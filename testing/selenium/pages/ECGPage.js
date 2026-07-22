/**
 * ECG Page Object
 * 
 * Selectors and actions for the CardioTwin ECG page (/ecg).
 * Derived from: frontend/src/desktop/pages/ECGPage.jsx
 */

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../utilities/configLoader');
const logger = require('../utilities/logger');

class ECGPage extends BasePage {
  constructor(driver) {
    super(driver);

    // ── Selectors ──────────────────────────────────────────
    this.mainContent = By.css('.max-w-\\[1600px\\]');
    this.loadingSpinner = By.css('.animate-spin');

    // Upload panel
    this.uploadPanel = By.xpath('//*[contains(text(),"Upload") or contains(text(),"upload")]');
    this.fileInput = By.css('input[type="file"]');

    // Preview panel
    this.previewPanel = By.xpath('//*[contains(text(),"Preview") or contains(text(),"preview")]');

    // Diagnosis card
    this.diagnosisCard = By.xpath('//*[contains(text(),"Diagnosis") or contains(text(),"diagnosis")]');

    // History table
    this.historyTable = By.xpath('//*[contains(text(),"History") or contains(text(),"history")]');
    this.tableRows = By.css('table tbody tr');

    // Empty state
    this.emptyState = By.xpath('//*[contains(text(),"No ECG scans")]');

    // Error state
    this.errorState = By.css('.text-red-500');
  }

  /**
   * Navigate to the ECG page.
   */
  async open() {
    await this.navigate(config.routes.ecg);
    logger.info('ECG page opened');
  }

  /**
   * Wait for the ECG page to finish loading.
   */
  async waitForLoad() {
    try {
      await this.waitForElement(this.mainContent, 20000);
    } catch {
      logger.warn('ECG page content not found within timeout');
    }
  }

  /**
   * Check if the ECG page is loaded.
   * @returns {Promise<boolean>}
   */
  async isLoaded() {
    return this.isDisplayed(this.mainContent);
  }

  /**
   * Check if the upload panel is visible.
   * @returns {Promise<boolean>}
   */
  async isUploadPanelVisible() {
    return this.isDisplayed(this.uploadPanel);
  }

  /**
   * Check if the preview panel is visible.
   * @returns {Promise<boolean>}
   */
  async isPreviewPanelVisible() {
    return this.isDisplayed(this.previewPanel);
  }

  /**
   * Check if the diagnosis card is visible.
   * @returns {Promise<boolean>}
   */
  async isDiagnosisCardVisible() {
    return this.isDisplayed(this.diagnosisCard);
  }

  /**
   * Check if the history table is visible.
   * @returns {Promise<boolean>}
   */
  async isHistoryTableVisible() {
    return this.isDisplayed(this.historyTable);
  }

  /**
   * Check if the empty state message is shown.
   * @returns {Promise<boolean>}
   */
  async isEmptyStateVisible() {
    return this.isDisplayed(this.emptyState);
  }

  /**
   * Get the number of rows in the ECG history table.
   * @returns {Promise<number>}
   */
  async getHistoryRowCount() {
    const rows = await this.findElements(this.tableRows);
    return rows.length;
  }
}

module.exports = ECGPage;
