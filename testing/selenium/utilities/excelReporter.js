/**
 * Excel Reporter
 * 
 * Generates a professional Excel (.xlsx) test report with:
 *  - Summary sheet: pass/fail/skip counts, overall status
 *  - Detailed sheet: every test case with result info
 * 
 * Uses ExcelJS library.
 */

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const config = require('./configLoader');
const logger = require('./logger');

const excelDir = path.resolve(__dirname, '..', config.paths.excel);

// Ensure output directory exists
if (!fs.existsSync(excelDir)) {
  fs.mkdirSync(excelDir, { recursive: true });
}

// ── Styling Constants ──────────────────────────────────────

const HEADER_FONT = { name: 'Calibri', bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } };
const TITLE_FONT = { name: 'Calibri', bold: true, size: 16, color: { argb: 'FF2F5496' } };
const PASS_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
const PASS_FONT = { name: 'Calibri', bold: true, color: { argb: 'FF006100' } };
const FAIL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
const FAIL_FONT = { name: 'Calibri', bold: true, color: { argb: 'FF9C0006' } };
const SKIP_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
const SKIP_FONT = { name: 'Calibri', bold: true, color: { argb: 'FF9C6500' } };
const LABEL_FONT = { name: 'Calibri', bold: true, size: 11 };
const LABEL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6E4F0' } };
const ALT_ROW_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6E4F0' } };
const THIN_BORDER = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

/**
 * Generate an Excel test report from test results.
 * 
 * @param {object} results - Test results object
 * @param {string} results.suiteName - Name of the test suite
 * @param {Array} results.tests - Array of test result objects
 * @param {string} results.tests[].id - Test case ID
 * @param {string} results.tests[].title - Test case title
 * @param {string} results.tests[].suite - Suite / module name
 * @param {string} results.tests[].status - PASS | FAIL | SKIP
 * @param {number} results.tests[].duration - Duration in ms
 * @param {string} [results.tests[].error] - Error message if failed
 * @returns {Promise<string>} Path to the generated Excel file
 */
async function generateExcelReport(results) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CardioTwin Selenium E2E';
  workbook.created = new Date();

  const { suiteName, tests } = results;
  const totalTests = tests.length;
  const passed = tests.filter((t) => t.status === 'PASS').length;
  const failed = tests.filter((t) => t.status === 'FAIL').length;
  const skipped = tests.filter((t) => t.status === 'SKIP').length;
  const overallStatus = failed > 0 ? 'FAIL' : 'PASS';
  const passPercent = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : '0.0';

  // ── Summary Sheet ────────────────────────────────────────
  const summary = workbook.addWorksheet('Summary', {
    properties: { tabColor: { argb: 'FF2F5496' } },
  });

  // Title
  summary.mergeCells('B2:E2');
  const titleCell = summary.getCell('B2');
  titleCell.value = `${suiteName} - Execution Summary`;
  titleCell.font = TITLE_FONT;
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Summary data
  const summaryRows = [
    ['Suite Name', suiteName],
    ['Total Test Cases', totalTests],
    ['Passed', passed],
    ['Failed', failed],
    ['Skipped', skipped],
    ['Overall Status', overallStatus],
    ['Pass Percentage', `${passPercent}%`],
    ['Execution Date', new Date().toLocaleString()],
    ['Browser', config.browser],
    ['Environment', process.env.TEST_ENV || 'default'],
  ];

  summaryRows.forEach(([label, value], idx) => {
    const row = 4 + idx;
    const labelCell = summary.getCell(`B${row}`);
    const valueCell = summary.getCell(`C${row}`);
    labelCell.value = label;
    labelCell.font = LABEL_FONT;
    labelCell.fill = LABEL_FILL;
    labelCell.border = THIN_BORDER;
    valueCell.value = value;
    valueCell.border = THIN_BORDER;
    valueCell.alignment = { horizontal: 'center' };
    if (label === 'Overall Status') {
      valueCell.fill = overallStatus === 'PASS' ? PASS_FILL : FAIL_FILL;
      valueCell.font = overallStatus === 'PASS' ? PASS_FONT : FAIL_FONT;
    }
  });

  summary.getColumn('B').width = 28;
  summary.getColumn('C').width = 30;

  // ── Detailed Report Sheet ────────────────────────────────
  const detail = workbook.addWorksheet('Detailed Report', {
    properties: { tabColor: { argb: 'FF548235' } },
  });

  const headers = ['#', 'Test Case ID', 'Test Case Title', 'Suite / Module', 'Status', 'Duration (ms)', 'Error / Remarks'];
  const colWidths = [6, 18, 55, 30, 14, 16, 55];

  // Header row
  headers.forEach((header, idx) => {
    const cell = detail.getCell(1, idx + 1);
    cell.value = header;
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = THIN_BORDER;
    detail.getColumn(idx + 1).width = colWidths[idx];
  });

  // Freeze header row
  detail.views = [{ state: 'frozen', ySplit: 1 }];

  // Data rows
  tests.forEach((test, idx) => {
    const rowNum = idx + 2;
    const values = [
      idx + 1,
      test.id || `TC-${String(idx + 1).padStart(3, '0')}`,
      test.title,
      test.suite || '--',
      test.status,
      test.duration || 0,
      test.error || (test.status === 'PASS' ? 'Executed successfully' : ''),
    ];

    values.forEach((val, colIdx) => {
      const cell = detail.getCell(rowNum, colIdx + 1);
      cell.value = val;
      cell.border = THIN_BORDER;
      cell.alignment = { vertical: 'middle', wrapText: true };

      // Status column styling
      if (colIdx === 4) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        switch (val) {
          case 'PASS':
            cell.fill = PASS_FILL;
            cell.font = PASS_FONT;
            break;
          case 'FAIL':
            cell.fill = FAIL_FILL;
            cell.font = FAIL_FONT;
            break;
          case 'SKIP':
            cell.fill = SKIP_FILL;
            cell.font = SKIP_FONT;
            break;
        }
      } else if (rowNum % 2 === 0) {
        cell.fill = ALT_ROW_FILL;
      }
    });
  });

  // Auto-filter
  detail.autoFilter = `A1:G${tests.length + 1}`;

  // Save
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `selenium-report-${timestamp}.xlsx`;
  const filepath = path.join(excelDir, filename);

  await workbook.xlsx.writeFile(filepath);
  logger.info(`Excel report generated: ${filepath}`);
  return filepath;
}

/**
 * Collect test results from Mocha runner for Excel reporting.
 * Call this in the root after() hook.
 * 
 * @param {string} suiteName - Name of the suite
 * @param {Array} testResults - Collected test results
 * @returns {Promise<string>} Path to Excel report
 */
async function finalizeExcelReport(suiteName, testResults) {
  return generateExcelReport({ suiteName, tests: testResults });
}

module.exports = { generateExcelReport, finalizeExcelReport };
