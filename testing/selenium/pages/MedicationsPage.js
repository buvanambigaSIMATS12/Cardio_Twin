/**
 * Medications Page Object
 * 
 * Selectors and actions for the CardioTwin Medications page (/medications).
 * Derived from: frontend/src/desktop/pages/MedicationsPage.jsx
 */

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../utilities/configLoader');
const logger = require('../utilities/logger');
const { sleep } = require('../utilities/waitHelpers');

class MedicationsPage extends BasePage {
  constructor(driver) {
    super(driver);

    // ── Selectors ──────────────────────────────────────────
    this.mainContent = By.css('.max-w-\\[1600px\\]');
    this.loadingSpinner = By.css('.animate-spin');

    // Add Medication button (top-right)
    this.addMedicationButton = By.xpath('//button[contains(text(),"Add Medication")]');

    // Add Medication Modal
    this.modal = By.css('.fixed.inset-0');
    this.modalTitle = By.xpath('//h3[contains(text(),"Add Medication")]');
    this.medNameInput = By.css('.fixed input[placeholder*="Aspirin"]');
    this.medDosageInput = By.css('.fixed input[placeholder*="10mg"]');
    this.medFrequencySelect = By.css('.fixed select');
    this.modalSubmitButton = By.xpath('//div[contains(@class,"fixed")]//button[@type="submit"]');
    this.modalCancelButton = By.xpath('//div[contains(@class,"fixed")]//button[contains(text(),"Cancel")]');
    this.modalCloseButton = By.css('.fixed .absolute button');

    // Adherence Card
    this.adherenceCard = By.xpath('//*[contains(text(),"Adherence")]');

    // Schedule Card
    this.scheduleCard = By.xpath('//*[contains(text(),"Schedule") or contains(text(),"schedule")]');

    // Medication List Table
    this.medicationTable = By.css('table');
    this.tableRows = By.css('table tbody tr');
    this.tableSearchInput = By.css('table ~ div input, div:has(> table) input');

    // Refill Card
    this.refillCard = By.xpath('//*[contains(text(),"Refill") or contains(text(),"refill")]');

    // Interactions Card
    this.interactionsCard = By.xpath('//*[contains(text(),"Interaction") or contains(text(),"interaction")]');

    // Empty state
    this.emptyState = By.xpath('//*[contains(text(),"No medications")]');
  }

  async open() {
    await this.navigate(config.routes.medications);
    logger.info('Medications page opened');
  }

  async waitForLoad() {
    try {
      await this.waitForElement(this.mainContent, 20000);
    } catch {
      logger.warn('Medications page content not found within timeout');
    }
  }

  async isLoaded() {
    return this.isDisplayed(this.mainContent);
  }

  async isAddButtonVisible() {
    return this.isDisplayed(this.addMedicationButton);
  }

  /**
   * Open the Add Medication modal.
   */
  async openAddModal() {
    await this.click(this.addMedicationButton);
    await sleep(500);
    logger.info('Add Medication modal opened');
  }

  /**
   * Check if the Add Medication modal is visible.
   */
  async isModalVisible() {
    return this.isDisplayed(this.modal);
  }

  /**
   * Close the Add Medication modal.
   */
  async closeModal() {
    await this.click(this.modalCancelButton);
    await sleep(500);
  }

  async isAdherenceCardVisible() {
    return this.isDisplayed(this.adherenceCard);
  }

  async isScheduleCardVisible() {
    return this.isDisplayed(this.scheduleCard);
  }

  async isMedicationTableVisible() {
    return this.isDisplayed(this.medicationTable);
  }

  async isRefillCardVisible() {
    return this.isDisplayed(this.refillCard);
  }

  async isInteractionsCardVisible() {
    return this.isDisplayed(this.interactionsCard);
  }

  async isEmptyStateVisible() {
    return this.isDisplayed(this.emptyState);
  }

  async getMedicationRowCount() {
    const rows = await this.findElements(this.tableRows);
    return rows.length;
  }
}

module.exports = MedicationsPage;
