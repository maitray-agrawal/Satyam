export { PolicyEngine } from './policy-engine';
export {
  GstComplianceRule,
  DebarmentBlacklistRule,
  TurnoverRule,
  OemAuthRule,
} from './statutory-rules';
export { ComplianceScorer } from './compliance-scorer';

import { PolicyEngine } from './policy-engine';
import {
  GstComplianceRule,
  DebarmentBlacklistRule,
  TurnoverRule,
  OemAuthRule,
} from './statutory-rules';

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
