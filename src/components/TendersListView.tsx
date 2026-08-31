import React, { useState } from 'react';
import { Building2, Calendar, FileText, CheckCircle, ShieldCheck, Scale, Plus, ArrowRight } from 'lucide-react';
import { Tender } from '../types';

interface TendersListViewProps {
  tenders: Tender[];
  onSelectTenderForBids: (tenderId: string) => void;
  onOpenNewTender: () => void;
}

export const TendersListView: React.FC<TendersListViewProps> = ({
  tenders,
  onSelectTenderForBids,
  onOpenNewTender,
}) => {
  const [selectedTender, setSelectedTender] = useState<Tender | null>(tenders.length > 0 ? tenders[0] : null);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Tender Catalog & Eligibility Clauses</h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard GeM tenders with deterministic statutory compliance weights and evaluation rules.
          </p>
        </div>
        <button
          id="btn-create-tender-top"
          onClick={onOpenNewTender}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Tender</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tender List Cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Tenders ({tenders.length})</h2>
          {tenders.map((t) => {
            const isSelected = selectedTender?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTender(t)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {t.tenderId}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      t.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">{t.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1">{t.department}</p>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium">
                  <span className="font-mono font-bold text-slate-900">
                    ₹ {(t.estimatedValue / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakhs
                  </span>
                  <span className="text-slate-400">
                    Deadline: {new Date(t.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Tender Requirement Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs lg:col-span-2 space-y-6">
          {selectedTender ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {selectedTender.tenderId}
                    </span>
                    <span className="text-xs text-slate-500">{selectedTender.category}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">{selectedTender.title}</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedTender.description}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Issuing Authority: <span className="font-bold text-slate-800">{selectedTender.department}</span>
                  </p>
                </div>

                <button
                  onClick={() => onSelectTenderForBids(selectedTender.id)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shrink-0 shadow-xs"
                >
                  <span>Filter Bids for Tender</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Requirement Clauses Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Statutory & Technical Compliance Clauses ({selectedTender.requirements?.length || 0})
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">Total Weight: 100 Points</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Clause / Code</th>
                        <th className="py-2.5 px-3">Requirement Details</th>
                        <th className="py-2.5 px-3">Authority / Format</th>
                        <th className="py-2.5 px-3 text-center">Weight</th>
                        <th className="py-2.5 px-3 text-center">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedTender.requirements && selectedTender.requirements.length > 0 ? (
                        selectedTender.requirements.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-bold text-slate-900">
                              <span className="font-mono text-emerald-800">{req.requirementCode}</span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-800">{req.requirementName}</div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{req.customRuleDescription}</p>
                              {req.minThreshold && (
                                <div className="text-[10px] text-blue-700 font-mono mt-0.5">
                                  Min Threshold: {req.minThreshold}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[11px] text-slate-600">
                              <div>{req.issuingAuthority}</div>
                              <span className="text-[10px] text-slate-400 font-mono">{req.formatRequired}</span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                              {req.weight} pts
                            </td>
                            <td className="py-3 px-3 text-center">
                              {req.isRequired ? (
                                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-200">
                                  Mandatory
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                                  Optional/Exempt
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            No requirements configured for this tender.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">Select a tender from the left list.</div>
          )}
        </div>
      </div>
    </div>
  );
};
