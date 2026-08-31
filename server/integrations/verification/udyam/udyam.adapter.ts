import { VerificationAdapter, VerificationInput, VerificationResult } from '../verification.adapter';

export class UdyamVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'UDYAM';
  readonly supportedRequirementCodes = ['REQ-05', 'UDYAM_MSME', 'MSME_CERTIFICATE'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const udyamNum = input.documentData?.udyamNumber || input.documentData?.urn || 'UDYAM-MH-01-0049281';

    return {
      requirementCode: input.requirementCode || 'REQ-05',
      serviceType: 'UDYAM',
      apiEndpoint: 'https://udyamregistration.gov.in/Udyam_Verify.aspx',
      simulated: true,
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus: 'VERIFIED',
      confidenceScore: 0.99,
      evidenceDetails: `Udyam Registration Certificate ${udyamNum} active under Ministry of MSME. Enterprise Classification: Micro / Small Enterprise. Qualifies for Public Procurement Policy purchase preferences & EMD exemption under GFR Rule 153.`,
      verifiedData: {
        udyamRegistrationNumber: udyamNum,
        enterpriseType: 'Micro Enterprise',
        majorActivity: 'Manufacturing & Services',
        dateOfIncorporation: '2019-04-10',
        dicJurisdiction: 'District Industries Centre Pune',
        activeStatus: 'Valid & Active',
        eligibleForEmdExemption: true,
      },
      discrepancies: [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}
