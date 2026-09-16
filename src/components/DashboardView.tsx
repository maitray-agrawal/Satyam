import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Building,
  Clock,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Info,
  Scale,
  Sparkles,
  Zap,
  Check,
  XCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Bid, DashboardStats, Tender } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  bids: Bid[];
  tenders: Tender[];
  onSelectBid: (bidId: string) => void;
  onRefreshAll: () => void;
  onOpenNewTender: () => void;
  onOpenNewBid: () => void;
  loading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  bids,
  tenders,
  onSelectBid,
  onRefreshAll,
  onOpenNewTender,
  onOpenNewBid,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [tenderFilter, setTenderFilter] = useState<string>('ALL');

  // Count missing evidence bids
  const missingEvidenceCount = bids.filter((b) => {
    const recs = b.reconciliationResults || [];
    return recs.some((r) => r.outcome === 'MISSING_EVIDENCE');
  }).length;

  const filteredBids = bids.filter((b) => {
    const matchesSearch =
      b.bidder?.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bidNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.tender?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bidder?.gstin?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || b.riskLevel === riskFilter;
    const matchesTender = tenderFilter === 'ALL' || b.tenderId === tenderFilter;
    return matchesSearch && matchesRisk && matchesTender;
  });

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            LOW RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
            MEDIUM RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
            <ShieldAlert className="w-3 h-3 mr-1 text-orange-600" />
            HIGH RISK
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
            CRITICAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            EVALUATING
          </span>
        );
    }
  };

  const getAiBadge = (rec?: string) => {
    switch (rec) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
            Compliant
          </span>
        );
      case 'MANUAL_REVIEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Info className="w-3 h-3 mr-1 text-amber-600" />
            Review Needed
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
            Non-Compliant
          </span>
        );
      default:
        return <span className="text-[11px] text-slate-400">Assessing...</span>;
    }
  };

  // High priority review items for the officer queue
  const pendingOfficerQueue = bids.filter(
    (b) => !b.officerDecision?.decision && (b.riskLevel === 'CRITICAL' || b.riskLevel === 'HIGH' || b.riskLevel === 'MEDIUM')
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>SIH 2026 PS 26100 • GeM Decision-Support</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">SATYAM</h1>
          <h2 className="text-sm font-semibold text-slate-600 mt-0.5">
            Procurement Compliance Intelligence & Verification Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-3xl leading-relaxed">
            Automated three-way evidence reconciliation against 13 simulated statutory government registries (GSTN, ITD, Udyam MSME, EPFO, ESIC, DPIIT, Central Debarment).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-dashboard-refresh"
            onClick={onRefreshAll}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            id="btn-dashboard-new-tender"
            onClick={onOpenNewTender}
            className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-2xs"
          >
            <span>+ New Tender</span>
          </button>
          <button
            id="btn-dashboard-new-bid"
            onClick={onOpenNewBid}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Ingest Bidder</span>
          </button>
        </div>
      </div>

      {/* SIH Hackathon 5 Demo Scenarios Quick Access Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" />
              Evaluation Demo Scenarios (Click to Inspect)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Directly testable for SIH Evaluation Panel
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Scenario 1: TechVanguard */}
          <button
            onClick={() => {
              const b = bids.find((item) => item.bidder?.legalName?.toLowerCase().includes('techvanguard') || item.id === 'bid-1');
              if (b) onSelectBid(b.id);
            }}
            className="text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">Scenario 1</span>
              <span className="font-mono text-emerald-700 font-bold">100/100</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate group-hover:text-emerald-700">
              TechVanguard
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              Clean 3-Way Match • Low Risk
            </div>
          </button>

          {/* Scenario 2: Apex Infotech */}
          <button
            onClick={() => {
              const b = bids.find((item) => item.bidder?.legalName?.toLowerCase().includes('apex') || item.id === 'bid-2');
              if (b) onSelectBid(b.id);
            }}
            className="text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-orange-500 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded">Scenario 2</span>
              <span className="font-mono text-orange-700 font-bold">70/100</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate group-hover:text-orange-700">
              Apex Infotech
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              Expired OEM Authorization
            </div>
          </button>

          {/* Scenario 3: Bharat Electro */}
          <button
            onClick={() => {
              const b = bids.find((item) => item.bidder?.legalName?.toLowerCase().includes('bharat') || item.id === 'bid-3');
              if (b) onSelectBid(b.id);
            }}
            className="text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-orange-500 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded">Scenario 3</span>
              <span className="font-mono text-orange-700 font-bold">75/100</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate group-hover:text-orange-700">
              Bharat Electro
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              Make in India Shortfall: 38% vs 65%
            </div>
          </button>

          {/* Scenario 4: Global Quantum */}
          <button
            onClick={() => {
              const b = bids.find((item) => item.bidder?.legalName?.toLowerCase().includes('global') || item.id === 'bid-4');
              if (b) onSelectBid(b.id);
            }}
            className="text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-rose-500 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded">Scenario 4</span>
              <span className="font-mono text-rose-700 font-bold">5/100</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate group-hover:text-rose-700">
              Global Quantum
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              Debarred GFR 151 • Disqualified
            </div>
          </button>

          {/* Scenario 5: Surya Solar */}
          <button
            onClick={() => {
              const b = bids.find(
                (item) => item.bidder?.legalName?.toLowerCase().includes('surya') || item.id === 'bid-7'
              );
              if (b) onSelectBid(b.id);
            }}
            className="text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">Scenario 5</span>
              <span className="font-mono text-teal-700 font-bold">100/100</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate group-hover:text-teal-700">
              Surya Solar
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              Startup India Exemption Applied
            </div>
          </button>
        </div>
      </div>

      {/* 6 Clean KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Active Tenders */}
        <div
          onClick={() => setTenderFilter('ALL')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Tenders</span>
            <Building className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {stats?.activeTendersCount ?? tenders.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Live RFP Mandates</div>
        </div>

        {/* Card 2: Bids Evaluated */}
        <div
          onClick={() => {
            setRiskFilter('ALL');
            setSearchTerm('');
          }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Bids Evaluated</span>
            <FileCheck className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {stats?.totalBidsCount ?? bids.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Ingested Dossiers</div>
        </div>

        {/* Card 3: Average Compliance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Avg Compliance</span>
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-teal-700">
            {stats?.averageComplianceScore ?? 74}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Deterministic Score</div>
        </div>

        {/* Card 4: Pending Reviews */}
        <div
          onClick={() => setRiskFilter('MEDIUM')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Reviews</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">
            {stats?.pendingVerificationCount ?? pendingOfficerQueue.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Officer Action Needed</div>
        </div>

        {/* Card 5: High-Risk Bids */}
        <div
          onClick={() => setRiskFilter('HIGH')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>High-Risk Bids</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700">
            {stats?.highRiskBidsCount ?? 4}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Discrepant / Flagged</div>
        </div>

        {/* Card 6: Missing Evidence */}
        <div
          onClick={() => setSearchTerm('')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Missing Evidence</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800">
            {missingEvidenceCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Shortfall Notices</div>
        </div>
      </div>

      {/* Compliance Overview & Risk Distribution Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Risk Distribution</h3>
              <p className="text-[11px] text-slate-500">Classified by verified discrepancies</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              {bids.length} Bids
            </span>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            {stats?.riskDistribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.riskDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {stats.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      color: '#0f172a',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Loading risk metrics...</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Low (90+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-slate-600">Medium (70-89)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-slate-600">High (50-69)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-slate-600">Critical (&lt;50)</span>
            </div>
          </div>
        </div>

        {/* Category Compliance Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Compliance Overview by Category (%)</h3>
              <p className="text-[11px] text-slate-500">Deterministic scoring across active tender requirements</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              GFR 2017 Weighted
            </span>
          </div>

          <div className="h-48 w-full">
            {stats?.complianceCategoryScores && stats.complianceCategoryScores.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.complianceCategoryScores} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Average Score']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      color: '#0f172a',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="averageScore" fill="#0f766e" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Calculating compliance stats...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bidder Evaluation Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-slate-900">Bidder Compliance & Verification Dossiers</h2>
            <span className="bg-white border border-slate-200 text-slate-700 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md">
              {filteredBids.length} of {bids.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3 h-3 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="input-search-bids"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by bidder, GSTIN, tender..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none w-48 sm:w-60"
              />
            </div>

            {/* Tender Filter */}
            <select
              id="select-tender-filter"
              value={tenderFilter}
              onChange={(e) => setTenderFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Tenders ({tenders.length})</option>
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tenderId} - {t.title.substring(0, 28)}...
                </option>
              ))}
            </select>

            {/* Risk Filter */}
            <select
              id="select-risk-filter"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Bidder Entity</th>
                <th className="py-3 px-4">Tender Reference</th>
                <th className="py-3 px-4">Quoted Amount</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">AI Advisory</th>
                <th className="py-3 px-4">Officer Action</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredBids.map((bid) => {
                const isDecisionDone = Boolean(bid.officerDecision?.decision);
                return (
                  <tr
                    key={bid.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => onSelectBid(bid.id)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{bid.bidder?.legalName}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1.5 mt-0.5">
                        <span>GSTIN: {bid.bidder?.gstin}</span>
                        <span>•</span>
                        <span>PAN: {bid.bidder?.pan}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {bid.bidder?.city}, {bid.bidder?.state} • MII: {bid.bidder?.localContentPercentage}%
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 font-mono">{bid.tender?.tenderId}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]" title={bid.tender?.title}>
                        {bid.tender?.title}
                      </div>
                      <div className="text-[10px] text-slate-400">{bid.bidNumber}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹ {(bid.quotedAmount / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`text-sm font-black font-mono ${
                            (bid.overallScore || 0) >= 90
                              ? 'text-emerald-700'
                              : (bid.overallScore || 0) >= 70
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {bid.overallScore ?? '--'}/100
                        </span>
                        <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${
                              (bid.overallScore || 0) >= 90
                                ? 'bg-emerald-500'
                                : (bid.overallScore || 0) >= 70
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${bid.overallScore || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getRiskBadge(bid.riskLevel)}</td>

                    <td className="py-3.5 px-4">{getAiBadge(bid.aiRecommendation?.recommendation)}</td>

                    <td className="py-3.5 px-4">
                      {isDecisionDone ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            bid.officerDecision?.decision === 'APPROVE'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : bid.officerDecision?.decision === 'REJECT'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {bid.officerDecision?.decision}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium italic">Pending</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        id={`btn-open-dossier-${bid.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBid(bid.id);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-2xs"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
