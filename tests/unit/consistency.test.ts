import { evaluateCrossDocumentConsistency } from '../../server/consistencyEngine';
import { Bid, Document } from '../../server/types';

export function runConsistencyUnitTests(): { passed: number; failed: number; tests: string[] } {
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

  const baseBid: Bid = {
    id: 'bid-test-cons',
    tenderId: 'tnd-1',
    bidderId: 'bidder-1',
    bidNumber: 'GEM/BID/2026/CONS/01',
    submissionDate: new Date().toISOString(),
    quotedAmount: 1000000,
    technicalStatus: 'PENDING_VERIFICATION',
    financialStatus: 'NOT_OPENED',
    status: 'UNDER_REVIEW',
    bidder: {
      id: 'bidder-1',
      legalName: 'RELIABLE SYSTEMS PRIVATE LIMITED',
      pan: 'AAACR5555M',
      gstin: '27AAACR5555M1Z2',
      businessType: 'Private Limited',
      address: 'Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      contactPerson: 'Suresh Patil',
      contactEmail: 'suresh@reliablesys.com',
      contactPhone: '+91 98220 12345',
      localContentPercentage: 60,
    },
  };

  // Case 1: Consistent documents (GST + PAN match perfectly)
  const consistentDocs: Document[] = [
    {
      id: 'd-1',
      bidId: 'bid-test-cons',
      bidderId: 'bidder-1',
      tenderId: 'tnd-1',
      documentType: 'GST',
      fileName: 'gst.pdf',
      fileOriginalName: 'gst.pdf',
      fileSize: 10000,
      mimeType: 'application/pdf',
      fileUrl: '/uploads/gst.pdf',
      uploadTimestamp: new Date().toISOString(),
      status: 'ANALYZED',
      verificationStatus: 'VALID',
      sha256Hash: 'hash1',
      extractedFields: [
        {
          id: 'f-1',
          documentId: 'd-1',
          fieldName: 'legalName',
          fieldValue: 'RELIABLE SYSTEMS PRIVATE LIMITED',
          confidence: 0.99,
          sourcePage: 1,
          isPresent: true,
          category: 'STATUTORY',
        },
        {
          id: 'f-2',
          documentId: 'd-1',
          fieldName: 'gstin',
          fieldValue: '27AAACR5555M1Z2',
          confidence: 0.99,
          sourcePage: 1,
          isPresent: true,
          category: 'STATUTORY',
        },
      ],
    },
    {
      id: 'd-2',
      bidId: 'bid-test-cons',
      bidderId: 'bidder-1',
      tenderId: 'tnd-1',
      documentType: 'PAN',
      fileName: 'pan.pdf',
      fileOriginalName: 'pan.pdf',
      fileSize: 10000,
      mimeType: 'application/pdf',
      fileUrl: '/uploads/pan.pdf',
      uploadTimestamp: new Date().toISOString(),
      status: 'ANALYZED',
      verificationStatus: 'VALID',
      sha256Hash: 'hash2',
      extractedFields: [
        {
          id: 'f-3',
          documentId: 'd-2',
          fieldName: 'legalName',
          fieldValue: 'RELIABLE SYSTEMS PRIVATE LIMITED',
          confidence: 0.99,
          sourcePage: 1,
          isPresent: true,
          category: 'STATUTORY',
        },
        {
          id: 'f-4',
          documentId: 'd-2',
          fieldName: 'pan',
          fieldValue: 'AAACR5555M',
          confidence: 0.99,
          sourcePage: 1,
          isPresent: true,
          category: 'STATUTORY',
        },
      ],
    },
  ];

  const cleanReport = evaluateCrossDocumentConsistency(baseBid, consistentDocs);
  assert(cleanReport.consistencyScore === 100, 'Consistency: Clean documents achieve 100 consistency score');
  assert(cleanReport.overallStatus === 'CONSISTENT', 'Consistency: Clean verdict is CONSISTENT');
  assert(cleanReport.inconsistencies.length === 0, 'Consistency: 0 inconsistencies in clean dossier');
  assert(cleanReport.verifiedMatchesCount >= 2, 'Consistency: Multiple verified cross-document matches recorded');

  // Case 2: PAN Contradiction (GSTIN embeds AAACR5555M, but PAN card shows BBBBB9999K)
  const contradictingDocs: Document[] = [
    consistentDocs[0],
    {
      id: 'd-contradict',
      bidId: 'bid-test-cons',
      bidderId: 'bidder-1',
      tenderId: 'tnd-1',
      documentType: 'PAN',
      fileName: 'pan_mismatched.pdf',
      fileOriginalName: 'pan_mismatched.pdf',
      fileSize: 10000,
      mimeType: 'application/pdf',
      fileUrl: '/uploads/pan_mismatched.pdf',
      uploadTimestamp: new Date().toISOString(),
      status: 'ANALYZED',
      verificationStatus: 'VALID',
      sha256Hash: 'hash3',
      extractedFields: [
        {
          id: 'f-mismatch',
          documentId: 'd-contradict',
          fieldName: 'pan',
          fieldValue: 'BBBBB9999K',
          confidence: 0.99,
          sourcePage: 1,
          isPresent: true,
          category: 'STATUTORY',
        },
      ],
    },
  ];

  const contradictionReport = evaluateCrossDocumentConsistency(baseBid, contradictingDocs);
  assert(contradictionReport.inconsistencies.length > 0, 'Consistency: Flags contradiction between GSTIN-embedded PAN and PAN card');
  const panInconsistency = contradictionReport.inconsistencies.find((i) => i.field.includes('PAN'));
  assert(!!panInconsistency, 'Consistency: Found PAN field inconsistency item');
  assert(panInconsistency?.severity === 'HIGH_RISK_REVIEW', 'Consistency: Contradicting PAN numbers flag as HIGH_RISK_REVIEW severity');
  assert(contradictionReport.consistencyScore < 100, 'Consistency: Score is penalized for contradiction');

  return { passed, failed, tests: results };
}
