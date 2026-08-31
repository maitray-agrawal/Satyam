import { createServiceLogger } from '../../observability/logger';

const log = createServiceLogger('VerificationAdapter');

export interface VerificationInput {
  requirementCode: string;
  bidId: string;
  bidderGstin?: string;
  bidderPan?: string;
  bidderLegalName?: string;
  documentData?: Record<string, any>;
  metadata?: Record<string, any>;
  tenderRequirements?: Array<{ requirementCode: string; minThreshold?: number }>;
}

export interface VerificationResult {
  requirementCode: string;
  serviceType: string;
  apiEndpoint: string;
  simulated: boolean;
  simulationNotice: string;
  matchStatus: 'VERIFIED' | 'MISMATCH' | 'NOT_FOUND' | 'SUSPENDED' | 'EXEMPTED' | 'FLAGGED';
  confidenceScore: number;
  evidenceDetails: string;
  verifiedData: Record<string, any>;
  discrepancies: string[];
  latencyMs: number;
  timestamp: string;
}

export interface VerificationAdapter {
  readonly serviceName: string;
  readonly supportedRequirementCodes: string[];
  verify(input: VerificationInput): Promise<VerificationResult>;
}

export class VerificationAdapterRegistry {
  private static instance: VerificationAdapterRegistry;
  private adapters: Map<string, VerificationAdapter> = new Map();

  private constructor() {}

  public static getInstance(): VerificationAdapterRegistry {
    if (!VerificationAdapterRegistry.instance) {
      VerificationAdapterRegistry.instance = new VerificationAdapterRegistry();
    }
    return VerificationAdapterRegistry.instance;
  }

  public register(adapter: VerificationAdapter): void {
    this.adapters.set(adapter.serviceName.toUpperCase(), adapter);
    for (const code of adapter.supportedRequirementCodes) {
      this.adapters.set(code.toUpperCase(), adapter);
    }
    log.info(`Registered verification adapter: ${adapter.serviceName}`);
  }

  public getAdapter(serviceNameOrCode: string): VerificationAdapter | undefined {
    return this.adapters.get(serviceNameOrCode.toUpperCase());
  }

  public getAllAdapters(): VerificationAdapter[] {
    const unique = new Set(this.adapters.values());
    return Array.from(unique);
  }
}
