import { Request, Response } from 'express';
import { BidRepository } from '../repositories/bid.repository';
import { CreateBidSchema, OfficerDecisionSchema } from '@gev-verify/validation';

export class BidController {
  private repo: BidRepository;

  constructor() {
    this.repo = new BidRepository();
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const tenderId = req.query.tenderId as string | undefined;
      const bids = await this.repo.findAll(tenderId);
      res.json(bids);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const bid = await this.repo.findById(req.params.id);
      if (!bid) {
        return res.status(404).json({ error: 'Bid not found' });
      }
      res.json(bid);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { tenderId, bidder, quotedAmount } = req.body;
      if (!tenderId || !bidder || !quotedAmount) {
        return res.status(400).json({ error: 'tenderId, bidder data, and quotedAmount are required' });
      }
      const newBid = await this.repo.create(tenderId, bidder, quotedAmount);
      res.status(201).json(newBid);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  saveDecision = async (req: Request, res: Response) => {
    try {
      const parseResult = OfficerDecisionSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: 'Validation failed', details: parseResult.error.issues });
      }
      const officer = (req as any).user || { name: 'Procurement Officer', role: 'PROCUREMENT_OFFICER' };
      const decisionPayload = {
        officerName: req.body.officerName || officer.name,
        officerDesignation: req.body.officerDesignation || 'Assistant Director (Procurement)',
        decision: parseResult.data.decision === 'ACCEPT' ? 'APPROVE' : parseResult.data.decision === 'REJECT' ? 'REJECT' : 'REQUEST_CLARIFICATION',
        comments: parseResult.data.justification,
        conditions: parseResult.data.discrepanciesNoted,
      };
      const result = await this.repo.saveDecision(req.params.id, decisionPayload);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  reevaluate = async (req: Request, res: Response) => {
    try {
      const updatedBid = await this.repo.reevaluateCompliance(req.params.id);
      if (!updatedBid) {
        return res.status(404).json({ error: 'Bid not found' });
      }
      res.json(updatedBid);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  reanalyzeDoc = async (req: Request, res: Response) => {
    try {
      const fields = req.body?.fields || [];
      const updatedDoc = await this.repo.reanalyzeDocument(req.params.docId, fields);
      if (!updatedDoc) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json(updatedDoc);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}
