import { AuditLog } from '@gev-verify/shared-types';
import { getAllAuditLogs, getDashboardStats } from '@/server/db';

export class AuditRepository {
  async findAll(filter?: { bidId?: string; tenderId?: string; eventType?: string }): Promise<AuditLog[]> {
    return (await getAllAuditLogs(filter)) as any;
  }

  async getDashboardMetrics() {
    return await getDashboardStats();
  }
}
