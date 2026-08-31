import { Request, Response } from 'express';
import { AuditRepository } from '../repositories/audit.repository';

export class AuditController {
  private repo: AuditRepository;

  constructor() {
    this.repo = new AuditRepository();
  }

  getDashboardStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.repo.getDashboardMetrics();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  getAllLogs = async (req: Request, res: Response) => {
    try {
      const filter = {
        bidId: req.query.bidId as string,
        tenderId: req.query.tenderId as string,
        eventType: req.query.eventType as string,
      };
      const logs = await this.repo.findAll(filter);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}
