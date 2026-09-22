export type TenderStatus = 'ACTIVE' | 'EVALUATION' | 'TECHNICAL_OPENING' | 'FINANCIAL_OPENING' | 'AWARDED' | 'CANCELLED';

export type UserRole = 'ADMIN' | 'PROCUREMENT_OFFICER' | 'AUDITOR' | 'REVIEWER' | 'TECHNICAL_EVALUATOR' | 'FINANCE_MEMBER';

export type RequirementCode =
  | 'GST'
  | 'PAN'
  | 'UDYAM'
  | 'INCOME_TAX'
  | 'EPFO'
  | 'ESIC'
  | 'STARTUP_INDIA'
  | 'NSIC'
  | 'OEM_AUTHORIZATION'
  | 'MAKE_IN_INDIA'
  | 'BLACKLISTING'
  | 'DIGILOCKER';

export type MatchStatus =
  | 'MATCH'
  | 'MISMATCH'
  | 'MISSING'
  | 'EXPIRED'
  | 'INVALID'
  | 'REQUIRES_MANUAL_REVIEW';

export type ComplianceResultStatus =
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'MISSING'
  | 'REVIEW'
  | 'EXEMPTED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RecommendationType = 'COMPLIANT' | 'MANUAL_REVIEW' | 'NON_COMPLIANT';

export type OfficerDecisionType = 'APPROVE' | 'REJECT' | 'REQUEST_CLARIFICATION' | 'HOLD';

export interface ComparisonFieldItem {
  fieldName: string;
  documentValue: string;
  portalValue: string;
  tenderCondition: string;
  status: MatchStatus;
  notes?: string;
}

export interface CrossVerificationResultItem {
  id: string;
  bidId: string;
  requirementCode: RequirementCode;
  requirementName: string;
  matchStatus: MatchStatus;
  complianceStatus: ComplianceResultStatus;
  isRequired: boolean;
  weight: number;
  documentEvidence: {
    hasDocument: boolean;
    fileName?: string;
    documentType?: string;
    sha256Hash?: string;
    sourcePage?: number;
    confidence?: number;
    rawSnippet?: string;
    extractedSummary: string;
    extractedKeyValues: Record<string, string>;
  };
  portalEvidence: {
    portalName: string;
    endpoint: string;
    queryParameters: Record<string, any>;
    timestamp: string;
    isSimulated: boolean;
    portalStatus: string;
    portalSummary: string;
    verifiedKeyValues: Record<string, any>;
  };
  tenderRequirement: {
    requirementCode: RequirementCode;
    requirementName: string;
    isRequired: boolean;
    weight: number;
    minThreshold?: string | number;
    customRuleDescription: string;
    issuingAuthority: string;
    formatRequired: string;
  };
  comparisonMatrix: ComparisonFieldItem[];
  exactEvidenceSummary: string;
  deterministicRule: string;
  issues: string[];
  criticalFlag?: string;
}

export interface CrossVerificationReport {
  bidId: string;
  bidNumber: string;
  bidderLegalName: string;
  tenderTitle: string;
  tenderId: string;
  evaluatedAt: string;
  summary: {
    totalRequirements: number;
    matchedCount: number;
    mismatchedCount: number;
    missingCount: number;
    invalidCount: number;
    expiredCount: number;
    reviewCount: number;
    overallScore: number;
  };
  items: CrossVerificationResultItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PROCUREMENT_OFFICER' | 'TECHNICAL_EVALUATOR' | 'FINANCE_MEMBER' | 'AUDITOR' | 'ADMIN';
  department: string;
  designation: string;
  createdAt: string;
}

export interface TenderRequirement {
  id: string;
  tenderId: string;
  requirementCode: RequirementCode;
  requirementName: string;
  isRequired: boolean;
  weight: number; // 0 - 100
  minThreshold?: string | number;
  customRuleDescription: string;
  issuingAuthority: string;
  formatRequired: string;
  version?: number;
  status?: 'DRAFT' | 'APPROVED' | 'REJECTED';
  officerApproved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  category?: string;
  sourceText?: string;
  sourcePage?: number;
  confidence?: number;
}

export interface Tender {
  id: string;
  tenderId: string; // GeM Tender Ref e.g. GEM/2026/B/894201
  title: string;
  department: string;
  description: string;
  category: string;
  estimatedValue: number;
  deadline: string;
  status: TenderStatus;
  rulesetVersion?: number;
  rulesetPublishedAt?: string;
  rulesetPublishedBy?: string;
  rfpFileName?: string;
  createdAt: string;
  updatedAt: string;
  requirements?: TenderRequirement[];
}

export interface TenderDocumentExtractionResult {
  tenderId: string;
  fileName: string;
  fileSize: number;
  extractedClausesCount: number;
  clauses: TenderRequirement[];
  summary: string;
}

export interface Bidder {
  id: string;
  legalName: string;
  tradeName?: string;
  pan: string;
  gstin: string;
  udyamNumber?: string;
  cinNumber?: string;
  businessType: 'Proprietorship' | 'Partnership' | 'Private Limited' | 'Public Limited' | 'LLP';
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  oemName?: string;
  localContentPercentage: number;
  startupDpiitNumber?: string;
  nsicRegNumber?: string;
  epfEstCode?: string;
  esicCode?: string;
}

export interface Document {
  id: string;
  bidId: string;
  bidderId: string;
  tenderId: string;
  documentType: RequirementCode | 'GENERAL' | 'FINANCIAL_STATEMENT' | 'TECHNICAL_SPEC';
  fileName: string;
  fileOriginalName: string;
  fileSize: number;
  mimeType: string;
  fileUrl?: string;
  uploadTimestamp: string;
  status: 'PENDING' | 'ANALYZED' | 'FAILED';
  verificationStatus: 'NOT_VERIFIED' | 'VALID' | 'SUSPICIOUS' | 'INVALID';
  sha256Hash: string;
  extractedFields?: ExtractedField[];
}

export interface ExtractedField {
  id: string;
  documentId: string;
  fieldName: string;
  fieldValue: string | null;
  originalValue?: string | null;
  normalizedValue?: string | null;
  confidence: number; // 0.0 - 1.0
  sourcePage?: number;
  isPresent: boolean;
  rawSnippet?: string;
  missingReason?: string;
  category?: 'IDENTITY' | 'COMPLIANCE' | 'STATUTORY' | 'FINANCIAL' | 'TECHNICAL';
  extractionMethod?: 'OCR_MULTIMODAL' | 'PDF_NATIVE_TEXT' | 'MANUAL_ATTESTATION';
}

export interface Verification {
  id: string;
  bidId: string;
  requirementCode: RequirementCode;
  apiEndpoint: string;
  status: 'SUCCESS' | 'FAILED' | 'ERROR';
  verifiedDataJson: Record<string, any>;
  matchStatus: MatchStatus;
  evidenceDetails: string;
  apiTimestamp: string;
  isSimulated: boolean;
}

export interface ComplianceCheck {
  id: string;
  bidId: string;
  requirementCode: RequirementCode;
  requirementName: string;
  isRequired: boolean;
  weight: number;
  status: ComplianceResultStatus;
  scoreAchieved: number; // proportional to weight
  evidenceSummary: string;
  issuesFound: string[];
  deterministicRuleEvaluated: string;
}

export interface RiskAssessment {
  id: string;
  bidId: string;
  overallScore: number; // 0 - 100
  riskLevel: RiskLevel;
  compliancePercentage: number;
  passedChecksCount: number;
  failedChecksCount: number;
  pendingChecksCount: number;
  criticalFlags: string[];
  calculatedAt: string;
}

export interface AIRecommendation {
  id: string;
  bidId: string;
  recommendation: RecommendationType;
  reason: string;
  reasoningText?: string;
  confidenceScore?: number;
  criticalIssues: string[];
  missingRequirements: string[];
  recommendedActions: string[];
  modelUsed: string;
  disclaimerText: string;
  generatedAt: string;
}

export interface OfficerDecision {
  id: string;
  bidId: string;
  officerName: string;
  officerDesignation: string;
  decision: OfficerDecisionType;
  comments: string;
  conditions?: string[];
  decidedAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  bidId?: string;
  tenderId?: string;
  eventType: string;
  actorName: string;
  actorRole: string;
  actionSummary: string;
  payloadJson?: any;
  timestamp: string;
  previousHash?: string;
  hash?: string;
}

export interface ThreeWayReconciliationItem {
  id: string;
  requirementCode: RequirementCode;
  requirementTitle: string;
  isRequired: boolean;
  weight: number;
  documentEvidence: {
    hasDocument: boolean;
    documentType?: string;
    fileName?: string;
    sourcePage?: number;
    sha256?: string;
    confidence?: number;
    extractedSnippet?: string;
    extractedKeyValues: Record<string, string>;
    provenance: string;
  };
  verificationEvidence: {
    sourcePortal: string;
    endpoint: string;
    verificationMode: 'SIMULATED' | 'MANUAL_EVIDENCE' | 'AUTHORIZED_LIVE';
    timestamp: string;
    verifiedKeyValues: Record<string, any>;
    statusText: string;
    isSimulated: boolean;
  };
  tenderCondition: {
    ruleDescription: string;
    threshold?: string | number;
    issuingAuthority: string;
    formatRequired: string;
  };
  outcome: 'COMPLIANT' | 'NON_COMPLIANT' | 'REVIEW_REQUIRED' | 'MISSING_EVIDENCE' | 'INCONSISTENT' | 'NOT_APPLICABLE';
  reconciliationOutcome?: 'MATCH' | 'MISMATCH' | 'MISSING' | 'UNVERIFIED' | 'CONFLICT' | 'NOT_APPLICABLE';
  scoreAchieved: number;
  confidenceScore: number;
  reason: string;
  issues: string[];
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedAction: string;
  discrepancyDetails?: {
    field: string;
    bidderValue: string;
    verificationValue: string;
    tenderExpectation: string;
    reason: string;
    severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    evidence: string;
    affectedRequirement: string;
    recommendedAction: string;
  };
  provenanceTrail?: {
    documentName?: string;
    sourcePage?: number;
    extractedField?: string;
    evidenceSnippet?: string;
    verificationSource?: string;
    reconciliationStatus?: string;
    policyRuleId?: string;
    finalResult?: string;
  };
}

export interface DocumentFieldObservation {
  documentId: string;
  documentType: string;
  fileName: string;
  field: string;
  value: string;
  page?: number;
  confidence?: number;
}

export interface InconsistencyItem {
  id: string;
  category: 'IDENTITY' | 'FINANCIAL' | 'OPERATIONAL' | 'STATUTORY';
  field: string;
  severity: 'INCONSISTENCY_DETECTED' | 'REVIEW_REQUIRED' | 'HIGH_RISK_REVIEW';
  documentA: DocumentFieldObservation;
  documentB: DocumentFieldObservation;
  differenceDescription: string;
  materialImpact: string;
  recommendedAction: string;
}

export interface CrossDocumentConsistencyReport {
  bidId: string;
  analyzedAt: string;
  totalDocumentsAnalyzed: number;
  consistencyScore: number;
  overallStatus: 'CONSISTENT' | 'REVIEW_REQUIRED' | 'HIGH_RISK_INCONSISTENCIES';
  inconsistencies: InconsistencyItem[];
  verifiedMatchesCount: number;
  summary: string;
}

export interface EvaluationRun {
  id: string;
  bidId: string;
  tenderId: string;
  rulesetVersion: number;
  evaluatorName: string;
  evaluatorRole: string;
  overallScore: number;
  riskLevel: RiskLevel;
  status: string;
  timestamp: string;
  complianceChecksCount: number;
  passedChecksCount: number;
  failedChecksCount: number;
  criticalFlagsCount: number;
  aiRecommendation?: string;
  officerDecision?: string;
  snapshotData?: {
    checks?: ComplianceCheck[];
    riskAssessment?: RiskAssessment;
    crossReport?: CrossVerificationReport;
    aiRecommendation?: AIRecommendation;
    threeWayReconciliations?: ThreeWayReconciliationItem[];
    crossDocConsistency?: CrossDocumentConsistencyReport;
  };
}

export interface Bid {
  id: string;
  tenderId: string;
  bidderId: string;
  bidNumber: string; // e.g. GEM/BID/2026/78210
  submissionDate: string;
  quotedAmount: number;
  technicalStatus: 'PENDING_VERIFICATION' | 'VERIFIED' | 'DISQUALIFIED' | 'QUALIFIED';
  financialStatus: 'NOT_OPENED' | 'EVALUATED' | 'L1_MATCH';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'DECIDED';
  overallScore?: number;
  riskLevel?: RiskLevel;
  verifiedAt?: string;
  
  // Populated relations
  bidder?: Bidder;
  tender?: Tender;
  documents?: Document[];
  verifications?: Verification[];
  complianceChecks?: ComplianceCheck[];
  riskAssessment?: RiskAssessment;
  aiRecommendation?: AIRecommendation;
  officerDecision?: OfficerDecision;
  crossVerificationReport?: CrossVerificationReport;
  auditLogs?: AuditLog[];
  evaluationRuns?: EvaluationRun[];
  threeWayReconciliations?: ThreeWayReconciliationItem[];
  crossDocConsistency?: CrossDocumentConsistencyReport;
}
