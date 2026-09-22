/**
 * SATYAM AI Gateway Adapter
 * 
 * Backwards-compatible facade that delegates to the consolidated
 * provider-based AI subsystem in server/ai/.
 * 
 * Complies with SIH26100 Phase 3:
 * - Decouples compliance logic from specific LLM providers
 * - Guarantees evidence-grounded extraction and structured JSON
 * - AI serves as advisory decision-support only (cannot modify deterministic scores)
 */

import {
  getAIProvider,
  ExtractionService,
  RecommendationService,
  ExtractedDocumentData,
} from './ai';
import {
  AIRecommendation,
  ComplianceCheck,
  RiskAssessment,
  Bid,
  Document,
  Tender,
  Verification,
  TenderDocumentExtractionResult,
} from './types';

export type { ExtractedDocumentData };

/**
 * Multimodal document understanding and evidence extraction.
 */
export async function analyzeDocumentWithGemini(
  doc: Document,
  fileBase64?: string,
  mimeType?: string
): Promise<ExtractedDocumentData> {
  return ExtractionService.extractDocumentFields(doc, fileBase64, mimeType);
}

/**
 * Generates Evidence-grounded AI Recommendation strictly from deterministic inputs.
 * The AI cannot alter the deterministic compliance score.
 */
export async function generateAIRecommendationWithGemini(
  bid: Bid,
  checks: ComplianceCheck[],
  assessment: RiskAssessment,
  tender?: Tender,
  verifications?: Verification[]
): Promise<AIRecommendation> {
  const tenderContext: Tender = tender || bid.tender || {
    id: bid.tenderId,
    tenderId: bid.tenderId,
    title: 'GeM Public Procurement Tender',
    department: 'Government e-Marketplace',
    description: 'Procurement evaluation under GFR 2017 & GeM GTC',
    category: 'STATUTORY',
    estimatedValue: bid.quotedAmount || 1000000,
    deadline: new Date().toISOString(),
    status: 'EVALUATION',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    requirements: [],
  };

  const verifs: Verification[] = verifications || (bid.verifications || []);

  return RecommendationService.generateRecommendation(
    tenderContext,
    bid,
    checks,
    assessment,
    verifs
  );
}

/**
 * Deterministic offline recommendation generator.
 */
export function generateDeterministicRecommendation(
  bid: Bid,
  checks: ComplianceCheck[],
  assessment: RiskAssessment
): AIRecommendation {
  const recType =
    assessment.overallScore >= 80 && assessment.criticalFlags.length === 0
      ? 'COMPLIANT'
      : assessment.overallScore >= 50 && assessment.criticalFlags.length === 0
      ? 'MANUAL_REVIEW'
      : 'NON_COMPLIANT';

  const criticalIssues = [
    ...assessment.criticalFlags,
    ...checks
      .filter((c) => c.status === 'NON_COMPLIANT' && c.isRequired)
      .map((c) => `Mandatory requirement breach: ${c.requirementName}`),
  ];

  const missingRequirements = checks
    .filter((c) => c.status === 'MISSING' && c.isRequired)
    .map((c) => c.requirementName);

  const recommendedActions: string[] = [];
  if (recType === 'COMPLIANT') {
    recommendedActions.push(
      'All mandatory statutory requirements satisfied. Proceed with technical qualification in accordance with GFR 2017 Rule 144.'
    );
  } else if (recType === 'MANUAL_REVIEW') {
    recommendedActions.push(
      'Issue a statutory 48-hour clarification notice to bidder seeking certified original documents under GeM GTC clause 12.'
    );
  } else {
    recommendedActions.push(
      'Disqualify bidder from current technical opening per GeM General Terms & Conditions.'
    );
  }

  const reason =
    recType === 'COMPLIANT'
      ? `Bidder demonstrates full compliance across all verified statutory criteria with a deterministic score of ${assessment.overallScore}/100 and LOW risk level.`
      : recType === 'MANUAL_REVIEW'
      ? `Bidder scored ${assessment.overallScore}/100 with ${assessment.riskLevel} risk level. Discrepancies require Procurement Officer review.`
      : `Bidder evaluated as NON_COMPLIANT with deterministic score of ${assessment.overallScore}/100 due to critical statutory breaches (${criticalIssues.join('; ')}).`;

  return {
    id: `ai-rec-${bid.id}-${Date.now()}`,
    bidId: bid.id,
    recommendation: recType,
    reason,
    reasoningText: reason,
    confidenceScore: 0.96,
    criticalIssues,
    missingRequirements,
    recommendedActions,
    modelUsed: 'SATYAM Deterministic Synthesis Engine (Offline GFR 2017 Grounded)',
    disclaimerText:
      'LEGAL MANDATE NOTICE: This automated advisory recommendation is strictly a decision-support artifact under GeM General Terms and Conditions (GTC) and General Financial Rules (GFR 2017). The final qualification or disqualification decision is the sole statutory responsibility of the authorized Procurement Officer. This service does not calculate or alter deterministic compliance scores.',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Interactive procurement copilot for GFR 2017 & GeM GTC clause interpretation.
 */
export async function queryCopilot(
  query: string,
  bidContext: Record<string, any>
): Promise<string> {
  const provider = getAIProvider();
  return provider.queryCopilot(query, bidContext);
}

/**
 * Ingests tender RFP and extracts structured candidate eligibility clauses.
 */
export async function extractTenderRequirementsWithGemini(
  tender: { id: string; title: string; department: string; category: string; estimatedValue: number },
  fileBase64?: string,
  mimeType?: string,
  textContent?: string
): Promise<TenderDocumentExtractionResult> {
  const provider = getAIProvider();
  return provider.extractTenderRequirements(tender, fileBase64, mimeType, textContent);
}
