/**
 * History Tests
 * 
 * Tests: Stats cards, health metrics chart, ECG history, activity timeline
 */

const { expect } = require('chai');
const { createDriver, quitDriver } = require('../utilities/driverFactory');
const { captureOnFailure } = require('../utilities/screenshotHelper');
const { finalizeExcelReport } = require('../utilities/excelReporter');
const { sleep } = require('../utilities/waitHelpers');
const logger = require('../utilities/logger');
const LoginPage = require('../pages/LoginPage');
const HistoryPage = require('../pages/HistoryPage');
const SidebarComponent = require('../pages/SidebarComponent');

describe('History Tests', function () {
  let driver;
  let historyPage;
  const testResults = [];

  before(async function () {
    driver = await createDriver();
    const loginPage = new LoginPage(driver);
    historyPage = new HistoryPage(driver);

    await loginPage.open();
    await loginPage.loginWithDefaults();
    await sleep(3000);

    const sidebar = new SidebarComponent(driver);
    await sidebar.navigateTo('History');
    await historyPage.waitForLoad();
  });

  afterEach(async function () {
    await captureOnFailure(driver, this.currentTest);
    testResults.push({
      id: `HIST-${String(testResults.length + 1).padStart(3, '0')}`,
      title: this.currentTest.title,
      suite: 'History',
      status: this.currentTest.state === 'passed' ? 'PASS' : this.currentTest.state === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration,
      error: this.currentTest.err ? this.currentTest.err.message : '',
    });
  });

  after(async function () {
    try {
      await finalizeExcelReport('Selenium - History Tests', testResults);
    } catch (err) {
      logger.error(`Failed to generate Excel report: ${err.message}`);
    }
    await quitDriver(driver);
  });

  it('TC-HIST-001: Should load the History page', async function () {
    const isLoaded = await historyPage.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('TC-HIST-002: Should be on the /history URL', async function () {
    const url = await historyPage.getCurrentUrl();
    expect(url).to.include('/history');
  });

  it('TC-HIST-003: Should display stats section', async function () {
    const isVisible = await historyPage.isStatsSectionVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-HIST-004: Should display health metrics chart or no-data message', async function () {
    const hasChart = await historyPage.isMetricsChartVisible();
    const hasNoData = await historyPage.isDisplayed(historyPage.noVitalsMessage);
    expect(hasChart || hasNoData).to.be.true;
  });

  it('TC-HIST-005: Should display ECG history section', async function () {
    const isVisible = await historyPage.isECGHistoryTableVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-HIST-006: Should display activity timeline section', async function () {
    const isVisible = await historyPage.isActivityTimelineVisible();
    expect(isVisible).to.be.true;
  });
});
