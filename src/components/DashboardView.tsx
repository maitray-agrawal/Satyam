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

  const filteredBids = bids.filter((b) => {
    const matchesSearch =
      b.bidder?.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bidNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.tender?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || b.riskLevel === riskFilter;
    const matchesTender = tenderFilter === 'ALL' || b.tenderId === tenderFilter;
    return matchesSearch && matchesRisk && matchesTender;
  });

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            LOW RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
            MEDIUM RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
            <ShieldAlert className="w-3 h-3 mr-1 text-orange-600" />
            HIGH RISK
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
            CRITICAL RISK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
            PENDING
          </span>
        );
    }
  };

  const getAiBadge = (rec?: string) => {
    switch (rec) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
            Compliant
          </span>
        );
      case 'MANUAL_REVIEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Info className="w-3 h-3 mr-1 text-amber-600" />
            Manual Review
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
            Non-Compliant
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">Evaluating...</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Officer Mandate */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-5 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-5 pointer-events-none flex items-center pr-8">
          <Scale className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Statutory Compliance Decision Support System</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              GeM Integrated Bid Compliance & Verification Matrix
            </h1>
            <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
              Real-time cross-verification of bidder submissions against simulated Government registries (GSTN, ITD, Udyam MSME, EPFO, ESIC, DPIIT, Central Debarment).
              <span className="text-amber-300 font-semibold block mt-1">
                Mandate: Deterministic business rules govern all compliance scoring. AI suggestions provide decision-support only. Final qualification/disqualification rests strictly with the Procurement Officer.
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-dashboard-refresh"
              onClick={onRefreshAll}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Matrix</span>
            </button>
            <button
              id="btn-dashboard-new-bid"
              onClick={onOpenNewBid}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>+ Ingest Bidder</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Tenders</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats?.activeTendersCount ?? tenders.length}</span>
            <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
              Live Bidding
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">MeitY, AIIMS, SECI</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Bids Evaluated</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats?.totalBidsCount ?? bids.length}</span>
            <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold">
              Total Ingested
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 3 active tenders</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Average Compliance</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700">{stats?.averageComplianceScore ?? 74}%</span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
              Deterministic
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Weighted statutory score</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending TEC Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">{stats?.pendingVerificationCount ?? 7}</span>
            <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold">
              Under Review
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting Officer Decision</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between text-rose-700 text-xs font-bold">
            <span>High/Critical Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-700">{stats?.highRiskBidsCount ?? 4}</span>
            <span className="text-[11px] text-rose-800 bg-rose-100 px-2 py-0.5 rounded font-semibold">
              Portal Anomalies
            </span>
          </div>
          <p className="text-[11px] text-rose-600 mt-1 font-medium">Mismatches / Debarred</p>
        </div>
      </div>

      {/* Analytics Visualizers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bidder Risk Classification</h3>
              <p className="text-[11px] text-slate-500">Based on verified discrepancies & score</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
              {bids.length} Total Bids
            </span>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            {stats?.riskDistribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.riskDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {stats.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Loading risk chart...</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Low Risk (90+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600">Medium (70-89)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="text-slate-600">High Risk (50-69)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600">Critical (&lt;50)</span>
            </div>
          </div>
        </div>

        {/* Category Compliance Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Statutory Requirement Compliance Average (%)</h3>
              <p className="text-[11px] text-slate-500">Cross-verified registry performance across all active bids</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              Deterministic Weights
            </span>
          </div>
          <div className="h-52 w-full">
            {stats?.complianceCategoryScores && stats.complianceCategoryScores.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.complianceCategoryScores} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Average Compliance']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="averageScore" fill="#059669" radius={[4, 4, 0, 0]} barSize={28} />
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Bidder Evaluation & Verification Matrix</h2>
            <span className="bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {filteredBids.length} Bidders
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="input-search-bids"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Bidder, GST, Tender..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none w-48 sm:w-60"
              />
            </div>

            {/* Tender Filter */}
            <select
              id="select-tender-filter"
              value={tenderFilter}
              onChange={(e) => setTenderFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Tenders ({tenders.length})</option>
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tenderId} - {t.title.substring(0, 30)}...
                </option>
              ))}
            </select>

            {/* Risk Filter */}
            <select
              id="select-risk-filter"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Bidder Entity & Identity</th>
                <th className="py-3 px-4">Tender Reference</th>
                <th className="py-3 px-4">Quoted Value</th>
                <th className="py-3 px-4 text-center">Deterministic Score</th>
                <th className="py-3 px-4">Calculated Risk</th>
                <th className="py-3 px-4">AI Advisory</th>
                <th className="py-3 px-4">Officer Action</th>
                <th className="py-3 px-4 text-right">Verification Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredBids.map((bid) => {
                const isDecisionDone = Boolean(bid.officerDecision?.decision);
                return (
                  <tr
                    key={bid.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => onSelectBid(bid.id)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{bid.bidder?.legalName}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2 mt-0.5">
                        <span>GST: {bid.bidder?.gstin}</span>
                        <span>•</span>
                        <span>PAN: {bid.bidder?.pan}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {bid.bidder?.city}, {bid.bidder?.state} • MII Content: {bid.bidder?.localContentPercentage}%
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 font-mono">{bid.tender?.tenderId}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={bid.tender?.title}>
                        {bid.tender?.title}
                      </div>
                      <div className="text-[10px] text-slate-400">{bid.bidNumber}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹ {(bid.quotedAmount / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakhs
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`text-sm font-black font-mono ${
                            (bid.overallScore || 0) >= 90
                              ? 'text-emerald-700'
                              : (bid.overallScore || 0) >= 70
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {bid.overallScore ?? '--'}/100
                        </span>
                        <div className="w-14 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
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
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            bid.officerDecision?.decision === 'APPROVE'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : bid.officerDecision?.decision === 'REJECT'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {bid.officerDecision?.decision}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium italic">Pending Decision</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        id={`btn-open-dossier-${bid.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBid(bid.id);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs"
                      >
                        <span>View Dossier</span>
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
