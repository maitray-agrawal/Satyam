import {
  initializePolicyEngine,
  ComplianceScorer,
  GstComplianceRule,
  DebarmentBlacklistRule,
  TurnoverRule,
} from '../../packages/compliance-core/src/index';
import { Tender, Bid, TenderRequirement, Document, Verification } from '../../packages/shared-types/src/index';

export function runComplianceCoreUnitTests(): { passed: number; failed: number; tests: string[] } {
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

  const engine = initializePolicyEngine();
  const scorer = new ComplianceScorer();

  // Test 1: GST rule evaluation with active verification
  const mockTender: Tender = {
    id: 'tnd-test',
    tenderId: 'GEM/2026/TEST',
    title: 'Test Tender',
    organization: 'Govt Org',
    department: 'Dept',
    category: 'Goods',
    estimatedValue: 1000000,
    emdAmount: 20000,
    publishedDate: new Date().toISOString(),
    closingDate: new Date().toISOString(),
    status: 'ACTIVE',
    minExperienceYears: 3,
    minAnnualTurnover: 10.0,
    startupExemptionAllowed: true,
    msmeExemptionAllowed: true,
  };

  const mockBid: Bid = {
    id: 'bid-test',
    tenderId: 'tnd-test',
    bidderId: 'bidder-test',
    bidNumber: 'GEM/BID/2026/001',
    submittedAt: new Date().toISOString(),
    financialQuote: 950000,
    technicalScore: 90,
    status: 'SUBMITTED',
    overallScore: 100,
    riskLevel: 'LOW',
    isStartupExemptionClaimed: false,
    isMsmeExemptionClaimed: false,
    bidder: {
      id: 'bidder-test',
      legalName: 'Test Enterprises Ltd',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      businessType: 'PRIVATE_LIMITED',
      registeredAddress: 'Mumbai',
      state: 'Maharashtra',
      contactEmail: 'info@test.com',
      contactPhone: '9876543210',
      isMsme: true,
      isStartup: false,
      blacklistedInPast: false,
    },
  };

  const gstRequirement: TenderRequirement = {
    id: 'req-gst',
    tenderId: 'tnd-test',
    requirementCode: 'GST',
    requirementName: 'GST Registration Certificate',
    isRequired: true,
    weight: 20,
  };

  const gstDocument: Document = {
    id: 'doc-gst',
    bidId: 'bid-test',
    documentType: 'GST',
    originalFileName: 'gst_certificate.pdf',
    storedFileName: 'gst_certificate.pdf',
    mimeType: 'application/pdf',
    fileSize: 102400,
    pageCount: 1,
    ocrConfidence: 0.98,
    uploadedAt: new Date().toISOString(),
    status: 'ANALYZED',
  };

  const gstVerification: Verification = {
    id: 'ver-gst',
    bidId: 'bid-test',
    requirementCode: 'GST',
    source: 'GST_PORTAL',
    endpointCalled: '/api/v1/gst/verify',
    queryPayload: { gstin: '27AABCU9603R1ZM' },
    responsePayload: { status: 'ACTIVE' },
    matchStatus: 'EXACT_MATCH',
    confidenceScore: 1.0,
    evidenceDetails: 'GSTIN 27AABCU9603R1ZM verified active with 100% legal name alignment.',
    verifiedAt: new Date().toISOString(),
  };

  const gstResult = engine.evaluateRequirement({
    tender: mockTender,
    bid: mockBid,
    requirement: gstRequirement,
    documents: [gstDocument],
    verifications: [gstVerification],
    extractedFields: { gstin: '27AABCU9603R1ZM' },
  });

  assert(gstResult.status === 'COMPLIANT', 'PolicyEngine: GST rule should evaluate to COMPLIANT when verified');
  assert(gstResult.score === 20, 'PolicyEngine: GST rule score should equal requirement weight');

  // Test 2: Debarment / Blacklist Rule should fail if flagged
  const debarRequirement: TenderRequirement = {
    id: 'req-debar',
    tenderId: 'tnd-test',
    requirementCode: 'BLACKLISTING',
    requirementName: 'Non-Blacklisting Undertaking',
    isRequired: true,
    weight: 20,
  };

  const debarVerification: Verification = {
    id: 'ver-debar',
    bidId: 'bid-test',
    requirementCode: 'BLACKLISTING',
    source: 'CPPP_PORTAL',
    endpointCalled: '/api/v1/cppp/debarred',
    queryPayload: { pan: 'AABCU9603R' },
    responsePayload: { isDebarred: true },
    matchStatus: 'FLAGGED',
    confidenceScore: 1.0,
    evidenceDetails: 'Active debarment record found on CPPP portal',
    verifiedAt: new Date().toISOString(),
  };

  const debarResult = engine.evaluateRequirement({
    tender: mockTender,
    bid: mockBid,
    requirement: debarRequirement,
    documents: [],
    verifications: [debarVerification],
    extractedFields: {},
  });

  assert(debarResult.status === 'NON_COMPLIANT', 'PolicyEngine: Debarment rule should evaluate to NON_COMPLIANT on blacklisted entity');
  assert(debarResult.score === 0, 'PolicyEngine: Debarment rule score should be 0');

  // Test 3: Scoring engine computes normalized score and risk assessment
  const scoreResult = scorer.computeScore('bid-test', [gstResult, debarResult]);
  assert(scoreResult.overallScore === 50, 'ComplianceScorer: Normalized score calculation (20 / 40 * 100 = 50)');
  assert(scoreResult.riskLevel === 'CRITICAL', 'ComplianceScorer: Critical debarment violation triggers CRITICAL risk level');

  return { passed, failed, tests: results };
}
