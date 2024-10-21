package com.ract.service;

import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.InjectMocks;
import org.junit.jupiter.api.extension.ExtendWith;

import java.text.ParseException;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.ArgumentMatchers.anyString;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @InjectMocks
    private SessionService sessionService;

    @Mock
    private HttpSession session;

    @Mock
    private SignedJWT signedJWT;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testStoreUserDataInSession_Success() throws Exception {
        String tokenResponse = "{\"access_token\": \"access-token\", \"id_token\": \"id-token\", \"token_type\": \"Bearer\", \"expires_in\": 3600}";

        sessionService.storeUserDataInSession(session, tokenResponse);

        verify(session).setAttribute("accessToken", "access-token");
        verify(session).setAttribute("idToken", "id-token");
        verify(session).setAttribute("tokenType", "Bearer");
        verify(session).setAttribute("expiresIn", 3600);
    }

    @Test
    void testStoreUserDataInSession_Failure() {
        String invalidTokenResponse = "{invalid_json}";

        Exception exception = assertThrows(RuntimeException.class, () -> {
            sessionService.storeUserDataInSession(session, invalidTokenResponse);
        });

        assertTrue(exception.getMessage().contains("Failed to store user data in session"));
    }

    @Test
    void testIsSessionActive_Active() {
        when(session.getAttribute("accessToken")).thenReturn("access-token");
        assertTrue(sessionService.isSessionActive(session));
    }

    @Test
    void testIsSessionActive_Inactive() {
        when(session.getAttribute("accessToken")).thenReturn(null);
        assertFalse(sessionService.isSessionActive(session));
    }

    @Test
    void testDecodeToken_Success() throws Exception {
        String token = "valid.jwt.token";
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder().claim("userid", "user1").build();

        // Mock static method SignedJWT.parse()
        try (var mockedStatic = mockStatic(SignedJWT.class)) {
            when(SignedJWT.parse(anyString())).thenReturn(signedJWT);
            when(signedJWT.getJWTClaimsSet()).thenReturn(claimsSet);

            JWTClaimsSet result = sessionService.decodeToken(token);
            assertNotNull(result);
            assertEquals("user1", result.getStringClaim("userid"));
        }
    }

    @Test
    void testDecodeToken_Failure() {
        String invalidToken = "invalid.jwt.token";

        Exception exception = assertThrows(RuntimeException.class, () -> {
            sessionService.decodeToken(invalidToken);
        });

        assertTrue(exception.getMessage().contains("Failed to decode token"));
    }

    @Test
    void testIsTokenValid_ValidToken() throws Exception {
        String token = "valid.jwt.token"; // Use a valid JWT for real cases
        Date futureDate = new Date(System.currentTimeMillis() + 3600 * 1000); // Token expires in 1 hour

        try (var mockedStatic = mockStatic(SignedJWT.class)) {
            when(SignedJWT.parse(anyString())).thenReturn(signedJWT);
            when(signedJWT.getJWTClaimsSet()).thenReturn(new JWTClaimsSet.Builder().expirationTime(futureDate).build());

            assertTrue(sessionService.isTokenValid(token));
        }
    }

    @Test
    void testIsTokenValid_ExpiredToken() throws Exception {
        String token = "expired.jwt.token";
        Date pastDate = new Date(System.currentTimeMillis() - 3600 * 1000); // Token expired 1 hour ago

        try (var mockedStatic = mockStatic(SignedJWT.class)) {
            when(SignedJWT.parse(anyString())).thenReturn(signedJWT);
            when(signedJWT.getJWTClaimsSet()).thenReturn(new JWTClaimsSet.Builder().expirationTime(pastDate).build());

            assertFalse(sessionService.isTokenValid(token));
        }
    }

    @Test
    void testIsTokenValid_Failure() {
        String invalidToken = "invalid.jwt.token";
        assertFalse(sessionService.isTokenValid(invalidToken));
    }

    @Test
    void testGetUserIdFromToken_Success() throws Exception {
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder().claim("userid", "user1").build();
        String userId = sessionService.getUserIdFromToken(claimsSet);
        assertEquals("user1", userId);
    }

    @Test
    void testGetUserIdFromToken_Failure() throws Exception {
        JWTClaimsSet claimsSet = mock(JWTClaimsSet.class);
        when(claimsSet.getStringClaim("userid")).thenThrow(new ParseException("Parse error", 0));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            sessionService.getUserIdFromToken(claimsSet);
        });

        assertTrue(exception.getMessage().contains("Failed to retrieve userid"));
    }

    @Test
    void testGetTdMemberOfFromToken_Success() throws Exception {
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder().claim("TD_memberOf", List.of("group1", "group2")).build();
        String groups = sessionService.getTdMemberOfFromToken(claimsSet);
        assertEquals("[group1, group2]", groups);
    }

    @Test
    void testGetTdMemberOfFromToken_Failure() throws Exception {
        JWTClaimsSet claimsSet = mock(JWTClaimsSet.class);
        when(claimsSet.getStringListClaim("TD_memberOf")).thenThrow(new ParseException("Parse error", 0));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            sessionService.getTdMemberOfFromToken(claimsSet);
        });

        assertTrue(exception.getMessage().contains("Failed to retrieve TD_memberOf"));
    }

    @Test
    void testGetAccessToken() {
        when(session.getAttribute("accessToken")).thenReturn("access-token");
        assertEquals("access-token", sessionService.getAccessToken(session));
    }

    @Test
    void testGetIdToken() {
        when(session.getAttribute("idToken")).thenReturn("id-token");
        assertEquals("id-token", sessionService.getIdToken(session));
    }

    @Test
    void testGetTokenType() {
        when(session.getAttribute("tokenType")).thenReturn("Bearer");
        assertEquals("Bearer", sessionService.getTokenType(session));
    }

    @Test
    void testGetExpiresIn() {
        when(session.getAttribute("expiresIn")).thenReturn(3600);
        assertEquals(3600, sessionService.getExpiresIn(session));
    }

    @Test
    void testInvalidateSession() {
        sessionService.invalidateSession(session);
        verify(session).invalidate();
    }
}