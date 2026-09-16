import React, { useState } from 'react';
import {
  Layers,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Bid, EvaluationRun } from '../types';

interface EvaluationsOverviewViewProps {
  bids: Bid[];
  onSelectBid: (bidId: string) => void;
  onRefreshAll: () => void;
}

export const EvaluationsOverviewView: React.FC<EvaluationsOverviewViewProps> = ({
  bids,
  onSelectBid,
  onRefreshAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBidId, setSelectedBidId] = useState<string>(bids.length > 0 ? bids[0].id : '');

  const allRuns: Array<{ run: EvaluationRun; bid: Bid }> = [];
  bids.forEach((bid) => {
    (bid.evaluationRuns || []).forEach((run) => {
      allRuns.push({ run, bid });
    });
  });

  allRuns.sort(
    (a, b) => new Date(b.run.timestamp).getTime() - new Date(a.run.timestamp).getTime()
  );

  const filteredRuns = allRuns.filter(({ run, bid }) => {
    const q = searchTerm.toLowerCase();
    return (
      bid.bidder?.legalName?.toLowerCase().includes(q) ||
      bid.bidNumber.toLowerCase().includes(q) ||
      run.evaluatorName.toLowerCase().includes(q) ||
      run.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Immutable Evaluation Snapshots</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Central Evaluation Runs & Version History
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Tamper-evident chronological log of all automated compliance runs across active bids, with ruleset versions and SHA-256 state proofs.
          </p>
        </div>

        <button
          onClick={onRefreshAll}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition shadow-xs self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Runs</span>
        </button>
      </div>

      {/* Runs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-slate-900">Recorded Evaluation Runs</h2>
            <span className="bg-white border border-slate-200 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded">
              {filteredRuns.length} Runs
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search run ID, bidder, officer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Run Identifier</th>
                <th className="py-3 px-4">Bidder & Tender</th>
                <th className="py-3 px-4">Evaluator</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredRuns.map(({ run, bid }) => (
                <tr
                  key={run.id}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => onSelectBid(bid.id)}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900 text-[11px]">
                      {run.id.substring(0, 14)}...
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Ruleset Version: v{run.rulesetVersion}.0
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{bid.bidder?.legalName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{bid.bidNumber}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{run.evaluatorName}</div>
                    <div className="text-[10px] text-slate-500">{run.evaluatorRole}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`font-mono font-black text-sm ${
                        run.overallScore >= 90
                          ? 'text-emerald-700'
                          : run.overallScore >= 70
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {run.overallScore}/100
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        run.riskLevel === 'LOW'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : run.riskLevel === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : run.riskLevel === 'HIGH'
                          ? 'bg-orange-50 text-orange-800 border-orange-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {run.riskLevel}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                    {new Date(run.timestamp).toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBid(bid.id);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
