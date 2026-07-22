/**
 * Default Configuration for CardioTwin Selenium E2E Tests
 * 
 * This file contains all base configuration values.
 * Environment-specific overrides are in environments.js.
 */

module.exports = {
  // ── Application URLs ──────────────────────────────────────
  baseUrl: 'http://localhost:5173',
  apiUrl: 'http://localhost:8000',

  // ── Browser Configuration ────────────────────────────────
  browser: process.env.BROWSER || 'chrome',       // chrome | edge | firefox
  headless: process.env.HEADLESS !== 'false',      // default: true (headless)

  // ── Viewport (must be >= 1024 for desktop mode) ──────────
  viewport: {
    width: 1280,
    height: 900,
  },

  // ── Timeouts (milliseconds) ──────────────────────────────
  timeouts: {
    implicit: 10000,
    pageLoad: 30000,
    script: 30000,
    explicit: 15000,
  },

  // ── Test User Credentials ────────────────────────────────
  credentials: {
    email: 'buvanambigasaravana@gmail.com',
    password: '122830',
  },

  // ── Paths (relative to testing/selenium/) ────────────────
  paths: {
    screenshots: './screenshots',
    logs: './logs',
    reports: './reports',
    excel: './excel',
  },

  // ── Application Routes ───────────────────────────────────
  routes: {
    login: '/login',
    register: '/register',
    dashboard: '/',
    ecg: '/ecg',
    digitalTwin: '/twin',
    medications: '/medications',
    history: '/history',
    doctors: '/doctors',
    profile: '/profile',
    settings: '/settings',
  },

  // ── Retry Configuration ──────────────────────────────────
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
  },
};
