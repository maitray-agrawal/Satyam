import { Request, Response } from 'express';
import { TenderRepository } from '../repositories/tender.repository';
import { CreateTenderSchema } from '@gev-verify/validation';

export class TenderController {
  private repo: TenderRepository;

  constructor() {
    this.repo = new TenderRepository();
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const tenders = await this.repo.findAll();
      res.json(tenders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const tender = await this.repo.findById(req.params.id);
      if (!tender) {
        return res.status(404).json({ error: 'Tender not found' });
      }
      res.json(tender);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const parseResult = CreateTenderSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: 'Validation failed', details: parseResult.error.issues });
      }
      const newTender = await this.repo.create(parseResult.data);
      res.status(201).json(newTender);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}
