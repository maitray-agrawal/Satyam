import { AIProvider } from './provider.interface';
import { GeminiProvider } from './gemini.provider';
import { DeterministicFallbackProvider } from './fallback.provider';

export * from './provider.interface';
export * from './gemini.provider';
export * from './fallback.provider';

let activeProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!activeProvider) {
    if (process.env.GEMINI_API_KEY) {
      activeProvider = new GeminiProvider();
    } else {
      activeProvider = new DeterministicFallbackProvider();
    }
  }
  return activeProvider;
}

export function setAIProvider(provider: AIProvider): void {
  activeProvider = provider;
}
