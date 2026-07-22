/**
 * Browser Driver Factory
 * 
 * Creates and configures Selenium WebDriver instances.
 * Supports Chrome, Edge, and Firefox in headed or headless mode.
 */

const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const edge = require('selenium-webdriver/edge');
const firefox = require('selenium-webdriver/firefox');
const config = require('./configLoader');
const logger = require('./logger');

/**
 * Create a new WebDriver instance based on configuration.
 * @returns {Promise<WebDriver>} Configured WebDriver instance
 */
async function createDriver() {
  const browser = config.browser.toLowerCase();
  const headless = config.headless;
  const { width, height } = config.viewport;

  logger.info(`Launching ${browser} browser (headless: ${headless}, viewport: ${width}x${height})`);

  let driver;

  switch (browser) {
    case 'chrome': {
      const options = new chrome.Options();
      options.addArguments(`--window-size=${width},${height}`);
      options.addArguments('--disable-gpu');
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
      options.addArguments('--disable-extensions');
      if (headless) {
        options.addArguments('--headless=new');
      }
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
      break;
    }

    case 'edge': {
      const options = new edge.Options();
      options.addArguments(`--window-size=${width},${height}`);
      options.addArguments('--disable-gpu');
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
      if (headless) {
        options.addArguments('--headless=new');
      }
      driver = await new Builder()
        .forBrowser('MicrosoftEdge')
        .setEdgeOptions(options)
        .build();
      break;
    }

    case 'firefox': {
      const options = new firefox.Options();
      options.addArguments(`--width=${width}`);
      options.addArguments(`--height=${height}`);
      if (headless) {
        options.addArguments('--headless');
      }
      driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();
      break;
    }

    default:
      throw new Error(`Unsupported browser: ${browser}. Use chrome, edge, or firefox.`);
  }

  // Set timeouts
  await driver.manage().setTimeouts({
    implicit: config.timeouts.implicit,
    pageLoad: config.timeouts.pageLoad,
    script: config.timeouts.script,
  });

  logger.info(`${browser} browser launched successfully`);
  return driver;
}

/**
 * Quit the WebDriver instance safely.
 * @param {WebDriver} driver
 */
async function quitDriver(driver) {
  if (driver) {
    try {
      await driver.quit();
      logger.info('Browser closed successfully');
    } catch (err) {
      logger.error(`Error closing browser: ${err.message}`);
    }
  }
}

module.exports = { createDriver, quitDriver };
