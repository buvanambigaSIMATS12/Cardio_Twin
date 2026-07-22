/**
 * Doctors Tests
 * 
 * Tests: Search, filter, doctor cards, list table, hospitals
 */

const { expect } = require('chai');
const { createDriver, quitDriver } = require('../utilities/driverFactory');
const { captureOnFailure } = require('../utilities/screenshotHelper');
const { finalizeExcelReport } = require('../utilities/excelReporter');
const { sleep } = require('../utilities/waitHelpers');
const logger = require('../utilities/logger');
const LoginPage = require('../pages/LoginPage');
const DoctorsPage = require('../pages/DoctorsPage');
const SidebarComponent = require('../pages/SidebarComponent');

describe('Doctors Tests', function () {
  let driver;
  let doctorsPage;
  const testResults = [];

  before(async function () {
    driver = await createDriver();
    const loginPage = new LoginPage(driver);
    doctorsPage = new DoctorsPage(driver);

    await loginPage.open();
    await loginPage.loginWithDefaults();
    await sleep(3000);

    const sidebar = new SidebarComponent(driver);
    await sidebar.navigateTo('Doctors');
    await doctorsPage.waitForLoad();
  });

  afterEach(async function () {
    await captureOnFailure(driver, this.currentTest);
    testResults.push({
      id: `DOC-${String(testResults.length + 1).padStart(3, '0')}`,
      title: this.currentTest.title,
      suite: 'Doctors',
      status: this.currentTest.state === 'passed' ? 'PASS' : this.currentTest.state === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration,
      error: this.currentTest.err ? this.currentTest.err.message : '',
    });
  });

  after(async function () {
    try {
      await finalizeExcelReport('Selenium - Doctors Tests', testResults);
    } catch (err) {
      logger.error(`Failed to generate Excel report: ${err.message}`);
    }
    await quitDriver(driver);
  });

  it('TC-DOC-001: Should load the Doctors page', async function () {
    const isLoaded = await doctorsPage.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('TC-DOC-002: Should be on the /doctors URL', async function () {
    const url = await doctorsPage.getCurrentUrl();
    expect(url).to.include('/doctors');
  });

  it('TC-DOC-003: Should display the search input', async function () {
    const isVisible = await doctorsPage.isSearchInputVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-DOC-004: Should display specialty filter pills', async function () {
    const count = await doctorsPage.getFilterPillCount();
    expect(count).to.be.greaterThan(0);
    logger.info(`Found ${count} filter pills`);
  });

  it('TC-DOC-005: Should display doctors table', async function () {
    const isVisible = await doctorsPage.isDoctorsTableVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-DOC-006: Should display nearby hospitals card', async function () {
    const isVisible = await doctorsPage.isHospitalsCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-DOC-007: Should allow typing in search input', async function () {
    await doctorsPage.search('Cardiology');
    await sleep(500);
    // Should still be on the doctors page
    const url = await doctorsPage.getCurrentUrl();
    expect(url).to.include('/doctors');
  });

  it('TC-DOC-008: Should clear search and show all results', async function () {
    await doctorsPage.clearSearch();
    await sleep(500);
    const isVisible = await doctorsPage.isDoctorsTableVisible();
    expect(isVisible).to.be.true;
  });
});
