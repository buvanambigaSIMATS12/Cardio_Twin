/**
 * TopNav Component Page Object
 * 
 * Selectors and actions for the desktop Top Navigation bar.
 * Derived from: frontend/src/desktop/components/TopNav.jsx
 */

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class TopNavComponent extends BasePage {
  constructor(driver) {
    super(driver);

    // ── Selectors (derived from TopNav.jsx) ────────────────
    this.topNav = By.css('header.h-16');
    this.projectTitle = By.xpath('//header//h1[contains(text(),"CardioTwin Desktop")]');
    this.searchInput = By.css('header input[placeholder="Search..."]');
    this.notificationBell = By.css('header button[title="Notifications"]');
    this.notificationBadge = By.css('header .bg-red-500.rounded-full');
    this.userAvatar = By.css('header .rounded-full.bg-teal-500');
    this.userName = By.css('header span.text-sm.font-medium');
  }

  /**
   * Check if the TopNav is visible.
   * @returns {Promise<boolean>}
   */
  async isVisible() {
    return this.isDisplayed(this.topNav);
  }

  /**
   * Get the project title text.
   * @returns {Promise<string>}
   */
  async getProjectTitle() {
    return this.getText(this.projectTitle);
  }

  /**
   * Check if the search input is visible.
   * @returns {Promise<boolean>}
   */
  async isSearchVisible() {
    return this.isDisplayed(this.searchInput);
  }

  /**
   * Check if the notification bell is visible.
   * @returns {Promise<boolean>}
   */
  async isNotificationBellVisible() {
    return this.isDisplayed(this.notificationBell);
  }

  /**
   * Check if the user avatar is visible.
   * @returns {Promise<boolean>}
   */
  async isUserAvatarVisible() {
    return this.isDisplayed(this.userAvatar);
  }

  /**
   * Check if the notification badge (red dot) is displayed.
   * @returns {Promise<boolean>}
   */
  async hasNotificationBadge() {
    return this.isDisplayed(this.notificationBadge);
  }
}

module.exports = TopNavComponent;
