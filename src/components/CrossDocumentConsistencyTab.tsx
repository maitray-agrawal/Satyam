import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  GitCompare,
  ArrowRight,
  Info,
} from 'lucide-react';
import { CrossDocumentConsistencyReport, InconsistencyItem } from '../types';

interface CrossDocumentConsistencyTabProps {
  consistencyReport?: CrossDocumentConsistencyReport;
  bidderLegalName?: string;
  onTriggerReVerify?: () => void;
}

export const CrossDocumentConsistencyTab: React.FC<CrossDocumentConsistencyTabProps> = ({
  consistencyReport,
  bidderLegalName,
  onTriggerReVerify,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!consistencyReport) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
        <FileQuestion className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Cross-Document Consistency Report Available</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Re-evaluate this bid dossier to run the multi-document contradiction detection engine.
        </p>
        {onTriggerReVerify && (
          <button
            onClick={onTriggerReVerify}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Run Consistency Engine
          </button>
        )}
      </div>
    );
  }

  const {
    consistencyScore,
    overallStatus,
    totalDocumentsAnalyzed,
    inconsistencies = [],
    verifiedMatchesCount,
    summary,
    analyzedAt,
  } = consistencyReport;

  const filteredInconsistencies = inconsistencies.filter((item) => {
    if (filterSeverity !== 'ALL' && item.severity !== filterSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.field.toLowerCase().includes(q) ||
        item.documentA.fileName.toLowerCase().includes(q) ||
        item.documentB.fileName.toLowerCase().includes(q) ||
        item.differenceDescription.toLowerCase().includes(q) ||
        item.materialImpact.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: CrossDocumentConsistencyReport['overallStatus']) => {
    switch (status) {
      case 'CONSISTENT':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>FULLY CONSISTENT DOSSIER</span>
          </span>
        );
      case 'REVIEW_REQUIRED':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>MINOR DISCREPANCY • REVIEW NEEDED</span>
          </span>
        );
      case 'HIGH_RISK_INCONSISTENCIES':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>MATERIAL CONTRADICTION DETECTED</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getSeverityBadge = (sev: InconsistencyItem['severity']) => {
    switch (sev) {
      case 'HIGH_RISK_REVIEW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            HIGH RISK
          </span>
        );
      case 'REVIEW_REQUIRED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            REVIEW NEEDED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            INFORMATIONAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
              <GitCompare className="w-4 h-4 text-teal-600" />
              <span>Multi-Document Integrity Audit</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Cross-Document Consistency Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Detects contradictions, mismatched corporate identifiers, name variations, and discrepancy claims across
              multiple submitted documents (e.g. GST registration vs PAN card vs CA Net Worth Certificate).
            </p>
          </div>
          {onTriggerReVerify && (
            <button
              onClick={onTriggerReVerify}
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-colors shadow-xs self-start md:self-auto"
            >
              <span>Re-Run Analysis</span>
            </button>
          )}
        </div>

        {/* Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Consistency Score</div>
            <div
              className={`text-2xl font-black font-mono mt-0.5 ${
                consistencyScore >= 90
                  ? 'text-emerald-700'
                  : consistencyScore >= 70
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {consistencyScore}/100
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Overall Verdict</div>
            <div className="mt-1">{getStatusBadge(overallStatus)}</div>
          </div>
          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80">
            <div className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">Verified Matches</div>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-0.5">{verifiedMatchesCount}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Contradictions Found</div>
            <div
              className={`text-2xl font-black font-mono mt-0.5 ${
                inconsistencies.length > 0 ? 'text-rose-700' : 'text-slate-700'
              }`}
            >
              {inconsistencies.length}
            </div>
          </div>
        </div>

        {summary && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Summary: </span>
            {summary}
          </div>
        )}
      </div>

      {/* Inconsistencies List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Detected Inconsistencies ({inconsistencies.length})
          </h3>
          {inconsistencies.length > 0 && (
            <div className="flex items-center space-x-1">
              {['ALL', 'HIGH_RISK_REVIEW', 'REVIEW_REQUIRED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    filterSeverity === s
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredInconsistencies.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900">No Material Inconsistencies Detected</h4>
            <p className="text-xs text-slate-500 mt-1">
              All extracted corporate names, tax identifiers, and statutory metrics align consistently across documents.
            </p>
          </div>
        ) : (
          filteredInconsistencies.map((inc) => {
            const isExp = expandedId === inc.id;
            return (
              <div
                key={inc.id}
                className="bg-white rounded-2xl border border-rose-200 shadow-2xs overflow-hidden"
              >
                <div
                  onClick={() => setExpandedId(isExp ? null : inc.id)}
                  className="p-4 bg-rose-50/40 cursor-pointer flex items-center justify-between border-b border-rose-100"
                >
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900 uppercase">{inc.field} Mismatch</span>
                        {getSeverityBadge(inc.severity)}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{inc.differenceDescription}</p>
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* 2-Document Comparison Grid */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Document A: {inc.documentA.fileName} (Page {inc.documentA.page})
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900 bg-white p-2 rounded border border-slate-200">
                      {inc.documentA.value}
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
                    <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-1">
                      Document B: {inc.documentB.fileName} (Page {inc.documentB.page})
                    </div>
                    <div className="text-xs font-mono font-bold text-rose-900 bg-white p-2 rounded border border-rose-200">
                      {inc.documentB.value}
                    </div>
                  </div>
                </div>

                {/* Material Impact & Clarification */}
                <div className="px-4 pb-4 bg-white">
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 text-xs">
                    <div className="font-bold text-amber-900 mb-0.5">Procurement Impact:</div>
                    <p className="text-amber-800 leading-relaxed">{inc.materialImpact}</p>
                    {inc.recommendedClarification && (
                      <div className="mt-2 pt-2 border-t border-amber-200/60 text-amber-900">
                        <span className="font-semibold">Suggested Clarification to Bidder: </span>
                        {inc.recommendedClarification}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
