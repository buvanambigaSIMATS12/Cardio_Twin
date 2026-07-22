/**
 * Environment-specific configuration overrides.
 * 
 * Set TEST_ENV=ci|staging|local to select an environment.
 * Values here are deep-merged over default.config.js by configLoader.
 */

const environments = {
  local: {
    baseUrl: 'http://localhost:5173',
    apiUrl: 'http://localhost:8000',
    headless: false,
  },

  ci: {
    baseUrl: 'http://localhost:5173',
    apiUrl: 'http://localhost:8000',
    headless: true,
    timeouts: {
      implicit: 15000,
      pageLoad: 45000,
      script: 45000,
      explicit: 20000,
    },
  },

  staging: {
    baseUrl: 'https://staging.cardiotwin.app',
    apiUrl: 'https://staging-api.cardiotwin.app',
    headless: true,
  },
};

module.exports = environments;
