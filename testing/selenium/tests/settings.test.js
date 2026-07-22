/**
 * Settings Tests
 * 
 * Tests: General, Appearance, Notification, Privacy, System Info cards
 */

const { expect } = require('chai');
const { createDriver, quitDriver } = require('../utilities/driverFactory');
const { captureOnFailure } = require('../utilities/screenshotHelper');
const { finalizeExcelReport } = require('../utilities/excelReporter');
const { sleep } = require('../utilities/waitHelpers');
const logger = require('../utilities/logger');
const LoginPage = require('../pages/LoginPage');
const SettingsPage = require('../pages/SettingsPage');
const SidebarComponent = require('../pages/SidebarComponent');

describe('Settings Tests', function () {
  let driver;
  let settingsPage;
  const testResults = [];

  before(async function () {
    driver = await createDriver();
    const loginPage = new LoginPage(driver);
    settingsPage = new SettingsPage(driver);

    await loginPage.open();
    await loginPage.loginWithDefaults();
    await sleep(3000);

    const sidebar = new SidebarComponent(driver);
    await sidebar.navigateTo('Settings');
    await settingsPage.waitForLoad();
  });

  afterEach(async function () {
    await captureOnFailure(driver, this.currentTest);
    testResults.push({
      id: `SET-${String(testResults.length + 1).padStart(3, '0')}`,
      title: this.currentTest.title,
      suite: 'Settings',
      status: this.currentTest.state === 'passed' ? 'PASS' : this.currentTest.state === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration,
      error: this.currentTest.err ? this.currentTest.err.message : '',
    });
  });

  after(async function () {
    try {
      await finalizeExcelReport('Selenium - Settings Tests', testResults);
    } catch (err) {
      logger.error(`Failed to generate Excel report: ${err.message}`);
    }
    await quitDriver(driver);
  });

  it('TC-SET-001: Should load the Settings page', async function () {
    const isLoaded = await settingsPage.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('TC-SET-002: Should be on the /settings URL', async function () {
    const url = await settingsPage.getCurrentUrl();
    expect(url).to.include('/settings');
  });

  it('TC-SET-003: Should display the General Settings card', async function () {
    const isVisible = await settingsPage.isGeneralSettingsCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-SET-004: Should display the Appearance card', async function () {
    const isVisible = await settingsPage.isAppearanceCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-SET-005: Should display the Notification Settings card', async function () {
    const isVisible = await settingsPage.isNotificationSettingsCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-SET-006: Should display the Privacy & Security card', async function () {
    const isVisible = await settingsPage.isPrivacySecurityCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-SET-007: Should display the System Information card', async function () {
    const isVisible = await settingsPage.isSystemInfoCardVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-SET-008: Should have multiple grid sections', async function () {
    const count = await settingsPage.getGridSectionCount();
    expect(count).to.be.greaterThanOrEqual(3);
    logger.info(`Settings page has ${count} grid sections`);
  });
});
