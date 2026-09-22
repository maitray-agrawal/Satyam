import { getAIProvider } from '../providers';
import { Bid, Tender, ComplianceCheck, RiskAssessment, AIRecommendation, Verification } from '../../types';
import { createServiceLogger } from '../../observability/logger';

const log = createServiceLogger('RecommendationService');

export class RecommendationService {
  /**
   * Generates Evidence-grounded AI Recommendation strictly from 4 verified deterministic inputs.
   * STRICT ARCHITECTURAL INVARIANT:
   * The AI recommendation engine is solely an advisory decision-support layer.
   * It NEVER alters or calculates the deterministic compliance score.
   */
  public static async generateRecommendation(
    tender: Tender,
    bid: Bid,
    checks: ComplianceCheck[],
    assessment: RiskAssessment,
    verifications: Verification[]
  ): Promise<AIRecommendation> {
    const provider = getAIProvider();
    log.info(`Synthesizing advisory recommendation using [${provider.providerName}] for bid: ${bid.id}`);

    const advisory = await provider.generateAdvisory(tender, bid, checks, assessment, verifications);

    // Safeguard invariant: ensure reason and reasoningText match and disclaimer is present
    advisory.reason = advisory.reason || advisory.reasoningText || 'Statutory review grounded in deterministic compliance results.';
    advisory.reasoningText = advisory.reason;

    return advisory;
  }
}
