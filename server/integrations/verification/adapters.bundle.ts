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
  readonly supportedRequirementCodes = ['REQ-07', 'REQ-DPIIT', 'STARTUP_DPIIT', 'STARTUP_INDIA', 'STARTUP'];

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
  readonly supportedRequirementCodes = ['REQ-NSIC', 'NSIC_CERTIFICATE', 'NSIC'];

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
  readonly supportedRequirementCodes = ['REQ-06', 'OEM_AUTHORIZATION', 'OEM', 'MAF'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const authCode = input.documentData?.authCode || input.documentData?.mafNumber || 'CISCO-MAF-2026-9921';
    const isMissingOrExpired = 
      input.documentData?.isExpired || 
      input.documentData?.missing || 
      input.bidderLegalName?.toLowerCase().includes('global quantum') ||
      !input.documentData?.hasDocument && !input.bidderLegalName?.toLowerCase().includes('techvanguard');

    return {
      requirementCode: input.requirementCode || 'OEM_AUTHORIZATION',
      serviceType: 'OEM',
      apiEndpoint: 'https://partnerportal.cisco.com/api/v3/auth/verify-maf',
      simulated: true,
      verificationMode: input.verificationMode || 'SIMULATED',
      simulationNotice: 'DEMO / SIMULATED OEM PARTNER REGISTRY',
      matchStatus: isMissingOrExpired ? 'MISMATCH' : 'VERIFIED',
      confidenceScore: isMissingOrExpired ? 0.35 : 0.98,
      evidenceDetails: isMissingOrExpired
        ? `OEM Manufacturer Authorization Form (MAF) is MISSING or EXPIRED. No valid back-to-back warranty commitment recorded by OEM.`
        : `OEM Manufacturer Authorization Code verified on Global OEM Partner Database. Confirmed 24x7 back-to-back warranty support SLA for tender reference.`,
      verifiedData: {
        oemEntity: 'Global Hardware & Systems OEM',
        tenderSpecificReference: 'GeM/2026/B/894201',
        authorizationStatus: isMissingOrExpired ? 'EXPIRED_OR_NOT_ISSUED' : 'VALID_ACTIVE',
        warrantyCoverageYears: isMissingOrExpired ? 0 : 5,
      },
      discrepancies: isMissingOrExpired ? ['Valid OEM authorization form not verified or expired'] : [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

export class BlacklistVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'BLACKLIST';
  readonly supportedRequirementCodes = ['REQ-10', 'BLACKLISTING', 'DEBARMENT_CHECK', 'BLACKLIST_STATUS', 'BLACKLIST'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const pan = input.bidderPan || 'AABCU9603R';
    const isBlacklisted = 
      input.documentData?.isBlacklisted || 
      input.bidderLegalName?.toLowerCase().includes('apex') || 
      input.bidderLegalName?.toLowerCase().includes('global quantum') ||
      input.bidderPan === 'AAACG9999K' ||
      input.bidderPan === 'AAACO4444N' ||
      input.bidderPan === 'AABCA1234F';

    return {
      requirementCode: input.requirementCode || 'BLACKLISTING',
      serviceType: 'BLACKLIST',
      apiEndpoint: 'https://eprocure.gov.in/cppp/debarredbidders/api/v1/search',
      simulated: true,
      verificationMode: input.verificationMode || 'SIMULATED',
      simulationNotice: 'DEMO / SIMULATED CENTRAL DEBARMENT DATABASE',
      matchStatus: isBlacklisted ? 'FLAGGED' : 'VERIFIED',
      confidenceScore: 0.99,
      evidenceDetails: isBlacklisted
        ? `CRITICAL FLAG: Entity is active on Central Debarment / Blacklist register under GFR Rule 151(iii). Debarred from Central Ministries & GeM procurement until 2027-04-30.`
        : `No active debarment or blacklisting orders detected on Central Public Procurement Portal (CPPP), GeM Incidents Repository, Ministry of Finance Debarred Database, or State Vigilance Commissions.`,
      verifiedData: {
        panChecked: pan,
        isBlacklisted: !!isBlacklisted,
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

export class MakeInIndiaVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'MAKE_IN_INDIA';
  readonly supportedRequirementCodes = ['REQ-08', 'MAKE_IN_INDIA', 'MII', 'LOCAL_CONTENT'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const company = input.bidderLegalName || '';
    const declaredContent = input.documentData?.localContent || 50;

    // Detect scenario 2: Bharat Electro claims 65% but audit reveals only 38%
    const isBharatElectro = company.toUpperCase().includes('BHARAT ELECTRO');
    const auditedContent = isBharatElectro ? 38.0 : declaredContent;
    const isMismatch = isBharatElectro;

    const supplierClass = auditedContent >= 50 ? 'Class-I Local Supplier (>= 50%)' : auditedContent >= 20 ? 'Class-II Local Supplier (20% to <50%)' : 'Non-Local Supplier (< 20%)';

    return {
      requirementCode: input.requirementCode || 'MAKE_IN_INDIA',
      serviceType: 'MAKE_IN_INDIA',
      apiEndpoint: 'https://dpiit.gov.in/publicprocurement/mii-verification',
      simulated: true,
      verificationMode: input.verificationMode || 'SIMULATED',
      simulationNotice: 'DEMO / SIMULATED DPIIT MII VERIFICATION',
      matchStatus: isMismatch ? 'MISMATCH' : 'VERIFIED',
      confidenceScore: isMismatch ? 0.6 : 0.96,
      evidenceDetails: isMismatch
        ? `DISCREPANCY DETECTED: Bidder self-declaration claimed ${declaredContent}% local content, but statutory supply-chain audit on DPIIT portal confirms only ${auditedContent}%. Classified as ${supplierClass}.`
        : `Local Content of ${auditedContent}% verified under Public Procurement (Preference to Make in India) Order 2017. Verified Class: ${supplierClass}. Valid CA UDIN attested.`,
      verifiedData: {
        declaredLocalContent: declaredContent,
        verifiedLocalContent: auditedContent,
        supplierClassification: supplierClass,
        caUdinVerified: !isMismatch,
        dpiitComplianceOrder: 'P-45021/2/2017-PP(BE-II) dated 16.09.2020',
      },
      discrepancies: isMismatch ? [`Local content discrepancy: Declared ${declaredContent}%, Verified ${auditedContent}%`] : [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

export class McaVerificationAdapter implements VerificationAdapter {
  readonly serviceName = 'MCA';
  readonly supportedRequirementCodes = ['REQ-MCA', 'MCA', 'CIN', 'COMPANY_MASTER_DATA'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const cin = input.bidderCin || input.documentData?.cinNumber || 'U72900DL2018PTC331940';
    const legalName = input.bidderLegalName || 'ENTERPRISE LIMITED';

    return {
      requirementCode: input.requirementCode || 'MCA',
      serviceType: 'MCA',
      apiEndpoint: 'https://www.mca.gov.in/mcafoportal/companyMasterData.do',
      simulated: true,
      verificationMode: input.verificationMode || 'SIMULATED',
      simulationNotice: 'DEMO / SIMULATED MINISTRY OF CORPORATE AFFAIRS REGISTRY',
      matchStatus: 'VERIFIED',
      confidenceScore: 0.98,
      evidenceDetails: `Company Master Data verified on MCA21 portal. CIN: ${cin}. Company status: Active. Authorized Capital & Director DIN verified with no disqualifications under Section 164(2).`,
      verifiedData: {
        cin,
        companyName: legalName,
        rocCode: 'ROC Delhi',
        registrationNumber: '331940',
        companyCategory: 'Company limited by Shares',
        companySubCategory: 'Non-govt company',
        classOfCompany: 'Private',
        dateOfIncorporation: '2018-04-12',
        activeComplianceStatus: 'ACTIVE',
      },
      discrepancies: [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

export class DigiLockerManualAdapter implements VerificationAdapter {
  readonly serviceName = 'DIGILOCKER';
  readonly supportedRequirementCodes = ['REQ-DIGILOCKER', 'DIGILOCKER', 'MANUAL_EVIDENCE'];

  async verify(input: VerificationInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const docName = input.documentData?.fileName || 'Document Evidence';

    return {
      requirementCode: input.requirementCode || 'DIGILOCKER',
      serviceType: 'DIGILOCKER',
      apiEndpoint: 'https://api.digitallocker.gov.in/public/oauth2/1/xml/pull',
      simulated: true,
      verificationMode: input.verificationMode || 'MANUAL_EVIDENCE',
      simulationNotice: 'DEMO / SIMULATED DIGILOCKER VERIFIED REPOSITORY',
      matchStatus: 'VERIFIED',
      confidenceScore: 0.95,
      evidenceDetails: `DigiLocker verified document XML schema parsed. Cryptographic timestamp and issuing authority digital signature validated.`,
      verifiedData: {
        issuerUri: 'in.gov.gem.docstore',
        documentTitle: docName,
        digitalSignatureStatus: 'CRYPTOGRAPHICALLY_VALID',
        hashAlgorithm: 'SHA-256',
        issuanceTimestamp: new Date().toISOString(),
      },
      discrepancies: [],
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}
