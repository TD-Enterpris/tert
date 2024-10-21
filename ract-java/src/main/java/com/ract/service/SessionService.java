package com.ract.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpSession;

import java.text.ParseException;
import java.util.Date;

@Service
public class SessionService {

    // Store user data in the session from the token response
    public void storeUserDataInSession(HttpSession session, String tokenResponse) {
        try {
            // Parse the token response (assuming it's in JSON format)
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(tokenResponse);

            // Extract necessary data from the response
            String accessToken = jsonNode.path("access_token").asText();
            String idToken = jsonNode.path("id_token").asText();
            String tokenType = jsonNode.path("token_type").asText();
            int expiresIn = jsonNode.path("expires_in").asInt();

            // Store in session
            session.setAttribute("accessToken", accessToken);
            session.setAttribute("idToken", idToken);
            session.setAttribute("tokenType", tokenType);
            session.setAttribute("expiresIn", expiresIn);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to store user data in session: " + e.getMessage());
        }
    }

    // Check if session is active by checking if access token is present
    public boolean isSessionActive(HttpSession session) {
        return session.getAttribute("accessToken") != null;
    }

    // Decode the JWT token using Nimbus and extract claims
    public JWTClaimsSet decodeToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet();
        } catch (ParseException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to decode token: " + e.getMessage());
        }
    }

    // Validate the JWT token (both accessToken and idToken)
    public boolean isTokenValid(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();

            // Check if token is expired
            return expirationTime != null && expirationTime.after(new Date());
        } catch (ParseException e) {
            e.printStackTrace();
            return false; // Token is invalid or failed to parse
        }
    }

    // Retrieve specific claims from the token (example: userid)
    public String getUserIdFromToken(JWTClaimsSet claimsSet) {
        try {
            return claimsSet.getStringClaim("userid");
        } catch (ParseException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to retrieve userid from token: " + e.getMessage());
        }
    }

    // Retrieve specific claims from the token (example: TD_memberOf)
    public String getTdMemberOfFromToken(JWTClaimsSet claimsSet) {
        try {
            return claimsSet.getStringListClaim("TD_memberOf").toString(); // Convert to string or adjust as needed
        } catch (ParseException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to retrieve TD_memberOf from token: " + e.getMessage());
        }
    }

    // Retrieve tokens and other session attributes
    public String getAccessToken(HttpSession session) {
        return (String) session.getAttribute("accessToken");
    }

    public String getIdToken(HttpSession session) {
        return (String) session.getAttribute("idToken");
    }

    public String getTokenType(HttpSession session) {
        return (String) session.getAttribute("tokenType");
    }

    public int getExpiresIn(HttpSession session) {
        return (Integer) session.getAttribute("expiresIn");
    }

    // Invalidate the session (clear session data)
    public void invalidateSession(HttpSession session) {
        session.invalidate();
    }
}