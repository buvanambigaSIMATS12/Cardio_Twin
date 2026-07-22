/**
 * Doctors Page Object
 * 
 * Selectors and actions for the CardioTwin Doctors page (/doctors).
 * Derived from: frontend/src/desktop/pages/DoctorsPage.jsx
 */

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../utilities/configLoader');
const logger = require('../utilities/logger');
const { sleep } = require('../utilities/waitHelpers');

class DoctorsPage extends BasePage {
  constructor(driver) {
    super(driver);

    this.mainContent = By.css('.max-w-\\[1600px\\]');
    this.loadingSpinner = By.css('.animate-spin');

    // Search Card
    this.searchInput = By.css('input[placeholder*="Search doctors"]');
    this.clearSearchButton = By.css('input[placeholder*="Search doctors"] ~ button');

    // Specialty Filter Pills
    this.filterPills = By.css('button.rounded-full');
    this.activeFilterPill = By.css('button.rounded-full.bg-\\[var\\(--color-cardio-primary\\)\\]');

    // Doctor Profile Cards
    this.doctorProfileCards = By.xpath('//*[contains(text(),"Dr.")]');

    // Doctors List Table
    this.doctorsTable = By.css('table');
    this.doctorsTableRows = By.css('table tbody tr');

    // Nearby Hospitals Card
    this.hospitalsCard = By.xpath('//*[contains(text(),"Hospital") or contains(text(),"hospital")]');

    // Empty state
    this.emptyState = By.xpath('//*[contains(text(),"No doctors")]');

    // Error state
    this.errorState = By.xpath('//*[contains(@class,"text-amber-500")]');
    this.retryButton = By.xpath('//button[contains(text(),"Retry")]');
  }

  async open() {
    await this.navigate(config.routes.doctors);
    logger.info('Doctors page opened');
  }

  async waitForLoad() {
    try {
      await this.waitForElement(this.mainContent, 20000);
    } catch {
      logger.warn('Doctors page content not found within timeout');
    }
  }

  async isLoaded() {
    return this.isDisplayed(this.mainContent);
  }

  /**
   * Search for a doctor by name, specialty, or hospital.
   * @param {string} query
   */
  async search(query) {
    logger.info(`Searching for: ${query}`);
    await this.type(this.searchInput, query);
    await sleep(500);
  }

  /**
   * Clear the search input.
   */
  async clearSearch() {
    const input = await this.waitForElement(this.searchInput);
    await input.clear();
    await sleep(300);
  }

  async isSearchInputVisible() {
    return this.isDisplayed(this.searchInput);
  }

  async isDoctorsTableVisible() {
    return this.isDisplayed(this.doctorsTable);
  }

  async isHospitalsCardVisible() {
    return this.isDisplayed(this.hospitalsCard);
  }

  async getDoctorsTableRowCount() {
    const rows = await this.findElements(this.doctorsTableRows);
    return rows.length;
  }

  /**
   * Get the number of filter pills.
   * @returns {Promise<number>}
   */
  async getFilterPillCount() {
    const pills = await this.findElements(this.filterPills);
    return pills.length;
  }
}

module.exports = DoctorsPage;
