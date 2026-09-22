import { GoogleGenAI, Type } from '@google/genai';
import {
  AIProvider,
  ExtractedDocumentData,
} from './provider.interface';
import { DeterministicFallbackProvider } from './fallback.provider';
import {
  AIRecommendation,
  ComplianceCheck,
  RiskAssessment,
  Bid,
  Tender,
  Document,
  Verification,
  TenderDocumentExtractionResult,
} from '../../types';
import { createServiceLogger } from '../../observability/logger';

const log = createServiceLogger('GeminiAIProvider');

export class GeminiProvider implements AIProvider {
  readonly providerName = 'Google Gemini Multimodal Provider (gemini-3.7-flash)';
  private aiClient: GoogleGenAI | null = null;
  private fallback: DeterministicFallbackProvider;

  constructor() {
    this.fallback = new DeterministicFallbackProvider();
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.aiClient = new GoogleGenAI({ apiKey });
        log.info('Initialized Google Gemini GenAI client successfully.');
      } catch (err: any) {
        log.warn(`Failed to initialize Gemini client: ${err?.message}. Operating in fallback mode.`);
      }
    } else {
      log.info('GEMINI_API_KEY not configured. Operating in robust deterministic fallback mode.');
    }
  }

  get isAvailable(): boolean {
    return this.aiClient !== null;
  }

  public async extractDocumentFields(
    doc: Document,
    fileBase64?: string,
    mimeType?: string
  ): Promise<ExtractedDocumentData> {
    if (!this.aiClient || !fileBase64 || !mimeType) {
      return this.fallback.extractDocumentFields(doc, fileBase64, mimeType);
    }

    try {
      const prompt = `You are the GeM Statutory Procurement Document Verification Specialist.
Analyze the provided government or commercial compliance document for bidder verification under GeM General Terms and Conditions (GTC).

Target Document Expected: ${doc.documentType}
File Name: ${doc.fileOriginalName || doc.fileName}

MANDATORY RULES:
1. STRICT EVIDENCE-GROUNDING: Quote exact verbatim snippets and page numbers for each extracted field.
2. MISSING VALUES: If any field is not explicitly present, set "isPresent" to false and provide "missingReason".
3. IDENTITY EXTRACTION: Extract Legal Entity Name, Trade Name, PAN (10 chars), GSTIN (15 chars), Udyam Number, CIN, Address.
4. STATUTORY EXTRACTION: Extract Document Number, Issuing Department, Issue Date (YYYY-MM-DD), Expiry/Validity, CA UDIN (18 digits), Local Content %, OEM Authorization Code.`;

      const response = await this.aiClient.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: fileBase64,
                mimeType,
              },
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documentType: { type: Type.STRING },
              documentNumber: { type: Type.STRING, nullable: true },
              issuingAuthority: { type: Type.STRING, nullable: true },
              issueDate: { type: Type.STRING, nullable: true },
              validUntil: { type: Type.STRING, nullable: true },
              bidder: {
                type: Type.OBJECT,
                properties: {
                  legalName: { type: Type.STRING, nullable: true },
                  tradeName: { type: Type.STRING, nullable: true },
                  pan: { type: Type.STRING, nullable: true },
                  gstin: { type: Type.STRING, nullable: true },
                  udyamNumber: { type: Type.STRING, nullable: true },
                  cinNumber: { type: Type.STRING, nullable: true },
                  address: { type: Type.STRING, nullable: true },
                  authorizedPerson: { type: Type.STRING, nullable: true },
                  signatoryDesignation: { type: Type.STRING, nullable: true },
                  contactEmail: { type: Type.STRING, nullable: true },
                  contactPhone: { type: Type.STRING, nullable: true },
                },
              },
              specializedFields: {
                type: Type.OBJECT,
                properties: {
                  localContentPercentage: { type: Type.NUMBER, nullable: true },
                  supplierClass: { type: Type.STRING, nullable: true },
                  caUdin: { type: Type.STRING, nullable: true },
                  oemName: { type: Type.STRING, nullable: true },
                  oemAuthorizationCode: { type: Type.STRING, nullable: true },
                  turnoverAverage: { type: Type.STRING, nullable: true },
                  nonDebarmentDeclared: { type: Type.BOOLEAN, nullable: true },
                },
              },
              fields: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    fieldName: { type: Type.STRING },
                    fieldValue: { type: Type.STRING, nullable: true },
                    confidence: { type: Type.NUMBER },
                    sourcePage: { type: Type.INTEGER },
                    isPresent: { type: Type.BOOLEAN },
                    rawSnippet: { type: Type.STRING, nullable: true },
                    missingReason: { type: Type.STRING, nullable: true },
                    category: { type: Type.STRING },
                  },
                  required: ['fieldName', 'confidence', 'isPresent'],
                },
              },
              issues: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingFieldsCount: { type: Type.INTEGER },
              presentFieldsCount: { type: Type.INTEGER },
              confidence: { type: Type.NUMBER },
            },
            required: ['documentType', 'bidder', 'specializedFields', 'fields', 'issues', 'confidence'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        parsed.modelUsed = 'Google Gemini 3.7 Flash (Multimodal Document Intelligence)';
        return parsed as ExtractedDocumentData;
      }
    } catch (err: any) {
      log.warn(`Gemini document extraction failed, switching to deterministic fallback: ${err?.message}`);
    }

    return this.fallback.extractDocumentFields(doc, fileBase64, mimeType);
  }

  public async generateAdvisory(
    tender: Tender,
    bid: Bid,
    checks: ComplianceCheck[],
    assessment: RiskAssessment,
    verifications: Verification[]
  ): Promise<AIRecommendation> {
    if (!this.aiClient) {
      return this.fallback.generateAdvisory(tender, bid, checks, assessment, verifications);
    }

    try {
      const prompt = `You are the GeM Public Procurement AI Decision-Support Layer (GFR 2017 & GeM GTC).
MANDATE & STRICT BOUNDARIES:
- You are strictly an advisory decision-support layer for the authorized Procurement Officer.
- You must NEVER alter, invent, or calculate compliance scores. The deterministic score is ${assessment.overallScore}/100 and risk level is ${assessment.riskLevel}.
- Ground every statement strictly in the verified evidence and policy engine checks.

INPUTS:
Tender: ${tender.title} (${tender.tenderId})
Bidder: ${bid.bidder?.legalName || 'Bidder'}
Deterministic Score: ${assessment.overallScore}/100
Risk Level: ${assessment.riskLevel}
Checks Summary: ${checks.map((c) => `${c.requirementName}: ${c.status} (${c.scoreAchieved}/${c.weight})`).join('; ')}
Critical Flags: ${assessment.criticalFlags.join('; ')}

Return JSON:
1. "recommendation": Must be one of "COMPLIANT", "MANUAL_REVIEW", "NON_COMPLIANT".
2. "reason": Clear statutory reasoning referencing GFR 2017 / GeM GTC.
3. "criticalIssues": Array of non-compliance issues.
4. "missingRequirements": Array of missing mandatory submissions.
5. "recommendedActions": Actionable statutory next steps for the Procurement Officer.`;

      const response = await this.aiClient.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendation: { type: Type.STRING, enum: ['COMPLIANT', 'MANUAL_REVIEW', 'NON_COMPLIANT'] },
              reason: { type: Type.STRING },
              criticalIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['recommendation', 'reason', 'criticalIssues', 'missingRequirements', 'recommendedActions'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return {
          id: `ai-rec-${bid.id}-${Date.now()}`,
          bidId: bid.id,
          recommendation: parsed.recommendation,
          reason: parsed.reason,
          reasoningText: parsed.reason,
          confidenceScore: 0.96,
          criticalIssues: parsed.criticalIssues || [],
          missingRequirements: parsed.missingRequirements || [],
          recommendedActions: parsed.recommendedActions || [],
          modelUsed: 'Google Gemini 3.7 Flash (Advisory Decision Support)',
          disclaimerText:
            'LEGAL MANDATE NOTICE: This AI-generated recommendation is strictly an advisory decision-support artifact under GeM General Terms and Conditions (GTC) and General Financial Rules (GFR 2017). The final qualification or disqualification decision is the sole statutory responsibility of the authorized Procurement Officer. This model does not calculate or alter deterministic compliance scores.',
          generatedAt: new Date().toISOString(),
        };
      }
    } catch (err: any) {
      log.warn(`Gemini advisory generation failed, switching to fallback: ${err?.message}`);
    }

    return this.fallback.generateAdvisory(tender, bid, checks, assessment, verifications);
  }

  public async embedText(text: string): Promise<number[]> {
    if (this.aiClient) {
      try {
        const response: any = await this.aiClient.models.embedContent({
          model: 'text-embedding-004',
          contents: text,
        });
        if (response.embedding?.values && response.embedding.values.length > 0) {
          return response.embedding.values;
        } else if (response.embeddings?.[0]?.values && response.embeddings[0].values.length > 0) {
          return response.embeddings[0].values;
        }
      } catch (err: any) {
        log.warn(`Failed to generate Gemini embedding, using fallback: ${err?.message}`);
      }
    }
    return this.fallback.embedText(text);
  }

  public async queryCopilot(query: string, bidContext: Record<string, any>): Promise<string> {
    if (this.aiClient) {
      try {
        const prompt = `You are the GeM Government Procurement Copilot & GFR 2017 Compliance Specialist.
Context:
${JSON.stringify(bidContext, null, 2)}

User Question:
${query}

Answer concisely with explicit statutory citations (GFR Rule 144, 151, 153, 173 or GeM GTC) and evidence references.`;

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });

        if (response.text) {
          return response.text.trim();
        }
      } catch (err: any) {
        log.warn(`Gemini Copilot failed, using fallback: ${err?.message}`);
      }
    }
    return this.fallback.queryCopilot(query, bidContext);
  }

  public async extractTenderRequirements(
    tender: { id: string; title: string; department: string; category: string; estimatedValue: number },
    fileBase64?: string,
    mimeType?: string,
    textContent?: string
  ): Promise<TenderDocumentExtractionResult> {
    if (this.aiClient && (fileBase64 || textContent)) {
      try {
        const prompt = `You are the GeM Tender RFP Ingestion & Eligibility Clause Parser.
Extract candidate eligibility clauses from this tender RFP.
Return strict JSON with clauses array containing requirementCode, requirementName, isRequired, weight, minThreshold, customRuleDescription, issuingAuthority, formatRequired, sourceText, sourcePage, confidence.`;

        const parts: any[] = [{ text: prompt }];
        if (fileBase64 && mimeType) {
          parts.push({ inlineData: { data: fileBase64, mimeType } });
        } else if (textContent) {
          parts.push({ text: textContent });
        }

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (Array.isArray(parsed.clauses) && parsed.clauses.length > 0) {
            const mapped = parsed.clauses.map((c: any, idx: number) => ({
              id: `req-ext-${tender.id}-${idx}`,
              tenderId: tender.id,
              ...c,
              status: 'DRAFT',
              officerApproved: false,
            }));
            return {
              tenderId: tender.id,
              fileName: 'tender-rfp.pdf',
              fileSize: fileBase64 ? Math.round(fileBase64.length * 0.75) : 1048576,
              extractedClausesCount: mapped.length,
              summary: `Extracted ${mapped.length} candidate eligibility clauses via Gemini 3.7 Flash`,
              clauses: mapped as any,
            };
          }
        }
      } catch (err: any) {
        log.warn(`Gemini RFP extraction failed, using fallback: ${err?.message}`);
      }
    }
    return this.fallback.extractTenderRequirements(tender, fileBase64, mimeType, textContent);
  }
}
