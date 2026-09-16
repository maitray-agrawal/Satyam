/**
 * GEV-VERIFY (SATYAM) Automated Screenshot Capture Utility
 *
 * Captures high-resolution, un-fabricated screenshots of the running application
 * across the Executive Dashboard, Bidder Dossier, Three-Way Reconciliation, and Audit Ledger.
 *
 * Requirements:
 *   1. Application must be running locally (`npm run dev` at http://localhost:3000)
 *   2. Playwright must be installed (`npx playwright install chromium`)
 *
 * Usage:
 *   node scripts/capture-screenshots.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(__dirname, '../docs/screenshots');

async function main() {
  console.log('====================================================');
  console.log('  GEV-VERIFY Screenshot Capture Utility');
  console.log('====================================================\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Dynamically import playwright to provide graceful feedback if not installed
  let chromium;
  try {
    const pw = await import('playwright');
    chromium = pw.chromium;
  } catch (err) {
    console.error('Playwright is not currently installed.');
    console.log('\nTo install Playwright and capture live screenshots:');
    console.log('  npm install -D playwright');
    console.log('  npx playwright install chromium');
    console.log('  node scripts/capture-screenshots.mjs\n');
    process.exit(1);
  }

  console.log(`Connecting to running application at: ${BASE_URL}`);

  // Test server connectivity
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    if (!healthRes.ok) throw new Error(`Health check returned status ${healthRes.status}`);
    console.log('  PASS: Application server is active.\n');
  } catch (err) {
    console.error(`  ERROR: Could not connect to application at ${BASE_URL}`);
    console.error('  Please ensure the dev server is running before executing this script:');
    console.error('    npm run dev\n');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // High-DPI retina capture
  });
  const page = await context.newPage();

  try {
    // 1. Executive Dashboard
    console.log('1. Capturing Executive Dashboard...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('#dashboard-metrics-grid, text="Dashboard"', { timeout: 10000 });
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'dashboard.png'), fullPage: false });
    console.log('  Saved: docs/screenshots/dashboard.png');

    // 2. Bidder Dossier View
    console.log('2. Capturing Bidder Dossier View...');
    // Look for first bidder card or navigate to tender bidders
    const bidderLink = await page.$('button[id^="btn-view-bidder-"], a[href*="bid-"]');
    if (bidderLink) {
      await bidderLink.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'bidder-dossier.png'), fullPage: false });
      console.log('  Saved: docs/screenshots/bidder-dossier.png');
    } else {
      console.log('  Attempting to open bidder dossier via navigation...');
      await page.goto(`${BASE_URL}/#bids`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'bidder-dossier.png'), fullPage: false });
      console.log('  Saved: docs/screenshots/bidder-dossier.png');
    }

    // 3. Three-Way Reconciliation
    console.log('3. Capturing Three-Way Evidence Reconciliation...');
    const reconTab = await page.$('button#tab-reconciliation, button:has-text("Reconciliation"), button:has-text("Cross-Verification")');
    if (reconTab) {
      await reconTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'three-way-reconciliation.png'), fullPage: false });
      console.log('  Saved: docs/screenshots/three-way-reconciliation.png');
    } else {
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'three-way-reconciliation.png'), fullPage: false });
      console.log('  Saved: docs/screenshots/three-way-reconciliation.png');
    }

    // 4. Audit Ledger & History
    console.log('4. Capturing Audit Ledger...');
    const auditTab = await page.$('button#tab-audit, button:has-text("Audit"), button:has-text("History")');
    if (auditTab) {
      await auditTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'audit-ledger.png'), fullPage: false });
      console.log('  Saved: docs/screenshots/audit-ledger.png');
    } else {
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'audit-ledger.png'), fullPage: false });
      console.log('  Saved: docs/screenshots/audit-ledger.png');
    }

    console.log('\nAll application screenshots captured successfully in docs/screenshots/!\n');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
