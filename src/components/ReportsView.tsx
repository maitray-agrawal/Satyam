import React, { useState } from 'react';
import { StateEmblem } from './StateEmblem';
import {
  FileSpreadsheet,
  Printer,
  FileCheck,
  Shield,
  Search,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  Scale,
  Download,
  Calendar,
} from 'lucide-react';
import { Bid, User } from '../types';

interface ReportsViewProps {
  bids: Bid[];
  currentUser: User;
  onSelectBid: (bidId: string) => void;
  onOpenPrintModal: (bid: Bid) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  bids,
  currentUser,
  onSelectBid,
  onOpenPrintModal,
}) => {
  const [selectedBidId, setSelectedBidId] = useState<string>(bids.length > 0 ? bids[0].id : '');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBids = bids.filter(
    (b) =>
      b.bidder?.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bidNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.tender?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeBid = bids.find((b) => b.id === selectedBidId) || (bids.length > 0 ? bids[0] : null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <StateEmblem size={50} alt="State Emblem of India" className="shrink-0 hidden sm:inline-flex" />
          <div>
            <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              <span>Statutory Compliance Reporting Engine</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Technical Evaluation Committee (TEC) Official Reports
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Generate, inspect, and export formal GFR 2017 Rule 144 compliance verification records for audited GeM tenders.
            </p>
          </div>
        </div>

        {activeBid && (
          <div className="flex items-center space-x-2 self-start md:self-auto">
            <button
              onClick={() => onOpenPrintModal(activeBid)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Full Print / PDF Export</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bid Selection List */}
        <div className="space-y-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Bidder Record ({filteredBids.length})
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search bidder or bid..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredBids.map((bid) => {
              const isSelected = activeBid?.id === bid.id;
              return (
                <div
                  key={bid.id}
                  onClick={() => setSelectedBidId(bid.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition shadow-2xs ${
                    isSelected
                      ? 'bg-slate-50 border-slate-400 ring-1 ring-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                      {bid.bidder?.legalName}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        (bid.overallScore || 0) >= 90
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : (bid.overallScore || 0) >= 70
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {bid.overallScore ?? '--'}/100
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Ref: {bid.bidNumber}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {bid.tender?.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Official Report Preview */}
        <div className="lg:col-span-2">
          {activeBid ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Official Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                  GOVERNMENT OF INDIA
                </div>
                <div className="text-xs font-bold uppercase text-slate-800">
                  {activeBid.tender?.department || 'Ministry of Petroleum & Natural Gas'}
                </div>
                <h2 className="text-base font-black uppercase tracking-tight text-slate-950 mt-1">
                  OFFICIAL RECORD OF TECHNICAL BID COMPLIANCE & ELIGIBILITY VERIFICATION
                </h2>
                <div className="text-[11px] font-mono text-slate-600">
                  GeM Bid Ref: <span className="font-bold">{activeBid.bidNumber}</span> | Tender Ref:{' '}
                  <span className="font-bold">{activeBid.tender?.tenderId}</span>
                </div>
                <div className="text-[10px] text-teal-800 font-semibold mt-1 bg-teal-50 py-0.5 border border-teal-200 rounded">
                  VERIFIED VIA SATYAM PLATFORM • SIMULATED STATUTORY REGISTRIES (SIH 2026 PS 26100)
                </div>
              </div>

              {/* Bidder & Tender Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 p-4 rounded-xl bg-slate-50/50 text-xs">
                <div>
                  <div className="font-bold uppercase text-[10px] text-slate-500 mb-1">
                    Bidder Particulars
                  </div>
                  <div className="font-bold text-slate-900">{activeBid.bidder?.legalName}</div>
                  <div className="text-slate-600 font-mono text-[11px] mt-0.5">
                    GSTIN: {activeBid.bidder?.gstin} | PAN: {activeBid.bidder?.pan}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {activeBid.bidder?.address}, {activeBid.bidder?.city}, {activeBid.bidder?.state}
                  </div>
                  <div className="text-slate-700 font-semibold mt-1">
                    Make in India Local Content: {activeBid.bidder?.localContentPercentage}%
                  </div>
                </div>

                <div>
                  <div className="font-bold uppercase text-[10px] text-slate-500 mb-1">
                    Tender Particulars
                  </div>
                  <div className="font-bold text-slate-900">{activeBid.tender?.title}</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    Estimated Budget: ₹{' '}
                    {((activeBid.tender?.estimatedValue || 0) / 100000).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}{' '}
                    Lakhs
                  </div>
                  <div className="text-slate-700 font-mono font-bold text-[11px] mt-0.5">
                    Quoted Bid Amount: ₹{' '}
                    {(activeBid.quotedAmount / 100000).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}{' '}
                    Lakhs
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Date of Verification: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
                  </div>
                </div>
              </div>

              {/* Three-Way Reconciliation Summary Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Statutory Criteria Three-Way Reconciliation
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    Score: {activeBid.overallScore}/100
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Requirement</th>
                        <th className="py-2.5 px-3">Tender Condition</th>
                        <th className="py-2.5 px-3">Extracted Document</th>
                        <th className="py-2.5 px-3">Statutory Registry</th>
                        <th className="py-2.5 px-3 text-right">Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
                      {(activeBid.threeWayReconciliations || []).slice(0, 6).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {item.requirementCode}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {item.tenderCondition.ruleDescription}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700">
                            {item.documentEvidence.extractedSnippet || (item.documentEvidence.hasDocument ? 'Attached' : 'Missing')}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700">
                            {item.verificationEvidence.statusText || item.verificationEvidence.sourcePortal}
                          </td>
                          <td className="py-2 px-3 text-right font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                item.outcome === 'COMPLIANT'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : item.outcome === 'REVIEW_REQUIRED'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-rose-50 text-rose-800'
                              }`}
                            >
                              {item.outcome}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Officer Sign-off Block */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-slate-500 text-[11px]">{currentUser.designation}</div>
                  <div className="text-slate-400 text-[10px] font-mono">
                    Digitally Sealed via SATYAM GFR 2017 Ledger
                  </div>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => onSelectBid(activeBid.id)}
                    className="text-teal-700 hover:text-teal-900 text-xs font-semibold underline"
                  >
                    Open Full Dossier →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Select a bidder from the left to view the official report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
