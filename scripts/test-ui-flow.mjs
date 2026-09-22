import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1536, height: 1100 } });
  await page.goto('http://localhost:3000');
  await page.waitForSelector('#satyam-header');
  
  // Click TechVanguard
  await page.locator('text=TechVanguard').first().click();
  await page.waitForTimeout(1000);
  
  // Click Compliance Report button in dossier
  await page.click('#btn-print-tec-report');
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'docs/screenshots/satyam-techvanguard-report.png' });
  
  // Click Back to Dossier
  await page.click('#btn-back-to-dossier');
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'docs/screenshots/satyam-dossier-returned.png' });
  
  await browser.close();
  console.log('Tested TechVanguard report and Back to Dossier successfully!');
}

main().catch(console.error);
