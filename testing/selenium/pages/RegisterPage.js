/**
 * Register Page Object
 * 
 * Selectors and actions for the CardioTwin Register page (/register).
 * Derived from: frontend/src/pages/auth/Register.jsx
 */

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const logger = require('../utilities/logger');

class RegisterPage extends BasePage {
  constructor(driver) {
    super(driver);

    // ── Selectors (derived from Register.jsx) ──────────────
    this.fullNameInput = By.css('input[type="text"]');
    this.ageInput = By.css('input[type="number"]');
    this.emailInput = By.css('input[type="email"]');
    this.passwordInputs = By.css('input[type="password"]');
    this.createAccountButton = By.xpath('//button[@type="submit" and (contains(text(),"Create Account") or contains(text(),"Creating"))]');
    this.errorMessage = By.css('.bg-red-50');
    this.loginLink = By.xpath('//a[contains(text(),"Login")]');
    this.pageHeader = By.xpath('//h1[contains(text(),"Create account")]');

    // Gender buttons
    this.genderMale = By.xpath('//button[@type="button" and text()="Male"]');
    this.genderFemale = By.xpath('//button[@type="button" and text()="Female"]');
    this.genderOther = By.xpath('//button[@type="button" and text()="Other"]');
  }

  /**
   * Navigate to the register page.
   */
  async open() {
    await this.navigate('/register');
    logger.info('Register page opened');
  }

  /**
   * Fill the registration form.
   * @param {object} data - Registration data
   * @param {string} data.full_name
   * @param {number} data.age
   * @param {string} data.gender - Male | Female | Other
   * @param {string} data.email
   * @param {string} data.password
   * @param {string} data.confirm_password
   */
  async fillForm(data) {
    logger.info(`Filling registration form for: ${data.email}`);

    await this.type(this.fullNameInput, data.full_name);
    await this.type(this.ageInput, String(data.age));

    // Select gender
    if (data.gender === 'Female') {
      await this.click(this.genderFemale);
    } else if (data.gender === 'Other') {
      await this.click(this.genderOther);
    } else {
      await this.click(this.genderMale);
    }

    await this.type(this.emailInput, data.email);

    // Password fields — there are two password inputs
    const pwFields = await this.findElements(this.passwordInputs);
    if (pwFields.length >= 2) {
      await pwFields[0].clear();
      await pwFields[0].sendKeys(data.password);
      await pwFields[1].clear();
      await pwFields[1].sendKeys(data.confirm_password);
    }
  }

  /**
   * Submit the registration form.
   */
  async submitForm() {
    await this.click(this.createAccountButton);
  }

  /**
   * Fill and submit the registration form.
   * @param {object} data
   */
  async register(data) {
    await this.fillForm(data);
    await this.submitForm();
  }

  /**
   * Get the error message text.
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
   * Check if the register page is loaded.
   * @returns {Promise<boolean>}
   */
  async isLoaded() {
    return this.isDisplayed(this.fullNameInput);
  }

  /**
   * Click the "Login" link.
   */
  async clickLoginLink() {
    await this.click(this.loginLink);
  }
}

module.exports = RegisterPage;
