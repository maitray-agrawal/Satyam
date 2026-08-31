import { VerificationAdapter, VerificationInput, VerificationResult } from '../verification.adapter';

export class EpfoVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'EPFO';
  readonly supportedRequirementCodes = ['REQ-08', 'EPFO_REGISTRATION', 'PF_COMPLIANCE'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const epfoNum = input.documentData?.epfoNumber || 'MH/BAN/0049281/000';

    return {
      requirementCode: input.requirementCode || 'REQ-08',
      serviceType: 'EPFO',
      apiEndpoint: 'https://unifiedportal-epfo.epfindia.gov.in/publicPortal/no-auth/misReport/home/loadEstSearchHome',
      simulated: true,
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus: 'VERIFIED',
      confidenceScore: 0.96,
      evidenceDetails: `EPFO Establishment Code ${epfoNum} verified. Active electronic challan cum return (ECR) remittances filed for 48 active employees through latest wage month.`,
      verifiedData: {
        establishmentCode: epfoNum,
        coverageStatus: 'Covered',
        activeMembers: 48,
        lastEcrMonth: '2026-07',
        regularityIndex: '100% On-time Filing',
      },
      discrepancies: [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

export class EsicVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'ESIC';
  readonly supportedRequirementCodes = ['REQ-09', 'ESIC_REGISTRATION', 'ESI_COMPLIANCE'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const esicNum = input.documentData?.esicNumber || '31000492810000101';

    return {
      requirementCode: input.requirementCode || 'REQ-09',
      serviceType: 'ESIC',
      apiEndpoint: 'https://www.esic.in/EmployerPortal/ESICInsurancePortal/SearchEmployer.aspx',
      simulated: true,
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus: 'VERIFIED',
      confidenceScore: 0.95,
      evidenceDetails: `ESIC Employer Code ${esicNum} active. Monthly contribution returns regular with no pending recovery notices.`,
      verifiedData: {
        employerCode: esicNum,
        registrationDate: '2019-06-01',
        insuredPersons: 36,
        complianceStatus: 'Regular / No Default',
      },
      discrepancies: [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}
