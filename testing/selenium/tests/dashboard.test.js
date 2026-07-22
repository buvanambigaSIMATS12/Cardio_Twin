/**
 * Dashboard Tests
 * 
 * Tests: Dashboard page load, all card visibility
 */

const { expect } = require('chai');
const { createDriver, quitDriver } = require('../utilities/driverFactory');
const { captureOnFailure } = require('../utilities/screenshotHelper');
const { finalizeExcelReport } = require('../utilities/excelReporter');
const { sleep } = require('../utilities/waitHelpers');
const logger = require('../utilities/logger');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');

describe('Dashboard Tests', function () {
  let driver;
  let dashboardPage;
  const testResults = [];

  before(async function () {
    driver = await createDriver();
    const loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);

    await loginPage.open();
    await loginPage.loginWithDefaults();
    await sleep(3000);
    await dashboardPage.waitForLoad();
  });

  afterEach(async function () {
    await captureOnFailure(driver, this.currentTest);
    testResults.push({
      id: `DASH-${String(testResults.length + 1).padStart(3, '0')}`,
      title: this.currentTest.title,
      suite: 'Dashboard',
      status: this.currentTest.state === 'passed' ? 'PASS' : this.currentTest.state === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration,
      error: this.currentTest.err ? this.currentTest.err.message : '',
    });
  });

  after(async function () {
    try {
      await finalizeExcelReport('Selenium - Dashboard Tests', testResults);
    } catch (err) {
      logger.error(`Failed to generate Excel report: ${err.message}`);
    }
    await quitDriver(driver);
  });

  it('TC-DASH-001: Should load the dashboard page', async function () {
    const isLoaded = await dashboardPage.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('TC-DASH-002: Should display the Health Score card', async function () {
    const isVisible = await dashboardPage.isHealthScoreCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-DASH-003: Should display the Cardiac Risk card', async function () {
    const isVisible = await dashboardPage.isCardiacRiskCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-DASH-004: Should display the Today Status card', async function () {
    const isVisible = await dashboardPage.isTodayStatusCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-DASH-005: Should display the Emergency card', async function () {
    const isVisible = await dashboardPage.isEmergencyCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-DASH-006: Should display the ECG Summary card', async function () {
    const isVisible = await dashboardPage.isECGSummaryCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-DASH-007: Should display the Vitals card', async function () {
    const isVisible = await dashboardPage.isVitalsCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-DASH-008: Should display the Medication card', async function () {
    const isVisible = await dashboardPage.isMedicationCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-DASH-009: Should display the Activity card', async function () {
    const isVisible = await dashboardPage.isActivityCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-DASH-010: Should display the Recommendations card', async function () {
    const isVisible = await dashboardPage.isRecommendationsCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-DASH-011: Should have multiple grid sections', async function () {
    const count = await dashboardPage.getCardGridCount();
    expect(count).to.be.greaterThan(0);
    logger.info(`Dashboard has ${count} grid sections`);
  });

  it('TC-DASH-012: Should be on the correct URL', async function () {
    const url = await dashboardPage.getCurrentUrl();
    expect(url).to.not.include('/login');
  });
});
