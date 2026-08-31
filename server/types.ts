export type TenderStatus = 'ACTIVE' | 'EVALUATION' | 'TECHNICAL_OPENING' | 'FINANCIAL_OPENING' | 'AWARDED' | 'CANCELLED';

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
  | 'NOT_APPLICABLE'
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
  createdAt: string;
  updatedAt: string;
  requirements?: TenderRequirement[];
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
  confidence: number; // 0.0 - 1.0
  sourcePage?: number;
  isPresent: boolean;
  rawSnippet?: string;
  missingReason?: string;
  category?: 'IDENTITY' | 'COMPLIANCE' | 'STATUTORY' | 'FINANCIAL' | 'TECHNICAL';
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
  auditLogs?: AuditLog[];
}
