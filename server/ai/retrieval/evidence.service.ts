import { getAIProvider } from '../providers';
import { createServiceLogger } from '../../observability/logger';

const log = createServiceLogger('EvidenceService');

export interface DocumentChunk {
  id: string;
  documentId: string;
  bidId: string;
  requirementCode: string;
  pageNumber: number;
  fileName: string;
  content: string;
  vector?: number[];
  metadata: {
    sectionTitle?: string;
    extractedDate?: string;
    certificateNumber?: string;
    issuingAuthority?: string;
    confidenceScore: number;
  };
}

export interface RetrievedEvidence {
  chunk: DocumentChunk;
  similarityScore: number;
  traceableSource: string;
}

export class EvidenceService {
  private static instance: EvidenceService;
  private vectorStore: DocumentChunk[] = [];

  private constructor() {}

  public static getInstance(): EvidenceService {
    if (!EvidenceService.instance) {
      EvidenceService.instance = new EvidenceService();
    }
    return EvidenceService.instance;
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    const provider = getAIProvider();
    return provider.embedText(text);
  }

  public async indexDocumentChunk(chunk: DocumentChunk): Promise<void> {
    if (!chunk.vector || chunk.vector.length === 0) {
      chunk.vector = await this.generateEmbedding(chunk.content);
    }
    this.vectorStore.push(chunk);
    log.info(`Indexed document chunk [${chunk.id}] from ${chunk.fileName} (Page ${chunk.pageNumber}) for Bid ${chunk.bidId}`);
  }

  public async retrieveRelevantEvidence(
    bidId: string,
    query: string,
    topK = 3,
    requirementCode?: string
  ): Promise<RetrievedEvidence[]> {
    const candidateChunks = this.vectorStore.filter(
      (c) => c.bidId === bidId && (!requirementCode || c.requirementCode === requirementCode)
    );

    if (candidateChunks.length === 0) {
      return [];
    }

    const queryVector = await this.generateEmbedding(query);

    const scored = candidateChunks.map((chunk) => {
      const similarity = this.cosineSimilarity(queryVector, chunk.vector || []);
      return {
        chunk,
        similarityScore: Math.round(similarity * 100) / 100,
        traceableSource: `[${chunk.fileName} | Page ${chunk.pageNumber} | Req: ${chunk.requirementCode}]`,
      };
    });

    scored.sort((a, b) => b.similarityScore - a.similarityScore);
    return scored.slice(0, topK);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0.5;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0.5;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
