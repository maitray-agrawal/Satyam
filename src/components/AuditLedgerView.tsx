import React, { useState } from 'react';
import { FileText, Search, Filter, Eye, X, Terminal, Clock, ShieldCheck } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLedgerViewProps {
  logs: AuditLog[];
  onRefreshLogs: () => void;
}

export const AuditLedgerView: React.FC<AuditLedgerViewProps> = ({ logs, onRefreshLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogPayload, setSelectedLogPayload] = useState<AuditLog | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.actionSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.bidId && l.bidId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = eventTypeFilter === 'ALL' || l.eventType === eventTypeFilter;
    return matchesSearch && matchesType;
  });

  const eventTypes = Array.from(new Set(logs.map((l) => l.eventType)));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Immutable GeM Procurement Ledger</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Central Procurement Audit Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident chronological record of all document uploads, API cross-checks, compliance scoring events, and Officer signed decisions.
          </p>
        </div>
        <button
          onClick={onRefreshLogs}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          Refresh Ledger
        </button>
      </div>

      {/* Controls & Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-slate-900">Audit Events ({filteredLogs.length})</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none w-56"
              />
            </div>

            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Event Types</option>
              {eventTypes.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC/IST)</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action Summary</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {log.eventType}
                    </span>
                    {log.bidId && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Bid ID: {log.bidId}</div>
                    )}
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-800">
                    <div>{log.actorName}</div>
                    <span className="text-[10px] text-slate-500 font-mono">{log.actorRole}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-700 max-w-md">{log.actionSummary}</td>

                  <td className="py-3 px-4 text-right">
                    {log.payloadJson && Object.keys(log.payloadJson).length > 0 && (
                      <button
                        onClick={() => setSelectedLogPayload(log)}
                        className="inline-flex items-center space-x-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedLogPayload && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Audit Payload Inspector</h3>
                <span className="text-xs text-slate-500 font-mono">{selectedLogPayload.eventType}</span>
              </div>
              <button
                onClick={() => setSelectedLogPayload(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 text-emerald-400 p-3 rounded-lg font-mono text-xs max-h-72 overflow-y-auto">
              <pre>{JSON.stringify(selectedLogPayload.payloadJson, null, 2)}</pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLogPayload(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
