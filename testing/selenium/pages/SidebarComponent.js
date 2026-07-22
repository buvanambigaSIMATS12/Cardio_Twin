/**
 * Sidebar Component Page Object
 * 
 * Selectors and actions for the desktop Sidebar navigation.
 * Derived from: frontend/src/desktop/components/Sidebar.jsx
 */

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const logger = require('../utilities/logger');

class SidebarComponent extends BasePage {
  constructor(driver) {
    super(driver);

    // ── Selectors ──────────────────────────────────────────
    this.sidebar = By.css('.desktop-sidebar');
    this.brandLogo = By.css('.desktop-sidebar .rounded-lg.bg-teal-500');
    this.brandText = By.xpath('//span[contains(@class,"nav-label") and contains(text(),"CardioTwin")]');
    this.navSection = By.css('.desktop-sidebar nav');
    this.collapseToggle = By.css('.desktop-sidebar button[title]');

    // Navigation links — using href attribute
    this.navLinks = {
      Dashboard: By.css('.desktop-sidebar nav a[href="/"]'),
      ECG: By.css('.desktop-sidebar nav a[href="/ecg"]'),
      'Digital Twin': By.css('.desktop-sidebar nav a[href="/twin"]'),
      Medications: By.css('.desktop-sidebar nav a[href="/medications"]'),
      History: By.css('.desktop-sidebar nav a[href="/history"]'),
      Doctors: By.css('.desktop-sidebar nav a[href="/doctors"]'),
      Profile: By.css('.desktop-sidebar nav a[href="/profile"]'),
      Settings: By.css('.desktop-sidebar nav a[href="/settings"]'),
    };

    // Active link indicator
    this.activeLink = By.css('.desktop-sidebar nav a.bg-teal-500\\/15');
  }

  /**
   * Check if the sidebar is visible.
   * @returns {Promise<boolean>}
   */
  async isVisible() {
    return this.isDisplayed(this.sidebar);
  }

  /**
   * Navigate to a page using the sidebar.
   * @param {string} pageName - One of: Dashboard, ECG, Digital Twin, Medications, History, Doctors, Profile, Settings
   */
  async navigateTo(pageName) {
    const link = this.navLinks[pageName];
    if (!link) {
      throw new Error(`Unknown sidebar page: ${pageName}. Valid pages: ${Object.keys(this.navLinks).join(', ')}`);
    }
    logger.info(`Sidebar: navigating to ${pageName}`);
    await this.click(link);
    const { sleep } = require('../utilities/waitHelpers');
    await sleep(1500); // Allow page transition
  }

  /**
   * Check if a nav item is currently active.
   * @param {string} pageName
   * @returns {Promise<boolean>}
   */
  async isNavItemActive(pageName) {
    const link = this.navLinks[pageName];
    if (!link) return false;
    try {
      const element = await this.driver.findElement(link);
      const classes = await element.getAttribute('class');
      return classes.includes('bg-teal-500/15') || classes.includes('text-teal-400');
    } catch {
      return false;
    }
  }

  /**
   * Get all sidebar navigation item names.
   * @returns {Promise<string[]>}
   */
  async getNavItemNames() {
    const navLabels = By.css('.desktop-sidebar nav .nav-label');
    const elements = await this.findElements(navLabels);
    const names = [];
    for (const el of elements) {
      names.push(await el.getText());
    }
    return names;
  }

  /**
   * Click the collapse/expand toggle button.
   */
  async toggleCollapse() {
    logger.info('Toggling sidebar collapse');
    await this.click(this.collapseToggle);
    const { sleep } = require('../utilities/waitHelpers');
    await sleep(500);
  }

  /**
   * Check if the sidebar is collapsed.
   * @returns {Promise<boolean>}
   */
  async isCollapsed() {
    const element = await this.driver.findElement(this.sidebar);
    const classes = await element.getAttribute('class');
    return classes.includes('desktop-sidebar-collapsed');
  }

  /**
   * Check if the brand logo is visible.
   * @returns {Promise<boolean>}
   */
  async isBrandLogoVisible() {
    return this.isDisplayed(this.brandLogo);
  }
}

module.exports = SidebarComponent;
