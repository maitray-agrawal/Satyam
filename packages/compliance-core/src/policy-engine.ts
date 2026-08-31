import {
  Tender,
  TenderRequirement,
  Bid,
  Document,
  Verification,
  RequirementCode,
  ComplianceResultStatus,
} from '@gev-verify/shared-types';

export type PolicySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
export type PolicyComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'REVIEW' | 'EXEMPTED' | 'MISSING' | 'INVALID';

export interface PolicyEvaluationResult {
  ruleId: string;
  requirementId: string;
  requirementCode: RequirementCode | string;
  requirementName: string;
  isRequired: boolean;
  weight: number;
  status: PolicyComplianceStatus;
  severity: PolicySeverity;
  score: number;
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

export interface ComplianceRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly severity: PolicySeverity;
  applies(context: PolicyContext): boolean;
  evaluate(context: PolicyContext): PolicyEvaluationResult;
}

export class PolicyEngine {
  private rules: Map<string, ComplianceRule> = new Map();

  registerRule(rule: ComplianceRule): void {
    this.rules.set(rule.id, rule);
  }

  evaluateRequirement(context: PolicyContext): PolicyEvaluationResult {
    for (const rule of this.rules.values()) {
      if (rule.applies(context)) {
        return rule.evaluate(context);
      }
    }
    return this.defaultEvaluate(context);
  }

  evaluateAll(contexts: PolicyContext[]): PolicyEvaluationResult[] {
    return contexts.map((ctx) => this.evaluateRequirement(ctx));
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
        severity: 'CRITICAL',
        score: 0,
        evidence: `Mandatory document for ${requirement.requirementName} was not submitted in the bid package.`,
        explanation: 'Mandatory statutory document missing.',
        discrepancies: [`Missing statutory requirement: ${requirement.requirementName}`],
        deterministicRuleEvaluated: 'GFR_RULE_MANDATORY_DOC_CHECK',
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
        status: 'NON_COMPLIANT',
        severity: 'CRITICAL',
        score: 0,
        evidence: `Government portal reports status: SUSPENDED.`,
        explanation: 'Statutory registration is currently suspended.',
        discrepancies: [`${requirement.requirementName} registration suspended`],
        deterministicRuleEvaluated: 'GOV_PORTAL_SUSPENDED_CHECK',
      };
    }

    const hasVerified = ver && (ver.matchStatus === 'EXACT_MATCH' || ver.matchStatus === 'VERIFIED');
    return {
      ruleId: `RULE-DEFAULT-${reqCode}`,
      requirementId: requirement.id || reqCode,
      requirementCode: reqCode,
      requirementName: requirement.requirementName,
      isRequired: requirement.isRequired,
      weight: requirement.weight,
      status: hasVerified ? 'COMPLIANT' : 'REVIEW',
      severity: hasVerified ? 'INFORMATIONAL' : 'MEDIUM',
      score: hasVerified ? requirement.weight : Math.round(requirement.weight * 0.5),
      evidence: hasVerified ? 'Document matches government database records.' : 'Requires manual validation.',
      explanation: hasVerified ? 'Verified against statutory registry.' : 'Awaiting automated match validation.',
      discrepancies: [],
      deterministicRuleEvaluated: 'STANDARD_COMPLIANCE_EVALUATION',
    };
  }
}
