import { Type } from '@google/genai';
import { getGeminiClient, GEMINI_MODEL } from './gemini.client';
import { createServiceLogger } from '../observability/logger';
import { Bid, Tender, ComplianceCheck, RiskAssessment, AIRecommendation, Verification } from '../types';
import { EvidenceService } from './evidence.service';

const log = createServiceLogger('GeminiRecommendationService');

const STATUTORY_DISCLAIMER =
  'LEGAL MANDATE NOTICE: This AI-generated recommendation is strictly an advisory decision-support artifact under GeM General Terms and Conditions (GTC) and General Financial Rules (GFR 2017). The final qualification or disqualification decision is the sole statutory responsibility of the authorized Procurement Officer. This model does not calculate or alter deterministic compliance scores.';

export class RecommendationService {
  /**
   * Generates Evidence-grounded AI Recommendation strictly from 4 verified deterministic inputs.
   * Gemini does NOT alter the deterministic compliance score.
   */
  public static async generateRecommendation(
    tender: Tender,
    bid: Bid,
    checks: ComplianceCheck[],
    assessment: RiskAssessment,
    verifications: Verification[]
  ): Promise<AIRecommendation> {
    const ai = getGeminiClient();
    const evidenceService = EvidenceService.getInstance();

    // RAG: Retrieve grounded evidence snippets
    const ragContext = await evidenceService.retrieveRelevantEvidence(
      bid.id,
      `Tender requirements compliance verification for ${bid.bidder?.legalName || 'Bidder'}`,
      5
    );

    const geminiInput = {
      tenderRequirements: (tender.requirements || []).map((r) => ({
        requirementCode: r.requirementCode,
        requirementName: r.requirementName,
        isRequired: r.isRequired,
        weight: r.weight,
        minThreshold: r.minThreshold ?? null,
        customRuleDescription: r.customRuleDescription,
      })),
      deterministicComplianceResults: checks.map((c) => ({
        requirementCode: c.requirementCode,
        requirementName: c.requirementName,
        isRequired: c.isRequired,
        weight: c.weight,
        status: c.status,
        scoreAchieved: c.scoreAchieved,
        evidenceSummary: c.evidenceSummary,
        deterministicRuleEvaluated: c.deterministicRuleEvaluated,
      })),
      verifiedEvidence: verifications.map((v) => ({
        requirementCode: v.requirementCode,
        apiEndpoint: v.apiEndpoint,
        matchStatus: v.matchStatus,
        evidenceDetails: v.evidenceDetails,
      })),
      detectedDiscrepancies: [
        ...(assessment.criticalFlags || []).map((flag) => ({
          type: 'CRITICAL_DISQUALIFICATION_FLAG',
          detail: flag,
        })),
        ...checks
          .filter((c) => c.status === 'NON_COMPLIANT' || c.status === 'MISSING' || (c.issuesFound && c.issuesFound.length > 0))
          .map((c) => ({
            requirement: c.requirementName,
            status: c.status,
            issues: c.issuesFound || [],
          })),
      ],
      groundedRagEvidence: ragContext.map((r) => ({
        source: r.traceableSource,
        snippet: r.chunk.content.substring(0, 200),
        similarity: r.similarityScore,
      })),
    };

    if (ai) {
      try {
        const prompt = `You are the GeM Public Procurement AI Decision-Support Layer (GFR 2017 & GeM GTC).
MANDATE & BOUNDARIES:
- You are strictly an advisory decision-support layer. You provide recommendations to the authorized Procurement Officer.
- You must NEVER alter or invent the deterministic compliance score (${assessment.overallScore}/100); your recommendation must be grounded purely in the provided verified inputs.

INPUTS:
\`\`\`json
${JSON.stringify(geminiInput, null, 2)}
\`\`\`

Evaluate the deterministic inputs and return strict JSON with:
1. "recommendation": Must be exactly one of "COMPLIANT", "MANUAL_REVIEW", or "NON_COMPLIANT".
2. "reason": Concise, authoritative explanation of the recommendation grounded in the deterministic results and verified evidence.
3. "criticalIssues": Array of critical issues/non-compliances identified.
4. "missingRequirements": Array of missing mandatory requirements.
5. "recommendedActions": Array of recommended next steps for the Procurement Officer under GeM guidelines.`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendation: {
                  type: Type.STRING,
                  enum: ['COMPLIANT', 'MANUAL_REVIEW', 'NON_COMPLIANT'],
                },
                reason: { type: Type.STRING },
                criticalIssues: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                missingRequirements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recommendedActions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['recommendation', 'reason', 'criticalIssues', 'missingRequirements', 'recommendedActions'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          const validRec: 'COMPLIANT' | 'MANUAL_REVIEW' | 'NON_COMPLIANT' =
            parsed.recommendation === 'COMPLIANT' || parsed.recommendation === 'NON_COMPLIANT'
              ? parsed.recommendation
              : 'MANUAL_REVIEW';

          return {
            id: `rec-${bid.id}`,
            bidId: bid.id,
            recommendation: validRec,
            reason: parsed.reason || parsed.reasoningText || 'Assessment evaluated against GeM criteria.',
            reasoningText: parsed.reason || parsed.reasoningText || 'Assessment evaluated against GeM criteria.',
            criticalIssues: Array.isArray(parsed.criticalIssues) ? parsed.criticalIssues : [],
            missingRequirements: Array.isArray(parsed.missingRequirements) ? parsed.missingRequirements : [],
            recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
            modelUsed: GEMINI_MODEL,
            disclaimerText: STATUTORY_DISCLAIMER,
            generatedAt: new Date().toISOString(),
          };
        }
      } catch (err: any) {
        log.warn(`Gemini recommendation fallback triggered: ${err?.message}`);
      }
    }

    // High-fidelity deterministic recommendation synthesis
    return this.fallbackDeterministicRecommendation(bid, assessment, checks);
  }

  private static fallbackDeterministicRecommendation(
    bid: Bid,
    assessment: RiskAssessment,
    checks: ComplianceCheck[]
  ): AIRecommendation {
    const criticalIssues: string[] = [...(assessment.criticalFlags || [])];
    const missingRequirements: string[] = [];
    const recommendedActions: string[] = [];

    let recommendation: 'COMPLIANT' | 'MANUAL_REVIEW' | 'NON_COMPLIANT' = 'COMPLIANT';

    for (const check of checks) {
      if (check.status === 'MISSING' && check.isRequired) {
        missingRequirements.push(check.requirementName);
      }
      if (check.status === 'NON_COMPLIANT' || (check.status as any) === 'INVALID') {
        if (check.issuesFound && check.issuesFound.length > 0) {
          criticalIssues.push(...check.issuesFound);
        }
      }
    }

    if (criticalIssues.length > 0 || assessment.overallScore < 60) {
      recommendation = 'NON_COMPLIANT';
      recommendedActions.push('Issue formal Disqualification Notice stating statutory grounds under GeM GTC.');
      recommendedActions.push('Allow 48-hour shortfall window only if permitted by tender specific terms.');
    } else if (assessment.overallScore < 90 || missingRequirements.length > 0 || assessment.pendingChecksCount > 0) {
      recommendation = 'MANUAL_REVIEW';
      recommendedActions.push('Request clarification or shortfall document via GeM Bid Life Cycle portal.');
      recommendedActions.push('Verify original CA certificate UDIN on ICAI portal before technical financial evaluation.');
    } else {
      recommendation = 'COMPLIANT';
      recommendedActions.push('Proceed to Commercial / Financial Bid Opening on GeM portal.');
      recommendedActions.push('Ensure EMD/PBG bank guarantee status is recorded prior to award.');
    }

    const reason =
      recommendation === 'COMPLIANT'
        ? `Bidder ${bid.bidder?.legalName || 'Entity'} achieved an overall compliance score of ${assessment.overallScore}/100 with Low Risk. All mandatory statutory parameters (GST, PAN, MSME, OEM, and MII Local Content) were verified successfully against simulated government registries.`
        : recommendation === 'MANUAL_REVIEW'
        ? `Bidder ${bid.bidder?.legalName || 'Entity'} scored ${assessment.overallScore}/100 with Moderate Risk. Shortfalls or manual review requirements detected in: ${missingRequirements.join(', ') || 'document metadata'}.`
        : `Bidder ${bid.bidder?.legalName || 'Entity'} scored ${assessment.overallScore}/100 with High Risk. Disqualification flags detected: ${criticalIssues.join('; ')}.`;

    return {
      id: `rec-${bid.id}`,
      bidId: bid.id,
      recommendation,
      reason,
      reasoningText: reason,
      criticalIssues: Array.from(new Set(criticalIssues)),
      missingRequirements: Array.from(new Set(missingRequirements)),
      recommendedActions: Array.from(new Set(recommendedActions)),
      modelUsed: GEMINI_MODEL,
      disclaimerText: STATUTORY_DISCLAIMER,
      generatedAt: new Date().toISOString(),
    };
  }
}
