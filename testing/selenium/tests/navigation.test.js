/**
 * Navigation Tests
 * 
 * Tests: Sidebar navigation, page routing, TopNav presence
 */

const { expect } = require('chai');
const { createDriver, quitDriver } = require('../utilities/driverFactory');
const { captureOnFailure } = require('../utilities/screenshotHelper');
const { finalizeExcelReport } = require('../utilities/excelReporter');
const { sleep } = require('../utilities/waitHelpers');
const logger = require('../utilities/logger');
const config = require('../utilities/configLoader');
const LoginPage = require('../pages/LoginPage');
const SidebarComponent = require('../pages/SidebarComponent');
const TopNavComponent = require('../pages/TopNavComponent');
const testData = require('../data/testData.json');

describe('Navigation Tests', function () {
  let driver;
  let loginPage;
  let sidebar;
  let topNav;
  const testResults = [];

  before(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    sidebar = new SidebarComponent(driver);
    topNav = new TopNavComponent(driver);

    // Login first
    await loginPage.open();
    await loginPage.loginWithDefaults();
    await sleep(3000);
    logger.info('Logged in for navigation tests');
  });

  afterEach(async function () {
    await captureOnFailure(driver, this.currentTest);
    testResults.push({
      id: `NAV-${String(testResults.length + 1).padStart(3, '0')}`,
      title: this.currentTest.title,
      suite: 'Navigation',
      status: this.currentTest.state === 'passed' ? 'PASS' : this.currentTest.state === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration,
      error: this.currentTest.err ? this.currentTest.err.message : '',
    });
  });

  after(async function () {
    try {
      await finalizeExcelReport('Selenium - Navigation Tests', testResults);
    } catch (err) {
      logger.error(`Failed to generate Excel report: ${err.message}`);
    }
    await quitDriver(driver);
  });

  // ── Sidebar Tests ──────────────────────────────────────

  it('TC-NAV-001: Should display the sidebar', async function () {
    const isVisible = await sidebar.isVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-NAV-002: Should display the CardioTwin brand logo', async function () {
    const isVisible = await sidebar.isBrandLogoVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-NAV-003: Should display all 8 navigation items', async function () {
    const navItems = await sidebar.getNavItemNames();
    expect(navItems).to.include.members([
      'Dashboard', 'ECG', 'Digital Twin', 'Medications',
      'History', 'Doctors', 'Profile', 'Settings',
    ]);
    logger.info(`Sidebar nav items: ${navItems.join(', ')}`);
  });

  it('TC-NAV-004: Should toggle sidebar collapse', async function () {
    await sidebar.toggleCollapse();
    const isCollapsed = await sidebar.isCollapsed();
    expect(isCollapsed).to.be.true;

    // Expand back
    await sidebar.toggleCollapse();
    const isExpanded = !(await sidebar.isCollapsed());
    expect(isExpanded).to.be.true;
  });

  // ── TopNav Tests ───────────────────────────────────────

  it('TC-NAV-005: Should display the TopNav bar', async function () {
    const isVisible = await topNav.isVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-NAV-006: Should display "CardioTwin Desktop" title in TopNav', async function () {
    const title = await topNav.getProjectTitle();
    expect(title).to.include('CardioTwin Desktop');
  });

  it('TC-NAV-007: Should display the notification bell in TopNav', async function () {
    const isVisible = await topNav.isNotificationBellVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-NAV-008: Should display the user avatar in TopNav', async function () {
    const isVisible = await topNav.isUserAvatarVisible();
    expect(isVisible).to.be.true;
  });

  // ── Page Routing Tests ────────────────────────────────

  it('TC-NAV-009: Should navigate to ECG page via sidebar', async function () {
    await sidebar.navigateTo('ECG');
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/ecg');
  });

  it('TC-NAV-010: Should navigate to Digital Twin page via sidebar', async function () {
    await sidebar.navigateTo('Digital Twin');
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/twin');
  });

  it('TC-NAV-011: Should navigate to Medications page via sidebar', async function () {
    await sidebar.navigateTo('Medications');
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/medications');
  });

  it('TC-NAV-012: Should navigate to History page via sidebar', async function () {
    await sidebar.navigateTo('History');
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/history');
  });

  it('TC-NAV-013: Should navigate to Doctors page via sidebar', async function () {
    await sidebar.navigateTo('Doctors');
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/doctors');
  });

  it('TC-NAV-014: Should navigate to Profile page via sidebar', async function () {
    await sidebar.navigateTo('Profile');
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/profile');
  });

  it('TC-NAV-015: Should navigate to Settings page via sidebar', async function () {
    await sidebar.navigateTo('Settings');
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/settings');
  });

  it('TC-NAV-016: Should navigate back to Dashboard via sidebar', async function () {
    await sidebar.navigateTo('Dashboard');
    const url = await driver.getCurrentUrl();
    const baseUrlNormalized = config.baseUrl.replace(/\/$/, '');
    const isDashboard = url === baseUrlNormalized || url === `${baseUrlNormalized}/`;
    expect(isDashboard).to.be.true;
  });

  it('TC-NAV-017: Should preserve sidebar visibility across page navigation', async function () {
    await sidebar.navigateTo('ECG');
    let isVisible = await sidebar.isVisible();
    expect(isVisible).to.be.true;

    await sidebar.navigateTo('Settings');
    isVisible = await sidebar.isVisible();
    expect(isVisible).to.be.true;
  });

  it('TC-NAV-018: Should preserve TopNav across page navigation', async function () {
    await sidebar.navigateTo('Profile');
    const isVisible = await topNav.isVisible();
    expect(isVisible).to.be.true;
  });
});
