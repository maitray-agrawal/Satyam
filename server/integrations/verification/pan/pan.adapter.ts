import { VerificationAdapter, VerificationInput, VerificationResult } from '../verification.adapter';
import { VerificationSimulators } from '../../../verificationSimulators';

export class PanVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'PAN';
  readonly supportedRequirementCodes = ['REQ-02', 'PAN_CARD', 'PAN'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const pan = (input.bidderPan || input.documentData?.pan || 'AABCU9603R').trim().toUpperCase();
    const simRes = VerificationSimulators.verifyPan(pan);
    const simData = simRes.data || {};

    return {
      requirementCode: input.requirementCode || 'PAN',
      serviceType: 'PAN',
      apiEndpoint: 'https://incometaxindiaefiling.gov.in/e-Filing/Services/PanStatusService.html',
      simulated: true,
      verificationMode: input.verificationMode || 'SIMULATED',
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus: simRes.status === 'NOT_FOUND' ? 'NOT_FOUND' : 'VERIFIED',
      confidenceScore: 0.98,
      evidenceDetails: `PAN ${pan} is OPERATIVE on CBDT Database with Aadhaar seeding and active corporate linkage.`,
      verifiedData: {
        pan,
        nameOnPan: simData.legalName || input.bidderLegalName || 'Enterprise Bidder Entity',
        panStatus: simData.status || 'OPERATIVE',
        category: simData.category || 'Company / Firm',
        aadhaarSeedingStatus: simData.aadhaarSeedingStatus || 'LINKED / EXEMPT',
        lastUpdated: '2026-01-15',
      },
      discrepancies: [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}
