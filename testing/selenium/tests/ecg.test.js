/**
 * ECG Tests
 * 
 * Tests: ECG page load, upload panel, preview, diagnosis, history
 */

const { expect } = require('chai');
const { createDriver, quitDriver } = require('../utilities/driverFactory');
const { captureOnFailure } = require('../utilities/screenshotHelper');
const { finalizeExcelReport } = require('../utilities/excelReporter');
const { sleep } = require('../utilities/waitHelpers');
const logger = require('../utilities/logger');
const LoginPage = require('../pages/LoginPage');
const ECGPage = require('../pages/ECGPage');
const SidebarComponent = require('../pages/SidebarComponent');

describe('ECG Tests', function () {
  let driver;
  let ecgPage;
  const testResults = [];

  before(async function () {
    driver = await createDriver();
    const loginPage = new LoginPage(driver);
    ecgPage = new ECGPage(driver);

    await loginPage.open();
    await loginPage.loginWithDefaults();
    await sleep(3000);

    const sidebar = new SidebarComponent(driver);
    await sidebar.navigateTo('ECG');
    await ecgPage.waitForLoad();
  });

  afterEach(async function () {
    await captureOnFailure(driver, this.currentTest);
    testResults.push({
      id: `ECG-${String(testResults.length + 1).padStart(3, '0')}`,
      title: this.currentTest.title,
      suite: 'ECG',
      status: this.currentTest.state === 'passed' ? 'PASS' : this.currentTest.state === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration,
      error: this.currentTest.err ? this.currentTest.err.message : '',
    });
  });

  after(async function () {
    try {
      await finalizeExcelReport('Selenium - ECG Tests', testResults);
    } catch (err) {
      logger.error(`Failed to generate Excel report: ${err.message}`);
    }
    await quitDriver(driver);
  });

  it('TC-ECG-001: Should load the ECG page', async function () {
    const isLoaded = await ecgPage.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('TC-ECG-002: Should be on the /ecg URL', async function () {
    const url = await ecgPage.getCurrentUrl();
    expect(url).to.include('/ecg');
  });

  it('TC-ECG-003: Should display the upload panel', async function () {
    const isVisible = await ecgPage.isUploadPanelVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-ECG-004: Should display the preview panel', async function () {
    const isVisible = await ecgPage.isPreviewPanelVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-ECG-005: Should display diagnosis card or empty state', async function () {
    const hasDiagnosis = await ecgPage.isDiagnosisCardVisible();
    const hasEmpty = await ecgPage.isEmptyStateVisible();
    // At least one should be true
    expect(hasDiagnosis || hasEmpty).to.be.true;
  });

  it('TC-ECG-006: Should display history table or empty state', async function () {
    const hasHistory = await ecgPage.isHistoryTableVisible();
    const hasEmpty = await ecgPage.isEmptyStateVisible();
    expect(hasHistory || hasEmpty).to.be.true;
  });
});
