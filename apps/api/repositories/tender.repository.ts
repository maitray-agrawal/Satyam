import { Tender, TenderRequirement } from '@gev-verify/shared-types';
import { getTendersList, getTenderById, getDb, saveDb } from '@/server/db';

export class TenderRepository {
  async findAll(): Promise<Tender[]> {
    return (await getTendersList()) as any;
  }

  async findById(id: string): Promise<Tender | null> {
    return (await getTenderById(id)) as any;
  }

  async create(tenderData: any): Promise<Tender> {
    const db = await getDb();
    const id = `tnd-${Date.now()}`;
    const tenderId = tenderData.tenderId || `GEM/${new Date().getFullYear()}/B/${Math.floor(100000 + Math.random() * 900000)}`;
    const publishedDate = new Date().toISOString();
    const closingDate = tenderData.closingDate || new Date(Date.now() + 14 * 86400000).toISOString();

    db.run(
      `INSERT INTO tenders (id, tenderId, title, organization, category, estimatedValue, emdAmount, publishedDate, closingDate, status, minExperienceYears, minAnnualTurnover, startupExemptionAllowed, msmeExemptionAllowed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        tenderId,
        tenderData.title,
        tenderData.organization || 'Government Department',
        tenderData.category || 'Goods',
        tenderData.estimatedValue || 10000000,
        tenderData.emdAmount || 200000,
        publishedDate,
        closingDate,
        'ACTIVE',
        tenderData.minExperienceYears || 3,
        tenderData.minAnnualTurnover || 10.0,
        tenderData.startupExemptionAllowed !== false ? 1 : 0,
        tenderData.msmeExemptionAllowed !== false ? 1 : 0,
      ]
    );

    const defaultRequirements = [
      { code: 'GST', name: 'Active GST Registration Certificate', weight: 20, isRequired: 1 },
      { code: 'PAN', name: 'PAN Card Registration', weight: 10, isRequired: 1 },
      { code: 'INCOME_TAX', name: '3-Year Audited CA Turnover Certificate (UDIN)', weight: 20, isRequired: 1 },
      { code: 'UDYAM', name: 'Udyam MSME Registration Certificate', weight: 15, isRequired: 0 },
      { code: 'EPFO', name: 'EPFO Monthly Electronic Challan Receipt (ECR)', weight: 15, isRequired: 1 },
      { code: 'BLACKLISTING', name: 'Non-Blacklisting & Integrity Undertaking', weight: 20, isRequired: 1 },
    ];

    const reqs = tenderData.requirements || defaultRequirements;
    for (const r of reqs) {
      db.run(
        `INSERT INTO tender_requirements (id, tenderId, requirementCode, requirementName, isRequired, weight, minThreshold) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`req-${id}-${r.code || r.requirementCode}`, id, r.code || r.requirementCode, r.name || r.requirementName, r.isRequired ? 1 : 0, r.weight || 15, r.minThreshold || null]
      );
    }

    saveDb();
    return (await getTenderById(id)) as any;
  }
}
