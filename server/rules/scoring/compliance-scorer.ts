import { PolicyEvaluationResult } from '../policy-engine';
import { ComplianceCheck, RiskAssessment, RiskLevel, RequirementCode, ComplianceResultStatus } from '../../types';

export interface ScoreComputationResult {
  overallScore: number;
  technicalScore: number;
  commercialScore: number;
  riskLevel: RiskLevel;
  passedChecksCount: number;
  failedChecksCount: number;
  pendingChecksCount: number;
  criticalFlags: string[];
  checks: ComplianceCheck[];
}

export class ComplianceScorer {
  /**
   * Deterministically calculates overall score, risk level, and critical flags.
   * Gemini or AI models NEVER alter this calculation.
   */
  public static computeScore(
    bidId: string,
    evaluations: PolicyEvaluationResult[]
  ): ScoreComputationResult {
    let totalAchieved = 0;
    let totalWeight = 0;
    let passedCount = 0;
    let failedCount = 0;
    let pendingCount = 0;
    const criticalFlags: string[] = [];

    const checks: ComplianceCheck[] = evaluations.map((e) => {
      totalAchieved += e.score;
      totalWeight += e.weight;

      if (e.status === 'COMPLIANT' || e.status === 'EXEMPTED') {
        passedCount++;
      } else if (e.status === 'REQUIRES_MANUAL_REVIEW' || e.status === 'REVIEW') {
        pendingCount++;
      } else {
        failedCount++;
      }

      if (e.severity === 'CRITICAL' && (e.status === 'NON_COMPLIANT' || e.status === 'INVALID' || e.status === 'MISSING')) {
        criticalFlags.push(...e.discrepancies);
      }

      let checkStatus: ComplianceResultStatus = 'REVIEW';
      if (e.status === 'COMPLIANT') checkStatus = 'COMPLIANT';
      else if (e.status === 'NON_COMPLIANT' || e.status === 'INVALID') checkStatus = 'NON_COMPLIANT';
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
        issuesFound: e.discrepancies,
      };
    });

    const normalizedScore = totalWeight > 0 ? Math.round((totalAchieved / totalWeight) * 100) : 0;

    // Deterministic Risk Assessment Matrix
    let riskLevel: RiskLevel = 'LOW';

    if (criticalFlags.length > 0) {
      riskLevel = 'CRITICAL';
    } else if (normalizedScore < 60 || failedCount >= 2) {
      riskLevel = 'HIGH';
    } else if (normalizedScore < 85 || pendingCount > 0 || failedCount === 1) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    return {
      overallScore: normalizedScore,
      technicalScore: normalizedScore,
      commercialScore: normalizedScore,
      riskLevel,
      passedChecksCount: passedCount,
      failedChecksCount: failedCount,
      pendingChecksCount: pendingCount,
      criticalFlags: Array.from(new Set(criticalFlags)),
      checks,
    };
  }
}
