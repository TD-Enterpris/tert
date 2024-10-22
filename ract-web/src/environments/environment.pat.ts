export const environment = {
  production: false,

  clientId: '43b82c47-ca7a-4876-8b0d-53350b61d58d',
  ssoUrl: 'http://localhost:8080/as/authorization.oauth2',  // Local SSO server
  redirectUri: 'http://localhost:8080/login',  // Local Angular app
  apiBaseUrl: 'http://localhost:8080',  // Local backend API
  scope: 'prts.rcint.prts.rw prts.rcint.prts.r openid TD_Custom_memberOf',

};
