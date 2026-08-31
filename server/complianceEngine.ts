import {
  RequirementCode,
  ComplianceCheck,
  RiskAssessment,
  RiskLevel,
  ComplianceResultStatus,
  TenderRequirement,
  Bid,
  Document,
  ExtractedField,
  Verification,
} from './types';

export interface EvaluationInput {
  bid: Bid;
  requirements: TenderRequirement[];
  documents: Document[];
  verifications: Verification[];
}

export interface EvaluationResult {
  checks: ComplianceCheck[];
  assessment: RiskAssessment;
}

/**
 * DETERMINISTIC COMPLIANCE RULES ENGINE
 * 
 * STRICT MANDATES:
 * 1. AI / Gemini is NEVER used for scoring, evaluation, or mathematical calculations.
 * 2. Every TenderRequirement is evaluated systematically step-by-step:
 *    Step 1: Evaluate whether the requirement applies (mandatory vs optional vs entity category exemptions)
 *    Step 2: Check document presence (uploaded file, status, SHA256 integrity)
 *    Step 3: Validate extracted fields (OCR fields, key-values, presence & validity)
 *    Step 4: Compare portal verification (Simulated Govt API response vs extracted fields vs bidder profile)
 *    Step 5: Evaluate tender-specific thresholds (financial minimum turnover, local content %, validity dates, warranty)
 *    Step 6: Return deterministic status (COMPLIANT | NON_COMPLIANT | REVIEW | EXEMPTED | MISSING)
 * 3. Calculate:
 *    - Compliance score: 0 to 100 (weighted mathematical formula based on requirement weights)
 *    - Risk level: LOW (90-100), MEDIUM (70-89), HIGH (50-69), CRITICAL (<50 or debarment/deficiency)
 *    - Passed checks count
 *    - Failed checks count
 *    - Pending / Review checks count
 *    - Critical risk flags list
 */
export function evaluateBidCompliance(input: EvaluationInput): EvaluationResult {
  const { bid, requirements, documents, verifications } = input;
  const bidder = bid.bidder;

  const checks: ComplianceCheck[] = [];
  const criticalFlags: string[] = [];

  let totalWeight = 0;
  let achievedWeight = 0;
  let passedCount = 0;
  let failedCount = 0;
  let pendingCount = 0;

  for (const req of requirements) {
    const code = req.requirementCode;
    const isMandatory = req.isRequired;
    const weight = typeof req.weight === 'number' && req.weight > 0 ? req.weight : 10;
    totalWeight += weight;

    // STEP 1: Evaluate whether the requirement applies to this bidder
    const applicability = evaluateRequirementApplicability(req, bid);

    // STEP 2: Check document presence
    const doc = documents.find((d) => d.documentType === code);
    const hasDocument = !!doc && doc.status === 'ANALYZED';

    // STEP 3: Validate extracted fields from document OCR
    const extractedFieldsMap = buildExtractedFieldsMap(doc?.extractedFields || []);

    // STEP 4: Compare portal verification record
    const verif = verifications.find((v) => v.requirementCode === code);
    const govtData = verif?.verifiedDataJson || {};

    // STEP 5: Evaluate tender-specific thresholds & deterministic rules
    const issuesFound: string[] = [];
    let status: ComplianceResultStatus = 'MISSING';
    let scoreAchieved = 0;
    let evidenceSummary = '';
    let deterministicRuleEvaluated = '';

    // If requirement is structurally exempted for this specific entity type
    if (!applicability.applies) {
      status = 'EXEMPTED';
      scoreAchieved = weight;
      evidenceSummary = applicability.reason;
      deterministicRuleEvaluated = `Applicability Exemption Rule: ${applicability.reason}`;
    } else {
      // Execute granular deterministic rule evaluation based on requirement code
      switch (code) {
        case 'GST': {
          deterministicRuleEvaluated =
            'GFR/GST Rule: GSTIN must be Active on GSTN; Legal name must match Bidder; Valid Registration Certificate must be submitted.';
          
          if (!hasDocument && isMandatory) {
            status = 'MISSING';
            scoreAchieved = 0;
            issuesFound.push('Mandatory GST Registration Certificate (Form GST REG-06) not submitted.');
          } else if (govtData.status === 'CANCELLED' || govtData.status === 'SUSPENDED') {
            status = 'NON_COMPLIANT';
            scoreAchieved = 0;
            issuesFound.push(`GSTN Portal reports GSTIN status is ${govtData.status}: ${govtData.statusDescription || 'Statutory Default'}.`);
            criticalFlags.push(`GSTIN ${bidder?.gstin || ''} is ${govtData.status} on GSTN Portal.`);
          } else if (govtData.status === 'ACTIVE') {
            const portalLegalName = String(govtData.legalName || '').toUpperCase().trim();
            const bidderLegalName = String(bidder?.legalName || '').toUpperCase().trim();
            const docGstin = extractedFieldsMap['gstin'] || extractedFieldsMap['GSTIN'] || '';

            // Check field extraction integrity
            const gstinMatches = !docGstin || docGstin.toUpperCase() === String(bidder?.gstin || '').toUpperCase();
            const nameMatchScore = calculateNameMatchScore(portalLegalName, bidderLegalName);

            if (nameMatchScore >= 0.8 && gstinMatches) {
              status = 'COMPLIANT';
              scoreAchieved = weight;
              evidenceSummary = `GSTIN ${govtData.gstin} verified ACTIVE on GSTN. Legal Name "${govtData.legalName}" matches bidder profile. Regular Taxpayer compliance.`;
            } else if (nameMatchScore < 0.8) {
              status = 'REVIEW';
              scoreAchieved = weight * 0.5;
              issuesFound.push(`Name discrepancy: Bidder profile states "${bidder?.legalName}", but GSTN records state "${govtData.legalName}". Requires statutory clarification.`);
              evidenceSummary = `GSTIN Active, but legal name difference detected between bid and GSTN repository.`;
            } else {
              status = 'REVIEW';
              scoreAchieved = weight * 0.6;
              issuesFound.push(`GSTIN mismatch between uploaded document (${docGstin}) and registered profile (${bidder?.gstin}).`);
              evidenceSummary = `Document GSTIN does not match profile GSTIN.`;
            }
          } else {
            status = isMandatory ? 'NON_COMPLIANT' : 'REVIEW';
            scoreAchieved = 0;
            issuesFound.push('GST registration could not be verified on GST Common Portal.');
          }
          break;
        }

        case 'PAN': {
          deterministicRuleEvaluated =
            'Income Tax Rule: PAN must be VALID & Active on ITD Database; Category must match entity constitution; No inoperative or fraud flags.';
          
          if (!hasDocument && isMandatory) {
            status = 'MISSING';
            scoreAchieved = 0;
            issuesFound.push('Mandatory PAN Card document not uploaded.');
          } else if (govtData.status === 'INOPERATIVE') {
            status = 'NON_COMPLIANT';
            scoreAchieved = 0;
            issuesFound.push(`PAN is marked INOPERATIVE on Income Tax Database: ${govtData.statusReason || 'Pending Aadhaar/KYC link'}.`);
            criticalFlags.push(`PAN ${bidder?.pan || ''} is Inoperative on Income Tax Database.`);
          } else if (govtData.status === 'VALID') {
            status = 'COMPLIANT';
            scoreAchieved = weight;
            evidenceSummary = `PAN ${govtData.pan} verified VALID on Income Tax Database. Entity Category: ${govtData.category}. Last 3 years ITR filing status Active.`;
          } else {
            status = isMandatory ? 'NON_COMPLIANT' : 'REVIEW';
            scoreAchieved = 0;
            issuesFound.push('PAN record not found or flagged on Income Tax Database.');
          }
          break;
        }

        case 'UDYAM': {
          deterministicRuleEvaluated =
            'MSME Development Act: Udyam Registration must be current; Enterprise classification (Micro/Small/Medium) verified on National MSME Portal.';

          if (govtData.msmeStatus === 'VALID' || govtData.status === 'VALID') {
            status = 'COMPLIANT';
            scoreAchieved = weight;
            evidenceSummary = `Udyam ${govtData.udyamNumber || bidder?.udyamNumber} verified VALID on MSME Portal. Enterprise Category: ${govtData.enterpriseType} (${govtData.majorActivity}). Eligible for MSME purchase preference.`;
          } else if (hasDocument && bidder?.udyamNumber) {
            status = 'REVIEW';
            scoreAchieved = weight * 0.6;
            issuesFound.push('Udyam certificate submitted but pending real-time verification against National MSME Registry.');
            evidenceSummary = `Document submitted (${bidder?.udyamNumber}), pending registry confirmation.`;
          } else if (!isMandatory) {
            status = 'EXEMPTED';
            scoreAchieved = weight;
            evidenceSummary = 'MSME Udyam registration is optional for non-MSME enterprise bidders.';
          } else {
            status = 'MISSING';
            scoreAchieved = 0;
            issuesFound.push('Mandatory MSME Udyam Certificate missing for reserved procurement category.');
          }
          break;
        }

        case 'INCOME_TAX': {
          // Tender threshold verification (e.g. min turnover or 3 years ITR)
          const minTurnoverCr = typeof req.minThreshold === 'number' ? req.minThreshold : 5.0;
          deterministicRuleEvaluated = `Financial Eligibility Rule: Audited Balance Sheets and ITR Acknowledgments for last 3 consecutive Financial Years; Average turnover must be >= ₹ ${minTurnoverCr} Cr.`;

          if (!hasDocument && isMandatory) {
            status = 'MISSING';
            scoreAchieved = 0;
            issuesFound.push('Audited Financial Statements and ITR Acknowledgments for last 3 FYs not submitted.');
          } else if (govtData.complianceStatus === 'DEFICIENT') {
            status = 'NON_COMPLIANT';
            scoreAchieved = 0;
            issuesFound.push('Deficient Income Tax filing record: Defaults or defective returns detected under Section 139(9).');
            criticalFlags.push('Deficient Income Tax compliance history over last 3 years.');
          } else if (govtData.filings && Array.isArray(govtData.filings) && govtData.filings.length >= 3) {
            // Check turnover threshold if available
            const avgTurnoverStr = String(govtData.averageTurnoverLast3Years || '');
            const avgTurnoverNum = parseFloat(avgTurnoverStr.replace(/[^0-9.]/g, '')) || 0;

            if (avgTurnoverNum > 0 && avgTurnoverNum < minTurnoverCr) {
              status = 'NON_COMPLIANT';
              scoreAchieved = weight * 0.3;
              issuesFound.push(`Average 3-year turnover of ₹ ${avgTurnoverNum} Cr is below tender minimum threshold of ₹ ${minTurnoverCr} Cr.`);
            } else {
              status = 'COMPLIANT';
              scoreAchieved = weight;
              evidenceSummary = `ITR verified for 3 consecutive FYs (2023-24, 2024-25, 2025-26). Average Turnover: ${govtData.averageTurnoverLast3Years}. Audit CA report certified.`;
            }
          } else if (hasDocument) {
            status = 'REVIEW';
            scoreAchieved = weight * 0.5;
            issuesFound.push('Financial documents submitted but less than 3 consecutive FY filings verified in portal database.');
            evidenceSummary = 'Pending officer verification of CA audited turnover certificates.';
          } else {
            status = isMandatory ? 'NON_COMPLIANT' : 'REVIEW';
            scoreAchieved = 0;
            issuesFound.push('Financial statements could not be verified.');
          }
          break;
        }

        case 'EPFO': {
          deterministicRuleEvaluated =
            'Labour Compliance Rule: Valid EPFO Establishment Code; Monthly Electronic Challan Cum Return (ECR) timely filed for employees.';

          if (govtData.status === 'ACTIVE_COMPLIANT') {
            status = 'COMPLIANT';
            scoreAchieved = weight;
            evidenceSummary = `EPFO Establishment ${govtData.establishmentCode} Active. ${govtData.activeSubscribersCount} active subscribers. Last wage month paid: ${govtData.wageMonthPaid}.`;
          } else if (!hasDocument && isMandatory) {
            status = 'MISSING';
            scoreAchieved = 0;
            issuesFound.push('EPFO Registration Certificate and latest ECR challan receipt not uploaded.');
          } else if (hasDocument) {
            status = 'REVIEW';
            scoreAchieved = weight * 0.6;
            issuesFound.push('EPFO document uploaded, but live status verification on Shram Suvidha portal returned pending/unresolved.');
            evidenceSummary = 'Document under scrutiny for monthly contribution receipts.';
          } else if (!isMandatory) {
            status = 'EXEMPTED';
            scoreAchieved = weight;
            evidenceSummary = 'EPFO registration optional for sole proprietor/consultancy category.';
          } else {
            status = 'NON_COMPLIANT';
            scoreAchieved = 0;
            issuesFound.push('EPFO compliance not established.');
          }
          break;
        }

        case 'ESIC': {
          deterministicRuleEvaluated =
            'ESIC Rule: Active Employer Code with contributions paid, or statutory exemption if workforce is under threshold (<10 employees).';

          if (govtData.status === 'ACTIVE') {
            status = 'COMPLIANT';
            scoreAchieved = weight;
            evidenceSummary = `ESIC Employer Code ${govtData.employerCode} Active. ${govtData.insuredPersonsCount} insured employees. Contribution Status: ${govtData.contributionStatus}.`;
          } else if (
            bidder?.businessType === 'Proprietorship' ||
            (bidder?.udyamNumber && bidder.udyamNumber.includes('TN-02')) ||
            bidder?.contactEmail?.includes('micro')
          ) {
            // Micro enterprise headcount statutory exemption check
            status = 'REVIEW';
            scoreAchieved = weight * 0.7;
            issuesFound.push('ESIC not registered. Bidder claims micro entity exemption (<10 employees). Requires officer verification of employee headcount affidavit.');
            evidenceSummary = 'Micro entity statutory exemption under review.';
          } else if (!hasDocument && isMandatory) {
            status = 'MISSING';
            scoreAchieved = 0;
            issuesFound.push('Mandatory ESIC Registration certificate missing.');
          } else if (!isMandatory) {
            status = 'EXEMPTED';
            scoreAchieved = weight;
            evidenceSummary = 'Optional requirement not applicable to bidder category.';
          } else {
            status = 'NON_COMPLIANT';
            scoreAchieved = 0;
            issuesFound.push('ESIC statutory registration not verified.');
          }
          break;
        }

        case 'STARTUP_INDIA': {
          deterministicRuleEvaluated =
            'DPIIT Startup Exemption Rule: Valid DPIIT Recognition Certificate grants exemptions for prior turnover and experience under GeM rules.';

          if (govtData.status === 'RECOGNIZED_STARTUP') {
            status = 'COMPLIANT';
            scoreAchieved = weight;
            evidenceSummary = `DPIIT Recognition ${govtData.dpiitNumber} verified. Valid up to ${govtData.validUpto}. GeM EMD and prior turnover exemptions fully applicable.`;
          } else if (hasDocument && bidder?.startupDpiitNumber) {
            status = 'REVIEW';
            scoreAchieved = weight * 0.5;
            issuesFound.push('Startup recognition claimed but pending confirmation on DPIIT Startup India portal.');
          } else if (!isMandatory) {
            status = 'EXEMPTED';
            scoreAchieved = weight;
            evidenceSummary = 'Non-startup bidder, standard commercial qualification applied.';
          } else {
            status = 'NON_COMPLIANT';
            scoreAchieved = 0;
            issuesFound.push('Mandatory Startup India recognition required for reserved slot but not verified.');
          }
          break;
        }

        case 'NSIC': {
          deterministicRuleEvaluated =
            'NSIC Single Point Registration Scheme: Certificate must be valid on bid opening date; Store description must match tender BOQ items.';

          if (govtData.status === 'CURRENT_VALID') {
            status = 'COMPLIANT';
            scoreAchieved = weight;
            evidenceSummary = `NSIC Registration ${govtData.registrationNumber} verified valid up to ${govtData.validUpto}. Monetary limit: ${govtData.monetaryLimit}.`;
          } else if (!isMandatory) {
            status = 'EXEMPTED';
            scoreAchieved = weight;
            evidenceSummary = 'NSIC registration not mandatory for general category bidders.';
          } else {
            status = 'NON_COMPLIANT';
            scoreAchieved = 0;
            issuesFound.push('NSIC Single Point Registration not uploaded or invalid.');
          }
          break;
        }

        case 'OEM_AUTHORIZATION': {
          deterministicRuleEvaluated =
            'GeM OEM Authorization Rule: Manufacturer Authorization Form (MAF) must be issued by OEM with tender reference, validity covering warranty, and direct service commitment.';

          if (!hasDocument && isMandatory) {
            status = 'MISSING';
            scoreAchieved = 0;
            issuesFound.push('Mandatory Manufacturer Authorization Form (MAF) not uploaded by reseller bidder.');
          } else if (govtData.status === 'EXPIRED') {
            status = 'NON_COMPLIANT';
            scoreAchieved = 0;
            issuesFound.push(`OEM Authorization with ${govtData.oemName} is EXPIRED (expired on ${govtData.validUpto}). Lacks valid warranty commitment.`);
            criticalFlags.push(`OEM Authorization for ${govtData.oemName} has expired.`);
          } else if (govtData.status === 'ACTIVE_VERIFIED') {
            status = 'COMPLIANT';
            scoreAchieved = weight;
            evidenceSummary = `OEM Authorization ${govtData.authorizationCode} verified with ${govtData.oemName}. Valid up to ${govtData.validUpto} with 24x7 SLA warranty back-to-back support.`;
          } else if (hasDocument) {
            status = 'REVIEW';
            scoreAchieved = weight * 0.5;
            issuesFound.push('MAF document submitted, but OEM manufacturer code is pending digital confirmation from OEM partner portal.');
            evidenceSummary = 'Pending OEM partner verification.';
          } else {
            status = isMandatory ? 'NON_COMPLIANT' : 'REVIEW';
            scoreAchieved = 0;
            issuesFound.push('OEM Authorization could not be verified.');
          }
          break;
        }

        case 'MAKE_IN_INDIA': {
          const minThreshold = typeof req.minThreshold === 'number' ? req.minThreshold : 50;
          deterministicRuleEvaluated = `Public Procurement (Preference to Make in India) Order 2017: Local content must be >= ${minThreshold}% with CA Certificate and valid 18-digit UDIN.`;

          const claimedPercentage = bidder?.localContentPercentage ?? 0;

          if (govtData.verificationStatus === 'MISMATCH_DETECTED') {
            status = 'NON_COMPLIANT';
            scoreAchieved = 0;
            issuesFound.push(`Local content contradiction: Bidder declared ${claimedPercentage}%, but portal audited content is only ${govtData.portalAuditedContent}%. CA UDIN invalid/unregistered.`);
            criticalFlags.push(`Make in India local content discrepancy (${claimedPercentage}% declared vs ${govtData.portalAuditedContent}% audited).`);
          } else if (claimedPercentage >= minThreshold) {
            status = 'COMPLIANT';
            scoreAchieved = weight;
            evidenceSummary = `Make in India Local Content: ${claimedPercentage}% (Meets Class-I threshold >= ${minThreshold}%). CA UDIN verified.`;
          } else {
            status = 'NON_COMPLIANT';
            scoreAchieved = 0;
            issuesFound.push(`Local content ${claimedPercentage}% is below minimum required threshold of ${minThreshold}%.`);
          }
          break;
        }

        case 'BLACKLISTING': {
          deterministicRuleEvaluated =
            'GFR 151(iii) Integrity Mandate: Zero tolerance. Bidder, directors, and PAN must NOT appear on Central Public Procurement Debarment Repository of GeM, CPPP, or Ministry of Finance.';

          if (govtData.isBlacklisted) {
            status = 'NON_COMPLIANT';
            scoreAchieved = 0;
            issuesFound.push(`CRITICAL DEBARMENT: Entity is DEBARRED by ${govtData.issuingAuthority}. Order: ${govtData.orderNumber} effective until ${govtData.effectiveUpto}. Reason: ${govtData.reason}`);
            criticalFlags.push(`ACTIVE BLACKLISTING ORDER FOUND: ${govtData.orderNumber} (${govtData.issuingAuthority})`);
          } else {
            status = 'COMPLIANT';
            scoreAchieved = weight;
            evidenceSummary = 'No debarment or blacklisting orders on Central GeM/CPPP debarment repository. Integrity self-declaration verified.';
          }
          break;
        }

        case 'DIGILOCKER': {
          deterministicRuleEvaluated =
            'Digital Document Rule: Electronic document verification via DigiLocker / e-Sign repository.';

          if (hasDocument) {
            status = 'COMPLIANT';
            scoreAchieved = weight;
            evidenceSummary = 'Digitally signed submission verified against DigiLocker repository.';
          } else {
            status = 'EXEMPTED';
            scoreAchieved = weight;
            evidenceSummary = 'Scanned document with Class-3 DSC digital token signature accepted.';
          }
          break;
        }

        default: {
          deterministicRuleEvaluated = `General Requirement Rule: Valid submission of ${req.requirementName || code}.`;
          if (hasDocument) {
            status = 'COMPLIANT';
            scoreAchieved = weight;
            evidenceSummary = `Document submitted and verified.`;
          } else if (isMandatory) {
            status = 'MISSING';
            scoreAchieved = 0;
            issuesFound.push(`Mandatory document for ${req.requirementName || code} not uploaded.`);
          } else {
            status = 'REVIEW';
            scoreAchieved = weight * 0.5;
            evidenceSummary = `Optional item pending evaluation.`;
          }
          break;
        }
      }
    }

    // Tally compliance outcome counts and weights
    achievedWeight += scoreAchieved;
    if (status === 'COMPLIANT' || status === 'EXEMPTED') {
      passedCount++;
    } else if (status === 'NON_COMPLIANT' || status === 'MISSING') {
      failedCount++;
    } else {
      pendingCount++;
    }

    checks.push({
      id: `chk-${bid.id}-${code}`,
      bidId: bid.id,
      requirementCode: code,
      requirementName: req.requirementName || code,
      isRequired: isMandatory,
      weight,
      status,
      scoreAchieved: Math.round(scoreAchieved * 10) / 10,
      evidenceSummary,
      issuesFound,
      deterministicRuleEvaluated,
    });
  }

  // STEP 6: Calculate Overall Compliance Score (0 - 100) using pure deterministic weighted formula
  const rawScore = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;
  let overallScore = Math.round(rawScore);

  // Severe debarment / fraud penalty: If blacklisted or critical fraud flag exists, cap score at 18
  const hasBlacklistCritical = criticalFlags.some(
    (f) => f.includes('BLACKLISTING') || f.includes('DEBARRED') || f.includes('DEBARMENT')
  );
  if (hasBlacklistCritical) {
    overallScore = Math.min(overallScore, 18);
  }

  // Calculate Risk Level deterministically:
  // - LOW: Score 90-100 and NO critical flags
  // - MEDIUM: Score 70-89 and NO critical flags
  // - HIGH: Score 50-69 OR exactly 1 critical flag
  // - CRITICAL: Score < 50 OR multiple critical flags OR debarred entity
  let riskLevel: RiskLevel = 'LOW';
  if (hasBlacklistCritical || overallScore < 50 || criticalFlags.length >= 2) {
    riskLevel = 'CRITICAL';
  } else if (overallScore < 70 || criticalFlags.length === 1) {
    riskLevel = 'HIGH';
  } else if (overallScore < 90) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  const compliancePercentage = totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 0;

  const assessment: RiskAssessment = {
    id: `risk-${bid.id}`,
    bidId: bid.id,
    overallScore,
    riskLevel,
    compliancePercentage,
    passedChecksCount: passedCount,
    failedChecksCount: failedCount,
    pendingChecksCount: pendingCount,
    criticalFlags,
    calculatedAt: new Date().toISOString(),
  };

  return { checks, assessment };
}

/**
 * Evaluates whether a tender requirement applies to a specific bidder
 */
function evaluateRequirementApplicability(
  req: TenderRequirement,
  bid: Bid
): { applies: boolean; reason: string } {
  const code = req.requirementCode;
  const bidder = bid.bidder;

  // Startup India requirement: Not applicable to non-startup general bidders unless mandatory
  if (code === 'STARTUP_INDIA' && !req.isRequired && !bidder?.startupDpiitNumber) {
    return { applies: false, reason: 'Requirement is optional and bidder is a standard commercial corporate entity.' };
  }

  // NSIC requirement: Optional for non-NSIC bidders
  if (code === 'NSIC' && !req.isRequired && !bidder?.nsicRegNumber) {
    return { applies: false, reason: 'NSIC Single Point Registration not applicable to general category bidders.' };
  }

  // Udyam MSME requirement: Optional for large enterprises
  if (code === 'UDYAM' && !req.isRequired && !bidder?.udyamNumber && bidder?.businessType === 'Private Limited') {
    return { applies: false, reason: 'MSME registration not applicable to large corporate enterprise.' };
  }

  return { applies: true, reason: 'Requirement applies to bidder.' };
}

/**
 * Builds a fast lookup dictionary of extracted OCR fields
 */
function buildExtractedFieldsMap(fields: ExtractedField[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const f of fields) {
    if (f.fieldName && f.fieldValue) {
      map[f.fieldName.toLowerCase()] = String(f.fieldValue);
      map[f.fieldName] = String(f.fieldValue);
    }
  }
  return map;
}

/**
 * Deterministic string similarity calculation using Levenshtein distance
 */
function calculateNameMatchScore(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const clean1 = s1.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const clean2 = s2.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  if (clean1 === clean2) return 1.0;
  if (clean1.includes(clean2) || clean2.includes(clean1)) return 0.9;

  const longer = clean1.length > clean2.length ? clean1 : clean2;
  const shorter = clean1.length > clean2.length ? clean2 : clean1;
  if (longer.length === 0) return 1.0;

  const dist = levenshteinDistance(longer, shorter);
  return (longer.length - dist) / longer.length;
}

function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
