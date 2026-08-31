import { VerificationAdapter, VerificationInput, VerificationResult } from '../verification.adapter';

export class GstVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'GST';
  readonly supportedRequirementCodes = ['REQ-01', 'GST_REGISTRATION', 'GST'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const gstin = input.bidderGstin || input.documentData?.gstin || '27AABCU9603R1ZM';
    const stateCode = gstin.substring(0, 2);

    const isSuspended = gstin.includes('CANC') || gstin.includes('SUSP');

    return {
      requirementCode: input.requirementCode || 'REQ-01',
      serviceType: 'GST',
      apiEndpoint: 'https://api.gst.gov.in/taxpayerapi/v1.2/returns/public/search',
      simulated: true,
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus: isSuspended ? 'SUSPENDED' : 'VERIFIED',
      confidenceScore: isSuspended ? 0.0 : 0.99,
      evidenceDetails: isSuspended
        ? `GSTIN ${gstin} status is SUSPENDED/CANCELLED by jurisdictional tax authority.`
        : `GSTIN ${gstin} is ACTIVE on GSTN. Legal name matched with tax register in state ${stateCode}. Filed GSTR-1 and GSTR-3B for all active quarters.`,
      verifiedData: {
        gstin,
        legalName: input.bidderLegalName || 'Enterprise Bidder Entity',
        status: isSuspended ? 'Cancelled' : 'Active',
        taxpayerType: 'Regular',
        registrationDate: '2017-07-01',
        filingFrequency: 'Monthly',
        lastReturnFilingDate: '2026-07-20',
        jurisdiction: `State Zone ${stateCode}-West`,
      },
      discrepancies: isSuspended ? ['GSTIN registration cancelled or suspended on GSTN portal'] : [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}
