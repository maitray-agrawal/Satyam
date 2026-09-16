import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  User,
  Clock,
  Shield,
  Layers,
  ChevronRight,
  Eye,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { EvaluationRun } from '../types';

interface EvaluationRunsTabProps {
  evaluationRuns?: EvaluationRun[];
  bidNumber: string;
  bidderLegalName?: string;
  onTriggerReVerify?: () => void;
}

export const EvaluationRunsTab: React.FC<EvaluationRunsTabProps> = ({
  evaluationRuns = [],
  bidNumber,
  bidderLegalName,
  onTriggerReVerify,
}) => {
  const [selectedRun, setSelectedRun] = useState<EvaluationRun | null>(
    evaluationRuns.length > 0 ? evaluationRuns[0] : null
  );

  if (evaluationRuns.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-2xs">
        <History className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Historical Evaluation Runs</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Every compliance evaluation cycle produces an immutable snapshot version stored in the compliance ledger.
        </p>
        {onTriggerReVerify && (
          <button
            onClick={onTriggerReVerify}
            className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Trigger Initial Evaluation Run
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner - Clean Light Enterprise */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Immutable Audit Trail & Versioning</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Evaluation Runs & Snapshot Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Cryptographically timestamped compliance snapshots created whenever the deterministic rule engine,
              reconciliation matrix, or officer decision changes. Guarantees GFR 2017 transparency.
            </p>
          </div>
          {onTriggerReVerify && (
            <button
              onClick={onTriggerReVerify}
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-colors shadow-xs self-start md:self-auto"
            >
              <span>Record New Evaluation Run</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Runs List */}
        <div className="space-y-3 lg:col-span-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Recorded Runs ({evaluationRuns.length})
          </div>
          {evaluationRuns.map((run, index) => {
            const isSelected = selectedRun?.id === run.id;
            return (
              <div
                key={run.id}
                onClick={() => setSelectedRun(run)}
                className={`p-4 rounded-xl border cursor-pointer transition-all shadow-2xs ${
                  isSelected
                    ? 'bg-slate-50 border-slate-400 ring-1 ring-slate-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Run #{evaluationRuns.length - index} (v{run.rulesetVersion}.0)
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      run.overallScore >= 75
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : run.overallScore >= 50
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    Score: {run.overallScore}/100
                  </span>
                </div>

                <div className="mt-2 text-xs font-semibold text-slate-900">
                  {run.evaluatorName} ({run.evaluatorRole})
                </div>

                <div className="flex items-center text-[11px] text-slate-500 mt-1 space-x-3">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(run.timestamp).toLocaleDateString()}{' '}
                    {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>Checks: {run.complianceChecksCount}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Run Details Inspector */}
        <div className="lg:col-span-2">
          {selectedRun ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      ID: {selectedRun.id.substring(0, 16)}...
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Ruleset: GFR 2017 v{selectedRun.rulesetVersion}.0
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Evaluation Run Snapshot
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-slate-900">
                    {selectedRun.overallScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Risk: <span className="font-bold text-slate-700">{selectedRun.riskLevel}</span>
                  </div>
                </div>
              </div>

              {/* Snapshot Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Passed</div>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                    {selectedRun.passedChecksCount}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Failed</div>
                  <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">
                    {selectedRun.failedChecksCount}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Critical Flags</div>
                  <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">
                    {selectedRun.criticalFlagsCount}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Total Checks</div>
                  <div className="text-xl font-bold font-mono text-slate-800 mt-0.5">
                    {selectedRun.complianceChecksCount}
                  </div>
                </div>
              </div>

              {/* SHA-256 Checksum Provenance Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                  Cryptographic Snapshot Proof
                </div>
                <div className="flex items-center justify-between text-slate-700 truncate">
                  <span className="text-slate-500">Run Proof ID:</span>
                  <span className="font-bold text-teal-800 truncate ml-2">
                    {selectedRun.id}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Snapshot Timestamp:</span>
                  <span>{new Date(selectedRun.timestamp).toISOString()}</span>
                </div>
              </div>

              {/* Inconsistencies Summary */}
              {selectedRun.snapshotData?.crossDocConsistency && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Cross-Document Contradictions: </span>
                  {selectedRun.snapshotData.crossDocConsistency.inconsistencies.length === 0 ? (
                    <span className="text-emerald-700 font-semibold">Zero contradictions detected in this run</span>
                  ) : (
                    <span className="text-rose-700 font-semibold">
                      {selectedRun.snapshotData.crossDocConsistency.inconsistencies.length} contradiction(s) logged
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Select an evaluation run to inspect its snapshot details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
