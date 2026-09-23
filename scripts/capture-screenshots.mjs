/**
 * SATYAM Automated Screenshot Capture Utility
 *
 * Captures high-resolution, un-fabricated screenshots of the running application
 * across all 8 required screens for SIH submission review:
 *   1. 01-command-center.png
 *   2. 02-tender-requirements.png
 *   3. 03-bidder-dossier.png
 *   4. 04-three-way-reconciliation.png
 *   5. 05-compliance-analysis.png
 *   6. 06-evidence-provenance.png
 *   7. 07-officer-decision.png
 *   8. 08-audit-ledger.png
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
  console.log('  SATYAM SIH-26100 Screenshot Capture Utility');
  console.log('====================================================\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let chromium;
  try {
    const pw = await import('playwright');
    chromium = pw.chromium;
  } catch (err) {
    console.error('Playwright is not installed.');
    process.exit(1);
  }

  console.log(`Connecting to running application at: ${BASE_URL}`);
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    if (!healthRes.ok) throw new Error(`Health status ${healthRes.status}`);
    console.log('  PASS: Application server is active.\n');
  } catch (err) {
    console.error(`  ERROR: Could not connect to application at ${BASE_URL}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // High-DPI retina capture
  });
  const page = await context.newPage();

  try {
    // 1. Command Center / Dashboard
    console.log('1. Capturing 01-command-center.png...');
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('#satyam-header', { timeout: 10000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-command-center.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/01-command-center.png');

    // 2. Tender Requirements & Ruleset Intelligence
    console.log('2. Capturing 02-tender-requirements.png...');
    const tenderTab = page.locator('#nav-tab-tenders');
    await tenderTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-tender-requirements.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/02-tender-requirements.png');

    // 3. Bidder Dossier View (Apex Infotech / Scenario 2)
    console.log('3. Capturing 03-bidder-dossier.png...');
    const dashTab = page.locator('#nav-tab-dashboard');
    await dashTab.click();
    await page.waitForTimeout(1000);
    const apexDossierBtn = page.locator('#btn-open-dossier-bid-2');
    await apexDossierBtn.click();
    await page.waitForSelector('#subtab-overview', { timeout: 10000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03-bidder-dossier.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/03-bidder-dossier.png');

    // 4. Three-Way Reconciliation Matrix
    console.log('4. Capturing 04-three-way-reconciliation.png...');
    const reconSubtab = page.locator('#subtab-reconciliation');
    await reconSubtab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04-three-way-reconciliation.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/04-three-way-reconciliation.png');

    // 5. Compliance Analysis Report
    console.log('5. Capturing 05-compliance-analysis.png...');
    const reportsTab = page.locator('#nav-tab-reports');
    await reportsTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05-compliance-analysis.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/05-compliance-analysis.png');

    // 6. Evidence & Provenance
    console.log('6. Capturing 06-evidence-provenance.png...');
    await dashTab.click();
    await page.waitForTimeout(1000);
    const tvDossierBtn = page.locator('#btn-open-dossier-bid-1');
    await tvDossierBtn.click();
    await page.waitForTimeout(1000);
    const docSubtab = page.locator('#subtab-documents');
    await docSubtab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06-evidence-provenance.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/06-evidence-provenance.png');

    // 7. Officer Review & Decision
    console.log('7. Capturing 07-officer-decision.png...');
    const decisionSubtab = page.locator('#subtab-decision');
    await decisionSubtab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07-officer-decision.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/07-officer-decision.png');

    // 8. Cryptographic Audit Ledger
    console.log('8. Capturing 08-audit-ledger.png...');
    const auditNavBtn = page.locator('#nav-tab-audit');
    await auditNavBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08-audit-ledger.png'), fullPage: false });
    console.log('  ✅ Captured: docs/screenshots/08-audit-ledger.png');

    console.log('\n====================================================');
    console.log('  All 8 SIH submission screenshots captured successfully!');
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
