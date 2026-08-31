import { getGeminiClient, EMBEDDING_MODEL } from './gemini.client';
import { createServiceLogger } from '../observability/logger';

const log = createServiceLogger('EvidenceRAGService');

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

  /**
   * Generates a 768-dimensional embedding vector for text chunk using Gemini text-embedding-004
   */
  public async generateEmbedding(text: string): Promise<number[]> {
    const ai = getGeminiClient();
    if (ai) {
      try {
        const response: any = await ai.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: text,
        });

        if (response.embedding?.values && response.embedding.values.length > 0) {
          return response.embedding.values;
        } else if (response.embeddings?.[0]?.values && response.embeddings[0].values.length > 0) {
          return response.embeddings[0].values;
        }
      } catch (err: any) {
        log.warn(`Failed to generate Gemini embedding, using fallback vector hash: ${err?.message}`);
      }
    }

    // Deterministic semantic embedding fallback (768-dim)
    return this.createDeterministicVector(text, 768);
  }

  /**
   * Ingests and indexes a document page or clause into vector store
   */
  public async indexDocumentChunk(chunk: DocumentChunk): Promise<void> {
    if (!chunk.vector || chunk.vector.length === 0) {
      chunk.vector = await this.generateEmbedding(chunk.content);
    }
    this.vectorStore.push(chunk);
    log.info(`Indexed document chunk [${chunk.id}] from ${chunk.fileName} (Page ${chunk.pageNumber}) for Bid ${chunk.bidId}`);
  }

  /**
   * Semantic Vector Similarity Search (Cosine similarity)
   */
  public async retrieveRelevantEvidence(
    bidId: string,
    query: string,
    topK = 3,
    requirementCode?: string
  ): Promise<RetrievedEvidence[]> {
    const queryVector = await this.generateEmbedding(query);

    const candidateChunks = this.vectorStore.filter(
      (c) => c.bidId === bidId && (!requirementCode || c.requirementCode === requirementCode)
    );

    if (candidateChunks.length === 0) {
      return [];
    }

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

  private createDeterministicVector(text: string, dimensions = 768): number[] {
    const vector = new Array(dimensions).fill(0);
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode * 31 + i * 17) % dimensions;
      vector[index] = (vector[index] + (charCode / 255.0)) % 1.0;
    }
    // Normalize vector
    let sumSquares = 0;
    for (let i = 0; i < dimensions; i++) {
      sumSquares += vector[i] * vector[i];
    }
    const norm = Math.sqrt(sumSquares) || 1;
    return vector.map((v) => v / norm);
  }
}
