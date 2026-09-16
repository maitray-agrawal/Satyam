import { executeThreeWayReconciliation } from '../../server/reconciliationService';
import { Bid, TenderRequirement, Document } from '../../server/types';

export async function runAsyncReconciliationTests(): Promise<{ passed: number; failed: number; tests: string[] }> {
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

  const mockBid: Bid = {
    id: 'bid-test-recon',
    tenderId: 'tnd-test',
    bidderId: 'bidder-test-recon',
    bidNumber: 'GEM/BID/2026/TEST/01',
    submissionDate: new Date().toISOString(),
    quotedAmount: 4500000,
    technicalStatus: 'PENDING_VERIFICATION',
    financialStatus: 'NOT_OPENED',
    status: 'UNDER_REVIEW',
    bidder: {
      id: 'bidder-test-recon',
      legalName: 'RECON ENTERPRISES PRIVATE LIMITED',
      pan: 'AAACR1234K',
      gstin: '27AAACR1234K1Z9',
      businessType: 'Private Limited',
      address: 'Plot 10, BKC, Bandra East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      contactPerson: 'Anand Kumar',
      contactEmail: 'anand@reconenterprises.in',
      contactPhone: '+91 98200 11223',
      localContentPercentage: 65,
    },
  };

  const requirements: TenderRequirement[] = [
    {
      id: 'req-gst',
      tenderId: 'tnd-test',
      requirementCode: 'GST',
      requirementName: 'GST Registration Certificate',
      isRequired: true,
      weight: 15,
      customRuleDescription: 'GSTIN must be ACTIVE on GST Portal',
      issuingAuthority: 'GSTN',
      formatRequired: 'GST REG-06',
    },
    {
      id: 'req-pan',
      tenderId: 'tnd-test',
      requirementCode: 'PAN',
      requirementName: 'PAN Card Verification',
      isRequired: true,
      weight: 10,
      customRuleDescription: 'Valid Income Tax PAN',
      issuingAuthority: 'Income Tax Dept',
      formatRequired: 'PAN Card',
    },
    {
      id: 'req-mii',
      tenderId: 'tnd-test',
      requirementCode: 'MAKE_IN_INDIA',
      requirementName: 'Make in India Local Content',
      isRequired: true,
      weight: 20,
      minThreshold: 50,
      customRuleDescription: 'Minimum 50% Class-I Local Content',
      issuingAuthority: 'CA / DPIIT',
      formatRequired: 'CA Certificate with UDIN',
    },
    {
      id: 'req-missing',
      tenderId: 'tnd-test',
      requirementCode: 'OEM_AUTHORIZATION',
      requirementName: 'Manufacturer Authorization Form',
      isRequired: true,
      weight: 20,
      customRuleDescription: 'OEM MAF required for reseller',
      issuingAuthority: 'OEM',
      formatRequired: 'MAF',
    },
  ];

  const documents: Document[] = [
    {
      id: 'doc-gst',
      bidId: 'bid-test-recon',
      bidderId: 'bidder-test-recon',
      tenderId: 'tnd-test',
      documentType: 'GST',
      fileName: 'gst_certificate.pdf',
      fileOriginalName: 'gst_certificate.pdf',
      fileSize: 1048576,
      mimeType: 'application/pdf',
      fileUrl: '/uploads/gst_certificate.pdf',
      uploadTimestamp: new Date().toISOString(),
      status: 'ANALYZED',
      verificationStatus: 'VALID',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      extractedFields: [
        {
          id: 'f-1',
          documentId: 'doc-gst',
          fieldName: 'legalName',
          fieldValue: 'RECON ENTERPRISES PRIVATE LIMITED',
          confidence: 0.98,
          sourcePage: 1,
          isPresent: true,
          category: 'STATUTORY',
        },
        {
          id: 'f-2',
          documentId: 'doc-gst',
          fieldName: 'gstin',
          fieldValue: '27AAACR1234K1Z9',
          confidence: 0.99,
          sourcePage: 1,
          isPresent: true,
          category: 'STATUTORY',
        },
      ],
    },
    {
      id: 'doc-pan',
      bidId: 'bid-test-recon',
      bidderId: 'bidder-test-recon',
      tenderId: 'tnd-test',
      documentType: 'PAN',
      fileName: 'pan_card.pdf',
      fileOriginalName: 'pan_card.pdf',
      fileSize: 524288,
      mimeType: 'application/pdf',
      fileUrl: '/uploads/pan_card.pdf',
      uploadTimestamp: new Date().toISOString(),
      status: 'ANALYZED',
      verificationStatus: 'VALID',
      sha256Hash: 'a1b2c3d4e5f6',
      extractedFields: [
        {
          id: 'f-3',
          documentId: 'doc-pan',
          fieldName: 'pan',
          fieldValue: 'AAACR1234K',
          confidence: 0.99,
          sourcePage: 1,
          isPresent: true,
          category: 'STATUTORY',
        },
      ],
    },
    {
      id: 'doc-mii',
      bidId: 'bid-test-recon',
      bidderId: 'bidder-test-recon',
      tenderId: 'tnd-test',
      documentType: 'MAKE_IN_INDIA',
      fileName: 'mii_declaration.pdf',
      fileOriginalName: 'mii_declaration.pdf',
      fileSize: 204800,
      mimeType: 'application/pdf',
      fileUrl: '/uploads/mii_declaration.pdf',
      uploadTimestamp: new Date().toISOString(),
      status: 'ANALYZED',
      verificationStatus: 'VALID',
      sha256Hash: 'b2c3d4e5f6a1',
      extractedFields: [
        {
          id: 'f-4',
          documentId: 'doc-mii',
          fieldName: 'localContentPercentage',
          fieldValue: '65%',
          confidence: 0.95,
          sourcePage: 1,
          isPresent: true,
          category: 'COMPLIANCE',
        },
      ],
    },
  ];

  const items = await executeThreeWayReconciliation(mockBid, requirements, documents);

  assert(items.length === 4, 'Reconciliation: Generated reconciliation matrix for all 4 requirements');

  const gstRecon = items.find((i) => i.requirementCode === 'GST');
  assert(!!gstRecon, 'Reconciliation: Found GST reconciliation item');
  assert(gstRecon?.outcome === 'COMPLIANT', 'Reconciliation: GST outcome is COMPLIANT');
  assert(gstRecon?.documentEvidence.hasDocument === true, 'Reconciliation: GST Document evidence presence is true');
  assert(gstRecon?.documentEvidence.extractedKeyValues.gstin === '27AAACR1234K1Z9', 'Reconciliation: Extracted GSTIN matches');
  assert(gstRecon?.verificationEvidence.isSimulated === true, 'Reconciliation: Verification evidence simulated flag is preserved');

  const missingRecon = items.find((i) => i.requirementCode === 'OEM_AUTHORIZATION');
  assert(!!missingRecon, 'Reconciliation: Found missing OEM requirement');
  assert(missingRecon?.outcome === 'MISSING_EVIDENCE', 'Reconciliation: Missing mandatory doc evaluated as MISSING_EVIDENCE');
  assert(missingRecon?.severity === 'CRITICAL', 'Reconciliation: Missing mandatory doc triggers CRITICAL severity');
  assert(missingRecon?.scoreAchieved === 0, 'Reconciliation: Missing mandatory doc receives 0 score');

  const miiRecon = items.find((i) => i.requirementCode === 'MAKE_IN_INDIA');
  assert(miiRecon?.outcome === 'COMPLIANT', 'Reconciliation: Make in India (65% >= 50%) is COMPLIANT');

  return { passed, failed, tests: results };
}
