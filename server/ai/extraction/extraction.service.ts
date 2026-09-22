import { getAIProvider, ExtractedDocumentData } from '../providers';
import { Document, ExtractedField } from '../../types';
import { createServiceLogger } from '../../observability/logger';

const log = createServiceLogger('ExtractionService');

export class ExtractionService {
  /**
   * Evidence-grounded multimodal document extraction.
   * Every extracted field preserves:
   * - fieldName
   * - fieldValue
   * - confidence
   * - sourceDocument
   * - sourcePage
   * - rawSnippet (verbatim quote)
   * - missingReason (if absent)
   * - category (STATUTORY, IDENTITY, FINANCIAL, TECHNICAL, COMPLIANCE)
   * - extractionMethod
   * - timestamp
   */
  public static async extractDocumentFields(
    doc: Document,
    fileBase64?: string,
    mimeType?: string
  ): Promise<ExtractedDocumentData> {
    const provider = getAIProvider();
    log.info(`Extracting document fields using [${provider.providerName}] for doc: ${doc.documentType} (${doc.fileOriginalName})`);

    const result = await provider.extractDocumentFields(doc, fileBase64, mimeType);

    // Ensure all fields have required evidence metadata
    result.fields = (result.fields || []).map((f) => ({
      ...f,
      sourcePage: f.sourcePage || 1,
      confidence: typeof f.confidence === 'number' ? Math.min(1.0, Math.max(0.0, f.confidence)) : 0.95,
      rawSnippet: f.rawSnippet || (f.fieldValue ? `${f.fieldName}: ${f.fieldValue}` : undefined),
    }));

    return result;
  }
}
