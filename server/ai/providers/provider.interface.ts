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

export interface ExtractedDocumentData {
  documentType: string;
  documentNumber: string | null;
  issuingAuthority: string | null;
  issueDate: string | null;
  validUntil: string | null;
  bidder: {
    legalName: string | null;
    tradeName: string | null;
    pan: string | null;
    gstin: string | null;
    udyamNumber: string | null;
    cinNumber: string | null;
    address: string | null;
    authorizedPerson: string | null;
    signatoryDesignation: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  specializedFields: {
    localContentPercentage?: number | null;
    supplierClass?: string | null;
    caUdin?: string | null;
    oemName?: string | null;
    oemAuthorizationCode?: string | null;
    turnoverAverage?: string | null;
    activeSubscribers?: number | null;
    establishmentCode?: string | null;
    esicCode?: string | null;
    startupDpiitNumber?: string | null;
    taxpayerType?: string | null;
    nonDebarmentDeclared?: boolean | null;
  };
  fields: Array<{
    fieldName: string;
    fieldValue: string | null;
    confidence: number;
    sourcePage?: number;
    isPresent: boolean;
    rawSnippet?: string;
    missingReason?: string;
    category?: 'IDENTITY' | 'COMPLIANCE' | 'STATUTORY' | 'FINANCIAL' | 'TECHNICAL';
  }>;
  issues: string[];
  missingFieldsCount: number;
  presentFieldsCount: number;
  confidence: number;
  modelUsed: string;
}

/**
 * Universal AI Provider Interface
 * Decouples public procurement business logic and deterministic evaluation engines
 * from specific LLM vendors (Google Gemini, Local Model, or Future Providers).
 */
export interface AIProvider {
  readonly providerName: string;
  readonly isAvailable: boolean;

  /**
   * Multimodal structured document extraction with verbatim snippets and page numbers.
   */
  extractDocumentFields(
    doc: Document,
    fileBase64?: string,
    mimeType?: string
  ): Promise<ExtractedDocumentData>;

  /**
   * Synthesizes citation-grounded advisory decision memo for the authorized Procurement Officer.
   * STRICT MANDATE: AI recommendation must NEVER alter or generate deterministic compliance scores.
   */
  generateAdvisory(
    tender: Tender,
    bid: Bid,
    checks: ComplianceCheck[],
    assessment: RiskAssessment,
    verifications: Verification[]
  ): Promise<AIRecommendation>;

  /**
   * Generates dense vector embeddings for semantic retrieval.
   */
  embedText(text: string): Promise<number[]>;

  /**
   * Interactive procurement copilot for GFR 2017 & GeM GTC clause interpretation.
   */
  queryCopilot(query: string, bidContext: Record<string, any>): Promise<string>;

  /**
   * Ingests tender RFP and extracts structured candidate eligibility clauses.
   */
  extractTenderRequirements(
    tender: { id: string; title: string; department: string; category: string; estimatedValue: number },
    fileBase64?: string,
    mimeType?: string,
    textContent?: string
  ): Promise<TenderDocumentExtractionResult>;
}
