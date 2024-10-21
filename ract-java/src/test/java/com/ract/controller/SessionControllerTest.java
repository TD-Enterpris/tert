package com.ract.controller;

import com.ract.service.SessionService;
import com.nimbusds.jwt.JWTClaimsSet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.data.redis.RedisConnectionFailureException;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SessionControllerTest {

    @InjectMocks
    private com.ract.controller.SessionController sessionController;

    @Mock
    private SessionService sessionService;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private HttpSession session;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // Test for a successful session initiation
    @Test
    void testInitiateSession_Success() throws Exception {
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("code", "auth-code");

        String tokenResponse = "{\"access_token\": \"access-token\", \"id_token\": \"id-token\"}";
        JWTClaimsSet accessTokenClaims = new JWTClaimsSet.Builder().claim("userid", "user1").build();
        JWTClaimsSet idTokenClaims = new JWTClaimsSet.Builder().claim("TD_memberOf", List.of("group1")).build();

        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));
        when(sessionService.getAccessToken(session)).thenReturn("access-token");
        when(sessionService.getIdToken(session)).thenReturn("id-token");
        when(sessionService.decodeToken("access-token")).thenReturn(accessTokenClaims);
        when(sessionService.decodeToken("id-token")).thenReturn(idTokenClaims);

        Map<String, Object> result = sessionController.initiateSession(requestBody, session, request, response);

        assertNotNull(result);
        assertEquals("user1", result.get("userid"));
        assertEquals(List.of("group1"), result.get("TD_memberOf"));

        verify(response).addCookie(any(Cookie.class));  // Verify JSESSIONID is added
    }

    // Test when authorization code is missing
    @Test
    void testInitiateSession_MissingCode() {
        Map<String, String> requestBody = new HashMap<>();

        Map<String, Object> result = sessionController.initiateSession(requestBody, session, request, response);

        assertEquals("Authorization code is missing", result.get("error"));
        verify(response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }

    // Test when groups are missing
    @Test
    void testInitiateSession_MissingGroups() throws Exception {
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("code", "auth-code");

        String tokenResponse = "{\"access_token\": \"access-token\", \"id_token\": \"id-token\"}";
        JWTClaimsSet accessTokenClaims = new JWTClaimsSet.Builder().claim("userid", "user1").build();
        JWTClaimsSet idTokenClaims = new JWTClaimsSet.Builder().build();  // Missing groups

        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));
        when(sessionService.getAccessToken(session)).thenReturn("access-token");
        when(sessionService.getIdToken(session)).thenReturn("id-token");
        when(sessionService.decodeToken("access-token")).thenReturn(accessTokenClaims);
        when(sessionService.decodeToken("id-token")).thenReturn(idTokenClaims);

        Map<String, Object> result = sessionController.initiateSession(requestBody, session, request, response);

        assertEquals("No groups assigned to the user", result.get("error"));
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }

    // Test for handling RuntimeException while retrieving TD_memberOf groups
    @Test
    void testInitiateSession_RuntimeExceptionForGroups() throws Exception {
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("code", "auth-code");

        String tokenResponse = "{\"access_token\": \"access-token\", \"id_token\": \"id-token\"}";
        JWTClaimsSet accessTokenClaims = new JWTClaimsSet.Builder().claim("userid", "user1").build();

        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));
        when(sessionService.getAccessToken(session)).thenReturn("access-token");
        when(sessionService.getIdToken(session)).thenReturn("id-token");
        // Simulate RuntimeException instead of ParseException
        when(sessionService.decodeToken("id-token")).thenThrow(new RuntimeException("Failed to parse groups"));

        Map<String, Object> result = sessionController.initiateSession(requestBody, session, request, response);

        assertEquals("Unexpected server error: Failed to parse groups", result.get("error"));
        verify(response).setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }

    // Test for handling RuntimeException while retrieving user ID
    @Test
    void testInitiateSession_RuntimeExceptionForUserId() throws Exception {
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("code", "auth-code");

        String tokenResponse = "{\"access_token\": \"access-token\", \"id_token\": \"id-token\"}";
        JWTClaimsSet idTokenClaims = new JWTClaimsSet.Builder().claim("TD_memberOf", List.of("group1")).build();

        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));
        when(sessionService.getAccessToken(session)).thenThrow(new RuntimeException("Failed to parse user ID"));
        when(sessionService.getIdToken(session)).thenReturn("id-token");

        Map<String, Object> result = sessionController.initiateSession(requestBody, session, request, response);

        assertEquals("Unexpected server error: Failed to parse user ID", result.get("error"));
        verify(response).setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }

    // Test for a successful session validation
    @Test
    void testValidateSession_Success() throws Exception {
        JWTClaimsSet accessTokenClaims = new JWTClaimsSet.Builder().claim("userid", "user1").build();
        JWTClaimsSet idTokenClaims = new JWTClaimsSet.Builder().claim("TD_memberOf", List.of("group1")).build();

        when(sessionService.isSessionActive(session)).thenReturn(true);
        when(sessionService.getAccessToken(session)).thenReturn("access-token");
        when(sessionService.getIdToken(session)).thenReturn("id-token");
        when(sessionService.decodeToken("access-token")).thenReturn(accessTokenClaims);
        when(sessionService.decodeToken("id-token")).thenReturn(idTokenClaims);

        Map<String, Object> result = sessionController.validateSession(session, response);

        assertEquals("user1", result.get("userid"));
        assertEquals(List.of("group1"), result.get("TD_memberOf"));
        verify(response, never()).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }

    @Test
    void testValidateSession_RuntimeExceptionForGroups() throws Exception {
        JWTClaimsSet accessTokenClaims = new JWTClaimsSet.Builder().claim("userid", "user1").build();

        when(sessionService.isSessionActive(session)).thenReturn(true);
        when(sessionService.getAccessToken(session)).thenReturn("access-token");
        when(sessionService.getIdToken(session)).thenReturn("id-token");
        // Simulating a runtime exception instead of checked exception
        when(sessionService.decodeToken("id-token")).thenThrow(new RuntimeException("Failed to retrieve groups"));

        Map<String, Object> result = sessionController.validateSession(session, response);

        // Adjust expected message to match actual response
        assertEquals("Unexpected server error: Failed to retrieve groups", result.get("error"));
        verify(response).setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }




    @Test
    void testValidateSession_MissingUserId() throws Exception {
        JWTClaimsSet accessTokenClaims = new JWTClaimsSet.Builder().build(); // Missing userid
        JWTClaimsSet idTokenClaims = new JWTClaimsSet.Builder().claim("TD_memberOf", List.of("group1")).build();

        when(sessionService.isSessionActive(session)).thenReturn(true);
        when(sessionService.getAccessToken(session)).thenReturn("access-token");
        when(sessionService.getIdToken(session)).thenReturn("id-token");
        when(sessionService.decodeToken("access-token")).thenReturn(accessTokenClaims);
        when(sessionService.decodeToken("id-token")).thenReturn(idTokenClaims);

        Map<String, Object> result = sessionController.validateSession(session, response);

        assertEquals("User ID is missing", result.get("error"));
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }

    @Test
    void testValidateSession_RuntimeExceptionForUserId() throws Exception {
        JWTClaimsSet idTokenClaims = new JWTClaimsSet.Builder().claim("TD_memberOf", List.of("group1")).build();

        when(sessionService.isSessionActive(session)).thenReturn(true);
        when(sessionService.getAccessToken(session)).thenReturn("access-token");
        when(sessionService.getIdToken(session)).thenReturn("id-token");
        // Simulating a runtime exception instead of checked exception
        when(sessionService.decodeToken("access-token")).thenThrow(new RuntimeException("Failed to retrieve User ID"));
        when(sessionService.decodeToken("id-token")).thenReturn(idTokenClaims);

        Map<String, Object> result = sessionController.validateSession(session, response);

        // Adjust expected message to match actual response
        assertEquals("Unexpected server error: Failed to retrieve User ID", result.get("error"));
        verify(response).setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }



    @Test
    void testValidateSession_NoActiveSession() {
        when(sessionService.isSessionActive(session)).thenReturn(false);

        Map<String, Object> result = sessionController.validateSession(session, response);

        assertEquals("No active session found.", result.get("message"));
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }






    // Test for Redis connection failure during validate session
    @Test
    void testValidateSession_RedisConnectionFailure() {
        when(sessionService.isSessionActive(any())).thenThrow(new RedisConnectionFailureException("Redis is down"));

        Map<String, Object> result = sessionController.validateSession(session, response);

        assertEquals("Redis connection failed: Redis is down", result.get("error"));
        verify(response).setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
    }

    // Test for Redis connection failure during invalidate session
    @Test
    void testInvalidateSession_RedisConnectionFailure() {
        // Simulate a RedisConnectionFailureException when sessionService.invalidateSession is called
        doThrow(new RedisConnectionFailureException("Redis is down")).when(sessionService).invalidateSession(any());

        // Call the invalidateSession endpoint
        Map<String, String> result = sessionController.invalidateSession(session);

        // Assert that the result contains the proper error message
        assertEquals("Redis connection failed: Redis is down", result.get("error"));
    }

    @Test
    void testValidateSession_MissingGroups() throws Exception {
        JWTClaimsSet accessTokenClaims = new JWTClaimsSet.Builder().claim("userid", "user1").build();
        JWTClaimsSet idTokenClaims = new JWTClaimsSet.Builder().build(); // Missing TD_memberOf

        when(sessionService.isSessionActive(session)).thenReturn(true);
        when(sessionService.getAccessToken(session)).thenReturn("access-token");
        when(sessionService.getIdToken(session)).thenReturn("id-token");
        when(sessionService.decodeToken("access-token")).thenReturn(accessTokenClaims);
        when(sessionService.decodeToken("id-token")).thenReturn(idTokenClaims);

        Map<String, Object> result = sessionController.validateSession(session, response);

        assertEquals("No groups assigned to the user", result.get("error"));
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }





    // Test for session invalidation success
    @Test
    void testInvalidateSession_Success() {
        Map<String, String> result = sessionController.invalidateSession(session);

        assertEquals("Session invalidated successfully.", result.get("message"));
        verify(sessionService).invalidateSession(session);
    }

    // Test for logout success
    @Test
    void testLogout_Success() {
        Map<String, String> result = sessionController.logout(session);

        assertEquals("You have been logged out, and session invalidated.", result.get("message"));
        verify(sessionService).invalidateSession(session);
    }
}