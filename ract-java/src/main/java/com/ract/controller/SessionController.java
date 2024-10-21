package com.ract.controller;

import com.ract.service.SessionService;
import com.nimbusds.jwt.JWTClaimsSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.beans.factory.annotation.Value;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.text.ParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/session")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private RestTemplate restTemplate;

    // Load properties from application.properties
    @Value("${oauth.token.url}")
    private String tokenUrl;

    @Value("${oauth.client.id}")
    private String clientId;

    @Value("${oauth.client.secret}")
    private String clientSecret;

    @Value("${oauth.scope}")
    private String scope;

    @Value("${oauth.redirect.uri}")
    private String redirectUri;

    @Value("${cors.allowedOrigins}")
    private String allowedOrigins;

    // Endpoint to initiate session and handle token exchange
    @CrossOrigin(origins = "${cors.allowedOrigins}")
    @PostMapping("/initiate")
    public Map<String, Object> initiateSession(
            @RequestBody Map<String, String> requestBody,
            HttpSession session, HttpServletRequest request, HttpServletResponse response) {

        Map<String, Object> result = new HashMap<>();

        try {
            // Validate Authorization Code
            String code = requestBody.get("code");
            if (code == null || code.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST); // 400 Bad Request
                result.put("error", "Authorization code is missing");
                return result;
            }

            // OAuth2 Token Exchange Call
            String tokenResponse = exchangeAuthorizationCode(code);

            // Store token response in Redis-backed session
            sessionService.storeUserDataInSession(session, tokenResponse);

            // Decode tokens
            JWTClaimsSet accessTokenClaims = sessionService.decodeToken(sessionService.getAccessToken(session));
            JWTClaimsSet idTokenClaims = sessionService.decodeToken(sessionService.getIdToken(session));

            // Extract and validate TD_memberOf groups
            try {
                List<String> tdMemberOf = idTokenClaims.getStringListClaim("TD_memberOf");
                if (tdMemberOf == null || tdMemberOf.isEmpty()) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized
                    result.put("error", "No groups assigned to the user");
                    return result;
                }
                result.put("TD_memberOf", tdMemberOf);
            } catch (ParseException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized
                result.put("error", "Failed to retrieve groups");
                return result;
            }

            // Extract and validate User ID
            try {
                String userId = accessTokenClaims.getStringClaim("userid");
                if (userId == null || userId.isEmpty()) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized
                    result.put("error", "User ID is missing");
                    return result;
                }
                result.put("userid", userId);
            } catch (ParseException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized
                result.put("error", "Failed to retrieve User ID");
                return result;
            }

            // Add JSESSIONID as a cookie in the response
            Cookie jsessionCookie = new Cookie("JSESSIONID", session.getId());
            jsessionCookie.setPath("/");
            response.addCookie(jsessionCookie);

        } catch (RedisConnectionFailureException redisEx) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE); // 503 Service Unavailable
            result.put("error", "Redis connection failed: " + redisEx.getMessage());
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // 500 Internal Server Error
            result.put("error", "Unexpected server error: " + e.getMessage());
        }

        return result;
    }

    // OAuth2 token exchange method
    private String exchangeAuthorizationCode(String code) {
        String url = tokenUrl
                + "?grant_type=authorization_code"
                + "&client_id=" + clientId
                + "&client_secret=" + clientSecret
                + "&scope=" + scope
                + "&redirect_uri=" + redirectUri
                + "&code=" + code;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to exchange code for tokens: " + e.getMessage());
        }
    }

    // Endpoint to validate session
    @CrossOrigin(origins = "${cors.allowedOrigins}")
    @GetMapping("/validate")
    public Map<String, Object> validateSession(HttpSession session, HttpServletResponse response) {
        Map<String, Object> result = new HashMap<>();

        try {
            // Check if the session is active
            if (sessionService.isSessionActive(session)) {
                JWTClaimsSet accessTokenClaims = sessionService.decodeToken(sessionService.getAccessToken(session));
                JWTClaimsSet idTokenClaims = sessionService.decodeToken(sessionService.getIdToken(session));

                // Validate TD_memberOf
                try {
                    List<String> tdMemberOf = idTokenClaims.getStringListClaim("TD_memberOf");
                    if (tdMemberOf == null || tdMemberOf.isEmpty()) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized
                        result.put("error", "No groups assigned to the user");
                        return result;
                    }
                    result.put("TD_memberOf", tdMemberOf);
                } catch (ParseException e) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized
                    result.put("error", "Failed to retrieve groups");
                    return result;
                }

                // Validate User ID
                try {
                    String userId = accessTokenClaims.getStringClaim("userid");
                    if (userId == null || userId.isEmpty()) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized
                        result.put("error", "User ID is missing");
                        return result;
                    }
                    result.put("userid", userId);
                } catch (ParseException e) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized
                    result.put("error", "Failed to retrieve User ID");
                    return result;
                }

            } else {
                result.put("message", "No active session found.");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized
            }

        } catch (RedisConnectionFailureException redisEx) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE); // 503 Service Unavailable
            result.put("error", "Redis connection failed: " + redisEx.getMessage());
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // 500 Internal Server Error
            result.put("error", "Unexpected server error: " + e.getMessage());
        }

        return result;
    }

    // Invalidate session
    @CrossOrigin(origins = "${cors.allowedOrigins}")
    @DeleteMapping("/invalidate")
    public Map<String, String> invalidateSession(HttpSession session) {
        Map<String, String> response = new HashMap<>();
        try {
            sessionService.invalidateSession(session);
            response.put("message", "Session invalidated successfully.");
        } catch (RedisConnectionFailureException redisEx) {
            response.put("error", "Redis connection failed: " + redisEx.getMessage());
        }
        return response;
    }

    // Logout and invalidate session
    @CrossOrigin(origins = "${cors.allowedOrigins}")
    @PostMapping("/logout")
    public Map<String, String> logout(HttpSession session) {
        Map<String, String> response = new HashMap<>();
        try {
            sessionService.invalidateSession(session);
            response.put("message", "You have been logged out, and session invalidated.");
        } catch (RedisConnectionFailureException redisEx) {
            response.put("error", "Redis connection failed: " + redisEx.getMessage());
        }
        return response;
    }
}
