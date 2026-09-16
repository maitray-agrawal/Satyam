/**
 * GEV-VERIFY (SATYAM) Automated Screenshot Capture Utility
 *
 * Captures high-resolution, un-fabricated screenshots of the running application
 * across all core screens:
 *   1. 01-dashboard.png
 *   2. 02-bidder-dossier.png
 *   3. 03-document-intelligence.png
 *   4. 04-verification-results.png
 *   5. 05-three-way-reconciliation.png
 *   6. 06-consistency-analysis.png
 *   7. 07-audit-ledger.png
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
    // 1. Procurement Dashboard
    console.log('1. Capturing 01-dashboard.png...');
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('#satyam-header', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-dashboard.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/01-dashboard.png');

    // 2. Bidder Dossier View
    console.log('2. Capturing 02-bidder-dossier.png...');
    const apexBtn = page.getByText('Apex Infotech').first();
    if ((await apexBtn.count()) > 0) {
      await apexBtn.click();
    } else {
      const firstBidder = page.locator('button:has-text("Inspect Dossier")').first();
      await firstBidder.click();
    }
    await page.waitForSelector('#subtab-overview', { timeout: 10000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-bidder-dossier.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/02-bidder-dossier.png');

    // 3. Document Intelligence
    console.log('3. Capturing 03-document-intelligence.png...');
    const docSubtab = page.locator('#subtab-documents');
    await docSubtab.click();
    await page.waitForTimeout(1000);
    const reanalyzeBtn = page.getByRole('button', { name: 'Re-analyze Document' });
    if ((await reanalyzeBtn.count()) > 0) {
      await reanalyzeBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.evaluate(() => window.scrollBy(0, 380));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03-document-intelligence.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/03-document-intelligence.png');

    // Reset scroll
    await page.evaluate(() => window.scrollTo(0, 0));

    // 4. Verification Results
    console.log('4. Capturing 04-verification-results.png...');
    const verifSubtab = page.locator('#subtab-verifications');
    await verifSubtab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04-verification-results.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/04-verification-results.png');

    // 5. Three-Way Reconciliation
    console.log('5. Capturing 05-three-way-reconciliation.png...');
    const reconSubtab = page.locator('#subtab-reconciliation');
    await reconSubtab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05-three-way-reconciliation.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/05-three-way-reconciliation.png');

    // 6. Cross-Document Consistency
    console.log('6. Capturing 06-consistency-analysis.png...');
    const consistencySubtab = page.locator('#subtab-consistency');
    await consistencySubtab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06-consistency-analysis.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/06-consistency-analysis.png');

    // 7. Audit & Evaluation History
    console.log('7. Capturing 07-audit-ledger.png...');
    const auditNavBtn = page.locator('#nav-tab-audit');
    await auditNavBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07-audit-ledger.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/07-audit-ledger.png');

    console.log('\n====================================================');
    console.log('  All 7 REAL screenshots captured successfully!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
