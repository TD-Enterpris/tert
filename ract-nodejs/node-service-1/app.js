const express = require('express');
const cors = require('cors');  
const app = express();
const port = 3000;  // The service will run on port 3000

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:8080',  // Allow requests from this origin (your front-end)
  methods: ['GET', 'POST'],  // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow these headers
  credentials: true  // Allow credentials like cookies
}));

// Route to handle the OAuth2 authorization request
app.get('/as/authorization.oauth2', (req, res) => {
  const { client_id, response_type, redirect_uri, scope } = req.query;

  console.log('Received OAuth2 authorization request');
  console.log(`Client ID: ${client_id}`);
  console.log(`Response Type: ${response_type}`);
  console.log(`Redirect URI: ${redirect_uri}`);
  console.log(`Scope: ${scope}`);

  // Simulate redirecting to the SSO login page by returning a mock URL
  const ssoRedirectUrl = `http://localhost:3000/as/some_random_string_10_characters/resume/as/authorization.ping`;
  console.log(`Redirecting to SSO page: ${ssoRedirectUrl}`);

  // Simulate 302 redirect to SSO login page
  res.redirect(302, ssoRedirectUrl);
});

// Route to simulate SSO login completion and returning the authorization code
app.get('/as/some_random_string_10_characters/resume/as/authorization.ping', (req, res) => {
  console.log('Simulated SSO login page hit');

  // Simulate successful authorization by redirecting back to the UI with a code
  const authCode = 'FezvA4LdmJZQV-sEilV2ZGmgCVQMqkcr1okAAAAC';  // Example auth code
  const redirectUri = 'http://localhost:8080/login';  // Redirect back to Angular app (HTTP)
  
  // Create the redirect URL with the auth code only
  const redirectUrl = `${redirectUri}?code=${authCode}`;

  console.log(`Redirecting back to Angular app with auth code: ${redirectUrl}`);
  
  // Send 302 redirect response back to the Angular app with the code
  res.redirect(302, redirectUrl);
});

// Start the HTTP server
app.listen(port, () => {
    console.log(`Node.js service is running on http://localhost:${port}`);
});
