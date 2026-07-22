/**
 * Retry Helper
 * 
 * Retries a function multiple times with configurable delay.
 * Useful for handling transient failures in Selenium tests.
 */

const config = require('./configLoader');
const logger = require('./logger');

/**
 * Retry an async function up to maxAttempts times.
 * @param {Function} fn - Async function to retry
 * @param {number} [maxAttempts] - Maximum number of attempts
 * @param {number} [delayMs] - Delay between retries in ms
 * @returns {Promise<*>} Result of the function
 * @throws {Error} Last error if all attempts fail
 */
async function retryAction(fn, maxAttempts = config.retry.maxAttempts, delayMs = config.retry.delayMs) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      logger.warn(`Attempt ${attempt}/${maxAttempts} failed: ${err.message}`);
      if (attempt < maxAttempts) {
        logger.info(`Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  logger.error(`All ${maxAttempts} attempts failed`);
  throw lastError;
}

module.exports = { retryAction };
