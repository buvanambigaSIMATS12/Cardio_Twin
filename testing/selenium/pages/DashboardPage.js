/**
 * Dashboard Page Object
 * 
 * Selectors and actions for the CardioTwin Dashboard page (/).
 * Derived from: frontend/src/desktop/pages/DashboardPage.jsx
 */

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../utilities/configLoader');
const logger = require('../utilities/logger');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);

    // ── Selectors (derived from DashboardPage.jsx components) ──
    // Loading spinner
    this.loadingSpinner = By.css('.animate-spin');

    // Cards are identified by their headings or content
    this.healthScoreCard = By.xpath('//*[contains(text(),"Health Score")]');
    this.cardiacRiskCard = By.xpath('//*[contains(text(),"Cardiac Risk")]');
    this.todayStatusCard = By.xpath('//*[contains(text(),"Today")]');
    this.emergencyCard = By.xpath('//*[contains(text(),"Emergency") or contains(text(),"SOS")]');
    this.ecgSummaryCard = By.xpath('//*[contains(text(),"ECG")]');
    this.vitalsCard = By.xpath('//*[contains(text(),"Vitals")]');
    this.medicationCard = By.xpath('//*[contains(text(),"Medication")]');
    this.activityCard = By.xpath('//*[contains(text(),"Activity") or contains(text(),"Recent Activity")]');
    this.recommendationsCard = By.xpath('//*[contains(text(),"Recommendation")]');
    this.timelinePlaceholder = By.xpath('//*[contains(text(),"Timeline")]');

    // Main content area
    this.mainContent = By.css('.max-w-\\[1600px\\]');

    // Grid containers
    this.cardGrid = By.css('.grid');
  }

  /**
   * Navigate to the Dashboard page.
   */
  async open() {
    await this.navigate(config.routes.dashboard);
    logger.info('Dashboard page opened');
  }

  /**
   * Wait for the dashboard to finish loading.
   */
  async waitForLoad() {
    // Wait for spinner to disappear or content to appear
    try {
      await this.waitForElement(this.mainContent, 20000);
    } catch {
      logger.warn('Dashboard main content not found within timeout');
    }
  }

  /**
   * Check if the dashboard is loaded (spinner gone, content visible).
   * @returns {Promise<boolean>}
   */
  async isLoaded() {
    return this.isDisplayed(this.mainContent);
  }

  /**
   * Check if Health Score card is visible.
   * @returns {Promise<boolean>}
   */
  async isHealthScoreCardVisible() {
    return this.isDisplayed(this.healthScoreCard);
  }

  /**
   * Check if Cardiac Risk card is visible.
   * @returns {Promise<boolean>}
   */
  async isCardiacRiskCardVisible() {
    return this.isDisplayed(this.cardiacRiskCard);
  }

  /**
   * Check if Today Status card is visible.
   * @returns {Promise<boolean>}
   */
  async isTodayStatusCardVisible() {
    return this.isDisplayed(this.todayStatusCard);
  }

  /**
   * Check if Emergency card is visible.
   * @returns {Promise<boolean>}
   */
  async isEmergencyCardVisible() {
    return this.isDisplayed(this.emergencyCard);
  }

  /**
   * Check if ECG Summary card is visible.
   * @returns {Promise<boolean>}
   */
  async isECGSummaryCardVisible() {
    return this.isDisplayed(this.ecgSummaryCard);
  }

  /**
   * Check if Vitals card is visible.
   * @returns {Promise<boolean>}
   */
  async isVitalsCardVisible() {
    return this.isDisplayed(this.vitalsCard);
  }

  /**
   * Check if Medication card is visible.
   * @returns {Promise<boolean>}
   */
  async isMedicationCardVisible() {
    return this.isDisplayed(this.medicationCard);
  }

  /**
   * Check if Activity card is visible.
   * @returns {Promise<boolean>}
   */
  async isActivityCardVisible() {
    return this.isDisplayed(this.activityCard);
  }

  /**
   * Check if Recommendations card is visible.
   * @returns {Promise<boolean>}
   */
  async isRecommendationsCardVisible() {
    return this.isDisplayed(this.recommendationsCard);
  }

  /**
   * Get the count of grid cards visible on the page.
   * @returns {Promise<number>}
   */
  async getCardGridCount() {
    const grids = await this.findElements(this.cardGrid);
    return grids.length;
  }
}

module.exports = DashboardPage;
