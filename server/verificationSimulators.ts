/**
 * GeM Government Verification API Simulators
 * 
 * DISCLAIMER:
 * ALL RESPONSES FROM THESE APIS ARE SIMULATED / MOCK GOVERNMENT DATA FOR DEMONSTRATION PURPOSES.
 * NEVER CLAIM THAT SIMULATED DATA IS REAL GOVERNMENT DATA.
 */

export interface GovtApiResponse<T = any> {
  status: 'SUCCESS' | 'NOT_FOUND' | 'ERROR';
  disclaimer: string;
  sourcePortal: string;
  queryParameters: Record<string, any>;
  timestamp: string;
  isSimulated: boolean;
  data: T | null;
  message: string;
}

const DISCLAIMER_TEXT = 'DEMO / SIMULATED GOVERNMENT DATA - FOR VERIFICATION PROTOTYPE ONLY';

// 1. GST Portal Simulator Database
const GST_DATABASE: Record<string, any> = {
  '07AAACT2727Q1ZB': {
    gstin: '07AAACT2727Q1ZB',
    legalName: 'TECHVANGUARD SOLUTIONS PRIVATE LIMITED',
    tradeName: 'TECHVANGUARD SOLUTIONS',
    taxpayerType: 'Regular',
    registrationDate: '2018-04-12',
    status: 'ACTIVE',
    statusDescription: 'Active & In Compliance',
    jurisdictionState: 'Delhi',
    centerJurisdiction: 'RANGE-14, DIVISION-II',
    eInvoiceStatus: 'Enabled',
    returnFilingStatusLast12Months: '12/12 Filed on time',
    cancellationDate: null,
    principalPlaceOfBusiness: 'Plot 42, Okhla Industrial Area Phase III, New Delhi 110020',
  },
  '27AABCA1234F1Z5': {
    gstin: '27AABCA1234F1Z5',
    legalName: 'APEX INFOTECH PRIVATE LIMITED',
    tradeName: 'APEX DIGITAL SYSTEMS',
    taxpayerType: 'Regular',
    registrationDate: '2019-09-20',
    status: 'ACTIVE',
    statusDescription: 'Active',
    jurisdictionState: 'Maharashtra',
    centerJurisdiction: 'ANDHERI EAST DIVISION',
    eInvoiceStatus: 'Enabled',
    returnFilingStatusLast12Months: '11/12 Filed',
    cancellationDate: null,
    principalPlaceOfBusiness: 'Unit 501, Technopolis Knowledge Park, Andheri East, Mumbai 400093',
  },
  '06AABCB5678H1Z2': {
    gstin: '06AABCB5678H1Z2',
    legalName: 'BHARAT ELECTRO SUPPLIES LLP',
    tradeName: 'BHARAT ELECTRO',
    taxpayerType: 'Regular',
    registrationDate: '2020-01-15',
    status: 'ACTIVE',
    statusDescription: 'Active',
    jurisdictionState: 'Haryana',
    centerJurisdiction: 'GURUGRAM NORTH',
    eInvoiceStatus: 'Enabled',
    returnFilingStatusLast12Months: '12/12 Filed',
    cancellationDate: null,
    principalPlaceOfBusiness: 'Sector 18, Electronic City, Gurugram, Haryana 122015',
  },
  '29AAACG9999K1Z1': {
    gstin: '29AAACG9999K1Z1',
    legalName: 'GLOBAL QUANTUM TECHNOLOGIES PVT LTD',
    tradeName: 'QUANTUM TECH',
    taxpayerType: 'Regular',
    registrationDate: '2017-07-01',
    status: 'SUSPENDED',
    statusDescription: 'Suspended due to non-filing of returns under Section 29(2)',
    jurisdictionState: 'Karnataka',
    centerJurisdiction: 'BENGALURU CENTRAL',
    eInvoiceStatus: 'Disabled',
    returnFilingStatusLast12Months: '3/12 Filed (Defaulted)',
    cancellationDate: '2025-11-10',
    principalPlaceOfBusiness: '104, Outer Ring Road, Whitefield, Bengaluru, Karnataka 560066',
  },
  '33AAACZ8888L1Z9': {
    gstin: '33AAACZ8888L1Z9',
    legalName: 'ZENITH HEALTH DIAGNOSTICS PRIVATE LIMITED',
    tradeName: 'ZENITH MEDTECH',
    taxpayerType: 'Regular',
    registrationDate: '2021-03-05',
    status: 'ACTIVE',
    statusDescription: 'Active',
    jurisdictionState: 'Tamil Nadu',
    centerJurisdiction: 'CHENNAI SOUTH',
    eInvoiceStatus: 'Enabled',
    returnFilingStatusLast12Months: '12/12 Filed',
    cancellationDate: null,
    principalPlaceOfBusiness: '88, Mount Road, Guindy, Chennai, Tamil Nadu 600032',
  },
  '08AAACO4444N1ZP': {
    gstin: '08AAACO4444N1ZP',
    legalName: 'ORION DIGITAL INFRASTRUCTURE LTD',
    tradeName: 'ORION INFRA',
    taxpayerType: 'Regular',
    registrationDate: '2016-08-14',
    status: 'CANCELLED',
    statusDescription: 'Registration Cancelled Suo-Moto by Tax Officer',
    jurisdictionState: 'Rajasthan',
    centerJurisdiction: 'JAIPUR DIVISION-I',
    eInvoiceStatus: 'Disabled',
    returnFilingStatusLast12Months: '0/12 Filed (Cancelled)',
    cancellationDate: '2025-06-18',
    principalPlaceOfBusiness: 'B-12, Sitapura Industrial Area, Jaipur, Rajasthan 302022',
  },
  '24AAACS7777M1ZV': {
    gstin: '24AAACS7777M1ZV',
    legalName: 'SURYA SOLAR & POWER SOLUTIONS PRIVATE LIMITED',
    tradeName: 'SURYA GREEN ENERGY',
    taxpayerType: 'Regular',
    registrationDate: '2022-02-18',
    status: 'ACTIVE',
    statusDescription: 'Active (DPIIT Registered Startup)',
    jurisdictionState: 'Gujarat',
    centerJurisdiction: 'AHMEDABAD WEST',
    eInvoiceStatus: 'Enabled',
    returnFilingStatusLast12Months: '12/12 Filed',
    cancellationDate: null,
    principalPlaceOfBusiness: 'GIDC Phase II, Vatva, Ahmedabad, Gujarat 382445',
  },
  '19AAACD3333E1ZQ': {
    gstin: '19AAACD3333E1ZQ',
    legalName: 'DELTA MEDICAL DEVICES INDIA PRIVATE LIMITED',
    tradeName: 'DELTA MED',
    taxpayerType: 'Regular',
    registrationDate: '2019-11-25',
    status: 'ACTIVE',
    statusDescription: 'Active',
    jurisdictionState: 'West Bengal',
    centerJurisdiction: 'KOLKATA CENTRAL',
    eInvoiceStatus: 'Enabled',
    returnFilingStatusLast12Months: '10/12 Filed',
    cancellationDate: null,
    principalPlaceOfBusiness: 'Salt Lake Sector V, Kolkata, West Bengal 700091',
  },
};

// 2. Income Tax PAN Database Simulator
const PAN_DATABASE: Record<string, any> = {
  'AAACT2727Q': {
    pan: 'AAACT2727Q',
    legalName: 'TECHVANGUARD SOLUTIONS PRIVATE LIMITED',
    category: 'Company',
    status: 'VALID',
    aadhaarSeedingStatus: 'NOT_APPLICABLE_COMPANY',
    maskedAadhaar: 'N/A',
    incorporationDate: '2018-04-02',
    jurisdictionAssessingOfficer: 'CIT (IT) Delhi-1',
  },
  'AABCA1234F': {
    pan: 'AABCA1234F',
    legalName: 'APEX INFOTECH PRIVATE LIMITED',
    category: 'Company',
    status: 'VALID',
    aadhaarSeedingStatus: 'NOT_APPLICABLE_COMPANY',
    maskedAadhaar: 'N/A',
    incorporationDate: '2019-09-10',
    jurisdictionAssessingOfficer: 'CIT (IT) Mumbai-4',
  },
  'AABCB5678H': {
    pan: 'AABCB5678H',
    legalName: 'BHARAT ELECTRO SUPPLIES LLP',
    category: 'Limited Liability Partnership',
    status: 'VALID',
    aadhaarSeedingStatus: 'NOT_APPLICABLE_LLP',
    maskedAadhaar: 'N/A',
    incorporationDate: '2020-01-08',
    jurisdictionAssessingOfficer: 'CIT (IT) Gurugram',
  },
  'AAACG9999K': {
    pan: 'AAACG9999K',
    legalName: 'GLOBAL QUANTUM TECHNOLOGIES PVT LTD',
    category: 'Company',
    status: 'VALID',
    aadhaarSeedingStatus: 'NOT_APPLICABLE_COMPANY',
    maskedAadhaar: 'N/A',
    incorporationDate: '2017-06-15',
    jurisdictionAssessingOfficer: 'CIT (IT) Bengaluru-2',
  },
  'AAACZ8888L': {
    pan: 'AAACZ8888L',
    legalName: 'ZENITH HEALTH DIAGNOSTICS PRIVATE LIMITED',
    category: 'Company',
    status: 'VALID',
    aadhaarSeedingStatus: 'NOT_APPLICABLE_COMPANY',
    incorporationDate: '2021-02-28',
    jurisdictionAssessingOfficer: 'CIT (IT) Chennai-3',
  },
  'AAACO4444N': {
    pan: 'AAACO4444N',
    legalName: 'ORION DIGITAL INFRASTRUCTURE LTD',
    category: 'Company',
    status: 'INOPERATIVE',
    statusReason: 'Under investigation for tax default',
    incorporationDate: '2016-08-01',
    jurisdictionAssessingOfficer: 'CIT (IT) Jaipur-1',
  },
  'AAACS7777M': {
    pan: 'AAACS7777M',
    legalName: 'SURYA SOLAR & POWER SOLUTIONS PRIVATE LIMITED',
    category: 'Company',
    status: 'VALID',
    incorporationDate: '2022-02-05',
    jurisdictionAssessingOfficer: 'CIT (IT) Ahmedabad-2',
  },
  'AAACD3333E': {
    pan: 'AAACD3333E',
    legalName: 'DELTA MEDICAL DEVICES INDIA PRIVATE LIMITED',
    category: 'Company',
    status: 'VALID',
    incorporationDate: '2019-11-12',
    jurisdictionAssessingOfficer: 'CIT (IT) Kolkata-1',
  },
};

// 3. Udyam MSME Database Simulator
const UDYAM_DATABASE: Record<string, any> = {
  'UDYAM-DL-01-0045892': {
    udyamNumber: 'UDYAM-DL-01-0045892',
    enterpriseName: 'TECHVANGUARD SOLUTIONS PRIVATE LIMITED',
    enterpriseType: 'Medium',
    majorActivity: 'Services & System Integration',
    nicCodes: ['62011 - Writing, modifying, testing of computer program', '62020 - Computer consultancy'],
    dateOfCommencement: '2018-04-12',
    dateOfRegistration: '2020-07-22',
    msmeStatus: 'VALID',
    validUpto: 'Permanent (Subject to Annual ITR/GST Update)',
    investmentInPlant: '₹ 18.50 Crores',
    turnover: '₹ 42.10 Crores',
    dicName: 'DIC Okhla New Delhi',
  },
  'UDYAM-MH-03-0098412': {
    udyamNumber: 'UDYAM-MH-03-0098412',
    enterpriseName: 'APEX INFOTECH PRIVATE LIMITED',
    enterpriseType: 'Small',
    majorActivity: 'Services',
    nicCodes: ['62099 - Other IT and computer service activities'],
    dateOfCommencement: '2019-09-20',
    dateOfRegistration: '2020-09-15',
    msmeStatus: 'VALID',
    validUpto: 'Permanent',
    investmentInPlant: '₹ 4.20 Crores',
    turnover: '₹ 14.80 Crores',
    dicName: 'DIC Mumbai Suburban',
  },
  'UDYAM-HR-04-0012903': {
    udyamNumber: 'UDYAM-HR-04-0012903',
    enterpriseName: 'BHARAT ELECTRO SUPPLIES LLP',
    enterpriseType: 'Small',
    majorActivity: 'Manufacturing',
    nicCodes: ['26101 - Manufacture of electronic components'],
    dateOfCommencement: '2020-01-15',
    dateOfRegistration: '2021-02-10',
    msmeStatus: 'VALID',
    validUpto: 'Permanent',
    investmentInPlant: '₹ 6.50 Crores',
    turnover: '₹ 18.90 Crores',
    dicName: 'DIC Gurugram',
  },
  'UDYAM-TN-02-0077431': {
    udyamNumber: 'UDYAM-TN-02-0077431',
    enterpriseName: 'ZENITH HEALTH DIAGNOSTICS PRIVATE LIMITED',
    enterpriseType: 'Micro',
    majorActivity: 'Manufacturing & R&D',
    nicCodes: ['26600 - Manufacture of electromedical and electrotherapeutic equipment'],
    dateOfCommencement: '2021-03-05',
    dateOfRegistration: '2021-05-18',
    msmeStatus: 'VALID',
    validUpto: 'Permanent',
    investmentInPlant: '₹ 85.00 Lakhs',
    turnover: '₹ 2.40 Crores',
    dicName: 'DIC Chennai',
  },
  'UDYAM-GJ-01-0066512': {
    udyamNumber: 'UDYAM-GJ-01-0066512',
    enterpriseName: 'SURYA SOLAR & POWER SOLUTIONS PRIVATE LIMITED',
    enterpriseType: 'Small',
    majorActivity: 'Manufacturing',
    nicCodes: ['27101 - Manufacture of electric motors, generators, transformers'],
    dateOfCommencement: '2022-02-18',
    dateOfRegistration: '2022-04-10',
    msmeStatus: 'VALID',
    validUpto: 'Permanent',
    investmentInPlant: '₹ 3.80 Crores',
    turnover: '₹ 9.50 Crores',
    dicName: 'DIC Ahmedabad',
  },
};

// 4. Income Tax Filing Database Simulator (ITR for 3 Financial Years)
const ITR_DATABASE: Record<string, any> = {
  'AAACT2727Q': {
    pan: 'AAACT2727Q',
    legalName: 'TECHVANGUARD SOLUTIONS PRIVATE LIMITED',
    complianceStatus: 'FULLY_COMPLIANT',
    filings: [
      { assessmentYear: '2024-25', financialYear: '2023-24', itrForm: 'ITR-6', filingDate: '2024-10-28', status: 'VERIFIED', grossTurnover: 421000000, ackNumber: '894719201948' },
      { assessmentYear: '2025-26', financialYear: '2024-25', itrForm: 'ITR-6', filingDate: '2025-10-24', status: 'VERIFIED', grossTurnover: 485000000, ackNumber: '748194029481' },
      { assessmentYear: '2026-27', financialYear: '2025-26', itrForm: 'ITR-6', filingDate: '2026-07-15', status: 'PROVISIONALLY_FILED', grossTurnover: 540000000, ackNumber: '610294829104' },
    ],
    averageTurnoverLast3Years: '₹ 48.20 Crores',
    hasAuditorReport3CA: true,
  },
  'AABCA1234F': {
    pan: 'AABCA1234F',
    legalName: 'APEX INFOTECH PRIVATE LIMITED',
    complianceStatus: 'FULLY_COMPLIANT',
    filings: [
      { assessmentYear: '2024-25', financialYear: '2023-24', itrForm: 'ITR-6', filingDate: '2024-10-15', status: 'VERIFIED', grossTurnover: 148000000, ackNumber: '381940294810' },
      { assessmentYear: '2025-26', financialYear: '2024-25', itrForm: 'ITR-6', filingDate: '2025-10-18', status: 'VERIFIED', grossTurnover: 175000000, ackNumber: '491048201948' },
      { assessmentYear: '2026-27', financialYear: '2025-26', itrForm: 'ITR-6', filingDate: '2026-07-29', status: 'VERIFIED', grossTurnover: 198000000, ackNumber: '501928471920' },
    ],
    averageTurnoverLast3Years: '₹ 17.36 Crores',
    hasAuditorReport3CA: true,
  },
  'AABCB5678H': {
    pan: 'AABCB5678H',
    legalName: 'BHARAT ELECTRO SUPPLIES LLP',
    complianceStatus: 'FULLY_COMPLIANT',
    filings: [
      { assessmentYear: '2024-25', financialYear: '2023-24', itrForm: 'ITR-5', filingDate: '2024-09-30', status: 'VERIFIED', grossTurnover: 189000000, ackNumber: '918471029481' },
      { assessmentYear: '2025-26', financialYear: '2024-25', itrForm: 'ITR-5', filingDate: '2025-09-28', status: 'VERIFIED', grossTurnover: 215000000, ackNumber: '829104820194' },
      { assessmentYear: '2026-27', financialYear: '2025-26', itrForm: 'ITR-5', filingDate: '2026-06-30', status: 'VERIFIED', grossTurnover: 240000000, ackNumber: '739104829102' },
    ],
    averageTurnoverLast3Years: '₹ 21.46 Crores',
    hasAuditorReport3CA: true,
  },
  'AAACG9999K': {
    pan: 'AAACG9999K',
    legalName: 'GLOBAL QUANTUM TECHNOLOGIES PVT LTD',
    complianceStatus: 'DEFICIENT',
    filings: [
      { assessmentYear: '2024-25', financialYear: '2023-24', itrForm: 'ITR-6', filingDate: '2025-01-12 (Late)', status: 'DEFECTIVE_NOTICE_139_9', grossTurnover: 85000000, ackNumber: '109284719204' },
      { assessmentYear: '2025-26', financialYear: '2024-25', itrForm: 'ITR-6', filingDate: null, status: 'NOT_FILED', grossTurnover: 0, ackNumber: null },
      { assessmentYear: '2026-27', financialYear: '2025-26', itrForm: 'ITR-6', filingDate: null, status: 'NOT_FILED', grossTurnover: 0, ackNumber: null },
    ],
    averageTurnoverLast3Years: 'Incomplete Records',
    hasAuditorReport3CA: false,
  },
  '33AAACZ8888L': {
    pan: 'AAACZ8888L',
    legalName: 'ZENITH HEALTH DIAGNOSTICS PRIVATE LIMITED',
    complianceStatus: 'FULLY_COMPLIANT',
    filings: [
      { assessmentYear: '2024-25', financialYear: '2023-24', itrForm: 'ITR-6', filingDate: '2024-09-15', status: 'VERIFIED', grossTurnover: 24000000, ackNumber: '619284710294' },
      { assessmentYear: '2025-26', financialYear: '2024-25', itrForm: 'ITR-6', filingDate: '2025-09-22', status: 'VERIFIED', grossTurnover: 31000000, ackNumber: '729104820194' },
      { assessmentYear: '2026-27', financialYear: '2025-26', itrForm: 'ITR-6', filingDate: '2026-07-10', status: 'VERIFIED', grossTurnover: 39000000, ackNumber: '839201948201' },
    ],
    averageTurnoverLast3Years: '₹ 3.13 Crores',
    hasAuditorReport3CA: true,
  },
};

// 5. EPFO (Employees' Provident Fund Organisation) Simulator Database
const EPFO_DATABASE: Record<string, any> = {
  'DSNHP0048192000': {
    establishmentCode: 'DSNHP0048192000',
    establishmentName: 'TECHVANGUARD SOLUTIONS PVT LTD',
    pan: 'AAACT2727Q',
    registrationDate: '2018-06-01',
    officeName: 'EPFO Regional Office Delhi South',
    status: 'ACTIVE_COMPLIANT',
    activeSubscribersCount: 142,
    lastECRFilingDate: '2026-08-10',
    wageMonthPaid: 'July 2026',
    defaultStatus: 'NIL_DEFAULT',
  },
  'MHBAN0019284000': {
    establishmentCode: 'MHBAN0019284000',
    establishmentName: 'APEX INFOTECH PVT LTD',
    pan: 'AABCA1234F',
    registrationDate: '2019-10-15',
    officeName: 'EPFO Regional Office Bandra, Mumbai',
    status: 'ACTIVE_COMPLIANT',
    activeSubscribersCount: 68,
    lastECRFilingDate: '2026-08-12',
    wageMonthPaid: 'July 2026',
    defaultStatus: 'NIL_DEFAULT',
  },
  'HRGUR0077412000': {
    establishmentCode: 'HRGUR0077412000',
    establishmentName: 'BHARAT ELECTRO SUPPLIES LLP',
    pan: 'AABCB5678H',
    registrationDate: '2020-03-01',
    officeName: 'EPFO Regional Office Gurugram',
    status: 'ACTIVE_COMPLIANT',
    activeSubscribersCount: 84,
    lastECRFilingDate: '2026-08-08',
    wageMonthPaid: 'July 2026',
    defaultStatus: 'NIL_DEFAULT',
  },
  'TNMAD0055192000': {
    establishmentCode: 'TNMAD0055192000',
    establishmentName: 'ZENITH HEALTH DIAGNOSTICS PVT LTD',
    pan: 'AAACZ8888L',
    registrationDate: '2021-04-10',
    officeName: 'EPFO Regional Office Chennai South',
    status: 'ACTIVE_COMPLIANT',
    activeSubscribersCount: 18,
    lastECRFilingDate: '2026-08-11',
    wageMonthPaid: 'July 2026',
    defaultStatus: 'NIL_DEFAULT',
  },
  'GJAHM0033190000': {
    establishmentCode: 'GJAHM0033190000',
    establishmentName: 'SURYA SOLAR & POWER SOLUTIONS PVT LTD',
    pan: 'AAACS7777M',
    registrationDate: '2022-03-20',
    officeName: 'EPFO Regional Office Ahmedabad',
    status: 'ACTIVE_COMPLIANT',
    activeSubscribersCount: 35,
    lastECRFilingDate: '2026-08-09',
    wageMonthPaid: 'July 2026',
    defaultStatus: 'NIL_DEFAULT',
  },
};

// 6. ESIC (Employees' State Insurance Corporation) Simulator Database
const ESIC_DATABASE: Record<string, any> = {
  '11000847190001001': {
    employerCode: '11000847190001001',
    employerName: 'TECHVANGUARD SOLUTIONS PVT LTD',
    pan: 'AAACT2727Q',
    registrationDate: '2018-07-15',
    region: 'Delhi Regional Office - Rajendra Place',
    status: 'ACTIVE',
    insuredPersonsCount: 94,
    lastContributionMonth: 'July 2026',
    contributionStatus: 'PAID',
  },
  '31000918270001002': {
    employerCode: '31000918270001002',
    employerName: 'APEX INFOTECH PVT LTD',
    pan: 'AABCA1234F',
    registrationDate: '2019-11-01',
    region: 'Maharashtra Regional Office - Mumbai',
    status: 'ACTIVE',
    insuredPersonsCount: 42,
    lastContributionMonth: 'July 2026',
    contributionStatus: 'PAID',
  },
  '13000648190001003': {
    employerCode: '13000648190001003',
    employerName: 'BHARAT ELECTRO SUPPLIES LLP',
    pan: 'AABCB5678H',
    registrationDate: '2020-04-10',
    region: 'Haryana Regional Office - Faridabad',
    status: 'ACTIVE',
    insuredPersonsCount: 65,
    lastContributionMonth: 'July 2026',
    contributionStatus: 'PAID',
  },
  '38000419280001004': {
    employerCode: '38000419280001004',
    employerName: 'SURYA SOLAR & POWER SOLUTIONS PVT LTD',
    pan: 'AAACS7777M',
    registrationDate: '2022-04-15',
    region: 'Gujarat Regional Office - Ahmedabad',
    status: 'ACTIVE',
    insuredPersonsCount: 28,
    lastContributionMonth: 'July 2026',
    contributionStatus: 'PAID',
  },
  // Note: ZENITH HEALTH has NO ESIC record (Micro < 10 threshold / Missing test case)
};

// 7. Startup India DPIIT Database Simulator
const STARTUP_DATABASE: Record<string, any> = {
  'DIPP98412': {
    dpiitNumber: 'DIPP98412',
    entityName: 'SURYA SOLAR & POWER SOLUTIONS PRIVATE LIMITED',
    pan: 'AAACS7777M',
    cinNumber: 'U40106GJ2022PTC129841',
    recognitionDate: '2022-03-10',
    status: 'RECOGNIZED_STARTUP',
    taxExemption80IAC: 'APPROVED',
    incubatorAffiliation: 'iCreate Ahmedabad',
    categorySector: 'Renewable Energy / CleanTech',
    validUpto: '2032-03-09 (10 Years from Incorporation)',
    gemExemptionEligible: {
      priorExperienceExemption: true,
      priorTurnoverExemption: true,
      emdExemption: true,
    },
  },
};

// 8. NSIC (National Small Industries Corporation) Single Point Registration Simulator
const NSIC_DATABASE: Record<string, any> = {
  'NSIC/DEL/SPR/2021/00491': {
    registrationNumber: 'NSIC/DEL/SPR/2021/00491',
    firmName: 'TECHVANGUARD SOLUTIONS PRIVATE LIMITED',
    storeDetails: 'IT Hardware, Computer Systems, Networking Appliances',
    manufacturingCapacityPerAnnum: '5,000 Units',
    validFrom: '2024-04-01',
    validUpto: '2027-03-31',
    status: 'CURRENT_VALID',
    monetaryLimit: '₹ 15.00 Crores',
    emdExemptionApplicable: true,
  },
  'NSIC/GUR/SPR/2022/00184': {
    registrationNumber: 'NSIC/GUR/SPR/2022/00184',
    firmName: 'BHARAT ELECTRO SUPPLIES LLP',
    storeDetails: 'Power distribution switches, relays, electronic assemblies',
    manufacturingCapacityPerAnnum: '25,000 Units',
    validFrom: '2024-01-01',
    validUpto: '2027-12-31',
    status: 'CURRENT_VALID',
    monetaryLimit: '₹ 8.00 Crores',
    emdExemptionApplicable: true,
  },
};

// 9. Debarment / Blacklisting Central GeM & CPPP Repository Simulator
const BLACKLIST_DATABASE: Record<string, any> = {
  'AAACG9999K': {
    isBlacklisted: true,
    entityName: 'GLOBAL QUANTUM TECHNOLOGIES PVT LTD',
    pan: 'AAACG9999K',
    gstin: '29AAACG9999K1Z1',
    orderNumber: 'GeM/DEBAR/2025/HQ-0881',
    issuingAuthority: 'Government e-Marketplace (GeM) Disciplinary Committee / Ministry of Commerce',
    debarmentType: 'All Government & GeM Tenders',
    reason: 'Submission of forged OEM authorization letter & non-performance in Contract GEMC-511687720918',
    effectiveFrom: '2025-08-15',
    effectiveUpto: '2028-08-14 (3 Years)',
    currentStatus: 'ACTIVE_DEBARRED',
    referenceCircular: 'OM No. F.1/20/2024-PPD Dept of Expenditure',
  },
  'AAACO4444N': {
    isBlacklisted: true,
    entityName: 'ORION DIGITAL INFRASTRUCTURE LTD',
    pan: 'AAACO4444N',
    gstin: '08AAACO4444N1ZP',
    orderNumber: 'CPPP/DEBAR/2025/DOE-419',
    issuingAuthority: 'Department of Telecommunications (DoT)',
    debarmentType: 'Telecom & Network Infra Works',
    reason: 'Breach of integrity pact and non-completion of critical optical grid rollout',
    effectiveFrom: '2025-05-01',
    effectiveUpto: '2027-04-30 (2 Years)',
    currentStatus: 'ACTIVE_DEBARRED',
    referenceCircular: 'DoT Notification No. 18-04/2024-IT',
  },
};

// 10. OEM Manufacturer Authorization Verification Portal Simulator
const OEM_DATABASE: Record<string, any> = {
  'DELL-AUTH-2026-DL8941': {
    authorizationCode: 'DELL-AUTH-2026-DL8941',
    oemName: 'Dell Technologies India Pvt Ltd',
    authorizedPartner: 'TECHVANGUARD SOLUTIONS PRIVATE LIMITED',
    partnerTier: 'Titanium Solution Provider',
    tenderRefCovered: 'GEM/2026/B/894201',
    validFrom: '2026-01-01',
    validUpto: '2026-12-31',
    status: 'ACTIVE_VERIFIED',
    warrantyCommitmentProvided: true,
    supportSlaGuaranteed: '24x7 4Hr On-Site Response',
    authorizedSignatory: 'Rajesh Subramanian, Director Partner Sales India',
  },
  'HP-AUTH-2025-MH1042': {
    authorizationCode: 'HP-AUTH-2025-MH1042',
    oemName: 'HP India Sales Private Limited',
    authorizedPartner: 'APEX INFOTECH PRIVATE LIMITED',
    partnerTier: 'Gold Partner',
    tenderRefCovered: 'GEM/2026/B/894201',
    validFrom: '2025-01-01',
    validUpto: '2025-12-31', // Expired!
    status: 'EXPIRED',
    warrantyCommitmentProvided: false,
    supportSlaGuaranteed: 'Expired',
    authorizedSignatory: 'Anand Kulkarni, Commercial Sales Head',
  },
  'SIEMENS-AUTH-2026-MED99': {
    authorizationCode: 'SIEMENS-AUTH-2026-MED99',
    oemName: 'Siemens Healthcare Private Limited',
    authorizedPartner: 'ZENITH HEALTH DIAGNOSTICS PRIVATE LIMITED',
    partnerTier: 'Authorized Healthcare Channel Partner',
    tenderRefCovered: 'GEM/2026/B/771029',
    validFrom: '2026-03-01',
    validUpto: '2027-02-28',
    status: 'ACTIVE_VERIFIED',
    warrantyCommitmentProvided: true,
    supportSlaGuaranteed: 'Comprehensive 5-Year CMC',
    authorizedSignatory: 'Dr. Vikramaditya Sen, VP MedTech India',
  },
};

// 11. Make in India Local Content Registry Simulator
const MII_DATABASE: Record<string, any> = {
  'TECHVANGUARD SOLUTIONS PRIVATE LIMITED': {
    productCategory: 'High Performance Servers & Storage',
    declaredLocalContent: 62.5,
    verifiedClass: 'Class-I Local Supplier (>= 50%)',
    caCertified: true,
    caName: 'R. K. Agrawal & Associates (FRN: 014285N)',
    caUdin: '26048192AAAA89410',
    verificationStatus: 'VERIFIED_COMPLIANT',
  },
  'BHARAT ELECTRO SUPPLIES LLP': {
    productCategory: 'Power Distribution Control Panels',
    declaredLocalContent: 65.0, // Bidder claimed 65% in bid
    portalAuditedContent: 38.0, // Portal audit shows only 38% - Mismatch!
    verifiedClass: 'Class-II Local Supplier (20% to <50%)',
    caCertified: false,
    caUdin: 'INVALID_UDIN_NOT_MATCHING_ICAI',
    verificationStatus: 'MISMATCH_DETECTED',
  },
  'SURYA SOLAR & POWER SOLUTIONS PRIVATE LIMITED': {
    productCategory: 'Grid-Tied Solar Inverters & DC Combiners',
    declaredLocalContent: 78.0,
    verifiedClass: 'Class-I Local Supplier (>= 50%)',
    caCertified: true,
    caName: 'Mehta & Shah Chartered Accountants',
    caUdin: '26098412BBBB77192',
    verificationStatus: 'VERIFIED_COMPLIANT',
  },
};

// Verification Service functions
export const VerificationSimulators = {
  verifyGst: (gstin: string): GovtApiResponse => {
    const cleanGstin = gstin.trim().toUpperCase();
    const record = GST_DATABASE[cleanGstin];
    if (record) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'GST Common Portal (GSTN India) - Simulated Endpoint',
        queryParameters: { gstin: cleanGstin },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: record,
        message: `GSTIN record found. Status: ${record.status}`,
      };
    }

    // Dynamic fallback simulator for any realistic GSTIN
    const isValidFormat = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGstin);
    if (isValidFormat) {
      const derivedPan = cleanGstin.substring(2, 12);
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'GST Common Portal (GSTN India) - Simulated Endpoint',
        queryParameters: { gstin: cleanGstin },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: {
          gstin: cleanGstin,
          legalName: `ENTERPRISE ASSOCIATED WITH ${derivedPan}`,
          tradeName: `BUSINESS UNIT ${cleanGstin.substring(0, 2)}`,
          taxpayerType: 'Regular',
          registrationDate: '2021-01-01',
          status: 'ACTIVE',
          statusDescription: 'Active & In Compliance',
          jurisdictionState: 'State Code ' + cleanGstin.substring(0, 2),
          centerJurisdiction: 'DIVISION-I',
          eInvoiceStatus: 'Enabled',
          returnFilingStatusLast12Months: '12/12 Filed on time',
          cancellationDate: null,
          principalPlaceOfBusiness: 'Industrial Area, India',
        },
        message: 'GSTIN record dynamically simulated as Active',
      };
    }

    return {
      status: 'NOT_FOUND',
      disclaimer: DISCLAIMER_TEXT,
      sourcePortal: 'GST Common Portal (GSTN India) - Simulated Endpoint',
      queryParameters: { gstin: cleanGstin },
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: null,
      message: 'GSTIN not found or invalid format on simulated GSTN database.',
    };
  },

  verifyPan: (pan: string): GovtApiResponse => {
    const cleanPan = pan.trim().toUpperCase();
    const record = PAN_DATABASE[cleanPan];
    if (record) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'Income Tax Department (ITD NSDL/UTI DB) - Simulated Endpoint',
        queryParameters: { pan: cleanPan },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: record,
        message: `PAN record verified. Status: ${record.status}`,
      };
    }

    const isValidFormat = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan);
    if (isValidFormat) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'Income Tax Department (ITD NSDL/UTI DB) - Simulated Endpoint',
        queryParameters: { pan: cleanPan },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: {
          pan: cleanPan,
          legalName: `ENTITY HOLDING PAN ${cleanPan}`,
          category: cleanPan[3] === 'C' ? 'Company' : cleanPan[3] === 'P' ? 'Individual' : cleanPan[3] === 'F' ? 'Firm/LLP' : 'Entity',
          status: 'VALID',
          aadhaarSeedingStatus: 'NOT_APPLICABLE',
          incorporationDate: '2020-01-01',
          jurisdictionAssessingOfficer: 'CIT (IT)',
        },
        message: 'PAN verified successfully via simulated ITD database',
      };
    }

    return {
      status: 'NOT_FOUND',
      disclaimer: DISCLAIMER_TEXT,
      sourcePortal: 'Income Tax Department (ITD) - Simulated Endpoint',
      queryParameters: { pan: cleanPan },
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: null,
      message: 'PAN not found or format invalid on simulated ITD registry.',
    };
  },

  verifyUdyam: (udyam: string): GovtApiResponse => {
    const cleanUdyam = udyam.trim().toUpperCase();
    const record = UDYAM_DATABASE[cleanUdyam];
    if (record) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'Ministry of MSME (Udyam Portal) - Simulated Endpoint',
        queryParameters: { udyamNumber: cleanUdyam },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: record,
        message: `Udyam Registration active. Enterprise Type: ${record.enterpriseType}`,
      };
    }

    if (cleanUdyam.startsWith('UDYAM-')) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'Ministry of MSME (Udyam Portal) - Simulated Endpoint',
        queryParameters: { udyamNumber: cleanUdyam },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: {
          udyamNumber: cleanUdyam,
          enterpriseName: 'REGISTERED MSME UNIT',
          enterpriseType: 'Small',
          majorActivity: 'Manufacturing & Services',
          nicCodes: ['62011 - Computer Services'],
          dateOfCommencement: '2021-01-01',
          dateOfRegistration: '2021-06-01',
          msmeStatus: 'VALID',
          validUpto: 'Permanent',
          investmentInPlant: '₹ 5.00 Crores',
          turnover: '₹ 15.00 Crores',
          dicName: 'District Industries Centre',
        },
        message: 'Udyam Certificate found and active',
      };
    }

    return {
      status: 'NOT_FOUND',
      disclaimer: DISCLAIMER_TEXT,
      sourcePortal: 'Ministry of MSME (Udyam Portal) - Simulated Endpoint',
      queryParameters: { udyamNumber: cleanUdyam },
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: null,
      message: 'Udyam Registration Number not found on MSME portal.',
    };
  },

  verifyIncomeTax: (pan: string): GovtApiResponse => {
    const cleanPan = pan.trim().toUpperCase();
    const record = ITR_DATABASE[cleanPan];
    if (record) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'e-Filing Portal Income Tax Department - Simulated Endpoint',
        queryParameters: { pan: cleanPan },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: record,
        message: `ITR filings retrieved for last 3 financial years. Compliance: ${record.complianceStatus}`,
      };
    }

    return {
      status: 'SUCCESS',
      disclaimer: DISCLAIMER_TEXT,
      sourcePortal: 'e-Filing Portal Income Tax Department - Simulated Endpoint',
      queryParameters: { pan: cleanPan },
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: {
        pan: cleanPan,
        legalName: `TAXPAYER ${cleanPan}`,
        complianceStatus: 'FULLY_COMPLIANT',
        filings: [
          { assessmentYear: '2024-25', financialYear: '2023-24', itrForm: 'ITR-6', filingDate: '2024-10-15', status: 'VERIFIED', grossTurnover: 250000000, ackNumber: '891048291048' },
          { assessmentYear: '2025-26', financialYear: '2024-25', itrForm: 'ITR-6', filingDate: '2025-10-20', status: 'VERIFIED', grossTurnover: 290000000, ackNumber: '748194029104' },
          { assessmentYear: '2026-27', financialYear: '2025-26', itrForm: 'ITR-6', filingDate: '2026-07-20', status: 'VERIFIED', grossTurnover: 320000000, ackNumber: '610482910482' },
        ],
        averageTurnoverLast3Years: '₹ 28.66 Crores',
        hasAuditorReport3CA: true,
      },
      message: 'ITR filings verified for 3 consecutive FYs',
    };
  },

  verifyEpfo: (estId?: string, pan?: string): GovtApiResponse => {
    let record = null;
    if (estId && EPFO_DATABASE[estId.trim()]) {
      record = EPFO_DATABASE[estId.trim()];
    } else if (pan) {
      record = Object.values(EPFO_DATABASE).find((item: any) => item.pan === pan.trim().toUpperCase());
    }

    if (record) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'EPFO Unified Portal (Shram Suvidha) - Simulated Endpoint',
        queryParameters: { estId, pan },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: record,
        message: `EPFO Establishment is Active. Subscribers: ${record.activeSubscribersCount}`,
      };
    }

    return {
      status: 'NOT_FOUND',
      disclaimer: DISCLAIMER_TEXT,
      sourcePortal: 'EPFO Unified Portal (Shram Suvidha) - Simulated Endpoint',
      queryParameters: { estId, pan },
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: null,
      message: 'EPFO Establishment record not found or not mapped under PAN.',
    };
  },

  verifyEsic: (code?: string, pan?: string): GovtApiResponse => {
    let record = null;
    if (code && ESIC_DATABASE[code.trim()]) {
      record = ESIC_DATABASE[code.trim()];
    } else if (pan) {
      record = Object.values(ESIC_DATABASE).find((item: any) => item.pan === pan.trim().toUpperCase());
    }

    if (record) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'ESIC Portal (Ministry of Labour & Employment) - Simulated Endpoint',
        queryParameters: { code, pan },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: record,
        message: `ESIC Registration Active. Insured Persons: ${record.insuredPersonsCount}`,
      };
    }

    return {
      status: 'NOT_FOUND',
      disclaimer: DISCLAIMER_TEXT,
      sourcePortal: 'ESIC Portal (Ministry of Labour & Employment) - Simulated Endpoint',
      queryParameters: { code, pan },
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: null,
      message: 'ESIC code not found or employer exempted/unregistered.',
    };
  },

  verifyStartup: (dpiit: string): GovtApiResponse => {
    const clean = dpiit.trim().toUpperCase();
    const record = STARTUP_DATABASE[clean];
    if (record) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'Startup India DPIIT Portal - Simulated Endpoint',
        queryParameters: { dpiit: clean },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: record,
        message: 'DPIIT Startup Recognition confirmed with GeM exemptions',
      };
    }

    return {
      status: 'NOT_FOUND',
      disclaimer: DISCLAIMER_TEXT,
      sourcePortal: 'Startup India DPIIT Portal - Simulated Endpoint',
      queryParameters: { dpiit: clean },
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: null,
      message: 'DPIIT Startup Recognition Number not found.',
    };
  },

  verifyNsic: (regNo: string): GovtApiResponse => {
    const clean = regNo.trim();
    const record = NSIC_DATABASE[clean];
    if (record) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'NSIC Single Point Registration System - Simulated Endpoint',
        queryParameters: { regNo: clean },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: record,
        message: `NSIC Certificate valid up to ${record.validUpto}`,
      };
    }

    return {
      status: 'NOT_FOUND',
      disclaimer: DISCLAIMER_TEXT,
      sourcePortal: 'NSIC Single Point Registration System - Simulated Endpoint',
      queryParameters: { regNo: clean },
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: null,
      message: 'NSIC Single Point Registration not found or expired.',
    };
  },

  verifyBlacklist: (pan?: string, gstin?: string, name?: string): GovtApiResponse => {
    const cleanPan = pan?.trim().toUpperCase();
    let record = null;
    if (cleanPan && BLACKLIST_DATABASE[cleanPan]) {
      record = BLACKLIST_DATABASE[cleanPan];
    } else if (gstin) {
      record = Object.values(BLACKLIST_DATABASE).find((item: any) => item.gstin === gstin.trim().toUpperCase());
    } else if (name) {
      record = Object.values(BLACKLIST_DATABASE).find((item: any) =>
        item.entityName.toLowerCase().includes(name.toLowerCase().trim())
      );
    }

    if (record && record.isBlacklisted) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'Central Debarment & Blacklist Repository (GeM / CPPP / DoE) - Simulated Endpoint',
        queryParameters: { pan, gstin, name },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: record,
        message: `CRITICAL ALERT: Entity is currently DEBARRED/BLACKLISTED until ${record.effectiveUpto}`,
      };
    }

    return {
      status: 'SUCCESS',
      disclaimer: DISCLAIMER_TEXT,
      sourcePortal: 'Central Debarment & Blacklist Repository (GeM / CPPP / DoE) - Simulated Endpoint',
      queryParameters: { pan, gstin, name },
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: {
        isBlacklisted: false,
        status: 'CLEAR',
        message: 'No adverse debarment or blacklisting orders found in Central GeM/CPPP repository',
        checkedAgainst: 'Department of Expenditure OM F.1/20/2024-PPD & GeM Incident Management Policy',
      },
      message: 'Entity is CLEAR of debarment/blacklisting.',
    };
  },

  verifyOem: (oemName?: string, authCode?: string): GovtApiResponse => {
    const cleanAuth = authCode?.trim();
    let record = null;
    if (cleanAuth && OEM_DATABASE[cleanAuth]) {
      record = OEM_DATABASE[cleanAuth];
    } else if (oemName) {
      record = Object.values(OEM_DATABASE).find((item: any) =>
        item.oemName.toLowerCase().includes(oemName.toLowerCase().trim())
      );
    }

    if (record) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'OEM Manufacturer Authorization Verification Portal (MAVP) - Simulated Endpoint',
        queryParameters: { oemName, authCode },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: record,
        message: `OEM Authorization verified with ${record.oemName}. Status: ${record.status}`,
      };
    }

    return {
      status: 'NOT_FOUND',
      disclaimer: DISCLAIMER_TEXT,
      sourcePortal: 'OEM Manufacturer Authorization Verification Portal (MAVP) - Simulated Endpoint',
      queryParameters: { oemName, authCode },
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: null,
      message: 'OEM Authorization certificate could not be validated with issuing OEM manufacturer repository.',
    };
  },

  verifyMii: (companyName: string): GovtApiResponse => {
    const record = MII_DATABASE[companyName.trim().toUpperCase()] ||
      Object.entries(MII_DATABASE).find(([k]) => companyName.toUpperCase().includes(k))?.[1];

    if (record) {
      return {
        status: 'SUCCESS',
        disclaimer: DISCLAIMER_TEXT,
        sourcePortal: 'Public Procurement (Preference to Make in India) Verification Portal - Simulated Endpoint',
        queryParameters: { companyName },
        timestamp: new Date().toISOString(),
        isSimulated: true,
        data: record,
        message: `Make in India verification executed. Status: ${record.verificationStatus}`,
      };
    }

    return {
      status: 'SUCCESS',
      disclaimer: DISCLAIMER_TEXT,
      sourcePortal: 'Public Procurement (Preference to Make in India) Verification Portal - Simulated Endpoint',
      queryParameters: { companyName },
      timestamp: new Date().toISOString(),
      isSimulated: true,
      data: {
        productCategory: 'General Equipment',
        declaredLocalContent: 50.0,
        verifiedClass: 'Class-I Local Supplier (>= 50%)',
        caCertified: true,
        caName: 'Associated Chartered Accountant',
        caUdin: '26000000XXXX12345',
        verificationStatus: 'VERIFIED_COMPLIANT',
      },
      message: 'Local Content compliance self-declaration with CA cert on record',
    };
  },
};
