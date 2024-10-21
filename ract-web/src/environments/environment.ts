export const environment = {
  production: false,


  clientId: 'your-local-client-id',
  ssoUrl: 'http://localhost:8080/as/authorization.oauth2',  // Local SSO server
  redirectUri: 'http://localhost:8080/login',  // Local Angular app
  apiBaseUrl: 'http://localhost:8080',  // Local backend API
  scope: 'prts.rcint.prts.rw prts.rcint.prts.r openid TD_Custom_memberOf',

};
