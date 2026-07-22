# CardioTwin Selenium E2E Automation Framework

Production-ready Selenium WebDriver E2E testing framework for the CardioTwin desktop web application.

## Architecture

- **Page Object Model (POM)** — Each page/component has a dedicated class
- **Config Driven** — Environment-specific configs with env var overrides
- **Reusable Utilities** — Browser factory, waits, screenshots, retry, logger, reporters

## Tech Stack

| Tool | Purpose |
|------|---------|
| Selenium WebDriver | Browser automation |
| Mocha | Test runner |
| Chai | Assertions |
| Mochawesome | HTML test reports |
| ExcelJS | Excel test reports |
| Winston | Structured logging |
| ChromeDriver / GeckoDriver / MSEdgeDriver | Browser drivers |

## Folder Structure

```
testing/selenium/
├── config/               # Configuration files
│   ├── default.config.js # Base config (URLs, credentials, timeouts)
│   └── environments.js   # Environment overrides (local, ci, staging)
├── pages/                # Page Object Model classes
│   ├── BasePage.js       # Abstract base page
│   ├── LoginPage.js      # Login page
│   ├── RegisterPage.js   # Register page
│   ├── DashboardPage.js  # Dashboard page
│   ├── ECGPage.js        # ECG page
│   ├── DigitalTwinPage.js# Digital Twin page
│   ├── MedicationsPage.js# Medications page
│   ├── HistoryPage.js    # History page
│   ├── DoctorsPage.js    # Doctors page
│   ├── ProfilePage.js    # Profile page
│   ├── SettingsPage.js   # Settings page
│   ├── SidebarComponent.js # Sidebar navigation
│   └── TopNavComponent.js  # Top navigation bar
├── tests/                # Test suites
│   ├── auth.test.js      # Authentication tests
│   ├── navigation.test.js# Navigation & routing tests
│   ├── dashboard.test.js # Dashboard tests
│   ├── ecg.test.js       # ECG tests
│   ├── digitalTwin.test.js # Digital Twin tests
│   ├── medications.test.js # Medications tests
│   ├── history.test.js   # History tests
│   ├── doctors.test.js   # Doctors tests
│   ├── profile.test.js   # Profile tests
│   ├── settings.test.js  # Settings tests
│   └── validation.test.js# Form validation tests
├── utilities/            # Reusable helpers
│   ├── driverFactory.js  # Browser launch & teardown
│   ├── waitHelpers.js    # Explicit wait utilities
│   ├── screenshotHelper.js # Screenshot capture
│   ├── retryHelper.js    # Retry wrapper
│   ├── logger.js         # Winston logger
│   ├── configLoader.js   # Config merger
│   ├── excelReporter.js  # Excel report generator
│   └── htmlReporter.js   # HTML report helper
├── data/                 # Test data
│   └── testData.json     # Credentials, form data, search terms
├── reports/              # HTML reports (auto-generated)
├── screenshots/          # Failure screenshots (auto-generated)
├── logs/                 # Winston log files (auto-generated)
├── excel/                # Excel reports (auto-generated)
├── .github/workflows/    # CI/CD
│   └── selenium-e2e.yml  # GitHub Actions workflow
├── package.json          # Dependencies
├── .mocharc.yml          # Mocha configuration
└── README.md             # This file
```

## Prerequisites

- Node.js 18+
- Google Chrome, Microsoft Edge, or Mozilla Firefox
- CardioTwin backend running on `http://localhost:8000`
- CardioTwin frontend running on `http://localhost:5173`

## Setup

```bash
cd testing/selenium
npm install
```

## Running Tests

### Run all tests (Chrome, headless)
```bash
npm test
```

### Run with specific browser
```bash
npm run test:chrome
npm run test:edge
npm run test:firefox
```

### Run in headed mode (visible browser)
```bash
npm run test:headed
```

### Run a single test suite
```bash
npm run test:auth
npm run test:navigation
npm run test:dashboard
npm run test:ecg
npm run test:twin
npm run test:medications
npm run test:history
npm run test:doctors
npm run test:profile
npm run test:settings
npm run test:validation
```

### Run with environment overrides
```bash
# CI environment (longer timeouts)
TEST_ENV=ci npm test

# Specific browser + headed
BROWSER=firefox HEADLESS=false npm test

# Custom base URL
BASE_URL=http://192.168.1.100:5173 npm test
```

## Test Suites

| Suite | Tests | Coverage |
|-------|-------|----------|
| Authentication | 15 | Login, logout, invalid login, empty fields, navigation |
| Navigation | 18 | Sidebar links, collapse, TopNav, all page routing |
| Dashboard | 12 | All dashboard cards visibility |
| ECG | 6 | Upload panel, preview, diagnosis, history |
| Digital Twin | 8 | Heart status, risk gauge, timeline, lifestyle, simulation, AI |
| Medications | 9 | Add modal, adherence, schedule, table, refill |
| History | 6 | Stats, metrics chart, ECG history, activity timeline |
| Doctors | 8 | Search, filter, table, hospitals |
| Profile | 7 | Summary, personal info, stats, medical history, contacts |
| Settings | 8 | General, appearance, notification, privacy, system info |
| Validation | 11 | Login/register/medication form validation |

## Reports

### HTML Report (Mochawesome)
Generated automatically in `reports/mochawesome-report/`. Open the `.html` file in a browser.

### Excel Report
Generated automatically in `excel/`. Each test suite produces its own Excel file with:
- **Summary sheet**: Pass/fail counts, overall status
- **Detailed sheet**: Every test case with ID, title, status, duration, error

### Failure Screenshots
Captured automatically on test failure in `screenshots/` directory.

### Logs
Written to `logs/test-run.log` and `logs/errors.log` via Winston.

## CI/CD

GitHub Actions workflow at `.github/workflows/selenium-e2e.yml`:
- Triggers on push to `main`/`develop` or manually
- Installs Chrome, Edge, and Firefox
- Starts backend and frontend servers
- Runs all tests in headless mode
- Uploads reports, screenshots, excel, and logs as artifacts

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BROWSER` | `chrome` | Browser: `chrome`, `edge`, `firefox` |
| `HEADLESS` | `true` | Run headless (`true`) or headed (`false`) |
| `TEST_ENV` | (none) | Environment: `local`, `ci`, `staging` |
| `BASE_URL` | `http://localhost:5173` | Frontend URL |
| `API_URL` | `http://localhost:8000` | Backend API URL |
