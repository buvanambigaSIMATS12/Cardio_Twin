/**
 * Screenshot Helper
 * 
 * Captures screenshots on demand or on test failure.
 * Saves PNG files to the screenshots/ directory with timestamps.
 */

const fs = require('fs');
const path = require('path');
const config = require('./configLoader');
const logger = require('./logger');

const screenshotDir = path.resolve(__dirname, '..', config.paths.screenshots);

// Ensure screenshot directory exists
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

/**
 * Capture a screenshot and save to disk.
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} testName - Name for the screenshot file
 * @returns {Promise<string>} Path to the saved screenshot
 */
async function captureScreenshot(driver, testName) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${sanitizedName}_${timestamp}.png`;
    const filepath = path.join(screenshotDir, filename);

    const image = await driver.takeScreenshot();
    fs.writeFileSync(filepath, image, 'base64');

    logger.info(`Screenshot saved: ${filename}`);
    return filepath;
  } catch (err) {
    logger.error(`Failed to capture screenshot: ${err.message}`);
    return null;
  }
}

/**
 * Capture a screenshot on test failure.
 * Designed to be called in afterEach hooks.
 * @param {WebDriver} driver
 * @param {object} currentTest - Mocha test context (this.currentTest)
 */
async function captureOnFailure(driver, currentTest) {
  if (currentTest && currentTest.state === 'failed') {
    const testTitle = currentTest.fullTitle();
    logger.warn(`Test FAILED: ${testTitle} — capturing screenshot`);
    await captureScreenshot(driver, `FAIL_${testTitle}`);
  }
}

module.exports = { captureScreenshot, captureOnFailure };
