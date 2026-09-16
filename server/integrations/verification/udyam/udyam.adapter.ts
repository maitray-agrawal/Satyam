import { VerificationAdapter, VerificationInput, VerificationResult } from '../verification.adapter';
import { VerificationSimulators } from '../../../verificationSimulators';

export class UdyamVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'UDYAM';
  readonly supportedRequirementCodes = ['REQ-05', 'UDYAM_MSME', 'MSME_CERTIFICATE', 'UDYAM', 'MSME'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const udyamNum = (input.documentData?.udyamNumber || input.documentData?.urn || 'UDYAM-MH-01-0049281').trim().toUpperCase();
    const simRes = VerificationSimulators.verifyUdyam(udyamNum);
    const simData = simRes.data || {};

    return {
      requirementCode: input.requirementCode || 'UDYAM',
      serviceType: 'UDYAM',
      apiEndpoint: 'https://udyamregistration.gov.in/Udyam_Verify.aspx',
      simulated: true,
      verificationMode: input.verificationMode || 'SIMULATED',
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus: simRes.status === 'NOT_FOUND' ? 'NOT_FOUND' : 'VERIFIED',
      confidenceScore: 0.99,
      evidenceDetails: `Udyam Registration Certificate ${udyamNum} active under Ministry of MSME. Enterprise Classification: ${simData.enterpriseType || 'Micro Enterprise'}. Qualifies for Public Procurement Policy purchase preferences & EMD exemption under GFR Rule 153.`,
      verifiedData: {
        udyamRegistrationNumber: udyamNum,
        enterpriseType: simData.enterpriseType || 'Micro Enterprise',
        majorActivity: simData.majorActivity || 'Manufacturing & Services',
        dateOfIncorporation: simData.dateOfIncorporation || '2019-04-10',
        dicJurisdiction: simData.dicJurisdiction || 'District Industries Centre',
        activeStatus: simData.status || 'Valid & Active',
        eligibleForEmdExemption: true,
      },
      discrepancies: [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}
