import { PolicyEngine } from './policy-engine';
import {
  GstComplianceRule,
  DebarmentBlacklistRule,
  TurnoverRule,
  OemAuthRule,
} from './rules/statutory-rules';

export * from './policy-engine';
export * from './rules/statutory-rules';
export * from './scoring/compliance-scorer';

let engineInstance: PolicyEngine | null = null;

export function initializePolicyEngine(): PolicyEngine {
  if (!engineInstance) {
    engineInstance = new PolicyEngine();
    engineInstance.registerRule(new GstComplianceRule());
    engineInstance.registerRule(new DebarmentBlacklistRule());
    engineInstance.registerRule(new TurnoverRule());
    engineInstance.registerRule(new OemAuthRule());
  }
  return engineInstance;
}
