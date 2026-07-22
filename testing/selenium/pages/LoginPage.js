/**
 * Login Page Object
 * 
 * Selectors and actions for the CardioTwin Login page (/login).
 * Derived from: frontend/src/pages/auth/Login.jsx
 */

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../utilities/configLoader');
const logger = require('../utilities/logger');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);

    // ── Selectors (derived from Login.jsx) ──────────────────
    this.emailInput = By.css('input[type="email"]');
    this.passwordInput = By.css('input[type="password"]');
    this.loginButton = By.xpath('//button[@type="submit" and (contains(text(),"Login") or contains(text(),"Signing in"))]');
    this.errorMessage = By.css('.bg-red-50');
    this.forgotPasswordLink = By.xpath('//a[contains(text(),"Forgot password")]');
    this.registerLink = By.xpath('//a[contains(text(),"Register")]');
    this.welcomeHeading = By.xpath('//h2[contains(text(),"Welcome back")]');
    this.subtitle = By.xpath('//p[contains(text(),"Sign in to CardioTwin")]');
    this.showPasswordButton = By.css('button[type="button"]');
    this.pageHeader = By.xpath('//h1[contains(text(),"Login")]');
  }

  /**
   * Navigate to the login page.
   */
  async open() {
    await this.navigate(config.routes.login);
    logger.info('Login page opened');
  }

  /**
   * Perform a login with the given credentials.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    logger.info(`Logging in with email: ${email}`);
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  /**
   * Login with the default test credentials.
   */
  async loginWithDefaults() {
    await this.login(config.credentials.email, config.credentials.password);
  }

  /**
   * Get the error message text displayed on login failure.
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    return this.getText(this.errorMessage);
  }

  /**
   * Check if the error message is displayed.
   * @returns {Promise<boolean>}
   */
  async isErrorDisplayed() {
    return this.isDisplayed(this.errorMessage);
  }

  /**
   * Check if the login page is loaded.
   * @returns {Promise<boolean>}
   */
  async isLoaded() {
    return this.isDisplayed(this.emailInput);
  }

  /**
   * Click the "Forgot password?" link.
   */
  async clickForgotPassword() {
    await this.click(this.forgotPasswordLink);
  }

  /**
   * Click the "Register" link.
   */
  async clickRegisterLink() {
    await this.click(this.registerLink);
  }

  /**
   * Get the email field value.
   * @returns {Promise<string>}
   */
  async getEmailValue() {
    return this.getInputValue(this.emailInput);
  }

  /**
   * Get the password field value.
   * @returns {Promise<string>}
   */
  async getPasswordValue() {
    return this.getInputValue(this.passwordInput);
  }

  /**
   * Check if the submit button is enabled.
   * @returns {Promise<boolean>}
   */
  async isLoginButtonEnabled() {
    const btn = await this.waitForElement(this.loginButton);
    const disabled = await btn.getAttribute('disabled');
    return disabled === null;
  }
}

module.exports = LoginPage;
