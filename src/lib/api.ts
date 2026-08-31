import {
  Tender,
  Bid,
  AuditLog,
  OfficerDecision,
  User,
  Verification,
} from '@gev-verify/shared-types';

const API_BASE = '/api';

export class ApiClient {
  private static currentUserRole: string = 'PROCUREMENT_OFFICER';

  static setActiveRole(role: string) {
    this.currentUserRole = role;
  }

  private static getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-user-role': this.currentUserRole,
    };
  }

  // Tenders
  static async getTenders(): Promise<Tender[]> {
    const res = await fetch(`${API_BASE}/tenders`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tenders');
    return res.json();
  }

  static async getTender(id: string): Promise<Tender> {
    const res = await fetch(`${API_BASE}/tenders/${id}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tender');
    return res.json();
  }

  static async createTender(tenderData: any): Promise<Tender> {
    const res = await fetch(`${API_BASE}/tenders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(tenderData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create tender');
    }
    return res.json();
  }

  // Bids
  static async getBids(tenderId?: string): Promise<Bid[]> {
    const url = tenderId ? `${API_BASE}/bids?tenderId=${encodeURIComponent(tenderId)}` : `${API_BASE}/bids`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch bids');
    return res.json();
  }

  static async getBid(id: string): Promise<Bid> {
    const res = await fetch(`${API_BASE}/bids/${id}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch bid details');
    return res.json();
  }

  static async createBid(tenderId: string, bidder: any, quotedAmount: number): Promise<Bid> {
    const res = await fetch(`${API_BASE}/bids`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ tenderId, bidder, quotedAmount }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit bid');
    }
    return res.json();
  }

  static async recordOfficerDecision(
    bidId: string,
    decision: {
      decision: string;
      justification: string;
      discrepanciesNoted?: string[];
      clarificationDeadline?: string;
    }
  ): Promise<OfficerDecision> {
    const res = await fetch(`${API_BASE}/bids/${bidId}/decision`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(decision),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to record officer decision');
    }
    return res.json();
  }

  static async reevaluateBid(bidId: string): Promise<Bid> {
    const res = await fetch(`${API_BASE}/bids/${bidId}/reevaluate`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to reevaluate compliance');
    return res.json();
  }

  static async reanalyzeDocument(docId: string, customInstruction?: string) {
    const res = await fetch(`${API_BASE}/documents/${docId}/reanalyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ customInstruction }),
    });
    if (!res.ok) throw new Error('Failed to re-analyze document');
    return res.json();
  }

  // Dashboard & Audit
  static async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  }

  static async getAuditLogs(filter?: { bidId?: string; tenderId?: string; eventType?: string }): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    if (filter?.bidId) params.append('bidId', filter.bidId);
    if (filter?.tenderId) params.append('tenderId', filter.tenderId);
    if (filter?.eventType) params.append('eventType', filter.eventType);

    const url = params.toString() ? `${API_BASE}/audit-logs?${params.toString()}` : `${API_BASE}/audit-logs`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  }

  // Verification Sandbox
  static async getVerificationAdapters() {
    const res = await fetch(`${API_BASE}/verification/adapters`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch statutory verification adapters');
    return res.json();
  }

  static async testVerificationAdapter(service: string, payload: any) {
    const res = await fetch(`${API_BASE}/verification/adapters/${service}/test`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Statutory adapter test failed');
    }
    return res.json();
  }

  // Grounded RAG Search
  static async searchEvidence(bidId: string, query: string, topK: number = 3, requirementCode?: string) {
    const res = await fetch(`${API_BASE}/evidence/search`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ bidId, query, topK, requirementCode }),
    });
    if (!res.ok) throw new Error('Failed to search grounded evidence');
    return res.json();
  }

  // Auth & Roles
  static async getMe(): Promise<{ user: User; allDemoUsers: User[] }> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch authenticated persona');
    return res.json();
  }

  static async switchRole(roleOrId: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/switch-role`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ roleOrId }),
    });
    if (!res.ok) throw new Error('Failed to switch persona');
    const data = await res.json();
    this.setActiveRole(data.user.role);
    return data;
  }
}
