/**
 * Profile Page Object
 * 
 * Selectors and actions for the CardioTwin Profile page (/profile).
 * Derived from: frontend/src/desktop/pages/ProfilePage.jsx
 */

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../utilities/configLoader');
const logger = require('../utilities/logger');

class ProfilePage extends BasePage {
  constructor(driver) {
    super(driver);

    this.mainContent = By.css('.max-w-\\[1600px\\]');
    this.loadingSpinner = By.css('.animate-spin');

    // Profile Summary Card
    this.profileSummary = By.xpath('//*[contains(text(),"Profile") or contains(text(),"Member since")]');
    this.userName = By.css('.max-w-\\[1600px\\] .text-lg, .max-w-\\[1600px\\] .text-xl');

    // Personal Information Card
    this.personalInfoCard = By.xpath('//*[contains(text(),"Personal Information") or contains(text(),"personal information")]');
    this.emailInfo = By.xpath('//*[contains(text(),"Email") or contains(text(),"email")]');
    this.genderInfo = By.xpath('//*[contains(text(),"Gender") or contains(text(),"gender")]');
    this.ageInfo = By.xpath('//*[contains(text(),"Age") or contains(text(),"years")]');

    // Account Statistics Card
    this.accountStatsCard = By.xpath('//*[contains(text(),"Account") or contains(text(),"Statistics")]');
    this.ecgScansStat = By.xpath('//*[contains(text(),"ECG Scans")]');
    this.vitalsLoggedStat = By.xpath('//*[contains(text(),"Vitals Logged")]');

    // Medical History Card
    this.medicalHistoryCard = By.xpath('//*[contains(text(),"Medical History") or contains(text(),"medical history")]');

    // Emergency Contacts Card
    this.emergencyContactsCard = By.xpath('//*[contains(text(),"Emergency") and contains(text(),"Contact")]');
  }

  async open() {
    await this.navigate(config.routes.profile);
    logger.info('Profile page opened');
  }

  async waitForLoad() {
    try {
      await this.waitForElement(this.mainContent, 20000);
    } catch {
      logger.warn('Profile page content not found within timeout');
    }
  }

  async isLoaded() {
    return this.isDisplayed(this.mainContent);
  }

  async isProfileSummaryVisible() {
    return this.isDisplayed(this.profileSummary);
  }

  async isPersonalInfoCardVisible() {
    return this.isDisplayed(this.personalInfoCard);
  }

  async isAccountStatsCardVisible() {
    return this.isDisplayed(this.accountStatsCard);
  }

  async isMedicalHistoryCardVisible() {
    return this.isDisplayed(this.medicalHistoryCard);
  }

  async isEmergencyContactsCardVisible() {
    return this.isDisplayed(this.emergencyContactsCard);
  }
}

module.exports = ProfilePage;
