export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'GEV-VERIFY: GeM Enterprise Bid Compliance & Verification API',
    version: '2.4.0',
    description:
      'National Public Procurement Enterprise API for automated documentary extraction, simulated government registry verification (GST, PAN, MSME, EPFO, ESIC, OEM, Debarment), deterministic policy-driven compliance scoring, and Gemini evidence-grounded decision support under GFR 2017.',
    contact: {
      name: 'GeM Technical & Procurement Directorate',
      url: 'https://gem.gov.in',
      email: 'tech-support@gem.gov.in',
    },
    license: {
      name: 'Government Open Data License - India (GODL)',
      url: 'https://data.gov.in',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Internal Enterprise API Gateway',
    },
  ],
  paths: {
    '/auth/me': {
      get: {
        summary: 'Get current authenticated user profile & RBAC role',
        tags: ['Authentication & RBAC'],
        responses: {
          '200': { description: 'Authenticated user profile' },
        },
      },
    },
    '/auth/switch-role': {
      post: {
        summary: 'Switch active persona for interactive demo testing',
        tags: ['Authentication & RBAC'],
        responses: {
          '200': { description: 'Role switched successfully' },
        },
      },
    },
    '/tenders': {
      get: {
        summary: 'List all active procurement tenders with requirements',
        tags: ['Tenders & Notices'],
        responses: { '200': { description: 'Array of tenders' } },
      },
      post: {
        summary: 'Publish new procurement tender and requirement clauses',
        tags: ['Tenders & Notices'],
        responses: { '201': { description: 'Tender created' } },
      },
    },
    '/tenders/{id}': {
      get: {
        summary: 'Get tender details by UUID',
        tags: ['Tenders & Notices'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Tender details' } },
      },
    },
    '/bids': {
      get: {
        summary: 'List all submitted bids with compliance scores',
        tags: ['Bids & Submissions'],
        responses: { '200': { description: 'Array of bids' } },
      },
      post: {
        summary: 'Create and submit a new bid dossier',
        tags: ['Bids & Submissions'],
        responses: { '201': { description: 'Bid created' } },
      },
    },
    '/bids/{id}': {
      get: {
        summary: 'Get complete bidder dossier with verifications and audit trail',
        tags: ['Bids & Submissions'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Bidder dossier' } },
      },
    },
    '/bids/{id}/evaluate': {
      post: {
        summary: 'Run full end-to-end evaluation pipeline (Deterministic engine + AI Advisory)',
        tags: ['Evaluation & Compliance'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Evaluation complete' } },
      },
    },
    '/bids/{id}/decision': {
      post: {
        summary: 'Procurement Officer seals final qualification determination',
        tags: ['Procurement Officer Determination'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Decision sealed with cryptographic hash' } },
      },
    },
    '/verification/adapters': {
      get: {
        summary: 'List all registered statutory verification adapters (GST, PAN, UDYAM, etc.)',
        tags: ['Statutory Verification'],
        responses: { '200': { description: 'Registered adapters list' } },
      },
    },
    '/verification/test-portal': {
      post: {
        summary: 'Execute live interactive simulation check against specific government registry',
        tags: ['Statutory Verification'],
        responses: { '200': { description: 'Portal simulation results' } },
      },
    },
    '/jobs/{id}': {
      get: {
        summary: 'Query asynchronous evaluation job status and progress',
        tags: ['Background Job Queue'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Job status and progress percentage' } },
      },
    },
    '/audit': {
      get: {
        summary: 'Retrieve immutable cryptographic audit ledger events',
        tags: ['Audit & Governance'],
        responses: { '200': { description: 'Audit log entries' } },
      },
    },
    '/reports/{bidId}/executive-summary': {
      get: {
        summary: 'Generate formal Executive Evaluation Summary Report',
        tags: ['Reports & Exports'],
        parameters: [{ name: 'bidId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Executive report' } },
      },
    },
  },
};
