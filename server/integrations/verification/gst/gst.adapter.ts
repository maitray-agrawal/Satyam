import { VerificationAdapter, VerificationInput, VerificationResult } from '../verification.adapter';
import { VerificationSimulators } from '../../../verificationSimulators';

export class GstVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'GST';
  readonly supportedRequirementCodes = ['REQ-01', 'GST_REGISTRATION', 'GST', 'GSTIN'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const gstin = (input.bidderGstin || input.documentData?.gstin || '27AABCU9603R1ZM').trim().toUpperCase();
    const simRes = VerificationSimulators.verifyGst(gstin);
    const simData = simRes.data || {};
    const stateCode = gstin.substring(0, 2);

    const isSuspended = simData.status === 'SUSPENDED' || gstin.includes('CANC') || gstin.includes('SUSP') || gstin === '06AABCG8901L1Z9';
    const matchStatus = isSuspended ? 'SUSPENDED' : simRes.status === 'NOT_FOUND' ? 'NOT_FOUND' : 'VERIFIED';

    return {
      requirementCode: input.requirementCode || 'GST',
      serviceType: 'GST',
      apiEndpoint: 'https://api.gst.gov.in/taxpayerapi/v1.2/returns/public/search',
      simulated: true,
      verificationMode: input.verificationMode || 'SIMULATED',
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus,
      confidenceScore: isSuspended ? 0.0 : 0.99,
      evidenceDetails: isSuspended
        ? `GSTIN ${gstin} status is SUSPENDED by jurisdictional tax authority. Tax compliance notice issued under Section 29(2) of CGST Act.`
        : `GSTIN ${gstin} is ACTIVE on GSTN. Legal name matched with tax register in state ${stateCode}. Filed GSTR-1 and GSTR-3B for all active quarters.`,
      verifiedData: {
        gstin,
        legalName: simData.legalName || input.bidderLegalName || 'Enterprise Bidder Entity',
        status: isSuspended ? 'SUSPENDED' : (simData.status || 'Active'),
        taxpayerType: simData.taxpayerType || 'Regular',
        registrationDate: simData.registrationDate || '2017-07-01',
        filingFrequency: 'Monthly',
        lastReturnFilingDate: '2026-07-20',
        jurisdiction: simData.jurisdictionState || `State Zone ${stateCode}-West`,
        returnFilingStatusLast12Months: simData.returnFilingStatusLast12Months || '12/12 Filed on time',
      },
      discrepancies: isSuspended ? ['GSTIN registration cancelled or suspended on GSTN portal under Section 29(2)'] : [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}
