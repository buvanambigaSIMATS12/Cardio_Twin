/**
 * Digital Twin Page Object
 * 
 * Selectors and actions for the CardioTwin Digital Twin page (/twin).
 * Derived from: frontend/src/desktop/pages/DigitalTwinPage.jsx
 */

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../utilities/configLoader');
const logger = require('../utilities/logger');

class DigitalTwinPage extends BasePage {
  constructor(driver) {
    super(driver);

    // ── Selectors ──────────────────────────────────────────
    this.mainContent = By.css('.max-w-\\[1600px\\]');
    this.loadingSpinner = By.css('.animate-spin');
    this.loadingText = By.xpath('//*[contains(text(),"Loading Digital Twin")]');

    // Heart Status Card
    this.heartStatusCard = By.xpath('//*[contains(text(),"Heart Status") or contains(text(),"heart status")]');
    this.bpmValue = By.xpath('//*[contains(text(),"bpm") or contains(text(),"BPM")]');

    // Risk Gauge Card
    this.riskGaugeCard = By.xpath('//*[contains(text(),"Risk") and contains(text(),"Score")]');

    // Risk Timeline Card
    this.riskTimelineCard = By.xpath('//*[contains(text(),"Risk") and contains(text(),"Timeline")]');

    // Lifestyle Factors Card
    this.lifestyleCard = By.xpath('//*[contains(text(),"Lifestyle") or contains(text(),"lifestyle")]');

    // Simulation Panel
    this.simulationPanel = By.xpath('//*[contains(text(),"Simulation") or contains(text(),"simulation") or contains(text(),"Simulate")]');

    // AI Insights Card
    this.aiInsightsCard = By.xpath('//*[contains(text(),"AI Insights") or contains(text(),"Insights")]');

    // Error state
    this.errorState = By.css('.text-red-500');
  }

  /**
   * Navigate to the Digital Twin page.
   */
  async open() {
    await this.navigate(config.routes.digitalTwin);
    logger.info('Digital Twin page opened');
  }

  /**
   * Wait for the page to finish loading.
   */
  async waitForLoad() {
    try {
      await this.waitForElement(this.mainContent, 20000);
    } catch {
      logger.warn('Digital Twin page content not found within timeout');
    }
  }

  async isLoaded() {
    return this.isDisplayed(this.mainContent);
  }

  async isHeartStatusCardVisible() {
    return this.isDisplayed(this.heartStatusCard);
  }

  async isRiskGaugeCardVisible() {
    return this.isDisplayed(this.riskGaugeCard);
  }

  async isRiskTimelineCardVisible() {
    return this.isDisplayed(this.riskTimelineCard);
  }

  async isLifestyleCardVisible() {
    return this.isDisplayed(this.lifestyleCard);
  }

  async isSimulationPanelVisible() {
    return this.isDisplayed(this.simulationPanel);
  }

  async isAIInsightsCardVisible() {
    return this.isDisplayed(this.aiInsightsCard);
  }
}

module.exports = DigitalTwinPage;
