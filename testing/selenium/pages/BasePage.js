/**
 * Base Page Object
 * 
 * Abstract base class providing common interactions for all page objects.
 * All page objects should extend this class.
 */

const { By, until } = require('selenium-webdriver');
const config = require('../utilities/configLoader');
const logger = require('../utilities/logger');
const { waitForVisible, waitForClickable, waitForPresent, sleep } = require('../utilities/waitHelpers');
const { captureScreenshot } = require('../utilities/screenshotHelper');

class BasePage {
  /**
   * @param {WebDriver} driver - Selenium WebDriver instance
   */
  constructor(driver) {
    this.driver = driver;
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeouts.explicit;
  }

  /**
   * Navigate to a path relative to baseUrl.
   * @param {string} path - Route path (e.g., '/login')
   */
  async navigate(path) {
    const url = `${this.baseUrl}${path}`;
    logger.info(`Navigating to: ${url}`);
    await this.driver.get(url);
    await sleep(1000); // Allow React to render
  }

  /**
   * Wait for an element to be visible and return it.
   * @param {By} locator
   * @param {number} [timeout]
   * @returns {Promise<WebElement>}
   */
  async waitForElement(locator, timeout = this.timeout) {
    return waitForVisible(this.driver, locator, timeout);
  }

  /**
   * Wait for an element to be clickable and return it.
   * @param {By} locator
   * @param {number} [timeout]
   * @returns {Promise<WebElement>}
   */
  async waitForClickableElement(locator, timeout = this.timeout) {
    return waitForClickable(this.driver, locator, timeout);
  }

  /**
   * Click an element after waiting for it to be clickable.
   * @param {By} locator
   */
  async click(locator) {
    const element = await this.waitForClickableElement(locator);
    await element.click();
  }

  /**
   * Type text into an input field after clearing it.
   * @param {By} locator
   * @param {string} text
   */
  async type(locator, text) {
    const element = await this.waitForElement(locator);
    await element.clear();
    await element.sendKeys(text);
  }

  /**
   * Get the text content of an element.
   * @param {By} locator
   * @returns {Promise<string>}
   */
  async getText(locator) {
    const element = await this.waitForElement(locator);
    return element.getText();
  }

  /**
   * Check if an element is displayed on the page.
   * @param {By} locator
   * @param {number} [timeout=5000]
   * @returns {Promise<boolean>}
   */
  async isDisplayed(locator, timeout = 5000) {
    try {
      const element = await this.driver.wait(until.elementLocated(locator), timeout);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Check if an element exists in the DOM (may not be visible).
   * @param {By} locator
   * @param {number} [timeout=3000]
   * @returns {Promise<boolean>}
   */
  async isPresent(locator, timeout = 3000) {
    try {
      await this.driver.wait(until.elementLocated(locator), timeout);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the current page URL.
   * @returns {Promise<string>}
   */
  async getCurrentUrl() {
    return this.driver.getCurrentUrl();
  }

  /**
   * Get the page title.
   * @returns {Promise<string>}
   */
  async getTitle() {
    return this.driver.getTitle();
  }

  /**
   * Take a screenshot with a given name.
   * @param {string} name
   * @returns {Promise<string>} Screenshot file path
   */
  async takeScreenshot(name) {
    return captureScreenshot(this.driver, name);
  }

  /**
   * Wait for the URL to contain a specific string.
   * @param {string} urlPart
   * @param {number} [timeout]
   */
  async waitForUrlContains(urlPart, timeout = this.timeout) {
    const { waitForUrlContains } = require('../utilities/waitHelpers');
    await waitForUrlContains(this.driver, urlPart, timeout);
  }

  /**
   * Get the value of an input element.
   * @param {By} locator
   * @returns {Promise<string>}
   */
  async getInputValue(locator) {
    const element = await this.waitForElement(locator);
    return element.getAttribute('value');
  }

  /**
   * Find multiple elements matching a locator.
   * @param {By} locator
   * @returns {Promise<WebElement[]>}
   */
  async findElements(locator) {
    return this.driver.findElements(locator);
  }

  /**
   * Execute JavaScript in the browser context.
   * @param {string} script
   * @param  {...any} args
   * @returns {Promise<*>}
   */
  async executeScript(script, ...args) {
    return this.driver.executeScript(script, ...args);
  }

  /**
   * Get an attribute value from an element.
   * @param {By} locator
   * @param {string} attribute
   * @returns {Promise<string>}
   */
  async getAttribute(locator, attribute) {
    const element = await this.waitForElement(locator);
    return element.getAttribute(attribute);
  }
}

module.exports = BasePage;
