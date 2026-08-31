import { Bid, OfficerDecision, ExtractedField } from '@gev-verify/shared-types';
import {
  getBidsList,
  getBidFullDetails,
  createBidderAndBid,
  saveOfficerDecision as dbSaveOfficerDecision,
  rerunVerificationAndCompliance,
  reanalyzeDocumentInDb,
} from '@/server/db';

export class BidRepository {
  async findAll(tenderId?: string): Promise<Bid[]> {
    return (await getBidsList(tenderId)) as any;
  }

  async findById(id: string): Promise<Bid | null> {
    return (await getBidFullDetails(id)) as any;
  }

  async create(tenderId: string, bidderData: any, quotedAmount: number): Promise<Bid> {
    return (await createBidderAndBid(tenderId, bidderData, quotedAmount)) as any;
  }

  async saveDecision(bidId: string, decision: any): Promise<OfficerDecision> {
    return (await dbSaveOfficerDecision(bidId, decision)) as any;
  }

  async reevaluateCompliance(bidId: string): Promise<Bid | null> {
    return (await rerunVerificationAndCompliance(bidId)) as any;
  }

  async reanalyzeDocument(documentId: string, fields: ExtractedField[]) {
    return await reanalyzeDocumentInDb(documentId, fields as any);
  }
}
