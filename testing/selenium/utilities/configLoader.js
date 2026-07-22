/**
 * Configuration Loader
 * 
 * Merges default.config.js with environment-specific overrides.
 * Set TEST_ENV environment variable to select environment: local | ci | staging
 */

const defaultConfig = require('../config/default.config');
const environments = require('../config/environments');

/**
 * Deep merge two objects. Source values override target values.
 */
function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object'
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

/**
 * Load and return the merged configuration.
 */
function loadConfig() {
  const env = process.env.TEST_ENV || '';
  let config = { ...defaultConfig };

  if (env && environments[env]) {
    config = deepMerge(config, environments[env]);
  }

  // Allow individual env var overrides
  if (process.env.BASE_URL) config.baseUrl = process.env.BASE_URL;
  if (process.env.API_URL) config.apiUrl = process.env.API_URL;
  if (process.env.BROWSER) config.browser = process.env.BROWSER;
  if (process.env.HEADLESS !== undefined) config.headless = process.env.HEADLESS !== 'false';

  return config;
}

module.exports = loadConfig();
