/**
 * Medications Tests
 * 
 * Tests: Medications page, add modal, adherence, schedule, table
 */

const { expect } = require('chai');
const { createDriver, quitDriver } = require('../utilities/driverFactory');
const { captureOnFailure } = require('../utilities/screenshotHelper');
const { finalizeExcelReport } = require('../utilities/excelReporter');
const { sleep } = require('../utilities/waitHelpers');
const logger = require('../utilities/logger');
const LoginPage = require('../pages/LoginPage');
const MedicationsPage = require('../pages/MedicationsPage');
const SidebarComponent = require('../pages/SidebarComponent');

describe('Medications Tests', function () {
  let driver;
  let medsPage;
  const testResults = [];

  before(async function () {
    driver = await createDriver();
    const loginPage = new LoginPage(driver);
    medsPage = new MedicationsPage(driver);

    await loginPage.open();
    await loginPage.loginWithDefaults();
    await sleep(3000);

    const sidebar = new SidebarComponent(driver);
    await sidebar.navigateTo('Medications');
    await medsPage.waitForLoad();
  });

  afterEach(async function () {
    await captureOnFailure(driver, this.currentTest);
    testResults.push({
      id: `MED-${String(testResults.length + 1).padStart(3, '0')}`,
      title: this.currentTest.title,
      suite: 'Medications',
      status: this.currentTest.state === 'passed' ? 'PASS' : this.currentTest.state === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration,
      error: this.currentTest.err ? this.currentTest.err.message : '',
    });
  });

  after(async function () {
    try {
      await finalizeExcelReport('Selenium - Medications Tests', testResults);
    } catch (err) {
      logger.error(`Failed to generate Excel report: ${err.message}`);
    }
    await quitDriver(driver);
  });

  it('TC-MED-001: Should load the Medications page', async function () {
    const isLoaded = await medsPage.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('TC-MED-002: Should be on the /medications URL', async function () {
    const url = await medsPage.getCurrentUrl();
    expect(url).to.include('/medications');
  });

  it('TC-MED-003: Should display the Add Medication button', async function () {
    const isVisible = await medsPage.isAddButtonVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-MED-004: Should open the Add Medication modal', async function () {
    await medsPage.openAddModal();
    const isVisible = await medsPage.isModalVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-MED-005: Should close the Add Medication modal', async function () {
    await medsPage.closeModal();
    await sleep(500);
    const isVisible = await medsPage.isModalVisible();
    expect(isVisible).to.be.false;
  });

  it('TC-MED-006: Should display adherence card or empty state', async function () {
    const hasAdherence = await medsPage.isAdherenceCardVisible();
    const hasEmpty = await medsPage.isEmptyStateVisible();
    expect(hasAdherence || hasEmpty).to.be.true;
  });

  it('TC-MED-007: Should display schedule card or empty state', async function () {
    const hasSchedule = await medsPage.isScheduleCardVisible();
    const hasEmpty = await medsPage.isEmptyStateVisible();
    expect(hasSchedule || hasEmpty).to.be.true;
  });

  it('TC-MED-008: Should display medication table or empty state', async function () {
    const hasTable = await medsPage.isMedicationTableVisible();
    const hasEmpty = await medsPage.isEmptyStateVisible();
    expect(hasTable || hasEmpty).to.be.true;
  });

  it('TC-MED-009: Should display interactions card or empty state', async function () {
    const hasInteractions = await medsPage.isInteractionsCardVisible();
    const hasEmpty = await medsPage.isEmptyStateVisible();
    expect(hasInteractions || hasEmpty).to.be.true;
  });
});
