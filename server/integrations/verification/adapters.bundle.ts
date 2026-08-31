import { VerificationAdapter, VerificationInput, VerificationResult } from './verification.adapter';

export class IncomeTaxVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'INCOME_TAX';
  readonly supportedRequirementCodes = ['REQ-03', 'REQ-04', 'ITR_FILINGS', 'TURNOVER_CA_CERTIFICATE'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const declaredTurnover = input.documentData?.turnoverCr || input.documentData?.auditedTurnover || 18.5;
    const minThreshold = input.tenderRequirements?.find(r => r.requirementCode === 'REQ-03')?.minThreshold || 15.0;

    const meetsThreshold = declaredTurnover >= minThreshold;

    return {
      requirementCode: input.requirementCode || 'REQ-03',
      serviceType: 'INCOME_TAX',
      apiEndpoint: 'https://eportal.incometax.gov.in/iec/foservices/api/v2/returns/verify-acknowledgment',
      simulated: true,
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus: meetsThreshold ? 'VERIFIED' : 'MISMATCH',
      confidenceScore: 0.97,
      evidenceDetails: `ITR filings cross-verified with CBDT e-Filing portal for Assessment Years 2023-24, 2024-25, 2025-26. 3-Year average annual audited turnover computed at ₹${declaredTurnover} Cr. (Minimum required: ₹${minThreshold} Cr). CA UDIN is verified on ICAI portal.`,
      verifiedData: {
        ay2023_24: 'Verified / Form ITR-6',
        ay2024_25: 'Verified / Form ITR-6',
        ay2025_26: 'Verified / Form ITR-6',
        threeYearAvgTurnoverCr: declaredTurnover,
        tenderThresholdCr: minThreshold,
        icaiUdinStatus: 'Active & Validated',
      },
      discrepancies: meetsThreshold ? [] : [`Audited turnover ₹${declaredTurnover} Cr is below tender threshold of ₹${minThreshold} Cr`],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

export class StartupIndiaVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'STARTUP_INDIA';
  readonly supportedRequirementCodes = ['REQ-DPIIT', 'STARTUP_DPIIT'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const dppitNumber = input.documentData?.dppitNumber || 'DIPP98741';

    return {
      requirementCode: input.requirementCode || 'REQ-DPIIT',
      serviceType: 'STARTUP_INDIA',
      apiEndpoint: 'https://www.startupindia.gov.in/api/v1/certificates/verify',
      simulated: true,
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus: 'VERIFIED',
      confidenceScore: 0.99,
      evidenceDetails: `DPIIT Certificate of Recognition ${dppitNumber} verified. Qualifies for prior turnover and prior experience relaxation under GFR Rule 173(i) and DPIIT Order 2016.`,
      verifiedData: {
        recognitionNumber: dppitNumber,
        sector: 'Enterprise Tech & AI Systems',
        validUntil: '2029-03-31',
        gfrExemptionsApplicable: ['PRIOR_TURNOVER_EXEMPTION', 'PRIOR_EXPERIENCE_EXEMPTION', 'EMD_EXEMPTION'],
      },
      discrepancies: [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

export class NsicVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'NSIC';
  readonly supportedRequirementCodes = ['REQ-NSIC', 'NSIC_CERTIFICATE'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const nsicCode = input.documentData?.nsicNumber || 'NSIC/GP/DEL/2022/94821';

    return {
      requirementCode: input.requirementCode || 'REQ-NSIC',
      serviceType: 'NSIC',
      apiEndpoint: 'https://www.nsiconline.com/SinglePointRegistration/verify',
      simulated: true,
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus: 'VERIFIED',
      confidenceScore: 0.96,
      evidenceDetails: `NSIC Single Point Registration Certificate ${nsicCode} verified on National Small Industries Corporation portal.`,
      verifiedData: {
        registrationNumber: nsicCode,
        storesCategory: 'IT Hardware & Cloud Infrastructure Software',
        monetaryLimitLakhs: 500,
        validity: 'Valid up to 2027-11-30',
      },
      discrepancies: [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

export class OemVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'OEM';
  readonly supportedRequirementCodes = ['REQ-06', 'OEM_AUTHORIZATION', 'MAF'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const authCode = input.documentData?.authCode || input.documentData?.mafNumber || 'CISCO-MAF-2026-9921';
    const isExpired = input.documentData?.isExpired || false;

    return {
      requirementCode: input.requirementCode || 'REQ-06',
      serviceType: 'OEM',
      apiEndpoint: 'https://partnerportal.cisco.com/api/v3/auth/verify-maf',
      simulated: true,
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus: isExpired ? 'MISMATCH' : 'VERIFIED',
      confidenceScore: isExpired ? 0.4 : 0.98,
      evidenceDetails: isExpired
        ? `OEM Manufacturer Authorization Form ${authCode} is EXPIRED or revoked by OEM.`
        : `OEM Manufacturer Authorization Code ${authCode} verified on Global OEM Partner Database. Confirmed 24x7 back-to-back warranty support SLA.`,
      verifiedData: {
        oemEntity: 'Global Hardware & Systems OEM',
        tenderSpecificReference: 'GeM/2026/B/894218',
        authorizationStatus: isExpired ? 'EXPIRED' : 'VALID_ACTIVE',
        warrantyCoverageYears: 5,
      },
      discrepancies: isExpired ? ['OEM authorization form is expired or unconfirmed by OEM partner portal'] : [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

export class BlacklistVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'BLACKLIST';
  readonly supportedRequirementCodes = ['REQ-10', 'DEBARMENT_CHECK', 'BLACKLIST_STATUS'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const pan = input.bidderPan || 'AABCU9603R';
    const isBlacklisted = (input.documentData?.isBlacklisted || input.bidderLegalName?.toLowerCase().includes('apex')) ?? false;

    return {
      requirementCode: input.requirementCode || 'REQ-10',
      serviceType: 'BLACKLIST',
      apiEndpoint: 'https://eprocure.gov.in/cppp/debarredbidders/api/v1/search',
      simulated: true,
      simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
      matchStatus: isBlacklisted ? 'FLAGGED' : 'VERIFIED',
      confidenceScore: 0.99,
      evidenceDetails: isBlacklisted
        ? `CRITICAL FLAG: Entity is active on Central Debarment / Blacklist register under GFR Rule 151(iii). Debarred from Central Ministries & GeM procurement until 2027-04-30.`
        : `No active debarment or blacklisting orders detected on Central Public Procurement Portal (CPPP), GeM Incidents Repository, Ministry of Finance Debarred Database, or State Vigilance Commissions.`,
      verifiedData: {
        panChecked: pan,
        cpppDebarredStatus: isBlacklisted ? 'DEBARRED' : 'CLEAR',
        gemIncidentHistory: isBlacklisted ? '1 ACTIVE DEBARMENT ORDER' : '0 Adverse Notices',
        debarmentReason: isBlacklisted ? 'Non-delivery & Breach of Statutory Warranty in Ministry of Defence tender' : null,
      },
      discrepancies: isBlacklisted ? ['Active Debarment order on CPPP under GFR Rule 151(iii) - Automatic Disqualification'] : [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}
