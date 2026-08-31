import { PolicyEvaluationResult } from './policy-engine';
import { ComplianceCheck, RiskAssessment, RiskLevel, RequirementCode, ComplianceResultStatus } from '@gev-verify/shared-types';

export interface ScoreComputationResult {
  overallScore: number;
  riskLevel: RiskLevel;
  complianceChecks: ComplianceCheck[];
  riskAssessment: RiskAssessment;
}

export class ComplianceScorer {
  computeScore(bidId: string, evaluations: PolicyEvaluationResult[]): ScoreComputationResult {
    let totalWeight = 0;
    let earnedWeight = 0;
    const criticalFlags: string[] = [];
    const warnings: string[] = [];
    const exemptions: string[] = [];

    const complianceChecks: ComplianceCheck[] = evaluations.map((e) => {
      totalWeight += e.weight;
      earnedWeight += e.score;

      if (e.status === 'EXEMPTED') {
        exemptions.push(e.explanation);
      } else if (e.status === 'NON_COMPLIANT' || e.status === 'MISSING') {
        if (e.severity === 'CRITICAL' || e.severity === 'HIGH') {
          criticalFlags.push(...e.discrepancies);
        } else {
          warnings.push(...e.discrepancies);
        }
      } else if (e.status === 'REVIEW') {
        warnings.push(`Pending verification for ${e.requirementName}`);
      }

      let checkStatus: ComplianceResultStatus = 'REVIEW';
      if (e.status === 'COMPLIANT') checkStatus = 'COMPLIANT';
      else if (e.status === 'NON_COMPLIANT' || (e.status as any) === 'INVALID') checkStatus = 'NON_COMPLIANT';
      else if (e.status === 'MISSING') checkStatus = 'MISSING';
      else if (e.status === 'EXEMPTED') checkStatus = 'EXEMPTED';

      return {
        id: `chk-${bidId}-${e.requirementCode}`,
        bidId,
        requirementCode: e.requirementCode as RequirementCode,
        requirementName: e.requirementName,
        isRequired: e.isRequired,
        weight: e.weight,
        status: checkStatus,
        scoreAchieved: e.score,
        evidenceSummary: e.evidence,
        deterministicRuleEvaluated: e.deterministicRuleEvaluated,
      };
    });

    const normalizedScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    let riskLevel: RiskLevel = 'LOW';
    if (criticalFlags.length > 0) {
      riskLevel = 'CRITICAL';
    } else if (normalizedScore < 60) {
      riskLevel = 'HIGH';
    } else if (normalizedScore < 80 || warnings.length > 0) {
      riskLevel = 'MEDIUM';
    }

    const riskAssessment: RiskAssessment = {
      id: `risk-${bidId}`,
      bidId,
      overallScore: normalizedScore,
      riskLevel,
      criticalIssues: criticalFlags,
      warnings,
      exemptionsApplied: exemptions,
      evaluatedAt: new Date().toISOString(),
    };

    return {
      overallScore: normalizedScore,
      riskLevel,
      complianceChecks,
      riskAssessment,
    };
  }
}
