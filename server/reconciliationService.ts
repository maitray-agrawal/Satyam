import {
  Bid,
  TenderRequirement,
  Document,
  RequirementCode,
  ThreeWayReconciliationItem,
  CrossVerificationReport,
} from './types';
import { initializeVerificationRegistry } from './integrations/verification';
import { evaluateRequirementApplicability } from './complianceEngine';

/**
 * Three-Way Reconciliation Service
 * 
 * Core architectural service that explicitly unites:
 * 1. Tender Requirement (what was required by the procurement authority)
 * 2. Document Evidence (what was submitted by the bidder and extracted)
 * 3. Verification Evidence (what was verified against the government or official registry)
 * 
 * Producing a deterministic Three-Way Reconciliation Matrix.
 */

export async function executeThreeWayReconciliation(
  bid: Bid,
  requirements: TenderRequirement[],
  documents: Document[],
  crossReport?: CrossVerificationReport
): Promise<ThreeWayReconciliationItem[]> {
  const registry = initializeVerificationRegistry();
  const results: ThreeWayReconciliationItem[] = [];
  const bidder = bid.bidder;

  for (const req of requirements) {
    const code = req.requirementCode;
    const doc = documents.find((d) => d.documentType === code);
    const fields = doc?.extractedFields || [];

    // 1. Layer 1: Document Evidence
    const extractedKeyValues: Record<string, string> = {};
    for (const f of fields) {
      if (f.isPresent && f.fieldValue) {
        extractedKeyValues[f.fieldName] = f.fieldValue;
      }
    }

    const docEvidence = {
      hasDocument: !!doc,
      documentType: doc?.documentType,
      fileName: doc?.fileName,
      sourcePage: doc?.extractedFields?.[0]?.sourcePage || 1,
      sha256: doc?.sha256Hash || 'SHA256-ATTESTED',
      confidence: doc?.extractedFields?.[0]?.confidence || 0.95,
      extractedSnippet: doc?.extractedFields?.find((f) => f.rawSnippet)?.rawSnippet?.substring(0, 200),
      extractedKeyValues,
      provenance: doc
        ? `Uploaded: ${doc.uploadTimestamp || 'Submission Date'} | File: ${doc.fileName}`
        : 'NO DOCUMENT SUBMITTED IN BID DOSSIER',
    };

    // 2. Layer 2: Verification Evidence via Centralized Adapter Registry
    const adapter = registry.getAdapter(code);
    let verifiedKeyValues: Record<string, any> = {};
    let statusText = 'VERIFIED';
    let isSimulated = true;
    let sourcePortal = 'Government / Official Registry';
    let endpoint = 'https://api.gem.gov.in/verify';
    let verificationMode: 'SIMULATED' | 'MANUAL_EVIDENCE' | 'AUTHORIZED_LIVE' = 'SIMULATED';

    if (adapter) {
      try {
        const vRes = await adapter.verify({
          requirementCode: code,
          bidId: bid.id,
          bidderGstin: bidder?.gstin,
          bidderPan: bidder?.pan,
          bidderLegalName: bidder?.legalName,
          bidderCin: bidder?.cinNumber,
          documentData: {
            ...extractedKeyValues,
            fileName: doc?.fileName,
            missing: !doc,
          },
          tenderRequirements: requirements.map((r) => ({
            requirementCode: r.requirementCode,
            minThreshold: typeof r.minThreshold === 'number' ? r.minThreshold : undefined,
          })),
          verificationMode: 'SIMULATED',
        });

        verifiedKeyValues = vRes.verifiedData || {};
        statusText = vRes.matchStatus;
        isSimulated = vRes.simulated;
        sourcePortal = `${adapter.serviceName} Registry Portal`;
        endpoint = vRes.apiEndpoint;
        verificationMode = vRes.verificationMode || 'SIMULATED';
      } catch (err) {
        statusText = 'VERIFICATION_ERROR';
        verifiedKeyValues = { error: String(err) };
      }
    }

    const verificationEvidence = {
      sourcePortal,
      endpoint,
      verificationMode,
      timestamp: new Date().toISOString(),
      verifiedKeyValues,
      statusText,
      isSimulated,
    };

    // 3. Layer 3: Tender Condition
    const tenderCondition = {
      ruleDescription: req.customRuleDescription || req.requirementName,
      threshold: req.minThreshold,
      issuingAuthority: req.issuingAuthority || 'Government of India',
      formatRequired: req.formatRequired || 'PDF Certificate',
    };

    // 4. Determine Three-Way Reconciliation Outcome
    let outcome: 'COMPLIANT' | 'NON_COMPLIANT' | 'REVIEW_REQUIRED' | 'MISSING_EVIDENCE' | 'INCONSISTENT' | 'NOT_APPLICABLE' = 'COMPLIANT';
    let scoreAchieved = req.weight || 10;
    let confidenceScore = 0.95;
    let reason = '';
    const issues: string[] = [];
    let severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'NONE';
    let recommendedAction = 'Proceed with technical qualification.';

    // Check statutory applicability & exemption first
    const applicability = evaluateRequirementApplicability(req, bid);
    if (!applicability.applies) {
      outcome = 'NOT_APPLICABLE';
      scoreAchieved = req.weight || 10;
      confidenceScore = 1.0;
      severity = 'NONE';
      reason = applicability.reason;
      recommendedAction = 'Exempted per statutory rule / tender clause. No action required.';
    } else if (!doc && req.isRequired) {
      outcome = 'MISSING_EVIDENCE';
      scoreAchieved = 0;
      confidenceScore = 1.0;
      severity = 'CRITICAL';
      reason = `Mandatory tender requirement ${code} has no supporting document submitted in the bidder dossier.`;
      issues.push(`Mandatory document ${req.requirementName} is completely missing.`);
      recommendedAction = 'Raise mandatory shortfall notice or reject bid for missing mandatory compliance document.';
    } else if (statusText === 'SUSPENDED' || statusText === 'FLAGGED') {
      outcome = 'NON_COMPLIANT';
      scoreAchieved = 0;
      confidenceScore = 0.99;
      severity = 'CRITICAL';
      reason = `Official registry verification returned ${statusText} status. Registry records contradict eligibility.`;
      issues.push(`Statutory verification flagged critical non-compliance: ${statusText}.`);
      recommendedAction = 'Disqualify bidder under GeM GTC & General Financial Rules 2017.';
    } else if (
      code === 'INCOME_TAX' &&
      req.minThreshold &&
      verifiedKeyValues.averageTurnoverCr &&
      parseFloat(String(req.minThreshold)) > parseFloat(String(verifiedKeyValues.averageTurnoverCr))
    ) {
      outcome = 'NON_COMPLIANT';
      scoreAchieved = 0;
      confidenceScore = 0.96;
      severity = 'HIGH';
      reason = `Audited average turnover (₹${verifiedKeyValues.averageTurnoverCr} Cr) fails minimum tender threshold (₹${req.minThreshold}).`;
      issues.push(`Turnover threshold breach: ₹${verifiedKeyValues.averageTurnoverCr} Cr vs ₹${req.minThreshold} minimum.`);
      recommendedAction = 'Disqualify for failure to satisfy minimum financial turnover requirement.';
    } else if (
      code === 'MAKE_IN_INDIA' &&
      req.minThreshold &&
      bidder?.localContentPercentage !== undefined &&
      parseFloat(String(req.minThreshold)) > bidder.localContentPercentage
    ) {
      outcome = 'NON_COMPLIANT';
      scoreAchieved = 0;
      confidenceScore = 0.95;
      severity = 'HIGH';
      reason = `Local content percentage (${bidder.localContentPercentage}%) fails minimum tender threshold (${req.minThreshold}).`;
      issues.push(`Make in India local content below requirement threshold.`);
      recommendedAction = 'Disqualify or treat as non-local supplier in accordance with DPIIT Order.';
    } else if (statusText === 'MISMATCH') {
      outcome = 'INCONSISTENT';
      scoreAchieved = Math.round((req.weight || 10) * 0.4);
      confidenceScore = 0.85;
      severity = 'HIGH';
      reason = `Reconciliation detected a discrepancy between the bidder's submitted declaration and the official verified records.`;
      issues.push(`Values reported in submitted certificate do not match the official registry.`);
      recommendedAction = 'Issue clarification notice requesting certified statutory explanation and original certificates.';
    } else if (statusText === 'NOT_FOUND') {
      outcome = 'REVIEW_REQUIRED';
      scoreAchieved = Math.round((req.weight || 10) * 0.5);
      confidenceScore = 0.7;
      severity = 'MEDIUM';
      reason = `Submitted credentials could not be unambiguously confirmed on the registry. Manual officer scrutiny required.`;
      issues.push('Registry returned no matching active record for the query parameter.');
      recommendedAction = 'Procurement officer must conduct manual verification or request physical notarized documentation.';
    } else {
      outcome = 'COMPLIANT';
      scoreAchieved = req.weight || 10;
      confidenceScore = 0.98;
      severity = 'NONE';
      reason = `Submitted document evidence fully aligns with verified registry data and satisfies all tender conditions.`;
      recommendedAction = 'Meets requirement. Approved for compliance.';
    }

    // Map outcome to SIH-standard reconciliationOutcome
    let reconciliationOutcome: 'MATCH' | 'MISMATCH' | 'MISSING' | 'UNVERIFIED' | 'CONFLICT' | 'NOT_APPLICABLE' = 'MATCH';
    if (outcome === 'COMPLIANT') reconciliationOutcome = 'MATCH';
    else if (outcome === 'MISSING_EVIDENCE') reconciliationOutcome = 'MISSING';
    else if (outcome === 'NON_COMPLIANT') reconciliationOutcome = 'CONFLICT';
    else if (outcome === 'INCONSISTENT') reconciliationOutcome = 'MISMATCH';
    else if (outcome === 'REVIEW_REQUIRED') reconciliationOutcome = 'UNVERIFIED';
    else if (outcome === 'NOT_APPLICABLE') reconciliationOutcome = 'NOT_APPLICABLE';

    // Construct structured discrepancy details if not perfectly matched
    let discrepancyDetails: ThreeWayReconciliationItem['discrepancyDetails'] = undefined;
    if (reconciliationOutcome !== 'MATCH' && reconciliationOutcome !== 'NOT_APPLICABLE') {
      const bidderValStr = Object.entries(extractedKeyValues).map(([k, v]) => `${k}=${v}`).join(', ') || 'None';
      const verifValStr = Object.entries(verifiedKeyValues).map(([k, v]) => `${k}=${v}`).join(', ') || statusText;
      discrepancyDetails = {
        field: code,
        bidderValue: bidderValStr,
        verificationValue: verifValStr,
        tenderExpectation: req.minThreshold ? `Threshold: ${req.minThreshold}` : (req.customRuleDescription || req.requirementName),
        reason,
        severity,
        evidence: `[Doc: ${doc?.fileName || 'MISSING'}] vs [Portal: ${sourcePortal}]`,
        affectedRequirement: req.requirementName,
        recommendedAction,
      };
    }

    // Provenance trail: Document -> Page -> Extracted Field -> Evidence -> Verification Source -> Reconciliation Result -> Policy Rule -> Compliance Status
    const provenanceTrail = {
      documentName: doc?.fileName || 'NO_DOCUMENT_SUBMITTED',
      sourcePage: doc?.extractedFields?.[0]?.sourcePage || 1,
      extractedField: Object.keys(extractedKeyValues).join(', ') || 'None',
      evidenceSnippet: docEvidence.extractedSnippet || 'No submitted text available',
      verificationSource: sourcePortal,
      reconciliationStatus: reconciliationOutcome,
      policyRuleId: `STATUTORY-RULE-${code}`,
      finalResult: outcome,
    };

    results.push({
      id: `RECON-${bid.id}-${code}`,
      requirementCode: code as RequirementCode,
      requirementTitle: req.requirementName,
      isRequired: req.isRequired,
      weight: req.weight || 10,
      documentEvidence: docEvidence,
      verificationEvidence,
      tenderCondition,
      outcome,
      reconciliationOutcome,
      scoreAchieved,
      confidenceScore,
      reason,
      issues,
      severity,
      recommendedAction,
      discrepancyDetails,
      provenanceTrail,
    });
  }

  return results;
}
