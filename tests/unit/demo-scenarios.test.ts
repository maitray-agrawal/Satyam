import { getDb, getBidFullDetails } from '../../server/db';
import { evaluateBidCompliance } from '../../server/complianceEngine';

export async function runDemoScenariosTests(): Promise<{ passed: number; failed: number; tests: string[] }> {
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

  // Ensure DB initialized with seed data
  await getDb();

  // 1. Scenario 1: Clean Bidder (bid-1: TechVanguard)
  const bid1 = await getBidFullDetails('bid-1');
  assert(!!bid1, 'Demo Scenario 1: Bid-1 (TechVanguard) exists in database');
  assert(bid1?.riskLevel === 'LOW', `Demo Scenario 1: TechVanguard has LOW risk level (actual: ${bid1?.riskLevel})`);
  assert((bid1?.overallScore || 0) >= 90, `Demo Scenario 1: TechVanguard score >= 90 (actual: ${bid1?.overallScore})`);
  assert(
    bid1?.complianceChecks?.every((c) => c.status === 'COMPLIANT' || c.status === 'EXEMPTED') || false,
    'Demo Scenario 1: TechVanguard all checks COMPLIANT or EXEMPTED'
  );

  // 2. Scenario 2: Expired OEM MAF / Discrepancy (bid-2: Apex Infotech)
  const bid2 = await getBidFullDetails('bid-2');
  assert(!!bid2, 'Demo Scenario 2: Bid-2 (Apex Infotech) exists in database');
  assert(bid2?.riskLevel === 'MEDIUM' || bid2?.riskLevel === 'HIGH', `Demo Scenario 2: Apex Infotech has elevated risk (actual: ${bid2?.riskLevel})`);
  const oemCheck = bid2?.complianceChecks?.find((c) => c.requirementCode === 'OEM_AUTHORIZATION');
  assert(
    oemCheck?.status === 'NON_COMPLIANT' || oemCheck?.status === 'REVIEW',
    `Demo Scenario 2: OEM authorization check flagged (actual: ${oemCheck?.status})`
  );

  // 3. Scenario 3: Contradiction / Local Content Mismatch (bid-3: Bharat Electro)
  const bid3 = await getBidFullDetails('bid-3');
  assert(!!bid3, 'Demo Scenario 3: Bid-3 (Bharat Electro) exists in database');
  assert(bid3?.riskLevel === 'HIGH' || bid3?.riskLevel === 'CRITICAL', `Demo Scenario 3: Bharat Electro has HIGH or CRITICAL risk (actual: ${bid3?.riskLevel})`);
  const miiCheck = bid3?.complianceChecks?.find((c) => c.requirementCode === 'MAKE_IN_INDIA');
  assert(
    miiCheck?.status === 'NON_COMPLIANT' || miiCheck?.status === 'REVIEW',
    `Demo Scenario 3: Make in India check flagged (actual: ${miiCheck?.status})`
  );

  // 4. Scenario 4: Blacklisted / Debarred Entity (bid-4: Global Quantum)
  const bid4 = await getBidFullDetails('bid-4');
  assert(!!bid4, 'Demo Scenario 4: Bid-4 (Global Quantum) exists in database');
  assert(bid4?.riskLevel === 'CRITICAL', `Demo Scenario 4: Global Quantum has CRITICAL risk level (actual: ${bid4?.riskLevel})`);
  assert((bid4?.overallScore || 100) <= 18, `Demo Scenario 4: Debarment penalty caps score <= 18 (actual: ${bid4?.overallScore})`);
  const blacklistCheck = bid4?.complianceChecks?.find((c) => c.requirementCode === 'BLACKLISTING');
  assert(blacklistCheck?.status === 'NON_COMPLIANT', 'Demo Scenario 4: Blacklisting check evaluated as NON_COMPLIANT');
  assert(
    bid4?.riskAssessment?.criticalFlags.some((f) => f.includes('BLACKLISTING') || f.includes('ORDER')) || false,
    'Demo Scenario 4: Critical debarment flag captured in risk assessment'
  );

  // 5. Scenario 5: Exemption Logic (Startup India / Non-MSME Corporate)
  const bid7 = await getBidFullDetails('bid-7');
  assert(!!bid7, 'Demo Scenario 5: Bid-7 (Surya Solar) exists in database');
  const startupCheck = bid7?.complianceChecks?.find((c) => c.requirementCode === 'STARTUP_INDIA');
  assert(
    startupCheck?.status === 'COMPLIANT' || startupCheck?.status === 'EXEMPTED',
    `Demo Scenario 5: Startup India check is recognized (actual: ${startupCheck?.status})`
  );

  return { passed, failed, tests: results };
}
