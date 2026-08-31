import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import {
  Tender,
  TenderRequirement,
  Bidder,
  Bid,
  Document,
  ExtractedField,
  Verification,
  ComplianceCheck,
  RiskAssessment,
  AIRecommendation,
  OfficerDecision,
  AuditLog,
  User,
} from './types';
import { evaluateBidCompliance } from './complianceEngine';
import { VerificationSimulators } from './verificationSimulators';
import { generateAIRecommendationWithGemini, generateDeterministicRecommendation } from './gemini';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'gev_verify.sqlite');

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
      initSchema(db);
      try {
        const res = db.exec(`SELECT count(*) as cnt FROM tenders`);
        if (!res.length || !res[0].values.length || res[0].values[0][0] === 0) {
          await seedInitialData(db);
          saveDb();
        }
      } catch (checkErr) {
        // Table might not exist in old file, seed it
        await seedInitialData(db);
        saveDb();
      }
      return db;
    } catch (e) {
      console.warn('Could not read existing SQLite DB file, creating fresh one:', e);
    }
  }

  db = new SQL.Database();
  initSchema(db);
  await seedInitialData(db);
  saveDb();
  return db;
}

export function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (e) {
    console.error('Error saving SQLite DB to disk:', e);
  }
}

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      designation TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tenders (
      id TEXT PRIMARY KEY,
      tenderId TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      estimatedValue REAL NOT NULL,
      deadline TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tender_requirements (
      id TEXT PRIMARY KEY,
      tenderId TEXT NOT NULL,
      requirementCode TEXT NOT NULL,
      requirementName TEXT NOT NULL,
      isRequired INTEGER NOT NULL,
      weight REAL NOT NULL,
      minThreshold TEXT,
      customRuleDescription TEXT NOT NULL,
      issuingAuthority TEXT NOT NULL,
      formatRequired TEXT NOT NULL,
      FOREIGN KEY(tenderId) REFERENCES tenders(id)
    );

    CREATE TABLE IF NOT EXISTS bidders (
      id TEXT PRIMARY KEY,
      legalName TEXT NOT NULL,
      tradeName TEXT,
      pan TEXT NOT NULL,
      gstin TEXT NOT NULL,
      udyamNumber TEXT,
      cinNumber TEXT,
      businessType TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      contactPerson TEXT NOT NULL,
      contactEmail TEXT NOT NULL,
      contactPhone TEXT NOT NULL,
      oemName TEXT,
      localContentPercentage REAL NOT NULL,
      startupDpiitNumber TEXT,
      nsicRegNumber TEXT,
      epfEstCode TEXT,
      esicCode TEXT
    );

    CREATE TABLE IF NOT EXISTS bids (
      id TEXT PRIMARY KEY,
      tenderId TEXT NOT NULL,
      bidderId TEXT NOT NULL,
      bidNumber TEXT UNIQUE NOT NULL,
      submissionDate TEXT NOT NULL,
      quotedAmount REAL NOT NULL,
      technicalStatus TEXT NOT NULL,
      financialStatus TEXT NOT NULL,
      status TEXT NOT NULL,
      overallScore REAL,
      riskLevel TEXT,
      verifiedAt TEXT,
      FOREIGN KEY(tenderId) REFERENCES tenders(id),
      FOREIGN KEY(bidderId) REFERENCES bidders(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      bidId TEXT NOT NULL,
      bidderId TEXT NOT NULL,
      tenderId TEXT NOT NULL,
      documentType TEXT NOT NULL,
      fileName TEXT NOT NULL,
      fileOriginalName TEXT NOT NULL,
      fileSize INTEGER NOT NULL,
      mimeType TEXT NOT NULL,
      fileUrl TEXT,
      uploadTimestamp TEXT NOT NULL,
      status TEXT NOT NULL,
      verificationStatus TEXT NOT NULL,
      sha256Hash TEXT NOT NULL,
      FOREIGN KEY(bidId) REFERENCES bids(id)
    );

    CREATE TABLE IF NOT EXISTS extracted_fields (
      id TEXT PRIMARY KEY,
      documentId TEXT NOT NULL,
      fieldName TEXT NOT NULL,
      fieldValue TEXT,
      confidence REAL NOT NULL,
      sourcePage INTEGER,
      isPresent INTEGER NOT NULL,
      rawSnippet TEXT,
      FOREIGN KEY(documentId) REFERENCES documents(id)
    );

    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY,
      bidId TEXT NOT NULL,
      requirementCode TEXT NOT NULL,
      apiEndpoint TEXT NOT NULL,
      status TEXT NOT NULL,
      verifiedDataJson TEXT NOT NULL,
      matchStatus TEXT NOT NULL,
      evidenceDetails TEXT NOT NULL,
      apiTimestamp TEXT NOT NULL,
      isSimulated INTEGER NOT NULL,
      FOREIGN KEY(bidId) REFERENCES bids(id)
    );

    CREATE TABLE IF NOT EXISTS compliance_checks (
      id TEXT PRIMARY KEY,
      bidId TEXT NOT NULL,
      requirementCode TEXT NOT NULL,
      requirementName TEXT NOT NULL,
      isRequired INTEGER NOT NULL,
      weight REAL NOT NULL,
      status TEXT NOT NULL,
      scoreAchieved REAL NOT NULL,
      evidenceSummary TEXT NOT NULL,
      issuesFoundJson TEXT NOT NULL,
      deterministicRuleEvaluated TEXT NOT NULL,
      FOREIGN KEY(bidId) REFERENCES bids(id)
    );

    CREATE TABLE IF NOT EXISTS risk_assessments (
      id TEXT PRIMARY KEY,
      bidId TEXT UNIQUE NOT NULL,
      overallScore REAL NOT NULL,
      riskLevel TEXT NOT NULL,
      compliancePercentage REAL NOT NULL,
      passedChecksCount INTEGER NOT NULL,
      failedChecksCount INTEGER NOT NULL,
      pendingChecksCount INTEGER NOT NULL,
      criticalFlagsJson TEXT NOT NULL,
      calculatedAt TEXT NOT NULL,
      FOREIGN KEY(bidId) REFERENCES bids(id)
    );

    CREATE TABLE IF NOT EXISTS ai_recommendations (
      id TEXT PRIMARY KEY,
      bidId TEXT UNIQUE NOT NULL,
      recommendation TEXT NOT NULL,
      reasoningText TEXT NOT NULL,
      criticalIssuesJson TEXT NOT NULL,
      missingRequirementsJson TEXT NOT NULL,
      recommendedActionsJson TEXT NOT NULL,
      modelUsed TEXT NOT NULL,
      disclaimerText TEXT NOT NULL,
      generatedAt TEXT NOT NULL,
      FOREIGN KEY(bidId) REFERENCES bids(id)
    );

    CREATE TABLE IF NOT EXISTS officer_decisions (
      id TEXT PRIMARY KEY,
      bidId TEXT UNIQUE NOT NULL,
      officerName TEXT NOT NULL,
      officerDesignation TEXT NOT NULL,
      decision TEXT NOT NULL,
      comments TEXT NOT NULL,
      conditionsJson TEXT,
      decidedAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(bidId) REFERENCES bids(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      bidId TEXT,
      tenderId TEXT,
      eventType TEXT NOT NULL,
      actorName TEXT NOT NULL,
      actorRole TEXT NOT NULL,
      actionSummary TEXT NOT NULL,
      payloadJson TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// ----------------- SEED DATA INITIALIZATION -----------------
async function seedInitialData(database: Database) {
  // 1. Default User / Officers
  database.run(
    `INSERT INTO users (id, name, email, role, department, designation, createdAt) VALUES 
    (?, ?, ?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?, ?, ?)`,
    [
      'usr-1', 'Rajiv K. Sharma', 'rajiv.sharma@gem.gov.in', 'PROCUREMENT_OFFICER', 'Ministry of Electronics & IT', 'Director (Procurement & Contracts)', new Date().toISOString(),
      'usr-2', 'Dr. Meenakshi Sundaram', 'm.sundaram@gem.gov.in', 'TECHNICAL_EVALUATOR', 'GeM Quality Assurance Cell', 'Senior Technical Officer', new Date().toISOString(),
    ]
  );

  // 2. Tenders
  const tender1: Tender = {
    id: 'tnd-1',
    tenderId: 'GEM/2026/B/894201',
    title: 'Procurement of High-Performance Enterprise Server Clusters & GPU Compute Nodes',
    department: 'Ministry of Electronics & Information Technology (MeitY)',
    description: 'Turnkey supply, installation, OEM on-site warranty & 5-year maintenance of 48-Core Rackmount Server nodes and NVidia A100 GPU compute infrastructure for National AI Data Centre.',
    category: 'IT Hardware & Enterprise Servers',
    estimatedValue: 45000000, // 4.5 Cr INR
    deadline: '2026-09-30T17:00:00.000Z',
    status: 'EVALUATION',
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-25T14:30:00.000Z',
  };

  const tender2: Tender = {
    id: 'tnd-2',
    tenderId: 'GEM/2026/B/771029',
    title: 'Supply and Commissioning of Advanced Multi-Slice CT Scanner & Digital Radiography Units',
    department: 'All India Institute of Medical Sciences (AIIMS) New Delhi',
    description: 'Procurement of 128-slice diagnostic computed tomography systems with complete radiological radiation safety compliance (AERB certified) and 5-year Comprehensive Maintenance Contract (CMC).',
    category: 'Medical & Diagnostic Equipment',
    estimatedValue: 85000000, // 8.5 Cr INR
    deadline: '2026-10-15T15:00:00.000Z',
    status: 'ACTIVE',
    createdAt: '2026-08-10T09:00:00.000Z',
    updatedAt: '2026-08-28T11:00:00.000Z',
  };

  const tender3: Tender = {
    id: 'tnd-3',
    tenderId: 'GEM/2026/B/660418',
    title: 'Turnkey 5MW Rooftop Grid-Interactive Solar Photovoltaic Power Plant with SCADA Monitoring',
    department: 'Solar Energy Corporation of India (SECI) / Ministry of New and Renewable Energy',
    description: 'Design, engineering, manufacturing, supply, testing and commissioning of 5MW grid connected solar power systems with Class-I Local Supplier preference under Make in India policy.',
    category: 'Renewable Energy & Solar Infrastructure',
    estimatedValue: 32000000, // 3.2 Cr INR
    deadline: '2026-10-05T18:00:00.000Z',
    status: 'ACTIVE',
    createdAt: '2026-08-15T11:30:00.000Z',
    updatedAt: '2026-08-29T16:00:00.000Z',
  };

  const tenders = [tender1, tender2, tender3];
  for (const t of tenders) {
    database.run(
      `INSERT INTO tenders (id, tenderId, title, department, description, category, estimatedValue, deadline, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.tenderId, t.title, t.department, t.description, t.category, t.estimatedValue, t.deadline, t.status, t.createdAt, t.updatedAt]
    );
  }

  // Tender 1 Requirements
  const t1Reqs: TenderRequirement[] = [
    { id: 'req-1-1', tenderId: 'tnd-1', requirementCode: 'GST', requirementName: 'Active GST Registration & Regular Return Filing', isRequired: true, weight: 15, customRuleDescription: 'GSTIN must be ACTIVE on GST Common Portal; no default in last 12 months.', issuingAuthority: 'GSTN', formatRequired: 'GST REG-06' },
    { id: 'req-1-2', tenderId: 'tnd-1', requirementCode: 'PAN', requirementName: 'Valid Permanent Account Number (PAN)', isRequired: true, weight: 10, customRuleDescription: 'Entity PAN must match legal name on certificate and bid profile.', issuingAuthority: 'Income Tax Department', formatRequired: 'PAN Card' },
    { id: 'req-1-3', tenderId: 'tnd-1', requirementCode: 'UDYAM', requirementName: 'MSME Udyam Registration (if applicable)', isRequired: false, weight: 5, customRuleDescription: 'Valid Udyam Registration with NIC code for computer servers & hardware.', issuingAuthority: 'Ministry of MSME', formatRequired: 'Udyam Certificate' },
    { id: 'req-1-4', tenderId: 'tnd-1', requirementCode: 'INCOME_TAX', requirementName: 'Audited Financials & 3-Year ITR Filings', isRequired: true, weight: 15, minThreshold: 'Average 15 Cr INR', customRuleDescription: 'Audited balance sheets & ITR acknowledgment for FY 2023-24, 2024-25, 2025-26.', issuingAuthority: 'ITD e-Filing', formatRequired: 'ITR Form 5/6 + CA Audit 3CA/CD' },
    { id: 'req-1-5', tenderId: 'tnd-1', requirementCode: 'EPFO', requirementName: 'EPFO Compliance & Monthly ECR Filing', isRequired: true, weight: 10, customRuleDescription: 'Active establishment code with timely wage month challan filings.', issuingAuthority: 'EPFO', formatRequired: 'EPF Registration + Recent ECR' },
    { id: 'req-1-6', tenderId: 'tnd-1', requirementCode: 'ESIC', requirementName: 'ESIC Registration / Statutory Exemption', isRequired: true, weight: 5, customRuleDescription: 'Valid ESIC employer code or micro-entity self-declaration under law.', issuingAuthority: 'ESIC', formatRequired: 'ESIC C-11 / Exemption Undertaking' },
    { id: 'req-1-7', tenderId: 'tnd-1', requirementCode: 'OEM_AUTHORIZATION', requirementName: 'Manufacturer Authorization Form (MAF)', isRequired: true, weight: 20, customRuleDescription: 'Direct authorization from Server/GPU OEM guaranteeing 24x7 4hr on-site support for tender ref GEM/2026/B/894201.', issuingAuthority: 'Authorized Server OEM', formatRequired: 'OEM Signed MAF Letter' },
    { id: 'req-1-8', tenderId: 'tnd-1', requirementCode: 'MAKE_IN_INDIA', requirementName: 'Make in India Class-I Local Content (>= 50%)', isRequired: true, weight: 15, minThreshold: 50, customRuleDescription: 'Class-I Local Supplier declaration with Chartered Accountant UDIN certificate verifying local value addition.', issuingAuthority: 'Chartered Accountant / DPIIT', formatRequired: 'CA Certificate with UDIN' },
    { id: 'req-1-9', tenderId: 'tnd-1', requirementCode: 'BLACKLISTING', requirementName: 'Non-Debarment & Integrity Declaration', isRequired: true, weight: 5, customRuleDescription: 'Zero hit on Central GeM/CPPP Blacklist repository. Mandatory declaration on non-judicial stamp paper.', issuingAuthority: 'Notary / GeM Central DB', formatRequired: 'Affidavit / Undertaking' },
  ];

  // Requirements for Tender 2 (Medical) and Tender 3 (Solar)
  const t2Reqs: TenderRequirement[] = [
    { id: 'req-2-1', tenderId: 'tnd-2', requirementCode: 'GST', requirementName: 'Active GST Registration', isRequired: true, weight: 15, customRuleDescription: 'Active GSTIN in State/UT of Delhi or parent jurisdiction.', issuingAuthority: 'GSTN', formatRequired: 'GST REG-06' },
    { id: 'req-2-2', tenderId: 'tnd-2', requirementCode: 'PAN', requirementName: 'PAN Card Verification', isRequired: true, weight: 10, customRuleDescription: 'Corporate PAN in operative status.', issuingAuthority: 'ITD', formatRequired: 'PAN Card' },
    { id: 'req-2-3', tenderId: 'tnd-2', requirementCode: 'OEM_AUTHORIZATION', requirementName: 'Diagnostic Medical Equipment OEM MAF', isRequired: true, weight: 25, customRuleDescription: 'OEM Authorization with guarantee of 10-year spare parts availability and AERB compliance certificate.', issuingAuthority: 'Medical Device OEM', formatRequired: 'MAF + AERB Type Approval' },
    { id: 'req-2-4', tenderId: 'tnd-2', requirementCode: 'MAKE_IN_INDIA', requirementName: 'Class-I or Class-II Local Content Declaration', isRequired: true, weight: 20, minThreshold: 20, customRuleDescription: 'Local content declaration with CA certified cost breakdown.', issuingAuthority: 'CA / DPIIT', formatRequired: 'MII Undertaking' },
    { id: 'req-2-5', tenderId: 'tnd-2', requirementCode: 'INCOME_TAX', requirementName: '3-Year Audited Balance Sheets', isRequired: true, weight: 20, customRuleDescription: 'Turnover >= 25 Cr INR for medical equipment vendor.', issuingAuthority: 'ITD', formatRequired: 'ITR-6 + Balance Sheet' },
    { id: 'req-2-6', tenderId: 'tnd-2', requirementCode: 'BLACKLISTING', requirementName: 'Non-Blacklisting Undertaking', isRequired: true, weight: 10, customRuleDescription: 'No debarment by MoHFW or State Procurement agencies.', issuingAuthority: 'Central CPPP', formatRequired: 'Affidavit' },
  ];

  const t3Reqs: TenderRequirement[] = [
    { id: 'req-3-1', tenderId: 'tnd-3', requirementCode: 'GST', requirementName: 'Active GST Registration', isRequired: true, weight: 15, customRuleDescription: 'Regular GST taxpayer status.', issuingAuthority: 'GSTN', formatRequired: 'GST REG-06' },
    { id: 'req-3-2', tenderId: 'tnd-3', requirementCode: 'PAN', requirementName: 'PAN Card', isRequired: true, weight: 10, customRuleDescription: 'Valid PAN.', issuingAuthority: 'ITD', formatRequired: 'PAN' },
    { id: 'req-3-3', tenderId: 'tnd-3', requirementCode: 'STARTUP_INDIA', requirementName: 'DPIIT Startup Recognition (if claiming EMD waiver)', isRequired: false, weight: 10, customRuleDescription: 'DPIIT Certificate for Prior Turnover & Experience Exemption on GeM.', issuingAuthority: 'DPIIT', formatRequired: 'DPIIT Cert' },
    { id: 'req-3-4', tenderId: 'tnd-3', requirementCode: 'MAKE_IN_INDIA', requirementName: 'Solar PV Make in India (>= 60%)', isRequired: true, weight: 30, minThreshold: 60, customRuleDescription: 'Solar ALMM (Approved List of Module Manufacturers) & >=60% local content.', issuingAuthority: 'MNRE / CA', formatRequired: 'ALMM Enlistment + CA UDIN' },
    { id: 'req-3-5', tenderId: 'tnd-3', requirementCode: 'BLACKLISTING', requirementName: 'Debarment Verification', isRequired: true, weight: 15, customRuleDescription: 'No blacklisting on SECI/NTPC/GeM.', issuingAuthority: 'GeM', formatRequired: 'Undertaking' },
    { id: 'req-3-6', tenderId: 'tnd-3', requirementCode: 'EPFO', requirementName: 'EPFO Compliance', isRequired: true, weight: 20, customRuleDescription: 'Active PF establishment.', issuingAuthority: 'EPFO', formatRequired: 'EPF ECR' },
  ];

  const allReqs = [...t1Reqs, ...t2Reqs, ...t3Reqs];
  for (const r of allReqs) {
    database.run(
      `INSERT INTO tender_requirements (id, tenderId, requirementCode, requirementName, isRequired, weight, minThreshold, customRuleDescription, issuingAuthority, formatRequired) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.tenderId, r.requirementCode, r.requirementName, r.isRequired ? 1 : 0, r.weight, String(r.minThreshold || ''), r.customRuleDescription, r.issuingAuthority, r.formatRequired]
    );
  }

  // 3. Bidders (8 Bidders across distinct realistic profiles)
  const bidders: Bidder[] = [
    {
      id: 'bidder-1',
      legalName: 'TECHVANGUARD SOLUTIONS PRIVATE LIMITED',
      tradeName: 'TECHVANGUARD SOLUTIONS',
      pan: 'AAACT2727Q',
      gstin: '07AAACT2727Q1ZB',
      udyamNumber: 'UDYAM-DL-01-0045892',
      cinNumber: 'U72900DL2018PTC331940',
      businessType: 'Private Limited',
      address: 'Plot 42, Okhla Industrial Area Phase III',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110020',
      contactPerson: 'Vikramaditya Sharma',
      contactEmail: 'tenders@techvanguard.in',
      contactPhone: '+91 98110 48192',
      oemName: 'Dell Technologies India Pvt Ltd',
      localContentPercentage: 62.5,
      nsicRegNumber: 'NSIC/DEL/SPR/2021/00491',
      epfEstCode: 'DSNHP0048192000',
      esicCode: '11000847190001001',
    },
    {
      id: 'bidder-2',
      legalName: 'APEX INFOTECH PRIVATE LIMITED',
      tradeName: 'APEX DIGITAL SYSTEMS',
      pan: 'AABCA1234F',
      gstin: '27AABCA1234F1Z5',
      udyamNumber: 'UDYAM-MH-03-0098412',
      cinNumber: 'U74140MH2019PTC329810',
      businessType: 'Private Limited',
      address: 'Unit 501, Technopolis Knowledge Park, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400093',
      contactPerson: 'Rohit Kulkarni',
      contactEmail: 'procurement@apexinfotech.co.in',
      contactPhone: '+91 98200 77412',
      oemName: 'HP India Sales Private Limited',
      localContentPercentage: 54.0,
      epfEstCode: 'MHBAN0019284000',
      esicCode: '31000918270001002',
    },
    {
      id: 'bidder-3',
      legalName: 'BHARAT ELECTRO SUPPLIES LLP',
      tradeName: 'BHARAT ELECTRO',
      pan: 'AABCB5678H',
      gstin: '06AABCB5678H1Z2',
      udyamNumber: 'UDYAM-HR-04-0012903',
      businessType: 'LLP',
      address: 'Sector 18, Electronic City',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122015',
      contactPerson: 'Harish Chandra Verma',
      contactEmail: 'govt.sales@bharatelectro.com',
      contactPhone: '+91 99100 33819',
      oemName: 'Indigenous Assembled Brand',
      localContentPercentage: 65.0, // Bidder claimed 65%, but portal audit showed 38%
      nsicRegNumber: 'NSIC/GUR/SPR/2022/00184',
      epfEstCode: 'HRGUR0077412000',
      esicCode: '13000648190001003',
    },
    {
      id: 'bidder-4',
      legalName: 'GLOBAL QUANTUM TECHNOLOGIES PVT LTD',
      tradeName: 'QUANTUM TECH',
      pan: 'AAACG9999K',
      gstin: '29AAACG9999K1Z1',
      businessType: 'Private Limited',
      address: '104, Outer Ring Road, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      contactPerson: 'Karan Mehra',
      contactEmail: 'bids@globalquantum.org',
      contactPhone: '+91 98860 19284',
      oemName: 'SuperServer Global Ltd',
      localContentPercentage: 22.0,
    },
    {
      id: 'bidder-5',
      legalName: 'ZENITH HEALTH DIAGNOSTICS PRIVATE LIMITED',
      tradeName: 'ZENITH MEDTECH',
      pan: 'AAACZ8888L',
      gstin: '33AAACZ8888L1Z9',
      udyamNumber: 'UDYAM-TN-02-0077431',
      cinNumber: 'U33110TN2021PTC142819',
      businessType: 'Private Limited',
      address: '88, Mount Road, Guindy',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600032',
      contactPerson: 'Dr. S. Ranganathan',
      contactEmail: 'director@zenithmedtech.in',
      contactPhone: '+91 94440 88291',
      oemName: 'Siemens Healthcare Private Limited',
      localContentPercentage: 45.0,
      epfEstCode: 'TNMAD0055192000',
    },
    {
      id: 'bidder-6',
      legalName: 'ORION DIGITAL INFRASTRUCTURE LTD',
      tradeName: 'ORION INFRA',
      pan: 'AAACO4444N',
      gstin: '08AAACO4444N1ZP',
      businessType: 'Public Limited',
      address: 'B-12, Sitapura Industrial Area',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302022',
      contactPerson: 'Mukesh Khandelwal',
      contactEmail: 'contact@orioninfra.in',
      contactPhone: '+91 94140 19284',
      localContentPercentage: 35.0,
    },
    {
      id: 'bidder-7',
      legalName: 'SURYA SOLAR & POWER SOLUTIONS PRIVATE LIMITED',
      tradeName: 'SURYA GREEN ENERGY',
      pan: 'AAACS7777M',
      gstin: '24AAACS7777M1ZV',
      udyamNumber: 'UDYAM-GJ-01-0066512',
      cinNumber: 'U40106GJ2022PTC129841',
      businessType: 'Private Limited',
      address: 'GIDC Phase II, Vatva',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '382445',
      contactPerson: 'Chirag Patel',
      contactEmail: 'chirag@suryasolar.co.in',
      contactPhone: '+91 98250 33418',
      startupDpiitNumber: 'DIPP98412',
      localContentPercentage: 78.0,
      epfEstCode: 'GJAHM0033190000',
      esicCode: '38000419280001004',
    },
    {
      id: 'bidder-8',
      legalName: 'DELTA MEDICAL DEVICES INDIA PRIVATE LIMITED',
      tradeName: 'DELTA MED',
      pan: 'AAACD3333E',
      gstin: '19AAACD3333E1ZQ',
      businessType: 'Private Limited',
      address: 'Salt Lake Sector V',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700091',
      contactPerson: 'Aniruddha Bose',
      contactEmail: 'sales@deltameddevices.com',
      contactPhone: '+91 98300 48192',
      oemName: 'Delta MedTech Global',
      localContentPercentage: 25.0,
    },
  ];

  for (const b of bidders) {
    database.run(
      `INSERT INTO bidders (id, legalName, tradeName, pan, gstin, udyamNumber, cinNumber, businessType, address, city, state, pincode, contactPerson, contactEmail, contactPhone, oemName, localContentPercentage, startupDpiitNumber, nsicRegNumber, epfEstCode, esicCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.id, b.legalName, b.tradeName || null, b.pan, b.gstin, b.udyamNumber || null, b.cinNumber || null, b.businessType, b.address, b.city, b.state, b.pincode, b.contactPerson, b.contactEmail, b.contactPhone, b.oemName || null, b.localContentPercentage, b.startupDpiitNumber || null, b.nsicRegNumber || null, b.epfEstCode || null, b.esicCode || null]
    );
  }

  // 4. Bids (Associated with Tenders)
  const bids: Bid[] = [
    // Bids on Tender 1 (IT Hardware)
    {
      id: 'bid-1',
      tenderId: 'tnd-1',
      bidderId: 'bidder-1', // TechVanguard (Low Risk, Fully Compliant)
      bidNumber: 'GEM/BID/2026/894201/01',
      submissionDate: '2026-08-20T11:15:00.000Z',
      quotedAmount: 43800000,
      technicalStatus: 'PENDING_VERIFICATION',
      financialStatus: 'NOT_OPENED',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'bid-2',
      tenderId: 'tnd-1',
      bidderId: 'bidder-2', // Apex Infotech (Medium Risk - OEM expired)
      bidNumber: 'GEM/BID/2026/894201/02',
      submissionDate: '2026-08-21T14:40:00.000Z',
      quotedAmount: 42500000,
      technicalStatus: 'PENDING_VERIFICATION',
      financialStatus: 'NOT_OPENED',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'bid-3',
      tenderId: 'tnd-1',
      bidderId: 'bidder-3', // Bharat Electro (High Risk - Local content mismatch)
      bidNumber: 'GEM/BID/2026/894201/03',
      submissionDate: '2026-08-22T09:30:00.000Z',
      quotedAmount: 41200000,
      technicalStatus: 'PENDING_VERIFICATION',
      financialStatus: 'NOT_OPENED',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'bid-4',
      tenderId: 'tnd-1',
      bidderId: 'bidder-4', // Global Quantum (Critical Risk - Blacklist match!)
      bidNumber: 'GEM/BID/2026/894201/04',
      submissionDate: '2026-08-23T16:20:00.000Z',
      quotedAmount: 39500000,
      technicalStatus: 'PENDING_VERIFICATION',
      financialStatus: 'NOT_OPENED',
      status: 'UNDER_REVIEW',
    },
    // Bids on Tender 2 (Medical Equipment)
    {
      id: 'bid-5',
      tenderId: 'tnd-2',
      bidderId: 'bidder-5', // Zenith Health (Medium Risk - ESIC micro exemption review)
      bidNumber: 'GEM/BID/2026/771029/01',
      submissionDate: '2026-08-24T10:05:00.000Z',
      quotedAmount: 82000000,
      technicalStatus: 'PENDING_VERIFICATION',
      financialStatus: 'NOT_OPENED',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'bid-6',
      tenderId: 'tnd-2',
      bidderId: 'bidder-8', // Delta Med (High Risk - Low local content & partial ITR)
      bidNumber: 'GEM/BID/2026/771029/02',
      submissionDate: '2026-08-25T15:10:00.000Z',
      quotedAmount: 79500000,
      technicalStatus: 'PENDING_VERIFICATION',
      financialStatus: 'NOT_OPENED',
      status: 'UNDER_REVIEW',
    },
    // Bids on Tender 3 (Solar)
    {
      id: 'bid-7',
      tenderId: 'tnd-3',
      bidderId: 'bidder-7', // Surya Solar (Low Risk - DPIIT recognized startup)
      bidNumber: 'GEM/BID/2026/660418/01',
      submissionDate: '2026-08-26T12:00:00.000Z',
      quotedAmount: 30500000,
      technicalStatus: 'PENDING_VERIFICATION',
      financialStatus: 'NOT_OPENED',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'bid-8',
      tenderId: 'tnd-3',
      bidderId: 'bidder-6', // Orion Digital (Critical Risk - Cancelled GST)
      bidNumber: 'GEM/BID/2026/660418/02',
      submissionDate: '2026-08-27T17:45:00.000Z',
      quotedAmount: 28900000,
      technicalStatus: 'PENDING_VERIFICATION',
      financialStatus: 'NOT_OPENED',
      status: 'UNDER_REVIEW',
    },
  ];

  for (const b of bids) {
    database.run(
      `INSERT INTO bids (id, tenderId, bidderId, bidNumber, submissionDate, quotedAmount, technicalStatus, financialStatus, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.id, b.tenderId, b.bidderId, b.bidNumber, b.submissionDate, b.quotedAmount, b.technicalStatus, b.financialStatus, b.status]
    );
  }

  // 5. Documents (30+ Documents across bids)
  const sampleDocs: Array<Partial<Document>> = [
    // Bid 1 docs (TechVanguard)
    { id: 'doc-1-1', bidId: 'bid-1', bidderId: 'bidder-1', tenderId: 'tnd-1', documentType: 'GST', fileName: 'techvanguard_gst_reg06.pdf', fileOriginalName: 'GST_Registration_Certificate_REG06.pdf', fileSize: 482104, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
    { id: 'doc-1-2', bidId: 'bid-1', bidderId: 'bidder-1', tenderId: 'tnd-1', documentType: 'PAN', fileName: 'techvanguard_pan.pdf', fileOriginalName: 'Corporate_PAN_Card.pdf', fileSize: 310492, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8' },
    { id: 'doc-1-3', bidId: 'bid-1', bidderId: 'bidder-1', tenderId: 'tnd-1', documentType: 'UDYAM', fileName: 'techvanguard_udyam.pdf', fileOriginalName: 'Udyam_Registration_Certificate.pdf', fileSize: 524102, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: 'f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3' },
    { id: 'doc-1-4', bidId: 'bid-1', bidderId: 'bidder-1', tenderId: 'tnd-1', documentType: 'INCOME_TAX', fileName: 'techvanguard_3yr_itr.pdf', fileOriginalName: 'Audited_Financials_ITR_3FYs.pdf', fileSize: 1842091, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' },
    { id: 'doc-1-5', bidId: 'bid-1', bidderId: 'bidder-1', tenderId: 'tnd-1', documentType: 'EPFO', fileName: 'techvanguard_epfo.pdf', fileOriginalName: 'EPFO_Registration_ECR_Receipt.pdf', fileSize: 412091, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' },
    { id: 'doc-1-6', bidId: 'bid-1', bidderId: 'bidder-1', tenderId: 'tnd-1', documentType: 'ESIC', fileName: 'techvanguard_esic.pdf', fileOriginalName: 'ESIC_Code_C11_Contribution.pdf', fileSize: 390184, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba' },
    { id: 'doc-1-7', bidId: 'bid-1', bidderId: 'bidder-1', tenderId: 'tnd-1', documentType: 'OEM_AUTHORIZATION', fileName: 'dell_maf_techvanguard.pdf', fileOriginalName: 'Dell_OEM_Manufacturer_Authorization_Form.pdf', fileSize: 620194, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210' },
    { id: 'doc-1-8', bidId: 'bid-1', bidderId: 'bidder-1', tenderId: 'tnd-1', documentType: 'MAKE_IN_INDIA', fileName: 'techvanguard_mii_ca.pdf', fileOriginalName: 'Make_In_India_CA_UDIN_Certificate.pdf', fileSize: 489201, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123' },
    { id: 'doc-1-9', bidId: 'bid-1', bidderId: 'bidder-1', tenderId: 'tnd-1', documentType: 'BLACKLISTING', fileName: 'techvanguard_affidavit.pdf', fileOriginalName: 'Non_Debarment_Notarized_Affidavit.pdf', fileSize: 312948, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456' },

    // Bid 2 docs (Apex Infotech)
    { id: 'doc-2-1', bidId: 'bid-2', bidderId: 'bidder-2', tenderId: 'tnd-1', documentType: 'GST', fileName: 'apex_gst_cert.pdf', fileOriginalName: 'GSTIN_Registration_Certificate.pdf', fileSize: 420192, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608210001apex' },
    { id: 'doc-2-2', bidId: 'bid-2', bidderId: 'bidder-2', tenderId: 'tnd-1', documentType: 'PAN', fileName: 'apex_pan.pdf', fileOriginalName: 'PAN_Card_Apex.pdf', fileSize: 280194, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608210002apex' },
    { id: 'doc-2-3', bidId: 'bid-2', bidderId: 'bidder-2', tenderId: 'tnd-1', documentType: 'OEM_AUTHORIZATION', fileName: 'hp_maf_apex_expired.pdf', fileOriginalName: 'HP_Authorization_Letter_2025.pdf', fileSize: 512048, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'SUSPICIOUS', sha256Hash: '202608210003apex' },
    { id: 'doc-2-4', bidId: 'bid-2', bidderId: 'bidder-2', tenderId: 'tnd-1', documentType: 'MAKE_IN_INDIA', fileName: 'apex_mii_declaration.pdf', fileOriginalName: 'Local_Content_Self_Declaration.pdf', fileSize: 398102, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608210004apex' },
    { id: 'doc-2-5', bidId: 'bid-2', bidderId: 'bidder-2', tenderId: 'tnd-1', documentType: 'INCOME_TAX', fileName: 'apex_itr_returns.pdf', fileOriginalName: 'ITR_Returns_3Years.pdf', fileSize: 1204910, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608210005apex' },

    // Bid 3 docs (Bharat Electro)
    { id: 'doc-3-1', bidId: 'bid-3', bidderId: 'bidder-3', tenderId: 'tnd-1', documentType: 'GST', fileName: 'bharat_gst.pdf', fileOriginalName: 'Bharat_Electro_GST.pdf', fileSize: 410294, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608220001bharat' },
    { id: 'doc-3-2', bidId: 'bid-3', bidderId: 'bidder-3', tenderId: 'tnd-1', documentType: 'PAN', fileName: 'bharat_pan.pdf', fileOriginalName: 'Bharat_LLP_PAN.pdf', fileSize: 290184, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608220002bharat' },
    { id: 'doc-3-3', bidId: 'bid-3', bidderId: 'bidder-3', tenderId: 'tnd-1', documentType: 'MAKE_IN_INDIA', fileName: 'bharat_local_content_disputed.pdf', fileOriginalName: 'Make_In_India_65Percent_Claim.pdf', fileSize: 490182, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'INVALID', sha256Hash: '202608220003bharat' },

    // Bid 4 docs (Global Quantum - Blacklisted)
    { id: 'doc-4-1', bidId: 'bid-4', bidderId: 'bidder-4', tenderId: 'tnd-1', documentType: 'GST', fileName: 'quantum_gst_suspended.pdf', fileOriginalName: 'GST_Certificate_Quantum.pdf', fileSize: 380194, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'INVALID', sha256Hash: '202608230001quant' },
    { id: 'doc-4-2', bidId: 'bid-4', bidderId: 'bidder-4', tenderId: 'tnd-1', documentType: 'BLACKLISTING', fileName: 'quantum_false_undertaking.pdf', fileOriginalName: 'Non_Debarment_Undertaking.pdf', fileSize: 250194, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'INVALID', sha256Hash: '202608230002quant' },

    // Bid 5 docs (Zenith Health - Medical)
    { id: 'doc-5-1', bidId: 'bid-5', bidderId: 'bidder-5', tenderId: 'tnd-2', documentType: 'GST', fileName: 'zenith_gst.pdf', fileOriginalName: 'Zenith_Medtech_GST.pdf', fileSize: 420918, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608240001zenith' },
    { id: 'doc-5-2', bidId: 'bid-5', bidderId: 'bidder-5', tenderId: 'tnd-2', documentType: 'PAN', fileName: 'zenith_pan.pdf', fileOriginalName: 'Zenith_PAN_Card.pdf', fileSize: 270194, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608240002zenith' },
    { id: 'doc-5-3', bidId: 'bid-5', bidderId: 'bidder-5', tenderId: 'tnd-2', documentType: 'OEM_AUTHORIZATION', fileName: 'siemens_maf_zenith.pdf', fileOriginalName: 'Siemens_Healthcare_MAF.pdf', fileSize: 710294, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608240003zenith' },
    { id: 'doc-5-4', bidId: 'bid-5', bidderId: 'bidder-5', tenderId: 'tnd-2', documentType: 'UDYAM', fileName: 'zenith_udyam_micro.pdf', fileOriginalName: 'Udyam_Micro_Enterprise_Cert.pdf', fileSize: 390184, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608240004zenith' },

    // Bid 7 docs (Surya Solar - Startup)
    { id: 'doc-7-1', bidId: 'bid-7', bidderId: 'bidder-7', tenderId: 'tnd-3', documentType: 'GST', fileName: 'surya_gst.pdf', fileOriginalName: 'Surya_Solar_GST_Active.pdf', fileSize: 440192, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608260001surya' },
    { id: 'doc-7-2', bidId: 'bid-7', bidderId: 'bidder-7', tenderId: 'tnd-3', documentType: 'PAN', fileName: 'surya_pan.pdf', fileOriginalName: 'Surya_PAN_Card.pdf', fileSize: 280194, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608260002surya' },
    { id: 'doc-7-3', bidId: 'bid-7', bidderId: 'bidder-7', tenderId: 'tnd-3', documentType: 'STARTUP_INDIA', fileName: 'surya_dpiit_recognition.pdf', fileOriginalName: 'Startup_India_DPIIT_Certificate.pdf', fileSize: 580192, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608260003surya' },
    { id: 'doc-7-4', bidId: 'bid-7', bidderId: 'bidder-7', tenderId: 'tnd-3', documentType: 'MAKE_IN_INDIA', fileName: 'surya_78pct_mii.pdf', fileOriginalName: 'Solar_Local_Content_78pct_CA.pdf', fileSize: 490184, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'VALID', sha256Hash: '202608260004surya' },

    // Bid 8 docs (Orion Digital - Cancelled GST)
    { id: 'doc-8-1', bidId: 'bid-8', bidderId: 'bidder-6', tenderId: 'tnd-3', documentType: 'GST', fileName: 'orion_old_gst.pdf', fileOriginalName: 'Old_GST_Certificate.pdf', fileSize: 320194, mimeType: 'application/pdf', status: 'ANALYZED', verificationStatus: 'INVALID', sha256Hash: '202608270001orion' },
  ];

  for (const d of sampleDocs) {
    database.run(
      `INSERT INTO documents (id, bidId, bidderId, tenderId, documentType, fileName, fileOriginalName, fileSize, mimeType, fileUrl, uploadTimestamp, status, verificationStatus, sha256Hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.id, d.bidId, d.bidderId, d.tenderId, d.documentType, d.fileName, d.fileOriginalName, d.fileSize, d.mimeType, `/uploads/${d.fileName}`, new Date().toISOString(), d.status, d.verificationStatus, d.sha256Hash]
    );
  }

  // 6. Pre-run verification, compliance, risk assessment & recommendations for all 8 bids
  for (const bid of bids) {
    const bidder = bidders.find((b) => b.id === bid.bidderId)!;
    const tender = tenders.find((t) => t.id === bid.tenderId)!;
    const reqs = allReqs.filter((r) => r.tenderId === bid.tenderId);
    const docs = sampleDocs.filter((d) => d.bidId === bid.id) as Document[];

    // Execute simulated verifications for all requirements
    const verifs: Verification[] = [];
    for (const r of reqs) {
      let govtRes;
      switch (r.requirementCode) {
        case 'GST': govtRes = VerificationSimulators.verifyGst(bidder.gstin); break;
        case 'PAN': govtRes = VerificationSimulators.verifyPan(bidder.pan); break;
        case 'UDYAM': govtRes = VerificationSimulators.verifyUdyam(bidder.udyamNumber || ''); break;
        case 'INCOME_TAX': govtRes = VerificationSimulators.verifyIncomeTax(bidder.pan); break;
        case 'EPFO': govtRes = VerificationSimulators.verifyEpfo(bidder.epfEstCode, bidder.pan); break;
        case 'ESIC': govtRes = VerificationSimulators.verifyEsic(bidder.esicCode, bidder.pan); break;
        case 'STARTUP_INDIA': govtRes = VerificationSimulators.verifyStartup(bidder.startupDpiitNumber || ''); break;
        case 'NSIC': govtRes = VerificationSimulators.verifyNsic(bidder.nsicRegNumber || ''); break;
        case 'OEM_AUTHORIZATION': govtRes = VerificationSimulators.verifyOem(bidder.oemName); break;
        case 'MAKE_IN_INDIA': govtRes = VerificationSimulators.verifyMii(bidder.legalName); break;
        case 'BLACKLISTING': govtRes = VerificationSimulators.verifyBlacklist(bidder.pan, bidder.gstin, bidder.legalName); break;
        default: govtRes = { status: 'SUCCESS', disclaimer: 'SIMULATED', isSimulated: true, data: { status: 'VALID' }, sourcePortal: 'GeM', queryParameters: {}, timestamp: new Date().toISOString(), message: 'Verified' };
      }

      let matchStatus = 'MATCH';
      if (govtRes.status === 'NOT_FOUND') matchStatus = 'MISSING';
      else if (govtRes.data?.status === 'CANCELLED' || govtRes.data?.status === 'EXPIRED') matchStatus = 'INVALID';
      else if (govtRes.data?.isBlacklisted) matchStatus = 'MISMATCH';

      const v: Verification = {
        id: `ver-${bid.id}-${r.requirementCode}`,
        bidId: bid.id,
        requirementCode: r.requirementCode,
        apiEndpoint: `/api/verify/${r.requirementCode.toLowerCase().replace('_', '-')}`,
        status: govtRes.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
        verifiedDataJson: govtRes.data || {},
        matchStatus: matchStatus as any,
        evidenceDetails: govtRes.message,
        apiTimestamp: govtRes.timestamp,
        isSimulated: true,
      };
      verifs.push(v);

      database.run(
        `INSERT INTO verifications (id, bidId, requirementCode, apiEndpoint, status, verifiedDataJson, matchStatus, evidenceDetails, apiTimestamp, isSimulated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.id, v.bidId, v.requirementCode, v.apiEndpoint, v.status, JSON.stringify(v.verifiedDataJson), v.matchStatus, v.evidenceDetails, v.apiTimestamp, 1]
      );
    }

    // Run deterministic compliance engine
    const evalInput = {
      bid: { ...bid, bidder, tender },
      requirements: reqs,
      documents: docs,
      verifications: verifs,
    };
    const { checks, assessment } = evaluateBidCompliance(evalInput);

    for (const c of checks) {
      database.run(
        `INSERT INTO compliance_checks (id, bidId, requirementCode, requirementName, isRequired, weight, status, scoreAchieved, evidenceSummary, issuesFoundJson, deterministicRuleEvaluated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.bidId, c.requirementCode, c.requirementName, c.isRequired ? 1 : 0, c.weight, c.status, c.scoreAchieved, c.evidenceSummary, JSON.stringify(c.issuesFound), c.deterministicRuleEvaluated]
      );
    }

    database.run(
      `INSERT INTO risk_assessments (id, bidId, overallScore, riskLevel, compliancePercentage, passedChecksCount, failedChecksCount, pendingChecksCount, criticalFlagsJson, calculatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [assessment.id, assessment.bidId, assessment.overallScore, assessment.riskLevel, assessment.compliancePercentage, assessment.passedChecksCount, assessment.failedChecksCount, assessment.pendingChecksCount, JSON.stringify(assessment.criticalFlags), assessment.calculatedAt]
    );

    // Update bid overall score and risk
    database.run(
      `UPDATE bids SET overallScore = ?, riskLevel = ?, verifiedAt = ? WHERE id = ?`,
      [assessment.overallScore, assessment.riskLevel, new Date().toISOString(), bid.id]
    );

    // AI Recommendation (Fast deterministic advisory during initial seed)
    const rec = generateDeterministicRecommendation(
      { ...bid, bidder, tender },
      checks,
      assessment
    );

    database.run(
      `INSERT INTO ai_recommendations (id, bidId, recommendation, reasoningText, criticalIssuesJson, missingRequirementsJson, recommendedActionsJson, modelUsed, disclaimerText, generatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [rec.id, rec.bidId, rec.recommendation, rec.reasoningText, JSON.stringify(rec.criticalIssues), JSON.stringify(rec.missingRequirements), JSON.stringify(rec.recommendedActions), rec.modelUsed, rec.disclaimerText, rec.generatedAt || new Date().toISOString()]
    );

    // Audit logs
    const seedTime = new Date().toISOString();
    database.run(
      `INSERT INTO audit_logs (id, bidId, tenderId, eventType, actorName, actorRole, actionSummary, payloadJson, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`aud-${bid.id}-1`, bid.id, bid.tenderId, 'BID_SUBMITTED', 'GeM Portal Ingest', 'SYSTEM', `Bid ${bid.bidNumber} ingested with quoted value ₹ ${(bid.quotedAmount / 100000).toFixed(2)} Lakhs.`, JSON.stringify({ bidNumber: bid.bidNumber, amount: bid.quotedAmount }), bid.submissionDate || seedTime]
    );
    database.run(
      `INSERT INTO audit_logs (id, bidId, tenderId, eventType, actorName, actorRole, actionSummary, payloadJson, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`aud-${bid.id}-2`, bid.id, bid.tenderId, 'COMPLIANCE_EVALUATED', 'Compliance Engine', 'SYSTEM', `Deterministic compliance calculated: Score ${assessment.overallScore}/100 (${assessment.riskLevel} Risk).`, JSON.stringify({ score: assessment.overallScore, risk: assessment.riskLevel }), seedTime]
    );
    database.run(
      `INSERT INTO audit_logs (id, bidId, tenderId, eventType, actorName, actorRole, actionSummary, payloadJson, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`aud-${bid.id}-3`, bid.id, bid.tenderId, 'AI_RECOMMENDATION_GENERATED', 'Gemini Decision Support', 'AI_AGENT', `AI advisory recommendation generated: ${rec.recommendation}.`, JSON.stringify({ recommendation: rec.recommendation }), seedTime]
    );
  }

  // Pre-seed an Officer Decision on Bid 1 (TechVanguard approved)
  database.run(
    `INSERT INTO officer_decisions (id, bidId, officerName, officerDesignation, decision, comments, conditionsJson, decidedAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'dec-bid-1',
      'bid-1',
      'Rajiv K. Sharma',
      'Director (Procurement & Contracts), MeitY',
      'APPROVE',
      'Bidder has satisfactorily met all mandatory eligibility parameters under GeM GTC. GST, OEM MAF from Dell Technologies, and Make-in-India 62.5% local content verified. Technically qualified for commercial opening.',
      JSON.stringify(['Furnish Performance Security (e-PBG) of 3% contract value within 15 days of GeM Contract generation', 'OEM SLA warranty certificate to be countersigned at installation']),
      new Date().toISOString(),
      new Date().toISOString(),
    ]
  );
  database.run(`UPDATE bids SET technicalStatus = 'QUALIFIED', status = 'DECIDED' WHERE id = 'bid-1'`);
}

// ----------------- REPOSITORY METHODS -----------------

export async function getTendersList(): Promise<Tender[]> {
  const database = await getDb();
  const res = database.exec(`SELECT * FROM tenders ORDER BY createdAt DESC`);
  if (!res.length || !res[0].values.length) return [];
  const cols = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    cols.forEach((c, idx) => (obj[c] = row[idx]));
    return obj as Tender;
  });
}

export async function getTenderById(tenderId: string): Promise<Tender | null> {
  const database = await getDb();
  const res = database.exec(`SELECT * FROM tenders WHERE id = '${tenderId}' OR tenderId = '${tenderId}'`);
  if (!res.length || !res[0].values.length) return null;
  const cols = res[0].columns;
  const tender: any = {};
  cols.forEach((c, idx) => (tender[c] = res[0].values[0][idx]));

  // fetch requirements
  const reqRes = database.exec(`SELECT * FROM tender_requirements WHERE tenderId = '${tender.id}'`);
  if (reqRes.length && reqRes[0].values.length) {
    const reqCols = reqRes[0].columns;
    tender.requirements = reqRes[0].values.map((row) => {
      const rObj: any = {};
      reqCols.forEach((c, idx) => (rObj[c] = row[idx]));
      rObj.isRequired = Boolean(rObj.isRequired);
      return rObj as TenderRequirement;
    });
  } else {
    tender.requirements = [];
  }

  return tender;
}

export async function createTender(tender: Omit<Tender, 'id' | 'createdAt' | 'updatedAt'>, reqs: Array<Omit<TenderRequirement, 'id' | 'tenderId'>>): Promise<Tender> {
  const database = await getDb();
  const id = `tnd-${Date.now()}`;
  const now = new Date().toISOString();

  database.run(
    `INSERT INTO tenders (id, tenderId, title, department, description, category, estimatedValue, deadline, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, tender.tenderId, tender.title, tender.department, tender.description, tender.category, tender.estimatedValue, tender.deadline, tender.status || 'ACTIVE', now, now]
  );

  for (const r of reqs) {
    const reqId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    database.run(
      `INSERT INTO tender_requirements (id, tenderId, requirementCode, requirementName, isRequired, weight, minThreshold, customRuleDescription, issuingAuthority, formatRequired) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reqId, id, r.requirementCode, r.requirementName, r.isRequired ? 1 : 0, r.weight, String(r.minThreshold || ''), r.customRuleDescription, r.issuingAuthority, r.formatRequired]
    );
  }

  saveDb();
  return (await getTenderById(id))!;
}

export async function getBidsList(tenderId?: string): Promise<Bid[]> {
  const database = await getDb();
  let query = `
    SELECT 
      b.*,
      bdr.legalName as bidder_legalName,
      bdr.tradeName as bidder_tradeName,
      bdr.pan as bidder_pan,
      bdr.gstin as bidder_gstin,
      bdr.businessType as bidder_businessType,
      bdr.city as bidder_city,
      bdr.state as bidder_state,
      bdr.localContentPercentage as bidder_localContentPercentage,
      tnd.title as tender_title,
      tnd.tenderId as tender_tenderId,
      tnd.department as tender_department,
      rec.recommendation as ai_rec_recommendation,
      dec.decision as officer_decision
    FROM bids b
    JOIN bidders bdr ON b.bidderId = bdr.id
    JOIN tenders tnd ON b.tenderId = tnd.id
    LEFT JOIN ai_recommendations rec ON b.id = rec.bidId
    LEFT JOIN officer_decisions dec ON b.id = dec.bidId
  `;
  if (tenderId) {
    query += ` WHERE b.tenderId = '${tenderId}'`;
  }
  query += ` ORDER BY b.submissionDate DESC`;

  const res = database.exec(query);
  if (!res.length || !res[0].values.length) return [];
  const cols = res[0].columns;

  return res[0].values.map((row) => {
    const rowObj: any = {};
    cols.forEach((c, idx) => (rowObj[c] = row[idx]));
    return {
      id: rowObj.id,
      tenderId: rowObj.tenderId,
      bidderId: rowObj.bidderId,
      bidNumber: rowObj.bidNumber,
      submissionDate: rowObj.submissionDate,
      quotedAmount: rowObj.quotedAmount,
      technicalStatus: rowObj.technicalStatus,
      financialStatus: rowObj.financialStatus,
      status: rowObj.status,
      overallScore: rowObj.overallScore,
      riskLevel: rowObj.riskLevel,
      verifiedAt: rowObj.verifiedAt,
      bidder: {
        id: rowObj.bidderId,
        legalName: rowObj.bidder_legalName,
        tradeName: rowObj.bidder_tradeName,
        pan: rowObj.bidder_pan,
        gstin: rowObj.bidder_gstin,
        businessType: rowObj.bidder_businessType,
        city: rowObj.bidder_city,
        state: rowObj.bidder_state,
        localContentPercentage: rowObj.bidder_localContentPercentage,
      } as any,
      tender: {
        id: rowObj.tenderId,
        title: rowObj.tender_title,
        tenderId: rowObj.tender_tenderId,
        department: rowObj.tender_department,
      } as any,
      aiRecommendation: rowObj.ai_rec_recommendation ? ({ recommendation: rowObj.ai_rec_recommendation } as any) : undefined,
      officerDecision: rowObj.officer_decision ? ({ decision: rowObj.officer_decision } as any) : undefined,
    };
  });
}

export async function getBidFullDetails(bidId: string): Promise<Bid | null> {
  const database = await getDb();
  const bidRes = database.exec(`SELECT * FROM bids WHERE id = '${bidId}' OR bidNumber = '${bidId}'`);
  if (!bidRes.length || !bidRes[0].values.length) return null;

  const bidCols = bidRes[0].columns;
  const bidObj: any = {};
  bidCols.forEach((c, idx) => (bidObj[c] = bidRes[0].values[0][idx]));

  // Bidder
  const bidderRes = database.exec(`SELECT * FROM bidders WHERE id = '${bidObj.bidderId}'`);
  if (bidderRes.length && bidderRes[0].values.length) {
    const bCols = bidderRes[0].columns;
    const bdr: any = {};
    bCols.forEach((c, idx) => (bdr[c] = bidderRes[0].values[0][idx]));
    bidObj.bidder = bdr as Bidder;
  }

  // Tender with requirements
  bidObj.tender = await getTenderById(bidObj.tenderId);

  // Documents
  const docRes = database.exec(`SELECT * FROM documents WHERE bidId = '${bidObj.id}'`);
  if (docRes.length && docRes[0].values.length) {
    const dCols = docRes[0].columns;
    bidObj.documents = docRes[0].values.map((r) => {
      const d: any = {};
      dCols.forEach((c, idx) => (d[c] = r[idx]));

      // Extracted fields
      const fRes = database.exec(`SELECT * FROM extracted_fields WHERE documentId = '${d.id}'`);
      if (fRes.length && fRes[0].values.length) {
        const fCols = fRes[0].columns;
        d.extractedFields = fRes[0].values.map((fr) => {
          const fObj: any = {};
          fCols.forEach((fc, idx) => (fObj[fc] = fr[idx]));
          fObj.isPresent = Boolean(fObj.isPresent);
          return fObj as ExtractedField;
        });
      } else {
        d.extractedFields = [];
      }
      return d as Document;
    });
  } else {
    bidObj.documents = [];
  }

  // Verifications
  const verRes = database.exec(`SELECT * FROM verifications WHERE bidId = '${bidObj.id}'`);
  if (verRes.length && verRes[0].values.length) {
    const vCols = verRes[0].columns;
    bidObj.verifications = verRes[0].values.map((r) => {
      const v: any = {};
      vCols.forEach((c, idx) => (v[c] = r[idx]));
      try {
        v.verifiedDataJson = JSON.parse(v.verifiedDataJson);
      } catch (e) {
        v.verifiedDataJson = {};
      }
      v.isSimulated = Boolean(v.isSimulated);
      return v as Verification;
    });
  } else {
    bidObj.verifications = [];
  }

  // Compliance checks
  const chkRes = database.exec(`SELECT * FROM compliance_checks WHERE bidId = '${bidObj.id}'`);
  if (chkRes.length && chkRes[0].values.length) {
    const cCols = chkRes[0].columns;
    bidObj.complianceChecks = chkRes[0].values.map((r) => {
      const c: any = {};
      cCols.forEach((col, idx) => (c[col] = r[idx]));
      try {
        c.issuesFound = JSON.parse(c.issuesFoundJson);
      } catch (e) {
        c.issuesFound = [];
      }
      c.isRequired = Boolean(c.isRequired);
      return c as ComplianceCheck;
    });
  } else {
    bidObj.complianceChecks = [];
  }

  // Risk Assessment
  const riskRes = database.exec(`SELECT * FROM risk_assessments WHERE bidId = '${bidObj.id}'`);
  if (riskRes.length && riskRes[0].values.length) {
    const rCols = riskRes[0].columns;
    const rObj: any = {};
    rCols.forEach((c, idx) => (rObj[c] = riskRes[0].values[0][idx]));
    try {
      rObj.criticalFlags = JSON.parse(rObj.criticalFlagsJson);
    } catch (e) {
      rObj.criticalFlags = [];
    }
    bidObj.riskAssessment = rObj as RiskAssessment;
  }

  // AI Recommendation
  const recRes = database.exec(`SELECT * FROM ai_recommendations WHERE bidId = '${bidObj.id}'`);
  if (recRes.length && recRes[0].values.length) {
    const recCols = recRes[0].columns;
    const recObj: any = {};
    recCols.forEach((c, idx) => (recObj[c] = recRes[0].values[0][idx]));
    try {
      recObj.criticalIssues = JSON.parse(recObj.criticalIssuesJson);
      recObj.missingRequirements = JSON.parse(recObj.missingRequirementsJson);
      recObj.recommendedActions = JSON.parse(recObj.recommendedActionsJson);
    } catch (e) {
      recObj.criticalIssues = [];
      recObj.missingRequirements = [];
      recObj.recommendedActions = [];
    }
    bidObj.aiRecommendation = recObj as AIRecommendation;
  }

  // Officer Decision
  const decRes = database.exec(`SELECT * FROM officer_decisions WHERE bidId = '${bidObj.id}'`);
  if (decRes.length && decRes[0].values.length) {
    const decCols = decRes[0].columns;
    const decObj: any = {};
    decCols.forEach((c, idx) => (decObj[c] = decRes[0].values[0][idx]));
    try {
      decObj.conditions = JSON.parse(decObj.conditionsJson);
    } catch (e) {
      decObj.conditions = [];
    }
    bidObj.officerDecision = decObj as OfficerDecision;
  }

  // Audit Logs
  const audRes = database.exec(`SELECT * FROM audit_logs WHERE bidId = '${bidObj.id}' ORDER BY timestamp ASC`);
  if (audRes.length && audRes[0].values.length) {
    const aCols = audRes[0].columns;
    bidObj.auditLogs = audRes[0].values.map((r) => {
      const a: any = {};
      aCols.forEach((c, idx) => (a[c] = r[idx]));
      try {
        a.payloadJson = JSON.parse(a.payloadJson);
      } catch (e) {
        a.payloadJson = {};
      }
      return a as AuditLog;
    });
  } else {
    bidObj.auditLogs = [];
  }

  return bidObj as Bid;
}

export async function addDocumentToBid(
  doc: Omit<Document, 'id' | 'uploadTimestamp' | 'status' | 'verificationStatus'>,
  extractedFields?: ExtractedField[]
): Promise<Document> {
  const database = await getDb();
  const id = `doc-${Date.now()}`;
  const now = new Date().toISOString();

  database.run(
    `INSERT INTO documents (id, bidId, bidderId, tenderId, documentType, fileName, fileOriginalName, fileSize, mimeType, fileUrl, uploadTimestamp, status, verificationStatus, sha256Hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, doc.bidId, doc.bidderId, doc.tenderId, doc.documentType, doc.fileName, doc.fileOriginalName, doc.fileSize, doc.mimeType, doc.fileUrl || `/uploads/${doc.fileName}`, now, 'ANALYZED', 'VALID', doc.sha256Hash]
  );

  if (extractedFields && extractedFields.length > 0) {
    for (const f of extractedFields) {
      const fId = `field-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      database.run(
        `INSERT INTO extracted_fields (id, documentId, fieldName, fieldValue, confidence, sourcePage, isPresent, rawSnippet) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [fId, id, f.fieldName, f.fieldValue, f.confidence, f.sourcePage || 1, f.isPresent ? 1 : 0, f.rawSnippet || '']
      );
    }
  }

  // Audit Log
  database.run(
    `INSERT INTO audit_logs (id, bidId, tenderId, eventType, actorName, actorRole, actionSummary, payloadJson, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [`aud-${Date.now()}`, doc.bidId, doc.tenderId, 'DOCUMENT_UPLOADED', 'Procurement Officer', 'USER', `Uploaded ${doc.documentType} document: ${doc.fileOriginalName} (${Math.round(doc.fileSize / 1024)} KB)`, JSON.stringify({ fileName: doc.fileOriginalName, type: doc.documentType }), now]
  );

  saveDb();
  return {
    ...doc,
    id,
    uploadTimestamp: now,
    status: 'ANALYZED',
    verificationStatus: 'VALID',
  };
}

export async function rerunVerificationAndCompliance(bidId: string): Promise<Bid | null> {
  const database = await getDb();
  const bid = await getBidFullDetails(bidId);
  if (!bid || !bid.tender || !bid.bidder) return null;

  const reqs = bid.tender.requirements || [];
  const docs = bid.documents || [];

  // Delete previous checks & verifications to refresh
  database.run(`DELETE FROM verifications WHERE bidId = '${bidId}'`);
  database.run(`DELETE FROM compliance_checks WHERE bidId = '${bidId}'`);
  database.run(`DELETE FROM risk_assessments WHERE bidId = '${bidId}'`);
  database.run(`DELETE FROM ai_recommendations WHERE bidId = '${bidId}'`);

  const verifs: Verification[] = [];
  for (const r of reqs) {
    let govtRes;
    switch (r.requirementCode) {
      case 'GST': govtRes = VerificationSimulators.verifyGst(bid.bidder.gstin); break;
      case 'PAN': govtRes = VerificationSimulators.verifyPan(bid.bidder.pan); break;
      case 'UDYAM': govtRes = VerificationSimulators.verifyUdyam(bid.bidder.udyamNumber || ''); break;
      case 'INCOME_TAX': govtRes = VerificationSimulators.verifyIncomeTax(bid.bidder.pan); break;
      case 'EPFO': govtRes = VerificationSimulators.verifyEpfo(bid.bidder.epfEstCode, bid.bidder.pan); break;
      case 'ESIC': govtRes = VerificationSimulators.verifyEsic(bid.bidder.esicCode, bid.bidder.pan); break;
      case 'STARTUP_INDIA': govtRes = VerificationSimulators.verifyStartup(bid.bidder.startupDpiitNumber || ''); break;
      case 'NSIC': govtRes = VerificationSimulators.verifyNsic(bid.bidder.nsicRegNumber || ''); break;
      case 'OEM_AUTHORIZATION': govtRes = VerificationSimulators.verifyOem(bid.bidder.oemName); break;
      case 'MAKE_IN_INDIA': govtRes = VerificationSimulators.verifyMii(bid.bidder.legalName); break;
      case 'BLACKLISTING': govtRes = VerificationSimulators.verifyBlacklist(bid.bidder.pan, bid.bidder.gstin, bid.bidder.legalName); break;
      default: govtRes = { status: 'SUCCESS', disclaimer: 'SIMULATED', isSimulated: true, data: { status: 'VALID' }, sourcePortal: 'GeM', queryParameters: {}, timestamp: new Date().toISOString(), message: 'Verified' };
    }

    let matchStatus = 'MATCH';
    if (govtRes.status === 'NOT_FOUND') matchStatus = 'MISSING';
    else if (govtRes.data?.status === 'CANCELLED' || govtRes.data?.status === 'EXPIRED') matchStatus = 'INVALID';
    else if (govtRes.data?.isBlacklisted) matchStatus = 'MISMATCH';

    const v: Verification = {
      id: `ver-${bid.id}-${r.requirementCode}-${Date.now()}`,
      bidId: bid.id,
      requirementCode: r.requirementCode,
      apiEndpoint: `/api/verify/${r.requirementCode.toLowerCase().replace('_', '-')}`,
      status: govtRes.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
      verifiedDataJson: govtRes.data || {},
      matchStatus: matchStatus as any,
      evidenceDetails: govtRes.message,
      apiTimestamp: govtRes.timestamp,
      isSimulated: true,
    };
    verifs.push(v);

    database.run(
      `INSERT INTO verifications (id, bidId, requirementCode, apiEndpoint, status, verifiedDataJson, matchStatus, evidenceDetails, apiTimestamp, isSimulated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [v.id, v.bidId, v.requirementCode, v.apiEndpoint, v.status, JSON.stringify(v.verifiedDataJson), v.matchStatus, v.evidenceDetails, v.apiTimestamp, 1]
    );
  }

  // Deterministic evaluation
  const { checks, assessment } = evaluateBidCompliance({
    bid,
    requirements: reqs,
    documents: docs,
    verifications: verifs,
  });

  for (const c of checks) {
    database.run(
      `INSERT INTO compliance_checks (id, bidId, requirementCode, requirementName, isRequired, weight, status, scoreAchieved, evidenceSummary, issuesFoundJson, deterministicRuleEvaluated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.bidId, c.requirementCode, c.requirementName, c.isRequired ? 1 : 0, c.weight, c.status, c.scoreAchieved, c.evidenceSummary, JSON.stringify(c.issuesFound), c.deterministicRuleEvaluated]
    );
  }

  database.run(
    `INSERT INTO risk_assessments (id, bidId, overallScore, riskLevel, compliancePercentage, passedChecksCount, failedChecksCount, pendingChecksCount, criticalFlagsJson, calculatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [assessment.id, assessment.bidId, assessment.overallScore, assessment.riskLevel, assessment.compliancePercentage, assessment.passedChecksCount, assessment.failedChecksCount, assessment.pendingChecksCount, JSON.stringify(assessment.criticalFlags), assessment.calculatedAt]
  );

  database.run(
    `UPDATE bids SET overallScore = ?, riskLevel = ?, verifiedAt = ? WHERE id = ?`,
    [assessment.overallScore, assessment.riskLevel, new Date().toISOString(), bid.id]
  );

  const rec = await generateAIRecommendationWithGemini(bid, checks, assessment);

  database.run(
    `INSERT INTO ai_recommendations (id, bidId, recommendation, reasoningText, criticalIssuesJson, missingRequirementsJson, recommendedActionsJson, modelUsed, disclaimerText, generatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [rec.id, rec.bidId, rec.recommendation, rec.reasoningText, JSON.stringify(rec.criticalIssues), JSON.stringify(rec.missingRequirements), JSON.stringify(rec.recommendedActions), rec.modelUsed, rec.disclaimerText, rec.generatedAt]
  );

  // Audit Log
  database.run(
    `INSERT INTO audit_logs (id, bidId, tenderId, eventType, actorName, actorRole, actionSummary, payloadJson, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [`aud-${Date.now()}`, bid.id, bid.tenderId, 'VERIFICATION_RE_EVALUATED', 'Procurement Officer', 'USER', `Re-evaluated compliance checks & simulated government API cross-checks. New score: ${assessment.overallScore}/100.`, JSON.stringify({ score: assessment.overallScore, risk: assessment.riskLevel }), new Date().toISOString()]
  );

  saveDb();
  return await getBidFullDetails(bidId);
}

export async function saveOfficerDecision(
  bidId: string,
  decision: {
    officerName: string;
    officerDesignation: string;
    decision: 'APPROVE' | 'REJECT' | 'REQUEST_CLARIFICATION' | 'HOLD';
    comments: string;
    conditions?: string[];
  }
): Promise<OfficerDecision> {
  const database = await getDb();
  const id = `dec-${bidId}`;
  const now = new Date().toISOString();

  database.run(`DELETE FROM officer_decisions WHERE bidId = '${bidId}'`);
  database.run(
    `INSERT INTO officer_decisions (id, bidId, officerName, officerDesignation, decision, comments, conditionsJson, decidedAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, bidId, decision.officerName, decision.officerDesignation, decision.decision, decision.comments, JSON.stringify(decision.conditions || []), now, now]
  );

  let techStatus = 'PENDING_VERIFICATION';
  if (decision.decision === 'APPROVE') techStatus = 'QUALIFIED';
  else if (decision.decision === 'REJECT') techStatus = 'DISQUALIFIED';

  database.run(`UPDATE bids SET technicalStatus = ?, status = 'DECIDED' WHERE id = ?`, [techStatus, bidId]);

  // Audit Log
  database.run(
    `INSERT INTO audit_logs (id, bidId, tenderId, eventType, actorName, actorRole, actionSummary, payloadJson, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [`aud-${Date.now()}`, bidId, null, 'OFFICER_DECISION_RECORDED', decision.officerName, 'PROCUREMENT_OFFICER', `Officer recorded final decision: ${decision.decision}. Reason: ${decision.comments}`, JSON.stringify(decision), now]
  );

  saveDb();
  return {
    id,
    bidId,
    officerName: decision.officerName,
    officerDesignation: decision.officerDesignation,
    decision: decision.decision,
    comments: decision.comments,
    conditions: decision.conditions,
    decidedAt: now,
    updatedAt: now,
  };
}

export async function createBidderAndBid(
  tenderId: string,
  bidderData: Omit<Bidder, 'id'>,
  quotedAmount: number
): Promise<Bid> {
  const database = await getDb();
  const bidderId = `bidder-${Date.now()}`;
  const bidId = `bid-${Date.now()}`;
  const bidNumber = `GEM/BID/2026/${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  database.run(
    `INSERT INTO bidders (id, legalName, tradeName, pan, gstin, udyamNumber, cinNumber, businessType, address, city, state, pincode, contactPerson, contactEmail, contactPhone, oemName, localContentPercentage, startupDpiitNumber, nsicRegNumber, epfEstCode, esicCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bidderId,
      bidderData.legalName,
      bidderData.tradeName || null,
      bidderData.pan,
      bidderData.gstin,
      bidderData.udyamNumber || null,
      bidderData.cinNumber || null,
      bidderData.businessType,
      bidderData.address,
      bidderData.city,
      bidderData.state,
      bidderData.pincode,
      bidderData.contactPerson,
      bidderData.contactEmail,
      bidderData.contactPhone,
      bidderData.oemName || null,
      bidderData.localContentPercentage || 50,
      bidderData.startupDpiitNumber || null,
      bidderData.nsicRegNumber || null,
      bidderData.epfEstCode || null,
      bidderData.esicCode || null,
    ]
  );

  database.run(
    `INSERT INTO bids (id, tenderId, bidderId, bidNumber, submissionDate, quotedAmount, technicalStatus, financialStatus, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [bidId, tenderId, bidderId, bidNumber, now, quotedAmount, 'PENDING_VERIFICATION', 'NOT_OPENED', 'SUBMITTED']
  );

  database.run(
    `INSERT INTO audit_logs (id, bidId, tenderId, eventType, actorName, actorRole, actionSummary, payloadJson, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [`aud-${Date.now()}`, bidId, tenderId, 'BIDDER_REGISTERED_AND_BID_CREATED', 'Procurement Portal', 'SYSTEM', `New bidder "${bidderData.legalName}" registered and Bid ${bidNumber} created.`, JSON.stringify({ bidNumber, legalName: bidderData.legalName }), now]
  );

  saveDb();
  await rerunVerificationAndCompliance(bidId);
  return (await getBidFullDetails(bidId))!;
}

export async function getDashboardStats(): Promise<{
  activeTendersCount: number;
  totalBidsCount: number;
  pendingVerificationCount: number;
  highRiskBidsCount: number;
  averageComplianceScore: number;
  riskDistribution: Array<{ name: string; value: number; color: string }>;
  complianceCategoryScores: Array<{ category: string; averageScore: number; totalChecks: number }>;
  recentAuditLogs: AuditLog[];
}> {
  const database = await getDb();
  const tenders = await getTendersList();
  const bids = await getBidsList();

  const activeTendersCount = tenders.filter((t) => t.status === 'ACTIVE' || t.status === 'EVALUATION').length;
  const totalBidsCount = bids.length;
  const pendingVerificationCount = bids.filter((b) => b.status === 'UNDER_REVIEW' || b.technicalStatus === 'PENDING_VERIFICATION').length;
  const highRiskBidsCount = bids.filter((b) => b.riskLevel === 'HIGH' || b.riskLevel === 'CRITICAL').length;

  const validScores = bids.filter((b) => typeof b.overallScore === 'number').map((b) => b.overallScore!);
  const averageComplianceScore = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;

  const riskDistribution = [
    { name: 'Low Risk (90-100)', value: bids.filter((b) => b.riskLevel === 'LOW').length, color: '#10B981' },
    { name: 'Medium Risk (70-89)', value: bids.filter((b) => b.riskLevel === 'MEDIUM').length, color: '#F59E0B' },
    { name: 'High Risk (50-69)', value: bids.filter((b) => b.riskLevel === 'HIGH').length, color: '#F97316' },
    { name: 'Critical Risk (<50)', value: bids.filter((b) => b.riskLevel === 'CRITICAL').length, color: '#EF4444' },
  ];

  const catRes = database.exec(`
    SELECT requirementCode, AVG(scoreAchieved * 100.0 / weight) as avgScore, COUNT(*) as cnt
    FROM compliance_checks
    GROUP BY requirementCode
  `);

  let complianceCategoryScores: Array<{ category: string; averageScore: number; totalChecks: number }> = [];
  if (catRes.length && catRes[0].values.length) {
    complianceCategoryScores = catRes[0].values.map((r) => ({
      category: String(r[0]),
      averageScore: Math.round(Number(r[1]) || 0),
      totalChecks: Number(r[2]) || 0,
    }));
  }

  const audRes = database.exec(`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 15`);
  let recentAuditLogs: AuditLog[] = [];
  if (audRes.length && audRes[0].values.length) {
    const aCols = audRes[0].columns;
    recentAuditLogs = audRes[0].values.map((r) => {
      const a: any = {};
      aCols.forEach((c, idx) => (a[c] = r[idx]));
      try {
        a.payloadJson = JSON.parse(a.payloadJson);
      } catch (e) {
        a.payloadJson = {};
      }
      return a as AuditLog;
    });
  }

  return {
    activeTendersCount,
    totalBidsCount,
    pendingVerificationCount,
    highRiskBidsCount,
    averageComplianceScore,
    riskDistribution,
    complianceCategoryScores,
    recentAuditLogs,
  };
}

export async function getAllAuditLogs(filter?: { bidId?: string; tenderId?: string; eventType?: string }): Promise<AuditLog[]> {
  const database = await getDb();
  let q = `SELECT * FROM audit_logs`;
  const conditions: string[] = [];
  if (filter?.bidId) conditions.push(`bidId = '${filter.bidId}'`);
  if (filter?.tenderId) conditions.push(`tenderId = '${filter.tenderId}'`);
  if (filter?.eventType) conditions.push(`eventType = '${filter.eventType}'`);
  if (conditions.length) q += ` WHERE ${conditions.join(' AND ')}`;
  q += ` ORDER BY timestamp DESC`;

  const res = database.exec(q);
  if (!res.length || !res[0].values.length) return [];
  const cols = res[0].columns;
  return res[0].values.map((r) => {
    const a: any = {};
    cols.forEach((c, idx) => (a[c] = r[idx]));
    try {
      a.payloadJson = JSON.parse(a.payloadJson);
    } catch (e) {
      a.payloadJson = {};
    }
    return a as AuditLog;
  });
}
