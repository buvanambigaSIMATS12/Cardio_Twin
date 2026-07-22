/**
 * Validation Tests
 * 
 * Tests: Form validation for Login, Register, and Medication Add forms
 */

const { expect } = require('chai');
const { createDriver, quitDriver } = require('../utilities/driverFactory');
const { captureOnFailure } = require('../utilities/screenshotHelper');
const { finalizeExcelReport } = require('../utilities/excelReporter');
const { sleep } = require('../utilities/waitHelpers');
const logger = require('../utilities/logger');
const config = require('../utilities/configLoader');
const LoginPage = require('../pages/LoginPage');
const RegisterPage = require('../pages/RegisterPage');
const MedicationsPage = require('../pages/MedicationsPage');
const SidebarComponent = require('../pages/SidebarComponent');
const testData = require('../data/testData.json');

describe('Validation Tests', function () {
  let driver;
  const testResults = [];

  before(async function () {
    driver = await createDriver();
  });

  afterEach(async function () {
    await captureOnFailure(driver, this.currentTest);
    testResults.push({
      id: `VAL-${String(testResults.length + 1).padStart(3, '0')}`,
      title: this.currentTest.title,
      suite: 'Validation',
      status: this.currentTest.state === 'passed' ? 'PASS' : this.currentTest.state === 'failed' ? 'FAIL' : 'SKIP',
      duration: this.currentTest.duration,
      error: this.currentTest.err ? this.currentTest.err.message : '',
    });
  });

  after(async function () {
    try {
      await finalizeExcelReport('Selenium - Validation Tests', testResults);
    } catch (err) {
      logger.error(`Failed to generate Excel report: ${err.message}`);
    }
    await quitDriver(driver);
  });

  // ── Login Form Validation ─────────────────────────────

  describe('Login Form Validation', function () {
    let loginPage;

    before(async function () {
      loginPage = new LoginPage(driver);
    });

    it('TC-VAL-001: Should not submit login form with both fields empty', async function () {
      await loginPage.open();
      await loginPage.click(loginPage.loginButton);
      await sleep(500);
      const url = await loginPage.getCurrentUrl();
      expect(url).to.include('/login');
    });

    it('TC-VAL-002: Should not submit login with invalid email format', async function () {
      await loginPage.open();
      await loginPage.type(loginPage.emailInput, 'notanemail');
      await loginPage.type(loginPage.passwordInput, 'password123');
      await loginPage.click(loginPage.loginButton);
      await sleep(500);
      const url = await loginPage.getCurrentUrl();
      expect(url).to.include('/login');
    });

    it('TC-VAL-003: Should show error for wrong password', async function () {
      await loginPage.open();
      await loginPage.login(testData.validUser.email, 'definitelywrongpassword');
      await sleep(2000);
      const hasError = await loginPage.isErrorDisplayed();
      expect(hasError).to.be.true;
    });
  });

  // ── Register Form Validation ──────────────────────────

  describe('Register Form Validation', function () {
    let registerPage;

    before(async function () {
      registerPage = new RegisterPage(driver);
    });

    it('TC-VAL-004: Should load register page', async function () {
      await registerPage.open();
      const isLoaded = await registerPage.isLoaded();
      expect(isLoaded).to.be.true;
    });

    it('TC-VAL-005: Should display all register form fields', async function () {
      await registerPage.open();
      const hasName = await registerPage.isDisplayed(registerPage.fullNameInput);
      const hasAge = await registerPage.isDisplayed(registerPage.ageInput);
      const hasEmail = await registerPage.isDisplayed(registerPage.emailInput);
      expect(hasName).to.be.true;
      expect(hasAge).to.be.true;
      expect(hasEmail).to.be.true;
    });

    it('TC-VAL-006: Should display gender selection buttons', async function () {
      await registerPage.open();
      const hasMale = await registerPage.isDisplayed(registerPage.genderMale);
      const hasFemale = await registerPage.isDisplayed(registerPage.genderFemale);
      const hasOther = await registerPage.isDisplayed(registerPage.genderOther);
      expect(hasMale).to.be.true;
      expect(hasFemale).to.be.true;
      expect(hasOther).to.be.true;
    });

    it('TC-VAL-007: Should show error for password mismatch', async function () {
      await registerPage.open();
      await registerPage.fillForm(testData.registerPasswordMismatch);
      await registerPage.submitForm();
      await sleep(1500);
      const hasError = await registerPage.isErrorDisplayed();
      expect(hasError).to.be.true;
      const errorText = await registerPage.getErrorMessage();
      expect(errorText.toLowerCase()).to.include('password');
      logger.info(`Password mismatch error: "${errorText}"`);
    });

    it('TC-VAL-008: Should navigate to login page via link', async function () {
      await registerPage.open();
      await registerPage.clickLoginLink();
      await sleep(1000);
      const url = await registerPage.getCurrentUrl();
      expect(url).to.include('/login');
    });
  });

  // ── Medication Add Modal Validation ───────────────────

  describe('Medication Add Modal Validation', function () {
    let medsPage;

    before(async function () {
      // Login first
      const loginPage = new LoginPage(driver);
      await loginPage.open();
      await loginPage.loginWithDefaults();
      await sleep(3000);

      const sidebar = new SidebarComponent(driver);
      await sidebar.navigateTo('Medications');
      medsPage = new MedicationsPage(driver);
      await medsPage.waitForLoad();
    });

    it('TC-VAL-009: Should open medication modal', async function () {
      await medsPage.openAddModal();
      const isVisible = await medsPage.isModalVisible();
      expect(isVisible).to.be.true;
    });

    it('TC-VAL-010: Should close medication modal via cancel', async function () {
      await medsPage.closeModal();
      await sleep(500);
      const isVisible = await medsPage.isModalVisible();
      expect(isVisible).to.be.false;
    });

    it('TC-VAL-011: Should reopen medication modal after closing', async function () {
      await medsPage.openAddModal();
      const isVisible = await medsPage.isModalVisible();
      expect(isVisible).to.be.true;
      await medsPage.closeModal();
    });
  });
});
