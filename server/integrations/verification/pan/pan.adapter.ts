import { VerificationAdapter, VerificationInput, VerificationResult } from '../verification.adapter';

export class PanVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'PAN';
  readonly supportedRequirementCodes = ['REQ-02', 'PAN_CARD', 'PAN'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const pan = input.bidderPan || input.documentData?.pan || 'AABCU9603R';

    return {
      requirementCode: input.requirementCode || 'REQ-02',
      serviceType: 'PAN',
      apiEndpoint: 'https://incometaxindiaefiling.gov.in/e-Filing/Services/PanStatusService.html',
      simulated: true,
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus: 'VERIFIED',
      confidenceScore: 0.98,
      evidenceDetails: `PAN ${pan} is OPERATIVE on CBDT Database with Aadhaar seeding and active corporate linkage.`,
      verifiedData: {
        pan,
        nameOnPan: input.bidderLegalName || 'Enterprise Bidder Entity',
        panStatus: 'OPERATIVE',
        category: 'Company / Firm',
        aadhaarSeedingStatus: 'LINKED / EXEMPT',
        lastUpdated: '2026-01-15',
      },
      discrepancies: [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}
