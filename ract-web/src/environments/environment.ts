export const environment = {
  production: false,

  // API configuration
  oauth: {
    baseUrl: 'http://localhost:8080/api',  // Base API URL
    validateSessionUrl: '/session/validate',  // Relative URL for session validation
    logoutUrl: '/session/logout',  // Relative URL for logout
    initiateSessionUrl: '/session/initiate'  // Relative URL for session initiation
  },

  // OAuth configuration
  api: {
   baseUrl: 'http://localhost:9000/api',  // Base API URL
  },

  // SSO configuration
  sso: {
    baseUrl: 'http://localhost:3000/as/authorization.oauth2',  // Base URL for SSO
    clientId: '43b82c47-ca7a-4876-8b0d-53350b61d58d',
    responseType: 'code',
    redirectUri: 'http://localhost:4200/login',
    scope: 'prts.rcint.prts.rw prts.rcint.prts.r openid TD_Custom_memberOf'
  }
};
