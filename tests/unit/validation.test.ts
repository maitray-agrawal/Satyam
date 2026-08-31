import { CreateBidSchema, CreateTenderSchema, OfficerDecisionSchema } from '../../packages/validation/src/index';

export function runValidationUnitTests(): { passed: number; failed: number; tests: string[] } {
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

  // Test 1: Valid GSTIN format pass
  const validBid = {
    tenderId: 'tnd-1',
    bidderLegalName: 'Apex Technologies India Pvt Ltd',
    gstin: '27AABCU9603R1ZM',
    pan: 'AABCU9603R',
    registeredAddress: 'BKC, Mumbai',
    state: 'Maharashtra',
    contactEmail: 'tenders@apextech.com',
    contactPhone: '9820011223',
    financialQuote: 42500000,
    isStartupExemptionClaimed: false,
    isMsmeExemptionClaimed: false,
  };

  const bidParse = CreateBidSchema.safeParse(validBid);
  assert(bidParse.success, 'Validation: CreateBidSchema parses valid Indian GSTIN & PAN');

  // Test 2: Invalid GSTIN format rejection
  const invalidBid = {
    ...validBid,
    gstin: 'INVALID_GSTIN_123',
  };
  const invalidBidParse = CreateBidSchema.safeParse(invalidBid);
  assert(!invalidBidParse.success, 'Validation: CreateBidSchema rejects invalid GSTIN format');

  // Test 3: Officer Decision justification length check
  const shortJustification = {
    decision: 'ACCEPT',
    justification: 'ok',
  };
  const decParse = OfficerDecisionSchema.safeParse(shortJustification);
  assert(!decParse.success, 'Validation: OfficerDecisionSchema requires min 10 chars statutory justification');

  return { passed, failed, tests: results };
}
