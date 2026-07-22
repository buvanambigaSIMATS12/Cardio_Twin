/**
 * History Page Object
 * 
 * Selectors and actions for the CardioTwin History page (/history).
 * Derived from: frontend/src/desktop/pages/HistoryPage.jsx
 */

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../utilities/configLoader');
const logger = require('../utilities/logger');

class HistoryPage extends BasePage {
  constructor(driver) {
    super(driver);

    this.mainContent = By.css('.max-w-\\[1600px\\]');
    this.loadingSpinner = By.css('.animate-spin');

    // Stats Cards
    this.statsSection = By.xpath('//*[contains(text(),"Total ECGs") or contains(text(),"Avg Heart Rate") or contains(text(),"Med Adherence") or contains(text(),"Days Tracked")]');

    // Health Metrics Chart
    this.metricsChart = By.xpath('//*[contains(text(),"Health Metrics") or contains(text(),"health metrics")]');

    // ECG History Table
    this.ecgHistoryTable = By.xpath('//*[contains(text(),"ECG History") or contains(text(),"ecg history")]');
    this.tableRows = By.css('table tbody tr');

    // Activity Timeline
    this.activityTimeline = By.xpath('//*[contains(text(),"Activity") or contains(text(),"Timeline")]');

    // Empty state for chart
    this.noVitalsMessage = By.xpath('//*[contains(text(),"No vitals data")]');
  }

  async open() {
    await this.navigate(config.routes.history);
    logger.info('History page opened');
  }

  async waitForLoad() {
    try {
      await this.waitForElement(this.mainContent, 20000);
    } catch {
      logger.warn('History page content not found within timeout');
    }
  }

  async isLoaded() {
    return this.isDisplayed(this.mainContent);
  }

  async isStatsSectionVisible() {
    return this.isDisplayed(this.statsSection);
  }

  async isMetricsChartVisible() {
    return this.isDisplayed(this.metricsChart);
  }

  async isECGHistoryTableVisible() {
    return this.isDisplayed(this.ecgHistoryTable);
  }

  async isActivityTimelineVisible() {
    return this.isDisplayed(this.activityTimeline);
  }

  async getECGHistoryRowCount() {
    const rows = await this.findElements(this.tableRows);
    return rows.length;
  }
}

module.exports = HistoryPage;
