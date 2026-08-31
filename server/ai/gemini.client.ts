import { GoogleGenAI } from '@google/genai';
import { createServiceLogger } from '../observability/logger';

const log = createServiceLogger('GeminiClient');

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      log.warn('GEMINI_API_KEY environment variable is not set. AI services will use simulated deterministic synthesis.');
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
    log.info('Initialized Google Gen AI client successfully.');
  }
  return aiClient;
}

export const GEMINI_MODEL = 'gemini-3.7-flash';
export const EMBEDDING_MODEL = 'text-embedding-004';
