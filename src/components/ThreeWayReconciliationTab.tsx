import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  FileText,
  Building2,
  Scale,
  ShieldCheck,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowDown,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { ThreeWayReconciliationItem } from '../types';

interface ThreeWayReconciliationTabProps {
  reconciliations?: ThreeWayReconciliationItem[];
  bidId: string;
  bidderLegalName?: string;
  onTriggerReVerify?: () => void;
}

export const ThreeWayReconciliationTab: React.FC<ThreeWayReconciliationTabProps> = ({
  reconciliations = [],
  bidId,
  bidderLegalName,
  onTriggerReVerify,
}) => {
  const [filterOutcome, setFilterOutcome] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalCount = reconciliations.length;
  const compliantCount = reconciliations.filter((r) => r.outcome === 'COMPLIANT').length;
  const reviewCount = reconciliations.filter((r) => r.outcome === 'REVIEW_REQUIRED').length;
  const nonCompliantCount = reconciliations.filter(
    (r) => r.outcome === 'NON_COMPLIANT' || r.outcome === 'INCONSISTENT'
  ).length;
  const missingCount = reconciliations.filter((r) => r.outcome === 'MISSING_EVIDENCE').length;

  const filteredItems = reconciliations.filter((item) => {
    if (filterOutcome !== 'ALL' && item.outcome !== filterOutcome) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const codeMatch = item.requirementCode.toLowerCase().includes(q);
      const nameMatch = item.requirementTitle.toLowerCase().includes(q);
      const reasonMatch = (item.reason || '').toLowerCase().includes(q);
      return codeMatch || nameMatch || reasonMatch;
    }
    return true;
  });

  const getOutcomeBadge = (outcome: ThreeWayReconciliationItem['outcome']) => {
    switch (outcome) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>3-WAY MATCH • COMPLIANT</span>
          </span>
        );
      case 'REVIEW_REQUIRED':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>SCRUTINY REQUIRED</span>
          </span>
        );
      case 'NON_COMPLIANT':
      case 'INCONSISTENT':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>EVIDENCE CONFLICT • NON-COMPLIANT</span>
          </span>
        );
      case 'MISSING_EVIDENCE':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>MISSING EVIDENCE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>EXEMPTED</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner: Clean light enterprise with subtle slate borders */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Hero Architecture •    </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Three-Way Evidence Reconciliation
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Automated proof triangulation comparing the <strong>Authoritative Tender Requirement</strong>,{' '}
              <strong>Bidder Submitted Document Evidence</strong>, and{' '}
              <strong>Simulated Statutory Government Registry API Evidence</strong> (GSTN, ITD, Udyam MSME, EPFO, ESIC, DPIIT, Central Debarment).
            </p>
          </div>
          {onTriggerReVerify && (
            <button
              onClick={onTriggerReVerify}
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-colors shadow-xs self-start md:self-auto"
            >
              <span>Re-Run Triangulation</span>
            </button>
          )}
        </div>

        {/* 5 KPI Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Total Evaluated</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">{totalCount}</div>
          </div>
          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80">
            <div className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">3-Way Matches</div>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-0.5">{compliantCount}</div>
          </div>
          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
            <div className="text-[11px] text-amber-800 font-semibold uppercase tracking-wider">Review Required</div>
            <div className="text-2xl font-black font-mono text-amber-700 mt-0.5">{reviewCount}</div>
          </div>
          <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200/80">
            <div className="text-[11px] text-rose-800 font-semibold uppercase tracking-wider">Conflicts / Shortfalls</div>
            <div className="text-2xl font-black font-mono text-rose-700 mt-0.5">{nonCompliantCount}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">Missing Docs</div>
            <div className="text-2xl font-black font-mono text-slate-700 mt-0.5">{missingCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search clause code, title, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium mr-1 flex items-center">
            <Filter className="w-3 h-3 mr-1 text-slate-400" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'COMPLIANT', label: '3-Way Match' },
            { id: 'REVIEW_REQUIRED', label: 'Review' },
            { id: 'NON_COMPLIANT', label: 'Conflicts' },
            { id: 'MISSING_EVIDENCE', label: 'Missing' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterOutcome(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${filterOutcome === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Way Reconciliation Triangulation Cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-600 font-medium">No reconciliation items match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const isConflict = item.outcome === 'NON_COMPLIANT' || item.outcome === 'INCONSISTENT';
            const isWarning = item.outcome === 'REVIEW_REQUIRED';
            const isMissing = item.outcome === 'MISSING_EVIDENCE';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all shadow-2xs ${isConflict
                  ? 'border-rose-300 ring-1 ring-rose-200/50'
                  : isWarning
                    ? 'border-amber-300 ring-1 ring-amber-200/50'
                    : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                {/* Clause Title & Status Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 rounded-t-2xl transition-colors border-b border-slate-100"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${isConflict
                        ? 'bg-rose-50 text-rose-700'
                        : isWarning
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.requirementCode}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{item.requirementTitle}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-auto">
                    {getOutcomeBadge(item.outcome)}
                    <div className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      Score: {item.scoreAchieved}/{item.weight}
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* THE 3-WAY RECONCILIATION VISUAL ARCHITECTURE */}
                <div className="p-5 bg-slate-50/40">
                  {/* Step 1: Tender Requirement (Top Center) */}
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        <span className="flex items-center text-slate-700">
                          <FileText className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                          1. Authoritative Tender Mandate
                        </span>
                        <span className="text-slate-600 font-mono text-[10px]">Weight: {item.weight}%</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 leading-snug">
                        {item.tenderCondition.ruleDescription}
                      </div>
                      {item.tenderCondition.threshold !== undefined && (
                        <div className="mt-2 text-[11px] text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono">
                          <span className="text-slate-400 font-sans">Mandated Threshold: </span>
                          <span className="font-bold text-slate-900">{item.tenderCondition.threshold}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flow Connectors: Downwards split into 2 branches */}
                  <div className="flex justify-center items-center py-2 text-slate-300">
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-3 bg-slate-300" />
                      <div className="flex items-center">
                        <div className="w-24 sm:w-48 h-0.5 bg-slate-300" />
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <div className="w-24 sm:w-48 h-0.5 bg-slate-300" />
                      </div>
                      <div className="flex justify-between w-48 sm:w-96 text-slate-400">
                        <ArrowDown className="w-3.5 h-3.5" />
                        <ArrowDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Step 2 & 3: Document Evidence vs Govt Portal Registry (Side by Side) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Branch A: Document Evidence */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        <span className="flex items-center text-slate-700">
                          <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                          2. Extracted Document Evidence
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${item.documentEvidence.hasDocument
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                        >
                          {item.documentEvidence.hasDocument ? 'SUBMITTED' : 'NOT UPLOADED'}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-900 leading-snug min-h-[38px]">
                        {item.documentEvidence.extractedSnippet || (
                          Object.keys(item.documentEvidence.extractedKeyValues || {}).length > 0 ? (
                            Object.entries(item.documentEvidence.extractedKeyValues)
                              .slice(0, 2)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')
                          ) : (
                            <span className="text-rose-600 italic">No extractable value in uploaded dossier</span>
                          )
                        )}
                      </div>

                      {item.documentEvidence.fileName && (
                        <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 truncate flex items-center justify-between">
                          <span className="truncate font-mono text-[10px] text-slate-700">
                            {item.documentEvidence.fileName}
                          </span>
                          {item.documentEvidence.confidence && (
                            <span className="text-[10px] text-teal-700 font-mono font-bold ml-2">
                              {Math.round(item.documentEvidence.confidence * 100)}% OCR
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Branch B: Government Portal Registry Evidence */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        <span className="flex items-center text-slate-700">
                          <Building2 className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                          3. Statutory Registry Evidence
                        </span>
                        <span className="text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                          {item.verificationEvidence.sourcePortal}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-900 leading-snug min-h-[38px]">
                        {item.verificationEvidence.statusText || 'VERIFIED RECORD FOUND'}
                      </div>

                      <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono text-[10px] flex items-center justify-between">
                        <span>Mode: {item.verificationEvidence.verificationMode}</span>
                        <span className="text-slate-400">
                          {new Date(item.verificationEvidence.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Flow Connector: Converges into Reconciled Result */}
                  <div className="flex justify-center items-center py-2 text-slate-300">
                    <div className="flex flex-col items-center">
                      <div className="flex justify-between w-48 sm:w-96 text-slate-400">
                        <div className="w-0.5 h-2 bg-slate-300 mx-auto" />
                        <div className="w-0.5 h-2 bg-slate-300 mx-auto" />
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 sm:w-48 h-0.5 bg-slate-300" />
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <div className="w-24 sm:w-48 h-0.5 bg-slate-300" />
                      </div>
                      <div className="w-0.5 h-3 bg-slate-300" />
                      <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Step 4: Reconciled Result Card (Bottom Center) */}
                  <div
                    className={`p-4 rounded-xl border ${isConflict
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : isWarning
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : isMissing
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Reconciliation Verdict:
                        </span>
                        {getOutcomeBadge(item.outcome)}
                      </div>
                      <span className="text-xs font-mono font-semibold">
                        Awarded Score: {item.scoreAchieved} / {item.weight} pts
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed font-medium">
                      {item.reason}
                    </p>

                    {item.issues && item.issues.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-rose-200/60">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800 mb-1">
                          Material Findings:
                        </div>
                        <ul className="list-disc list-inside text-xs space-y-0.5 text-rose-800">
                          {item.issues.map((iss, i) => (
                            <li key={i}>{iss}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-white rounded-b-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                          Statutory Guidance & Recommended Action
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.recommendedAction || 'No corrective action required. Criterion is compliant.'}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                          Extracted Key-Value Audit
                        </div>
                        {Object.keys(item.documentEvidence.extractedKeyValues || {}).length > 0 ? (
                          <div className="space-y-1 mt-1 font-mono text-[11px]">
                            {Object.entries(item.documentEvidence.extractedKeyValues).map(([k, v]) => (
                              <div key={k} className="flex items-center justify-between text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                                <span className="text-slate-500">{k}:</span>
                                <span className="font-semibold">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-1">No structured fields extracted.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
