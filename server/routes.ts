import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import {
  getTendersList,
  getTenderById,
  createTender,
  getBidsList,
  getBidFullDetails,
  createBidderAndBid,
  addDocumentToBid,
  reanalyzeDocumentInDb,
  rerunVerificationAndCompliance,
  saveOfficerDecision,
  getDashboardStats,
  getAllAuditLogs,
} from './db';
import { VerificationSimulators } from './verificationSimulators';
import { analyzeDocumentWithGemini, queryCopilot } from './gemini';
import { Document, RequirementCode } from './types';
import { AuthService } from './modules/auth/auth.service';
import { authMiddleware, requireRole } from './modules/auth/auth.middleware';
import { openApiSpec } from './openapi/openapi.spec';
import { initializeVerificationRegistry } from './integrations/verification';
import { JobQueueService } from './jobs/job-queue.service';
import { EvidenceService } from './ai/evidence.service';
import { createServiceLogger } from './observability/logger';

const log = createServiceLogger('ApiGateway');
const verificationRegistry = initializeVerificationRegistry();
const jobQueue = JobQueueService.getInstance();
const evidenceService = EvidenceService.getInstance();

export const apiRouter = Router();

// Apply auth middleware to tag user role on requests
apiRouter.use(authMiddleware);

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer configuration for file uploads with size and MIME validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, PNG, JPG, and JPEG files are permitted under GeM procurement rules.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
});

// ---------------- DASHBOARD ----------------
apiRouter.get('/dashboard/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- TENDERS ----------------
apiRouter.get('/tenders', async (req: Request, res: Response) => {
  try {
    const list = await getTendersList();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/tenders/:id', async (req: Request, res: Response) => {
  try {
    const tender = await getTenderById(req.params.id);
    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }
    res.json(tender);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/tenders', async (req: Request, res: Response) => {
  try {
    const { tender, requirements } = req.body;
    if (!tender || !tender.tenderId || !tender.title) {
      return res.status(400).json({ error: 'Tender ID and Title are required' });
    }
    const created = await createTender(tender, requirements || []);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- BIDS & BIDDERS ----------------
apiRouter.get('/bids', async (req: Request, res: Response) => {
  try {
    const tenderId = req.query.tenderId as string | undefined;
    const bids = await getBidsList(tenderId);
    res.json(bids);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/bids/:id', async (req: Request, res: Response) => {
  try {
    const bid = await getBidFullDetails(req.params.id);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    res.json(bid);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/bids/:id/cross-verification', async (req: Request, res: Response) => {
  try {
    const bid = await getBidFullDetails(req.params.id);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    res.json(bid.crossVerificationReport || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/bids/:id/evaluate-compliance', async (req: Request, res: Response) => {
  try {
    const updated = await rerunVerificationAndCompliance(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    res.json({
      checks: updated.complianceChecks || [],
      riskAssessment: updated.riskAssessment || null,
      score: updated.overallScore,
      riskLevel: updated.riskLevel,
      passedChecks: updated.riskAssessment?.passedChecksCount || 0,
      failedChecks: updated.riskAssessment?.failedChecksCount || 0,
      pendingChecks: updated.riskAssessment?.pendingChecksCount || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/bids', async (req: Request, res: Response) => {
  try {
    const { tenderId, bidder, quotedAmount } = req.body;
    if (!tenderId || !bidder || !bidder.legalName || !bidder.pan || !bidder.gstin) {
      return res.status(400).json({ error: 'Tender ID, Bidder Legal Name, PAN, and GSTIN are required' });
    }
    const newBid = await createBidderAndBid(tenderId, bidder, quotedAmount || 1000000);
    res.status(201).json(newBid);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/bids/:id/re-verify', async (req: Request, res: Response) => {
  try {
    const updated = await rerunVerificationAndCompliance(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/bids/:id/decision', async (req: Request, res: Response) => {
  try {
    const { officerName, officerDesignation, decision, comments, conditions } = req.body;
    if (!decision || !comments) {
      return res.status(400).json({ error: 'Decision and Officer comments are mandatory' });
    }
    const record = await saveOfficerDecision(req.params.id, {
      officerName: officerName || 'Rajiv K. Sharma',
      officerDesignation: officerDesignation || 'Director (Procurement & Contracts)',
      decision,
      comments,
      conditions,
    });
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- DOCUMENT UPLOADS & GEMINI EXTRACTION ----------------
apiRouter.post('/documents/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { bidId, bidderId, tenderId, documentType } = req.body;
    if (!bidId || !bidderId || !tenderId || !documentType) {
      return res.status(400).json({ error: 'bidId, bidderId, tenderId, and documentType are required' });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const base64Content = fileBuffer.toString('base64');

    const tempDoc: Document = {
      id: 'temp',
      bidId,
      bidderId,
      tenderId,
      documentType: documentType as RequirementCode,
      fileName: req.file.filename,
      fileOriginalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadTimestamp: new Date().toISOString(),
      status: 'PENDING',
      verificationStatus: 'NOT_VERIFIED',
      sha256Hash,
    };

    // Analyze with Gemini
    const extractedData = await analyzeDocumentWithGemini(tempDoc, base64Content, req.file.mimetype);

    // Save document and extracted fields to DB
    const savedDoc = await addDocumentToBid(
      {
        bidId,
        bidderId,
        tenderId,
        documentType: documentType as RequirementCode,
        fileName: req.file.filename,
        fileOriginalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileUrl: `/uploads/${req.file.filename}`,
        sha256Hash,
      },
      extractedData.fields.map((f, idx) => ({
        id: `f-${idx}`,
        documentId: '',
        fieldName: f.fieldName,
        fieldValue: f.fieldValue,
        confidence: f.confidence,
        sourcePage: f.sourcePage || 1,
        isPresent: f.isPresent,
        rawSnippet: f.rawSnippet,
        missingReason: f.missingReason,
        category: f.category || 'STATUTORY',
      }))
    );

    // Re-evaluate bid compliance automatically
    await rerunVerificationAndCompliance(bidId);
    const updatedBid = await getBidFullDetails(bidId);

    res.status(201).json({
      document: savedDoc,
      extraction: extractedData,
      updatedBid,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Re-analyze existing document with Gemini
apiRouter.post('/documents/:id/re-analyze', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { bidId } = req.body;

    if (!bidId) {
      return res.status(400).json({ error: 'bidId is required' });
    }

    const bid = await getBidFullDetails(bidId);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    const doc = (bid.documents || []).find((d) => d.id === id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Attempt to load file buffer if present on disk
    let fileBase64: string | undefined;
    const localFilePath = path.join(UPLOADS_DIR, doc.fileName);
    if (fs.existsSync(localFilePath)) {
      const buf = fs.readFileSync(localFilePath);
      fileBase64 = buf.toString('base64');
    }

    const extraction = await analyzeDocumentWithGemini(doc, fileBase64, doc.mimeType);

    const reanalyzedFields = extraction.fields.map((f, idx) => ({
      id: `ref-${idx}`,
      documentId: id,
      fieldName: f.fieldName,
      fieldValue: f.fieldValue,
      confidence: f.confidence,
      sourcePage: f.sourcePage || 1,
      isPresent: f.isPresent,
      rawSnippet: f.rawSnippet,
      missingReason: f.missingReason,
      category: f.category || 'STATUTORY',
    }));

    const updatedDoc = await reanalyzeDocumentInDb(id, reanalyzedFields);
    await rerunVerificationAndCompliance(bidId);
    const updatedBid = await getBidFullDetails(bidId);

    res.json({
      document: updatedDoc,
      extraction,
      updatedBid,
    });
  } catch (err: any) {
    console.error('Re-analysis error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------- GOVERNMENT VERIFICATION SIMULATORS (MOCK APIS) ----------------
apiRouter.get('/verify/gst', (req: Request, res: Response) => {
  const gstin = (req.query.gstin as string) || '';
  res.json(VerificationSimulators.verifyGst(gstin));
});

apiRouter.get('/verify/pan', (req: Request, res: Response) => {
  const pan = (req.query.pan as string) || '';
  res.json(VerificationSimulators.verifyPan(pan));
});

apiRouter.get('/verify/udyam', (req: Request, res: Response) => {
  const udyam = (req.query.udyam as string) || (req.query.udyamNumber as string) || '';
  res.json(VerificationSimulators.verifyUdyam(udyam));
});

apiRouter.get('/verify/income-tax', (req: Request, res: Response) => {
  const pan = (req.query.pan as string) || '';
  res.json(VerificationSimulators.verifyIncomeTax(pan));
});

apiRouter.get('/verify/epfo', (req: Request, res: Response) => {
  const estId = req.query.estId as string;
  const pan = req.query.pan as string;
  res.json(VerificationSimulators.verifyEpfo(estId, pan));
});

apiRouter.get('/verify/esic', (req: Request, res: Response) => {
  const code = req.query.code as string;
  const pan = req.query.pan as string;
  res.json(VerificationSimulators.verifyEsic(code, pan));
});

apiRouter.get('/verify/startup', (req: Request, res: Response) => {
  const dpiit = (req.query.dpiit as string) || '';
  res.json(VerificationSimulators.verifyStartup(dpiit));
});

apiRouter.get('/verify/nsic', (req: Request, res: Response) => {
  const regNo = (req.query.regNo as string) || '';
  res.json(VerificationSimulators.verifyNsic(regNo));
});

apiRouter.get('/verify/blacklist', (req: Request, res: Response) => {
  const pan = req.query.pan as string;
  const gstin = req.query.gstin as string;
  const name = req.query.name as string;
  res.json(VerificationSimulators.verifyBlacklist(pan, gstin, name));
});

apiRouter.get('/verify/oem', (req: Request, res: Response) => {
  const oemName = req.query.oemName as string;
  const authCode = req.query.authCode as string;
  res.json(VerificationSimulators.verifyOem(oemName, authCode));
});

apiRouter.get('/verify/mii', (req: Request, res: Response) => {
  const companyName = (req.query.companyName as string) || '';
  res.json(VerificationSimulators.verifyMii(companyName));
});

// ---------------- AI COPILOT ----------------
apiRouter.post('/ai/copilot', async (req: Request, res: Response) => {
  try {
    const { query, bidContext } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const responseText = await queryCopilot(query, bidContext || {});
    res.json({ response: responseText });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- AUDIT LOGS ----------------
apiRouter.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const bidId = req.query.bidId as string | undefined;
    const tenderId = req.query.tenderId as string | undefined;
    const eventType = req.query.eventType as string | undefined;
    const logs = await getAllAuditLogs({ bidId, tenderId, eventType });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- ENTERPRISE AUTH & RBAC ----------------
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  res.json({
    user: req.user,
    allDemoUsers: AuthService.listAllDemoUsers(),
  });
});

apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { roleOrId } = req.body;
  const user = AuthService.getCurrentUser(roleOrId);
  res.json({
    success: true,
    user,
    message: `Active persona switched to ${user.name} (${user.role})`,
  });
});

// ---------------- OPENAPI SPECIFICATION & DOCUMENTATION ----------------
apiRouter.get('/openapi.json', (req: Request, res: Response) => {
  res.json(openApiSpec);
});

apiRouter.get('/docs', (req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GEV-VERIFY API Documentation | OpenAPI 3.0</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; font-family: sans-serif; }
    .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// ---------------- STATUTORY VERIFICATION ADAPTERS REGISTRY ----------------
apiRouter.get('/verification/adapters', (req: Request, res: Response) => {
  const adapters = verificationRegistry.getAllAdapters().map((a) => ({
    serviceName: a.serviceName,
    supportedCodes: a.supportedRequirementCodes,
    architecture: 'Simulated / Authorizable Gov API Integration',
    simulationNotice: 'DEMO / SIMULATED GOVERNMENT DATA',
    status: 'ACTIVE_HEALTHY',
  }));
  res.json({
    count: adapters.length,
    adapters,
  });
});

apiRouter.post('/verification/adapters/:service/test', async (req: Request, res: Response) => {
  try {
    const { service } = req.params;
    const adapter = verificationRegistry.getAdapter(service);
    if (!adapter) {
      return res.status(404).json({ error: `Adapter for service ${service} not registered` });
    }
    const result = await adapter.verify({
      requirementCode: req.body.requirementCode || 'REQ-01',
      bidId: req.body.bidId || 'test-bid',
      bidderGstin: req.body.gstin,
      bidderPan: req.body.pan,
      bidderLegalName: req.body.legalName,
      documentData: req.body.data,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- BACKGROUND JOB QUEUE ----------------
apiRouter.get('/jobs', (req: Request, res: Response) => {
  res.json(jobQueue.getAllJobs());
});

apiRouter.get('/jobs/:id', (req: Request, res: Response) => {
  const job = jobQueue.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// ---------------- EVIDENCE GROUNDED RAG SEARCH ----------------
apiRouter.post('/evidence/search', async (req: Request, res: Response) => {
  try {
    const { bidId, query, topK, requirementCode } = req.body;
    if (!bidId || !query) {
      return res.status(400).json({ error: 'bidId and query are required' });
    }
    const results = await evidenceService.retrieveRelevantEvidence(bidId, query, topK || 3, requirementCode);
    res.json({
      bidId,
      query,
      resultsCount: results.length,
      evidence: results,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- EXECUTIVE SUMMARY REPORTS ----------------
apiRouter.get('/reports/:bidId/executive-summary', async (req: Request, res: Response) => {
  try {
    const bid = await getBidFullDetails(req.params.bidId);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    res.json({
      tenderId: bid.tender?.tenderId,
      tenderTitle: bid.tender?.title,
      bidderName: bid.bidder?.legalName,
      bidNumber: bid.bidNumber,
      deterministicScore: bid.overallScore,
      riskLevel: bid.riskLevel,
      complianceStatus: bid.status,
      aiAdvisory: bid.aiRecommendation?.recommendation,
      aiReason: bid.aiRecommendation?.reason,
      officerDecision: bid.officerDecision?.decision || 'PENDING',
      officerSignoff: bid.officerDecision?.officerName || null,
      generatedAt: new Date().toISOString(),
      statutoryStandard: 'General Financial Rules (GFR 2017) Rule 144 & GeM GTC',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
