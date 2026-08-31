export type TenderStatus = 'ACTIVE' | 'EVALUATION' | 'TECHNICAL_OPENING' | 'FINANCIAL_OPENING' | 'AWARDED' | 'CANCELLED';

export type UserRole = 'ADMIN' | 'PROCUREMENT_OFFICER' | 'AUDITOR' | 'REVIEWER' | 'TECHNICAL_EVALUATOR' | 'FINANCE_MEMBER';

export type RequirementCode =
  | 'GST'
  | 'PAN'
  | 'INCOME_TAX'
  | 'UDYAM'
  | 'EPFO'
  | 'ESIC'
  | 'STARTUP_INDIA'
  | 'NSIC'
  | 'OEM_AUTHORIZATION'
  | 'BLACKLISTING'
  | 'EXPERIENCE'
  | 'TECHNICAL_SPECS'
  | 'EMD'
  | 'FINANCIAL_STANDING';

export type ComplianceResultStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'REVIEW' | 'EXEMPTED' | 'MISSING';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MatchStatus = 'EXACT_MATCH' | 'VERIFIED' | 'MISMATCH' | 'SUSPENDED' | 'FLAGGED' | 'MANUAL_CHECK';
export type VerificationSource = 'GST_PORTAL' | 'IT_PORTAL' | 'EPFO_PORTAL' | 'ESIC_PORTAL' | 'UDYAM_PORTAL' | 'STARTUP_INDIA' | 'NSIC_PORTAL' | 'OEM_PORTAL' | 'CPPP_PORTAL' | 'PAN_NSDL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation?: string;
  badgeNumber?: string;
  avatarUrl?: string;
}

export interface Tender {
  id: string;
  tenderId: string;
  title: string;
  organization: string;
  department: string;
  category: string;
  estimatedValue: number;
  emdAmount: number;
  publishedDate: string;
  closingDate: string;
  status: TenderStatus;
  minExperienceYears: number;
  minAnnualTurnover: number;
  startupExemptionAllowed: boolean;
  msmeExemptionAllowed: boolean;
  requirements?: TenderRequirement[];
  bidsCount?: number;
  compliantBidsCount?: number;
  nonCompliantBidsCount?: number;
  reviewBidsCount?: number;
}

export interface TenderRequirement {
  id: string;
  tenderId: string;
  requirementCode: RequirementCode;
  requirementName: string;
  isRequired: boolean;
  minThreshold?: number;
  weight: number;
  statutoryRuleReference?: string;
  description?: string;
}

export interface Bidder {
  id: string;
  legalName: string;
  tradeName?: string;
  gstin: string;
  pan: string;
  udyamNumber?: string;
  cin?: string;
  startupDpiitNumber?: string;
  businessType: 'PRIVATE_LIMITED' | 'PUBLIC_LIMITED' | 'PARTNERSHIP' | 'PROPRIETORSHIP' | 'LLP';
  registeredAddress: string;
  state: string;
  contactEmail: string;
  contactPhone: string;
  isMsme: boolean;
  isStartup: boolean;
  blacklistedInPast: boolean;
}

export interface Document {
  id: string;
  bidId: string;
  documentType: RequirementCode;
  originalFileName: string;
  storedFileName: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  extractedText?: string;
  ocrConfidence: number;
  uploadedAt: string;
  status: 'PENDING' | 'ANALYZING' | 'ANALYZED' | 'ERROR';
  extractedFields?: ExtractedField[];
}

export interface ExtractedField {
  id: string;
  documentId: string;
  fieldName: string;
  fieldValue: string;
  confidence: number;
  rawSnippet?: string;
  sourcePage?: number;
  isPresent: boolean;
  category: string;
}

export interface Verification {
  id: string;
  bidId: string;
  requirementCode: RequirementCode;
  source: VerificationSource;
  endpointCalled: string;
  queryPayload: Record<string, any>;
  responsePayload: Record<string, any>;
  matchStatus: MatchStatus;
  confidenceScore: number;
  evidenceDetails: string;
  verifiedAt: string;
}

export interface ComplianceCheck {
  id: string;
  bidId: string;
  requirementCode: RequirementCode;
  requirementName: string;
  isRequired: boolean;
  weight: number;
  status: ComplianceResultStatus;
  scoreAchieved: number;
  evidenceSummary: string;
  deterministicRuleEvaluated: string;
}

export interface RiskAssessment {
  id: string;
  bidId: string;
  overallScore: number;
  riskLevel: RiskLevel;
  criticalIssues: string[];
  warnings: string[];
  exemptionsApplied: string[];
  evaluatedAt: string;
}

export interface AIRecommendation {
  id: string;
  bidId: string;
  recommendation: 'QUALIFIED' | 'DISQUALIFIED' | 'REQUIRES_CLARIFICATION';
  confidence: number;
  reason: string;
  keyPositiveFactors: string[];
  criticalDefects: string[];
  clarificationsToSeek: string[];
  statutoryCitations: string[];
  generatedAt: string;
  geminiModelVersion: string;
}

export interface OfficerDecision {
  id: string;
  bidId: string;
  officerId: string;
  officerName: string;
  decision: 'ACCEPT' | 'REJECT' | 'CLARIFICATION_REQUESTED' | 'PENDING';
  justification: string;
  discrepanciesNoted?: string[];
  clarificationDeadline?: string;
  decidedAt: string;
  signatureHash: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'TENDER' | 'BID' | 'DOCUMENT' | 'VERIFICATION' | 'DECISION' | 'SYSTEM';
  entityId: string;
  details: string;
  ipAddress: string;
  previousHash?: string;
  hash: string;
}

export interface Bid {
  id: string;
  tenderId: string;
  bidderId: string;
  bidNumber: string;
  submittedAt: string;
  financialQuote: number;
  technicalScore: number;
  status: 'SUBMITTED' | 'UNDER_EVALUATION' | 'ACCEPTED' | 'REJECTED' | 'DISQUALIFIED' | 'CLARIFICATION_SOUGHT';
  overallScore: number;
  riskLevel: RiskLevel;
  isStartupExemptionClaimed: boolean;
  isMsmeExemptionClaimed: boolean;
  tender?: Tender;
  bidder?: Bidder;
  documents?: Document[];
  verifications?: Verification[];
  complianceChecks?: ComplianceCheck[];
  riskAssessment?: RiskAssessment;
  aiRecommendation?: AIRecommendation;
  officerDecision?: OfficerDecision;
}
