import { ComplianceScorer } from '../../server/rules/scoring/compliance-scorer';
import { PolicyEngine, PolicyEvaluationResult } from '../../server/rules/policy-engine';
import { GstComplianceRule, DebarmentBlacklistRule, TurnoverRule } from '../../server/rules/rules/statutory-rules';
import { getDb, verifyAuditLedgerIntegrity, insertAuditLog } from '../../server/db';
import { Bid, Tender, TenderRequirement } from '../../server/types';

export async function runPolicyEdgeCasesTests(): Promise<{ passed: number; failed: number; tests: string[] }> {
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

  // 1. Edge Case: 100% Compliance Clean Bidder
  const perfectEvaluations: PolicyEvaluationResult[] = [
    {
      ruleId: 'RULE-GST-01',
      requirementId: 'req-gst',
      requirementCode: 'GST',
      requirementName: 'GST Registration',
      isRequired: true,
      weight: 25,
      status: 'COMPLIANT',
      severity: 'INFORMATIONAL',
      score: 25,
      evidence: 'Active GSTIN',
      explanation: 'Verified active',
      discrepancies: [],
      deterministicRuleEvaluated: 'GST_ACTIVE_CHECK',
    },
    {
      ruleId: 'RULE-PAN-01',
      requirementId: 'req-pan',
      requirementCode: 'PAN',
      requirementName: 'PAN Verification',
      isRequired: true,
      weight: 25,
      status: 'COMPLIANT',
      severity: 'INFORMATIONAL',
      score: 25,
      evidence: 'Valid PAN',
      explanation: 'Verified valid',
      discrepancies: [],
      deterministicRuleEvaluated: 'PAN_VALID_CHECK',
    },
    {
      ruleId: 'RULE-TURNOVER-01',
      requirementId: 'req-turnover',
      requirementCode: 'INCOME_TAX',
      requirementName: 'Financial Turnover',
      isRequired: true,
      weight: 25,
      status: 'COMPLIANT',
      severity: 'INFORMATIONAL',
      score: 25,
      evidence: 'Turnover exceeds ₹25 Cr',
      explanation: 'Meets threshold',
      discrepancies: [],
      deterministicRuleEvaluated: 'TURNOVER_THRESHOLD_CHECK',
    },
    {
      ruleId: 'RULE-MII-01',
      requirementId: 'req-mii',
      requirementCode: 'MAKE_IN_INDIA',
      requirementName: 'Make in India Local Content',
      isRequired: true,
      weight: 25,
      status: 'COMPLIANT',
      severity: 'INFORMATIONAL',
      score: 25,
      evidence: 'Local content 70%',
      explanation: 'Class-I Local Supplier',
      discrepancies: [],
      deterministicRuleEvaluated: 'MII_LOCAL_CONTENT_CHECK',
    },
  ];

  const perfectScore = ComplianceScorer.computeScore('bid-perfect', perfectEvaluations);
  assert(perfectScore.overallScore === 100, 'Edge Case 1: 100% compliant bidder achieves exact 100 score');
  assert(perfectScore.riskLevel === 'LOW', 'Edge Case 1: 100% compliant bidder has LOW risk level');
  assert(perfectScore.failedChecksCount === 0, 'Edge Case 1: 0 failed checks on clean dossier');
  assert(perfectScore.criticalFlags.length === 0, 'Edge Case 1: 0 critical flags on clean dossier');

  // 2. Edge Case: Partial Compliance / Borderline Threshold
  const partialEvaluations: PolicyEvaluationResult[] = [
    { ...perfectEvaluations[0], score: 25, status: 'COMPLIANT' },
    { ...perfectEvaluations[1], score: 25, status: 'COMPLIANT' },
    {
      ...perfectEvaluations[2],
      score: 12,
      status: 'REQUIRES_MANUAL_REVIEW',
      severity: 'MEDIUM',
      discrepancies: ['Audited turnover is within 5% of minimum requirement threshold'],
    },
    { ...perfectEvaluations[3], score: 25, status: 'COMPLIANT' },
  ];

  const partialScore = ComplianceScorer.computeScore('bid-partial', partialEvaluations);
  assert(partialScore.overallScore === 87, `Edge Case 2: Partial compliance score mathematically normalized to 87 (actual: ${partialScore.overallScore})`);
  assert(partialScore.riskLevel === 'MEDIUM', `Edge Case 2: Partial compliance with review check flags MEDIUM risk (actual: ${partialScore.riskLevel})`);
  assert(partialScore.pendingChecksCount === 1, 'Edge Case 2: Exactly 1 pending/review check recorded');

  // 3. Edge Case: Missing Mandatory Document Evidence
  const missingEvaluations: PolicyEvaluationResult[] = [
    { ...perfectEvaluations[0], score: 25, status: 'COMPLIANT' },
    {
      ...perfectEvaluations[1],
      score: 0,
      status: 'MISSING',
      severity: 'CRITICAL',
      discrepancies: ['Mandatory PAN Card document omitted from dossier submission'],
    },
    { ...perfectEvaluations[2], score: 25, status: 'COMPLIANT' },
    { ...perfectEvaluations[3], score: 25, status: 'COMPLIANT' },
  ];

  const missingScore = ComplianceScorer.computeScore('bid-missing', missingEvaluations);
  assert(missingScore.overallScore === 75, `Edge Case 3: Missing mandatory doc drops score to 75 (actual: ${missingScore.overallScore})`);
  assert(missingScore.riskLevel === 'CRITICAL', 'Edge Case 3: Missing mandatory doc with CRITICAL severity elevates risk to CRITICAL');
  assert(missingScore.criticalFlags.length === 1, 'Edge Case 3: Critical flag captured in risk assessment');

  // 4. Edge Case: Critical Debarment Violation
  const debarredEvaluations: PolicyEvaluationResult[] = [
    { ...perfectEvaluations[0], score: 25, status: 'COMPLIANT' },
    { ...perfectEvaluations[1], score: 25, status: 'COMPLIANT' },
    {
      ruleId: 'RULE-DEBARMENT-01',
      requirementId: 'req-debar',
      requirementCode: 'BLACKLISTING',
      requirementName: 'Non-Debarment Affidavit',
      isRequired: true,
      weight: 25,
      status: 'NON_COMPLIANT',
      severity: 'CRITICAL',
      score: 0,
      evidence: 'Entity active on CPPP debarred registry per MoF Order F.1/20/2023-PPD',
      explanation: 'Statutory debarment active',
      discrepancies: ['ACTIVE_DEBARMENT_ORDER_DETECTED'],
      deterministicRuleEvaluated: 'STATUTORY_DEBARMENT_CHECK',
    },
    { ...perfectEvaluations[3], score: 25, status: 'COMPLIANT' },
  ];

  const debarredScore = ComplianceScorer.computeScore('bid-debarred', debarredEvaluations);
  assert(debarredScore.riskLevel === 'CRITICAL', 'Edge Case 4: Debarred entity immediately triggers CRITICAL risk tier');
  assert(debarredScore.criticalFlags.includes('ACTIVE_DEBARMENT_ORDER_DETECTED'), 'Edge Case 4: Debarment flag explicitly recorded');

  // 5. Edge Case: Multiple Simultaneous Failures
  const multiFailEvaluations: PolicyEvaluationResult[] = [
    { ...perfectEvaluations[0], score: 0, status: 'NON_COMPLIANT', severity: 'HIGH', discrepancies: ['GST cancelled'] },
    { ...perfectEvaluations[1], score: 0, status: 'NON_COMPLIANT', severity: 'HIGH', discrepancies: ['PAN invalid'] },
    { ...perfectEvaluations[2], score: 0, status: 'NON_COMPLIANT', severity: 'HIGH', discrepancies: ['Turnover below threshold'] },
    { ...perfectEvaluations[3], score: 0, status: 'NON_COMPLIANT', severity: 'HIGH', discrepancies: ['Local content < 20%'] },
  ];

  const multiFailScore = ComplianceScorer.computeScore('bid-multifail', multiFailEvaluations);
  assert(multiFailScore.overallScore === 0, 'Edge Case 5: Multiple failures score bounded at 0');
  assert(multiFailScore.riskLevel === 'HIGH', 'Edge Case 5: Multiple high-severity failures evaluate to HIGH risk');
  assert(multiFailScore.failedChecksCount === 4, 'Edge Case 5: Exactly 4 failed checks counted');

  // 6. Edge Case: Cryptographic Audit Trail Hash Chain Integrity
  await getDb();
  const auditVerification = await verifyAuditLedgerIntegrity();
  assert(auditVerification.isValid === true, `Edge Case 6: Cryptographic audit trail chain is 100% valid (total: ${auditVerification.totalLogs} logs)`);
  assert(auditVerification.genesisHash !== 'UNKNOWN', 'Edge Case 6: Genesis hash established and verified');

  return { passed, failed, tests: results };
}
