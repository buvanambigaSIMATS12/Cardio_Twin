/**
 * Settings Page Object
 * 
 * Selectors and actions for the CardioTwin Settings page (/settings).
 * Derived from: frontend/src/desktop/pages/SettingsPage.jsx
 */

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../utilities/configLoader');
const logger = require('../utilities/logger');

class SettingsPage extends BasePage {
  constructor(driver) {
    super(driver);

    this.mainContent = By.css('.max-w-\\[1600px\\]');

    // General Settings Card
    this.generalSettingsCard = By.xpath('//*[contains(text(),"General") and contains(text(),"Settings")]');

    // Appearance Card
    this.appearanceCard = By.xpath('//*[contains(text(),"Appearance") or contains(text(),"appearance")]');

    // Notification Settings Card
    this.notificationSettingsCard = By.xpath('//*[contains(text(),"Notification")]');

    // Privacy & Security Card
    this.privacySecurityCard = By.xpath('//*[contains(text(),"Privacy") or contains(text(),"Security")]');

    // System Information Card
    this.systemInfoCard = By.xpath('//*[contains(text(),"System") and contains(text(),"Information")]');

    // Toggle switches (common in settings)
    this.toggleSwitches = By.css('button[role="switch"], input[type="checkbox"]');

    // Grid layout
    this.gridCards = By.css('.grid');
  }

  async open() {
    await this.navigate(config.routes.settings);
    logger.info('Settings page opened');
  }

  async waitForLoad() {
    try {
      await this.waitForElement(this.mainContent, 15000);
    } catch {
      logger.warn('Settings page content not found within timeout');
    }
  }

  async isLoaded() {
    return this.isDisplayed(this.mainContent);
  }

  async isGeneralSettingsCardVisible() {
    return this.isDisplayed(this.generalSettingsCard);
  }

  async isAppearanceCardVisible() {
    return this.isDisplayed(this.appearanceCard);
  }

  async isNotificationSettingsCardVisible() {
    return this.isDisplayed(this.notificationSettingsCard);
  }

  async isPrivacySecurityCardVisible() {
    return this.isDisplayed(this.privacySecurityCard);
  }

  async isSystemInfoCardVisible() {
    return this.isDisplayed(this.systemInfoCard);
  }

  /**
   * Get the number of grid sections on the settings page.
   * @returns {Promise<number>}
   */
  async getGridSectionCount() {
    const grids = await this.findElements(this.gridCards);
    return grids.length;
  }
}

module.exports = SettingsPage;
