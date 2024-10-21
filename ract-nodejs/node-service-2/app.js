const express = require('express');
const cors = require('cors');  // Import the cors middleware
const app = express();
const port = 4000;  // The service will run on port 4000

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:4200',  // Allow requests from this origin (your front-end)
  methods: ['GET', 'POST'],  // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow these headers
  credentials: true  // Allow credentials like cookies and authorization headers
}));

// Middleware to parse JSON request body
app.use(express.json());

// Route to handle token exchange POST request
app.post('/as/token.oauth2', (req, res) => {
    // Extract parameters from the request body
    const { grant_type, client_id, client_secret, scope, redirect_uri, code } = req.query;

    // Log the incoming request details for debugging
    console.log('Received POST request for token exchange:');
    console.log(`Grant Type: ${grant_type}`);
    console.log(`Client ID: ${client_id}`);
    console.log(`Client Secret: ${client_secret}`);
    console.log(`Scope: ${scope}`);
    console.log(`Redirect URI: ${redirect_uri}`);
    console.log(`Authorization Code: ${code}`);

    // Mock response with access token, id token, and other details
    const tokenResponse = {
        "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjIiLCJwaS5hdG0iOiIyIn0.eyJzY29wZSI6WyJwcnRzLnJjaW50LnBydHMudyIsInBydHMucmNpbnQucHJ0cy5yIiwib3BlbmlkIiwiVERfQ3VzdG9tX21lbWJlck9mIl0sImNsaWVudF9pZCI6IjQzYjgyYzQ3LWNhN2EtNDg3Ni04YjBkLTUzMzUwYjYxZDU4ZCIsImlzcyI6InVybjpjb206dGQ6YXBpOm9hdXRoMjp2MSIsImF1ZCI6InVybjpjb206dGQ6YXBpOmdhdGV3YXk6c2VjdXJpdHk6djEiLCJqdGkiOiJVWHRWUzd5UWF6NVY5aEFFYXlZUGE1WURzS2dNMmtYbUZYVFoiLCJyZW1vdGVhZGRyIjoiTi9BIiwiYWNmMmlkIjoiRE1BTElTRSIsInN1YiI6InVybjpjb206dGQ6YXBpOmNsaWVudGlkOjQzYjgyYzQ3LWNhN2EtNDg3Ni04YjBkLTUzMzUwYjYxZDU4ZCIsInZlciI6IjEuMSIsImpmYyI6IiIsInVzZXJhZ2VudCI6Ik4vQSIsImRpcmVjdG9yeSI6IlREQkZHIiwidXNlcmlkIjoiRE1BTElTRSIsInN0c3Byb2NpZCI6ImFwaW9hdXRoYmVhcmVydG9rZW4iLCJyZWFkb25seSI6ImZhbHNlIiwiamMiOiJXMDI3NDIiLCJ0b2tlblR5cGUiOiJhY2Nlc3NUb2tlbiIsImV4cCI6MTcyODQ0NDc4NX0.KzGulB56giiNzodppBXs1anYQV2-26Al471WRPoPWJaGbmDfhsg6EBfIifLzA4jiN-SX2vsO7WaGhj9B93mOBput09Ykh_qgXXAS8iTOHe4wFUVJlp0P3FoLxfIZ_r2pcTNH2PmUv4hzfSXmCGLwEZ3MBy37NEWYVBdXuLvx4LjYaWSwonidUuirfve_c59mfIP8nU1k1le-TED4338b9wqeR1L5SjyhTKBSBSyP8ZtDziF6ZXbDIMXMM_CYhoo3eMMG5lfTtw7ubDn1G02PNpg5iCLmT7X6ZrWjWpF2MEQl6fugCIlOi-RW5rfG4S1YxZhADOS07aTl_c86wpCl9Q",
        "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImRJOXVELU03MUJqQ1FZODRiaXVtWXc5VGJoRV9SUzI1NiJ9.eyJzdWIiOiJETUFMSVNFIiwiYXVkIjoiNDNiODJjNDctY2E3YS00ODc2LThiMGQtNTMzNTBiNjFkNThkIiwianRpIjoiWWdSMmxVVk9HaEdTeE1KelVzbWtJbyIsImlzcyI6Imh0dHBzOi8vZmVkc2l0LnJhc3Rlc3QudGRiYW5rLmNhIiwiaWF0IjoxNzI4NDA4NzcyLCJleHAiOjE3Mjg0MDkwNzIsImF1dGhfdGltZSI6MTcyODQwODc3MiwiVERfbWVtYmVyT2YiOlsiUERJLVJBQ1QtR0EiLCJQREktUkFDVC1BRE1JTiJdfQ.VrNkh01D5Go8I6Tg8AjrnyJ0-DdH_Wvnuu0pJsQ-f7jRVcCIFWUhElLE73ShHbXhNRhf9nTN-2mm-CNxwESeZFNEM6SOgn-lODO5oyRaHzzuWdUhcd2kvYpBG4GMrPi0JRyrIOwbKrfFqBe7eBMljzRf9Xf7-k6TPxE5ap5oUA0UXk-7f-OTVkob-L6nV1XShnC5SOGNY59GTwjUGIVyJttC8C4NFGyMdBRKHXSfXyd4MbYpW49TQzZaJehuorpzMkm3xdmt2TsANZb2ABCsKLO77zRI7pyfUwitCojGHphU0OJFgSexPb86M0WPllFrG6COreLXiNbX8KbpS4kkMg",
        "token_type": "Bearer",
        "expires_in": 35999
    };

    // Send the mocked token response
    res.json(tokenResponse);
});

// Start the HTTP server
app.listen(port, () => {
    console.log(`Node.js service is running on http://localhost:${port}`);
});
