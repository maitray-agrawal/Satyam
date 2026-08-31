export const APP_CONFIG = {
  appName: 'GEV-VERIFY',
  version: '2.4.0',
  description: 'National Public Procurement Compliance Verification & Decision-Support System',
  statutoryStandard: 'General Financial Rules (GFR 2017) & GeM General Terms & Conditions (GTC v4.0)',
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || '0.0.0.0',
  env: process.env.NODE_ENV || 'development',
  corsOrigins: ['*'],
  uploadLimits: {
    maxFileSize: 25 * 1024 * 1024, // 25 MB
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
  },
  ai: {
    model: 'gemini-2.5-flash',
    embeddingModel: 'text-embedding-004',
    maxTokens: 4096,
    temperature: 0.1, // Deterministic extraction & strictly grounded citations
  },
  scoring: {
    criticalRiskThreshold: 0, // Any critical violation triggers CRITICAL risk
    highRiskThreshold: 60,
    mediumRiskThreshold: 80,
  },
  registrySimulationBadge: 'DEMO / SIMULATED GOVERNMENT DATA',
};
