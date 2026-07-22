/**
 * Profile Tests
 * 
 * Tests: Profile summary, personal info, account stats, medical history, emergency contacts
 */

const { expect } = require('chai');
const { createDriver, quitDriver } = require('../utilities/driverFactory');
const { captureOnFailure } = require('../utilities/screenshotHelper');
const { finalizeExcelReport } = require('../utilities/excelReporter');
const { sleep } = require('../utilities/waitHelpers');
const logger = require('../utilities/logger');
const LoginPage = require('../pages/LoginPage');
const ProfilePage = require('../pages/ProfilePage');
const SidebarComponent = require('../pages/SidebarComponent');

describe('Profile Tests', function () {
  let driver;
  let profilePage;
  const testResults = [];

  before(async function () {
    driver = await createDriver();
    const loginPage = new LoginPage(driver);
    profilePage = new ProfilePage(driver);

    await loginPage.open();
    await loginPage.loginWithDefaults();
    await sleep(3000);

    const sidebar = new SidebarComponent(driver);
    await sidebar.navigateTo('Profile');
    await profilePage.waitForLoad();
  });

  afterEach(async function () {
    await captureOnFailure(driver, this.currentTest);
    testResults.push({
      id: `PROF-${String(testResults.length + 1).padStart(3, '0')}`,
      title: this.currentTest.title,
      suite: 'Profile',
      status: this.currentTest.state === 'passed' ? 'PASS' : this.currentTest.state === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration,
      error: this.currentTest.err ? this.currentTest.err.message : '',
    });
  });

  after(async function () {
    try {
      await finalizeExcelReport('Selenium - Profile Tests', testResults);
    } catch (err) {
      logger.error(`Failed to generate Excel report: ${err.message}`);
    }
    await quitDriver(driver);
  });

  it('TC-PROF-001: Should load the Profile page', async function () {
    const isLoaded = await profilePage.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('TC-PROF-002: Should be on the /profile URL', async function () {
    const url = await profilePage.getCurrentUrl();
    expect(url).to.include('/profile');
  });

  it('TC-PROF-003: Should display the Profile Summary card', async function () {
    const isVisible = await profilePage.isProfileSummaryVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-PROF-004: Should display the Personal Information card', async function () {
    const isVisible = await profilePage.isPersonalInfoCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-PROF-005: Should display the Account Statistics card', async function () {
    const isVisible = await profilePage.isAccountStatsCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-PROF-006: Should display the Medical History card', async function () {
    const isVisible = await profilePage.isMedicalHistoryCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-PROF-007: Should display the Emergency Contacts card', async function () {
    const isVisible = await profilePage.isEmergencyContactsCardVisible();
    expect(isVisible).to.be.true;
  });
});
