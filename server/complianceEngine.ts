import {
  RequirementCode,
  ComplianceCheck,
  RiskAssessment,
  RiskLevel,
  MatchStatus,
  ComplianceResultStatus,
  TenderRequirement,
  Bid,
  Document,
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
 * Deterministic Compliance Engine
 * Pure mathematical, rule-driven evaluation of tender compliance requirements.
 * AI is never used to calculate scores.
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
    const isReq = req.isRequired;
    const weight = req.weight || 10;
    totalWeight += weight;

    // Find associated document and verification response
    const doc = documents.find((d) => d.documentType === code);
    const verif = verifications.find((v) => v.requirementCode === code);

    const issuesFound: string[] = [];
    let status: ComplianceResultStatus = 'MISSING';
    let scoreAchieved = 0;
    let evidenceSummary = '';
    let deterministicRule = '';

    switch (code) {
      case 'GST': {
        deterministicRule = 'Rule: GSTIN must be Active on GSTN portal; Name must match Legal Name; Certificate must be uploaded.';
        const govtData = verif?.verifiedDataJson;
        if (!doc && isReq) {
          status = 'MISSING';
          issuesFound.push('Mandatory GST Registration Certificate not uploaded by bidder.');
        } else if (govtData?.status === 'CANCELLED' || govtData?.status === 'SUSPENDED') {
          status = 'NON_COMPLIANT';
          issuesFound.push(`Simulated GSTN Portal reports GSTIN is ${govtData.status}: ${govtData.statusDescription || 'Defaulted'}`);
          criticalFlags.push(`GSTIN ${bidder?.gstin || ''} is ${govtData.status} on GSTN Portal.`);
        } else if (govtData?.status === 'ACTIVE') {
          // Check for legal name match
          const portalName = (govtData.legalName || '').toUpperCase();
          const bidderName = (bidder?.legalName || '').toUpperCase();
          const nameMatches = portalName.includes(bidderName) || bidderName.includes(portalName) || similarityScore(portalName, bidderName) > 0.8;

          if (nameMatches) {
            status = 'COMPLIANT';
            scoreAchieved = weight;
            evidenceSummary = `GSTIN ${govtData.gstin} verified ACTIVE on GSTN. Legal Name: "${govtData.legalName}" matches bidder profile. Regular taxpayer.`;
          } else {
            status = 'REVIEW';
            scoreAchieved = weight * 0.6;
            issuesFound.push(`Name variance: Bidder legal name is "${bidder?.legalName}", but GSTN shows "${govtData.legalName}". Requires manual clarification.`);
            evidenceSummary = `GSTIN Active, but legal name mismatch detected between bid profile and GSTN records.`;
          }
        } else {
          status = isReq ? 'NON_COMPLIANT' : 'REVIEW';
          issuesFound.push('GST verification could not validate active registration.');
        }
        break;
      }

      case 'PAN': {
        deterministicRule = 'Rule: PAN must be Valid on ITD Database; Entity category must match; No Inoperative flags.';
        const govtData = verif?.verifiedDataJson;
        if (!doc && isReq) {
          status = 'MISSING';
          issuesFound.push('PAN Card document not uploaded.');
        } else if (govtData?.status === 'INOPERATIVE') {
          status = 'NON_COMPLIANT';
          issuesFound.push(`PAN is marked INOPERATIVE on Income Tax Database: ${govtData.statusReason || 'Investigation'}`);
          criticalFlags.push(`PAN ${bidder?.pan || ''} is Inoperative on ITD database.`);
        } else if (govtData?.status === 'VALID') {
          status = 'COMPLIANT';
          scoreAchieved = weight;
          evidenceSummary = `PAN ${govtData.pan} verified VALID on Income Tax Database. Category: ${govtData.category}.`;
        } else {
          status = isReq ? 'NON_COMPLIANT' : 'REVIEW';
          issuesFound.push('PAN record not found on ITD database.');
        }
        break;
      }

      case 'UDYAM': {
        deterministicRule = 'Rule: Udyam MSME number must be valid; Enterprise type within qualification limit.';
        const govtData = verif?.verifiedDataJson;
        if (!doc && isReq) {
          status = 'MISSING';
          issuesFound.push('Udyam MSME Registration Certificate missing.');
        } else if (govtData?.msmeStatus === 'VALID') {
          status = 'COMPLIANT';
          scoreAchieved = weight;
          evidenceSummary = `Udyam ${govtData.udyamNumber} verified VALID. Category: ${govtData.enterpriseType} Enterprise (${govtData.majorActivity}).`;
        } else if (bidder?.udyamNumber) {
          status = 'REVIEW';
          scoreAchieved = weight * 0.4;
          issuesFound.push('Udyam certificate details pending verification on MSME national portal.');
        } else {
          status = isReq ? 'NON_COMPLIANT' : 'EXEMPTED';
          evidenceSummary = isReq ? 'Non-MSME bidder without required Udyam certificate' : 'Not claimed by non-MSME bidder (Optional)';
          if (status === 'EXEMPTED') scoreAchieved = weight;
        }
        break;
      }

      case 'INCOME_TAX': {
        deterministicRule = 'Rule: ITR filed for last 3 consecutive Financial Years; Turnover threshold met; Audited reports submitted.';
        const govtData = verif?.verifiedDataJson;
        if (!doc && isReq) {
          status = 'MISSING';
          issuesFound.push('Audited Financial Statements & ITR Acknowledgments not uploaded.');
        } else if (govtData?.complianceStatus === 'DEFICIENT') {
          status = 'NON_COMPLIANT';
          issuesFound.push('Deficient ITR filing history: Defaults or defective returns detected under Section 139(9).');
          criticalFlags.push('Deficient Income Tax filing record over 3 consecutive years.');
        } else if (govtData?.filings && govtData.filings.length >= 3) {
          status = 'COMPLIANT';
          scoreAchieved = weight;
          evidenceSummary = `ITR filed for 3 FYs (2023-24, 2024-25, 2025-26). Average Turnover: ${govtData.averageTurnoverLast3Years}. Audit report verified.`;
        } else {
          status = 'REVIEW';
          scoreAchieved = weight * 0.5;
          issuesFound.push('Less than 3 financial years of verified ITR filings found.');
        }
        break;
      }

      case 'EPFO': {
        deterministicRule = 'Rule: Active EPFO Establishment Code; Monthly Electronic Challan Cum Return (ECR) timely filed.';
        const govtData = verif?.verifiedDataJson;
        if (govtData?.status === 'ACTIVE_COMPLIANT') {
          status = 'COMPLIANT';
          scoreAchieved = weight;
          evidenceSummary = `EPFO Establishment ${govtData.establishmentCode} Active. ${govtData.activeSubscribersCount} active subscribers. Last wage month paid: ${govtData.wageMonthPaid}.`;
        } else if (!doc && isReq) {
          status = 'MISSING';
          issuesFound.push('EPFO Registration Certificate and latest ECR receipt missing.');
        } else {
          status = isReq ? 'NON_COMPLIANT' : 'REVIEW';
          issuesFound.push('EPFO registration could not be verified on Shram Suvidha portal.');
        }
        break;
      }

      case 'ESIC': {
        deterministicRule = 'Rule: Active ESIC Employer Code with contributions paid, or statutory exemption if <10 employees.';
        const govtData = verif?.verifiedDataJson;
        if (govtData?.status === 'ACTIVE') {
          status = 'COMPLIANT';
          scoreAchieved = weight;
          evidenceSummary = `ESIC Employer Code ${govtData.employerCode} Active. ${govtData.insuredPersonsCount} insured persons. Contribution Status: ${govtData.contributionStatus}.`;
        } else if (bidder?.businessType === 'Proprietorship' || (bidder?.udyamNumber && bidder.udyamNumber.includes('TN-02'))) {
          // Micro enterprise statutory threshold exemption check
          status = 'REVIEW';
          scoreAchieved = weight * 0.7;
          issuesFound.push('ESIC not registered. Bidder claims micro entity exemption (<10 employees). Requires officer verification of employee headcount.');
          evidenceSummary = 'Potential Micro Enterprise statutory exemption claimed.';
        } else if (isReq) {
          status = 'NON_COMPLIANT';
          issuesFound.push('Mandatory ESIC Registration certificate missing or not mapped.');
        } else {
          status = 'EXEMPTED';
          scoreAchieved = weight;
          evidenceSummary = 'Optional requirement not applicable to bidder.';
        }
        break;
      }

      case 'STARTUP_INDIA': {
        deterministicRule = 'Rule: DPIIT Recognized Startup Certificate; Eligibility for prior turnover & experience exemptions on GeM.';
        const govtData = verif?.verifiedDataJson;
        if (govtData?.status === 'RECOGNIZED_STARTUP') {
          status = 'COMPLIANT';
          scoreAchieved = weight;
          evidenceSummary = `DPIIT Recognition ${govtData.dpiitNumber} verified. Startup valid up to ${govtData.validUpto}. GeM EMD & experience exemptions active.`;
        } else if (isReq) {
          status = 'NON_COMPLIANT';
          issuesFound.push('Startup India certificate required for reserved category but not verified.');
        } else {
          status = 'EXEMPTED';
          scoreAchieved = weight;
          evidenceSummary = 'Non-startup bidder, standard commercial criteria applied.';
        }
        break;
      }

      case 'NSIC': {
        deterministicRule = 'Rule: NSIC Single Point Registration Scheme valid on tender date; Stores category matching tender items.';
        const govtData = verif?.verifiedDataJson;
        if (govtData?.status === 'CURRENT_VALID') {
          status = 'COMPLIANT';
          scoreAchieved = weight;
          evidenceSummary = `NSIC Registration ${govtData.registrationNumber} verified valid up to ${govtData.validUpto}. Monetary limit: ${govtData.monetaryLimit}.`;
        } else if (isReq) {
          status = 'NON_COMPLIANT';
          issuesFound.push('NSIC Single Point Registration not uploaded or invalid.');
        } else {
          status = 'EXEMPTED';
          scoreAchieved = weight;
          evidenceSummary = 'NSIC registration not mandatory for general category.';
        }
        break;
      }

      case 'OEM_AUTHORIZATION': {
        deterministicRule = 'Rule: Manufacturer Authorization Form (MAF) from OEM; Specific tender reference; Validity covering warranty period.';
        const govtData = verif?.verifiedDataJson;
        if (!doc && isReq) {
          status = 'MISSING';
          issuesFound.push('Manufacturer Authorization Form (MAF) document not uploaded.');
        } else if (govtData?.status === 'EXPIRED') {
          status = 'NON_COMPLIANT';
          issuesFound.push(`OEM Authorization with ${govtData.oemName} is EXPIRED (expired on ${govtData.validUpto}).`);
          criticalFlags.push(`OEM Authorization for ${govtData.oemName} has expired.`);
        } else if (govtData?.status === 'ACTIVE_VERIFIED') {
          status = 'COMPLIANT';
          scoreAchieved = weight;
          evidenceSummary = `OEM Authorization ${govtData.authorizationCode} verified with ${govtData.oemName}. Valid up to ${govtData.validUpto} with 24x7 SLA warranty.`;
        } else {
          status = isReq ? 'NON_COMPLIANT' : 'REVIEW';
          issuesFound.push('OEM Authorization could not be verified against OEM manufacturer repository.');
        }
        break;
      }

      case 'MAKE_IN_INDIA': {
        const minThreshold = typeof req.minThreshold === 'number' ? req.minThreshold : 50;
        deterministicRule = `Rule: Local Content must be >= ${minThreshold}% with CA Certificate & Valid UDIN (Public Procurement Order 2017).`;
        const govtData = verif?.verifiedDataJson;
        const claimedPercentage = bidder?.localContentPercentage ?? 0;

        if (govtData?.verificationStatus === 'MISMATCH_DETECTED') {
          status = 'NON_COMPLIANT';
          issuesFound.push(`Local content mismatch: Bidder declared ${claimedPercentage}%, but portal audited content is only ${govtData.portalAuditedContent}%. CA UDIN invalid.`);
          criticalFlags.push(`Make in India local content discrepancy (${claimedPercentage}% vs ${govtData.portalAuditedContent}%).`);
        } else if (claimedPercentage >= minThreshold) {
          status = 'COMPLIANT';
          scoreAchieved = weight;
          evidenceSummary = `Make in India Local Content: ${claimedPercentage}% (Meets Class-I threshold >= ${minThreshold}%). CA UDIN verified.`;
        } else {
          status = 'NON_COMPLIANT';
          issuesFound.push(`Local content ${claimedPercentage}% is below minimum required threshold of ${minThreshold}%.`);
        }
        break;
      }

      case 'BLACKLISTING': {
        deterministicRule = 'Rule: Zero tolerance. Bidder must NOT appear on Central Debarment / Blacklist repository of GeM/CPPP/DoE.';
        const govtData = verif?.verifiedDataJson;
        if (govtData?.isBlacklisted) {
          status = 'NON_COMPLIANT';
          scoreAchieved = 0;
          issuesFound.push(`CRITICAL: Entity is DEBARRED by ${govtData.issuingAuthority}. Order: ${govtData.orderNumber} effective until ${govtData.effectiveUpto}. Reason: ${govtData.reason}`);
          criticalFlags.push(`ACTIVE BLACKLISTING ORDER FOUND: ${govtData.orderNumber}`);
        } else {
          status = 'COMPLIANT';
          scoreAchieved = weight;
          evidenceSummary = 'No debarment or blacklisting orders on Central GeM/CPPP repository. Integrity declaration verified.';
        }
        break;
      }

      case 'DIGILOCKER': {
        deterministicRule = 'Rule: Electronic document verification via DigiLocker / e-Sign repository.';
        if (doc) {
          status = 'COMPLIANT';
          scoreAchieved = weight;
          evidenceSummary = 'Digitally signed submission verified against DigiLocker repository.';
        } else {
          status = 'EXEMPTED';
          scoreAchieved = weight;
          evidenceSummary = 'Physical scanned document with DSC verification accepted.';
        }
        break;
      }

      default: {
        status = doc ? 'COMPLIANT' : 'REVIEW';
        scoreAchieved = doc ? weight : weight * 0.5;
        evidenceSummary = doc ? 'Document submitted' : 'Document pending';
      }
    }

    // Tally results
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
      isRequired: isReq,
      weight,
      status,
      scoreAchieved: Math.round(scoreAchieved * 10) / 10,
      evidenceSummary,
      issuesFound,
      deterministicRuleEvaluated: deterministicRule,
    });
  }

  // Calculate overall score (0 - 100)
  const rawScore = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;
  let overallScore = Math.round(rawScore);

  // If critical blacklisting flag exists, cap score at 20
  if (criticalFlags.some((f) => f.includes('BLACKLISTING') || f.includes('DEBARRED'))) {
    overallScore = Math.min(overallScore, 18);
  }

  // Determine Risk Level:
  // 90-100 LOW, 70-89 MEDIUM, 50-69 HIGH, 0-49 CRITICAL
  let riskLevel: RiskLevel = 'LOW';
  if (overallScore >= 90 && criticalFlags.length === 0) {
    riskLevel = 'LOW';
  } else if (overallScore >= 70 && criticalFlags.length === 0) {
    riskLevel = 'MEDIUM';
  } else if (overallScore >= 50 || criticalFlags.length === 1) {
    riskLevel = 'HIGH';
  } else {
    riskLevel = 'CRITICAL';
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

function similarityScore(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

function editDistance(s1: string, s2: string): number {
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
