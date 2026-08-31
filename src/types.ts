export type UserRole =
  | 'PROCUREMENT_OFFICER'
  | 'TECHNICAL_EVALUATOR'
  | 'FINANCIAL_EVALUATOR'
  | 'AUDITOR'
  | 'ADMIN';

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
  | 'CUSTOM';

export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'REVIEW' | 'EXEMPTED' | 'MISSING';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MatchStatus =
  | 'MATCH'
  | 'MISMATCH'
  | 'MISSING'
  | 'INVALID'
  | 'EXPIRED'
  | 'REQUIRES_MANUAL_REVIEW';
export type VerificationMatchStatus = MatchStatus;
export type BidStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTFALL_RAISED' | 'CLARIFICATION_RECEIVED' | 'DECIDED';
export type TechnicalStatus = 'PENDING_VERIFICATION' | 'QUALIFIED' | 'DISQUALIFIED' | 'SHORTFALL_PENDING';
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
  complianceStatus: ComplianceStatus;
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
  role: UserRole;
  department: string;
  designation: string;
}

export interface TenderRequirement {
  id: string;
  tenderId: string;
  requirementCode: RequirementCode;
  requirementName: string;
  isRequired: boolean;
  weight: number;
  minThreshold?: string | number;
  customRuleDescription: string;
  issuingAuthority: string;
  formatRequired: string;
}

export interface Tender {
  id: string;
  tenderId: string;
  title: string;
  department: string;
  description: string;
  category: string;
  estimatedValue: number;
  deadline: string;
  status: 'DRAFT' | 'ACTIVE' | 'EVALUATION' | 'AWARDED' | 'CANCELLED';
  requirements?: TenderRequirement[];
  createdAt: string;
  updatedAt: string;
}

export interface Bidder {
  id: string;
  legalName: string;
  tradeName?: string;
  pan: string;
  gstin: string;
  udyamNumber?: string;
  cinNumber?: string;
  businessType: string;
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

export interface ExtractedField {
  id: string;
  documentId: string;
  fieldName: string;
  fieldValue: string | null;
  confidence: number;
  sourcePage?: number;
  isPresent: boolean;
  rawSnippet?: string;
  missingReason?: string;
  category?: 'IDENTITY' | 'COMPLIANCE' | 'STATUTORY' | 'FINANCIAL' | 'TECHNICAL';
}

export interface Document {
  id: string;
  bidId: string;
  bidderId: string;
  tenderId: string;
  documentType: RequirementCode;
  fileName: string;
  fileOriginalName: string;
  fileSize: number;
  mimeType: string;
  fileUrl?: string;
  uploadTimestamp: string;
  status: 'PENDING' | 'ANALYZING' | 'ANALYZED' | 'FAILED';
  verificationStatus: 'NOT_VERIFIED' | 'VALID' | 'INVALID' | 'SUSPICIOUS';
  sha256Hash: string;
  extractedFields?: ExtractedField[];
}

export interface Verification {
  id: string;
  bidId: string;
  requirementCode: RequirementCode;
  apiEndpoint: string;
  status: 'SUCCESS' | 'FAILED' | 'ERROR';
  verifiedDataJson: Record<string, any>;
  matchStatus: VerificationMatchStatus;
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
  status: ComplianceStatus;
  scoreAchieved: number;
  evidenceSummary: string;
  issuesFound: string[];
  deterministicRuleEvaluated: string;
}

export interface RiskAssessment {
  id: string;
  bidId: string;
  overallScore: number;
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
  recommendation: 'COMPLIANT' | 'MANUAL_REVIEW' | 'NON_COMPLIANT';
  reasoningText: string;
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
  payloadJson?: Record<string, any>;
  timestamp: string;
}

export interface Bid {
  id: string;
  tenderId: string;
  bidderId: string;
  bidNumber: string;
  submissionDate: string;
  quotedAmount: number;
  technicalStatus: TechnicalStatus;
  financialStatus: 'NOT_OPENED' | 'OPENED' | 'EVALUATED' | 'L1' | 'L2' | 'REJECTED';
  status: BidStatus;
  overallScore?: number;
  riskLevel?: RiskLevel;
  verifiedAt?: string;
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
}

export interface DashboardStats {
  activeTendersCount: number;
  totalBidsCount: number;
  pendingVerificationCount: number;
  highRiskBidsCount: number;
  averageComplianceScore: number;
  riskDistribution: Array<{ name: string; value: number; color: string }>;
  complianceCategoryScores: Array<{ category: string; averageScore: number; totalChecks: number }>;
  recentAuditLogs: AuditLog[];
}
