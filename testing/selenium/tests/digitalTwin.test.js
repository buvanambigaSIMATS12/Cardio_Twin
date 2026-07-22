/**
 * Digital Twin Tests
 * 
 * Tests: Heart Status, Risk Gauge, Timeline, Lifestyle, Simulation, AI Insights
 */

const { expect } = require('chai');
const { createDriver, quitDriver } = require('../utilities/driverFactory');
const { captureOnFailure } = require('../utilities/screenshotHelper');
const { finalizeExcelReport } = require('../utilities/excelReporter');
const { sleep } = require('../utilities/waitHelpers');
const logger = require('../utilities/logger');
const LoginPage = require('../pages/LoginPage');
const DigitalTwinPage = require('../pages/DigitalTwinPage');
const SidebarComponent = require('../pages/SidebarComponent');

describe('Digital Twin Tests', function () {
  let driver;
  let twinPage;
  const testResults = [];

  before(async function () {
    driver = await createDriver();
    const loginPage = new LoginPage(driver);
    twinPage = new DigitalTwinPage(driver);

    await loginPage.open();
    await loginPage.loginWithDefaults();
    await sleep(3000);

    const sidebar = new SidebarComponent(driver);
    await sidebar.navigateTo('Digital Twin');
    await twinPage.waitForLoad();
  });

  afterEach(async function () {
    await captureOnFailure(driver, this.currentTest);
    testResults.push({
      id: `TWIN-${String(testResults.length + 1).padStart(3, '0')}`,
      title: this.currentTest.title,
      suite: 'Digital Twin',
      status: this.currentTest.state === 'passed' ? 'PASS' : this.currentTest.state === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration,
      error: this.currentTest.err ? this.currentTest.err.message : '',
    });
  });

  after(async function () {
    try {
      await finalizeExcelReport('Selenium - Digital Twin Tests', testResults);
    } catch (err) {
      logger.error(`Failed to generate Excel report: ${err.message}`);
    }
    await quitDriver(driver);
  });

  it('TC-TWIN-001: Should load the Digital Twin page', async function () {
    const isLoaded = await twinPage.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('TC-TWIN-002: Should be on the /twin URL', async function () {
    const url = await twinPage.getCurrentUrl();
    expect(url).to.include('/twin');
  });

  it('TC-TWIN-003: Should display the Heart Status card', async function () {
    const isVisible = await twinPage.isHeartStatusCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-TWIN-004: Should display the Risk Gauge card', async function () {
    const isVisible = await twinPage.isRiskGaugeCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-TWIN-005: Should display the Risk Timeline card', async function () {
    const isVisible = await twinPage.isRiskTimelineCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-TWIN-006: Should display the Lifestyle Factors card', async function () {
    const isVisible = await twinPage.isLifestyleCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-TWIN-007: Should display the Simulation panel', async function () {
    const isVisible = await twinPage.isSimulationPanelVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-TWIN-008: Should display the AI Insights card', async function () {
    const isVisible = await twinPage.isAIInsightsCardVisible();
    expect(isVisible).to.be.true;
  });
});
