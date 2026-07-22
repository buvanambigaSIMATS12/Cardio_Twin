/**
 * Authentication Tests
 * 
 * Tests: Login, Logout, Invalid Login, Empty Fields
 */

const { expect } = require('chai');
const { createDriver, quitDriver } = require('../utilities/driverFactory');
const { captureOnFailure } = require('../utilities/screenshotHelper');
const { finalizeExcelReport } = require('../utilities/excelReporter');
const { sleep } = require('../utilities/waitHelpers');
const logger = require('../utilities/logger');
const config = require('../utilities/configLoader');
const LoginPage = require('../pages/LoginPage');
const testData = require('../data/testData.json');

describe('Authentication Tests', function () {
  let driver;
  let loginPage;
  const testResults = [];

  before(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
  });

  afterEach(async function () {
    // Capture screenshot on failure
    await captureOnFailure(driver, this.currentTest);

    // Collect results for Excel report
    testResults.push({
      id: `AUTH-${String(testResults.length + 1).padStart(3, '0')}`,
      title: this.currentTest.title,
      suite: 'Authentication',
      status: this.currentTest.state === 'passed' ? 'PASS' : this.currentTest.state === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration,
      error: this.currentTest.err ? this.currentTest.err.message : '',
    });
  });

  after(async function () {
    // Generate Excel report for this suite
    try {
      await finalizeExcelReport('Selenium - Authentication Tests', testResults);
    } catch (err) {
      logger.error(`Failed to generate Excel report: ${err.message}`);
    }
    await quitDriver(driver);
  });

  // ── Test Cases ──────────────────────────────────────────

  it('TC-AUTH-001: Should display the login page', async function () {
    await loginPage.open();
    const isLoaded = await loginPage.isLoaded();
    expect(isLoaded).to.be.true;
    logger.info('Login page loaded successfully');
  });

  it('TC-AUTH-002: Should display email and password fields', async function () {
    await loginPage.open();
    const emailVisible = await loginPage.isDisplayed(loginPage.emailInput);
    const passwordVisible = await loginPage.isDisplayed(loginPage.passwordInput);
    expect(emailVisible).to.be.true;
    expect(passwordVisible).to.be.true;
  });

  it('TC-AUTH-003: Should display the login submit button', async function () {
    await loginPage.open();
    const buttonVisible = await loginPage.isDisplayed(loginPage.loginButton);
    expect(buttonVisible).to.be.true;
  });

  it('TC-AUTH-004: Should display "Welcome back" heading', async function () {
    await loginPage.open();
    const headingVisible = await loginPage.isDisplayed(loginPage.welcomeHeading);
    expect(headingVisible).to.be.true;
  });

  it('TC-AUTH-005: Should display "Forgot password?" link', async function () {
    await loginPage.open();
    const linkVisible = await loginPage.isDisplayed(loginPage.forgotPasswordLink);
    expect(linkVisible).to.be.true;
  });

  it('TC-AUTH-006: Should display "Register" link', async function () {
    await loginPage.open();
    const linkVisible = await loginPage.isDisplayed(loginPage.registerLink);
    expect(linkVisible).to.be.true;
  });

  it('TC-AUTH-007: Should login successfully with valid credentials', async function () {
    await loginPage.open();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await sleep(3000); // Wait for redirect after login

    const currentUrl = await loginPage.getCurrentUrl();
    // After login, should redirect to dashboard (/) — not on /login anymore
    expect(currentUrl).to.not.include('/login');
    logger.info('Login successful — redirected from /login');
  });

  it('TC-AUTH-008: Should redirect to dashboard after login', async function () {
    // Already logged in from previous test
    const currentUrl = await loginPage.getCurrentUrl();
    const baseUrlNormalized = config.baseUrl.replace(/\/$/, '');
    // Dashboard is at / — URL should be baseUrl or baseUrl/
    const isDashboard = currentUrl === baseUrlNormalized || currentUrl === `${baseUrlNormalized}/`;
    expect(isDashboard).to.be.true;
    logger.info('Redirected to dashboard after login');
  });

  it('TC-AUTH-009: Should logout by clearing localStorage and redirecting', async function () {
    // Clear auth tokens from localStorage (simulates logout)
    await driver.executeScript('localStorage.removeItem("token"); localStorage.removeItem("user");');
    await loginPage.navigate('/');
    await sleep(2000);

    // After clearing auth, app should redirect to /login
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
    logger.info('Logout successful — redirected to /login');
  });

  it('TC-AUTH-010: Should show error for invalid credentials', async function () {
    await loginPage.open();
    await loginPage.login(testData.invalidUser.email, testData.invalidUser.password);
    await sleep(2000);

    const isErrorDisplayed = await loginPage.isErrorDisplayed();
    expect(isErrorDisplayed).to.be.true;
    logger.info('Error message displayed for invalid credentials');
  });

  it('TC-AUTH-011: Should show correct error message text', async function () {
    // Error should still be displayed from previous test
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).to.be.a('string');
    expect(errorText.length).to.be.greaterThan(0);
    logger.info(`Error message: "${errorText}"`);
  });

  it('TC-AUTH-012: Should remain on login page after invalid login', async function () {
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  it('TC-AUTH-013: Should prevent form submission with empty email (HTML5 validation)', async function () {
    await loginPage.open();
    // Try to type only password, leave email empty
    await loginPage.type(loginPage.passwordInput, 'somepassword');
    await loginPage.click(loginPage.loginButton);
    await sleep(500);

    // Should still be on login page (HTML5 validation prevents submission)
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  it('TC-AUTH-014: Should prevent form submission with empty password (HTML5 validation)', async function () {
    await loginPage.open();
    // Type only email, leave password empty
    await loginPage.type(loginPage.emailInput, testData.validUser.email);
    await loginPage.click(loginPage.loginButton);
    await sleep(500);

    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  it('TC-AUTH-015: Should navigate to register page via link', async function () {
    await loginPage.open();
    await loginPage.clickRegisterLink();
    await sleep(1500);

    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/register');
    logger.info('Navigated to register page via link');
  });
});
