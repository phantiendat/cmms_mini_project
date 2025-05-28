module.exports = {
  secret: "cmms-mini-project-secret-key",
  jwtExpiration: 86400,           // 24 hours
  jwtRefreshExpiration: 604800,   // 7 days

  /* For testing */
  // jwtExpiration: 60,          // 1 minute
  // jwtRefreshExpiration: 120,  // 2 minutes
}; 