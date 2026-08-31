import { Tender, TenderRequirement, Bid, Document, Verification } from '../types';
import { createServiceLogger } from '../observability/logger';

const log = createServiceLogger('PolicyEngine');

export type PolicyComplianceStatus =
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'MISSING'
  | 'MISMATCH'
  | 'EXPIRED'
  | 'INVALID'
  | 'NOT_APPLICABLE'
  | 'REQUIRES_MANUAL_REVIEW'
  | 'EXEMPTED'
  | 'REVIEW';

export type PolicySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export interface PolicyEvaluationResult {
  ruleId: string;
  requirementId: string;
  requirementCode: string;
  requirementName: string;
  isRequired: boolean;
  weight: number;
  status: PolicyComplianceStatus;
  severity: PolicySeverity;
  score: number; // 0 to weight
  evidence: string;
  explanation: string;
  discrepancies: string[];
  deterministicRuleEvaluated: string;
}

export interface PolicyContext {
  tender: Tender;
  bid: Bid;
  requirement: TenderRequirement;
  documents: Document[];
  verifications: Verification[];
  extractedFields: Record<string, any>;
}

export interface CompliancePolicyRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly severity: PolicySeverity;
  applies(context: PolicyContext): boolean;
  evaluate(context: PolicyContext): Promise<PolicyEvaluationResult> | PolicyEvaluationResult;
}

export class PolicyEngine {
  private rules: CompliancePolicyRule[] = [];

  public registerRule(rule: CompliancePolicyRule): void {
    this.rules.push(rule);
    log.info(`Registered compliance policy rule: ${rule.id} - ${rule.name}`);
  }

  public async evaluateRequirement(context: PolicyContext): Promise<PolicyEvaluationResult> {
    // Find custom or specific rule for this requirement
    const matchedRule = this.rules.find((r) => r.applies(context));

    if (matchedRule) {
      return await matchedRule.evaluate(context);
    }

    // Default Fallback Evaluator if no custom rule matches
    return this.defaultEvaluate(context);
  }

  private defaultEvaluate(context: PolicyContext): PolicyEvaluationResult {
    const { requirement, documents, verifications } = context;
    const reqCode = requirement.requirementCode;
    const doc = documents.find((d) => d.documentType === reqCode && d.status === 'ANALYZED');
    const ver = verifications.find((v) => v.requirementCode === reqCode);

    if (!doc && requirement.isRequired) {
      return {
        ruleId: `RULE-DEFAULT-${reqCode}`,
        requirementId: requirement.id || reqCode,
        requirementCode: reqCode,
        requirementName: requirement.requirementName,
        isRequired: true,
        weight: requirement.weight,
        status: 'MISSING',
        severity: 'HIGH',
        score: 0,
        evidence: `Mandatory requirement ${requirement.requirementName} has no uploaded or verified document.`,
        explanation: 'Document is missing from bid submission package.',
        discrepancies: [`Missing mandatory submission for ${requirement.requirementName}`],
        deterministicRuleEvaluated: 'MANDATORY_DOCUMENT_PRESENCE_CHECK',
      };
    }

    if (ver && (ver.matchStatus as string) === 'SUSPENDED') {
      return {
        ruleId: `RULE-DEFAULT-${reqCode}`,
        requirementId: requirement.id || reqCode,
        requirementCode: reqCode,
        requirementName: requirement.requirementName,
        isRequired: requirement.isRequired,
        weight: requirement.weight,
        status: 'INVALID',
        severity: 'CRITICAL',
        score: 0,
        evidence: ver.evidenceDetails,
        explanation: 'Statutory portal returned suspended/cancelled registration status.',
        discrepancies: [`Suspended registration on government portal for ${requirement.requirementName}`],
        deterministicRuleEvaluated: 'STATUTORY_ACTIVE_REGISTRATION_CHECK',
      };
    }

    return {
      ruleId: `RULE-DEFAULT-${reqCode}`,
      requirementId: requirement.id || reqCode,
      requirementCode: reqCode,
      requirementName: requirement.requirementName,
      isRequired: requirement.isRequired,
      weight: requirement.weight,
      status: 'COMPLIANT',
      severity: 'LOW',
      score: requirement.weight,
      evidence: ver?.evidenceDetails || 'Document submitted and verified.',
      explanation: 'Requirement fully satisfied with valid documentary evidence.',
      discrepancies: [],
      deterministicRuleEvaluated: 'STANDARD_COMPLIANCE_PASS',
    };
  }
}
