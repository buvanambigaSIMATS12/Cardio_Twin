/**
 * Wait Helpers
 * 
 * Reusable explicit wait utilities built on top of Selenium's WebDriver wait.
 */

const { until, By } = require('selenium-webdriver');
const config = require('./configLoader');
const logger = require('./logger');

const DEFAULT_TIMEOUT = config.timeouts.explicit;

/**
 * Wait until an element is visible on the page.
 * @param {WebDriver} driver
 * @param {By} locator - Selenium By locator
 * @param {number} [timeout] - Max wait in ms
 * @returns {Promise<WebElement>}
 */
async function waitForVisible(driver, locator, timeout = DEFAULT_TIMEOUT) {
  logger.info(`Waiting for element to be visible: ${locator}`);
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

/**
 * Wait until an element is clickable (visible and enabled).
 * @param {WebDriver} driver
 * @param {By} locator
 * @param {number} [timeout]
 * @returns {Promise<WebElement>}
 */
async function waitForClickable(driver, locator, timeout = DEFAULT_TIMEOUT) {
  logger.info(`Waiting for element to be clickable: ${locator}`);
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  await driver.wait(until.elementIsEnabled(element), timeout);
  return element;
}

/**
 * Wait until the current URL contains a specific string.
 * @param {WebDriver} driver
 * @param {string} urlPart - Substring to look for in the URL
 * @param {number} [timeout]
 */
async function waitForUrlContains(driver, urlPart, timeout = DEFAULT_TIMEOUT) {
  logger.info(`Waiting for URL to contain: ${urlPart}`);
  await driver.wait(until.urlContains(urlPart), timeout);
}

/**
 * Wait until the current URL matches exactly.
 * @param {WebDriver} driver
 * @param {string} url
 * @param {number} [timeout]
 */
async function waitForUrlIs(driver, url, timeout = DEFAULT_TIMEOUT) {
  logger.info(`Waiting for URL to be: ${url}`);
  await driver.wait(until.urlIs(url), timeout);
}

/**
 * Wait until an element becomes stale (removed from DOM).
 * @param {WebDriver} driver
 * @param {WebElement} element
 * @param {number} [timeout]
 */
async function waitForStaleness(driver, element, timeout = DEFAULT_TIMEOUT) {
  logger.info('Waiting for element to become stale');
  await driver.wait(until.stalenessOf(element), timeout);
}

/**
 * Wait until specific text is present in an element.
 * @param {WebDriver} driver
 * @param {By} locator
 * @param {string} text
 * @param {number} [timeout]
 * @returns {Promise<WebElement>}
 */
async function waitForTextPresent(driver, locator, text, timeout = DEFAULT_TIMEOUT) {
  logger.info(`Waiting for text "${text}" in element: ${locator}`);
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementTextContains(element, text), timeout);
  return element;
}

/**
 * Wait for a specified number of milliseconds.
 * Use sparingly — prefer explicit waits where possible.
 * @param {number} ms
 */
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait until an element is present in DOM (may not be visible).
 * @param {WebDriver} driver
 * @param {By} locator
 * @param {number} [timeout]
 * @returns {Promise<WebElement>}
 */
async function waitForPresent(driver, locator, timeout = DEFAULT_TIMEOUT) {
  logger.info(`Waiting for element to be present: ${locator}`);
  return driver.wait(until.elementLocated(locator), timeout);
}

module.exports = {
  waitForVisible,
  waitForClickable,
  waitForUrlContains,
  waitForUrlIs,
  waitForStaleness,
  waitForTextPresent,
  waitForPresent,
  sleep,
};
