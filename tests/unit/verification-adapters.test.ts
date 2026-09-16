import { initializeVerificationRegistry } from '../../server/integrations/verification';

export async function runVerificationAdaptersUnitTests(): Promise<{ passed: number; failed: number; tests: string[] }> {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${testName}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${testName}`);
    }
  }

  const registry = initializeVerificationRegistry();
  const allAdapters = registry.getAllAdapters();

  assert(allAdapters.length >= 13, `Verification Registry: At least 13 adapters registered (actual: ${allAdapters.length})`);

  // Test GST Adapter
  const gstAdapter = registry.getAdapter('GST');
  assert(!!gstAdapter, 'Verification Registry: GST adapter found');
  if (gstAdapter) {
    const res = await gstAdapter.verify({
      requirementCode: 'GST',
      bidId: 'test-bid',
      bidderGstin: '07AAACT2727Q1ZB',
      bidderLegalName: 'TECHVANGUARD SOLUTIONS PRIVATE LIMITED',
    });
    assert(res.simulated === true, 'GST Adapter: Returns simulated: true flag');
    assert(res.simulationNotice.includes('SIMULATED') || res.simulationNotice.includes('DEMO'), 'GST Adapter: Includes simulation notice');
    assert(res.matchStatus === 'VERIFIED', 'GST Adapter: Active GSTIN matches as VERIFIED');
  }

  // Test PAN Adapter
  const panAdapter = registry.getAdapter('PAN');
  assert(!!panAdapter, 'Verification Registry: PAN adapter found');
  if (panAdapter) {
    const res = await panAdapter.verify({
      requirementCode: 'PAN',
      bidId: 'test-bid',
      bidderPan: 'AAACT2727Q',
    });
    assert(res.matchStatus === 'VERIFIED', 'PAN Adapter: Returns VERIFIED status for valid PAN');
  }

  // Test Blacklist Adapter
  const blAdapter = registry.getAdapter('BLACKLISTING');
  assert(!!blAdapter, 'Verification Registry: Debarment/Blacklist adapter found');
  if (blAdapter) {
    const cleanRes = await blAdapter.verify({
      requirementCode: 'BLACKLISTING',
      bidId: 'test-clean-bid',
      bidderPan: 'AAACT2727Q',
      bidderLegalName: 'TECHVANGUARD SOLUTIONS PRIVATE LIMITED',
    });
    assert(cleanRes.matchStatus === 'VERIFIED', 'Blacklist Adapter: Non-blacklisted entity returns VERIFIED clean');

    const blacklistedRes = await blAdapter.verify({
      requirementCode: 'BLACKLISTING',
      bidId: 'test-bl-bid',
      bidderPan: 'AAACG9999K',
      bidderLegalName: 'GLOBAL QUANTUM TECHNOLOGIES PVT LTD',
    });
    assert(blacklistedRes.matchStatus === 'FLAGGED', 'Blacklist Adapter: Blacklisted entity returns FLAGGED status');
    assert(blacklistedRes.verifiedData.isBlacklisted === true, 'Blacklist Adapter: isBlacklisted flag is true');
  }

  // Test Make In India Adapter
  const miiAdapter = registry.getAdapter('MAKE_IN_INDIA');
  assert(!!miiAdapter, 'Verification Registry: Make In India adapter found');

  // Test Udyam MSME Adapter
  const udyamAdapter = registry.getAdapter('UDYAM');
  assert(!!udyamAdapter, 'Verification Registry: Udyam MSME adapter found');

  return { passed, failed, tests: results };
}
