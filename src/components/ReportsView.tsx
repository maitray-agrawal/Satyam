import React, { useState } from 'react';
import { StateEmblem } from './StateEmblem';
import {
  ArrowLeft,
  Printer,
  Shield,
  FileCheck,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { Bid, User } from '../types';

interface ReportsViewProps {
  bids: Bid[];
  currentUser: User;
  onSelectBid: (bidId: string) => void;
  selectedBidId?: string;
  selectedBidDetails?: Bid | null;
  onOpenPrintModal?: (bid: Bid) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  bids,
  currentUser,
  onSelectBid,
  selectedBidId: initialBidId,
  selectedBidDetails,
}) => {
  const [currentBidId, setCurrentBidId] = useState<string>(
    initialBidId || (bids.length > 0 ? bids[0].id : '')
  );
  const [detailedBid, setDetailedBid] = useState<Bid | null>(
    selectedBidDetails?.id === currentBidId ? selectedBidDetails : null
  );

  React.useEffect(() => {
    if (selectedBidDetails && selectedBidDetails.id === currentBidId) {
      setDetailedBid(selectedBidDetails);
      return;
    }
    if (currentBidId) {
      fetch(`/api/bids/${currentBidId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.id === currentBidId) {
            setDetailedBid(data);
          }
        })
        .catch(() => {});
    }
  }, [currentBidId, selectedBidDetails]);

  const activeBid = detailedBid || bids.find((b) => b.id === currentBidId) || (bids.length > 0 ? bids[0] : null);

  const handlePrint = () => {
    window.print();
  };

  const handleBackToDossier = () => {
    if (activeBid) {
      onSelectBid(activeBid.id);
    }
  };

  if (!activeBid) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <Scale className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">No Bidders Available</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No bid records found for compliance analysis reporting.
        </p>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="pb-16 pt-2">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ========================================================================= */}
        {/* ACTION ROW (Hidden in Print)                                             */}
        {/* LEFT: [ ← Back to Dossier ]    RIGHT: [ 🖨 Print Report ]                */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between print:hidden">
          <button
            id="btn-back-to-dossier"
            onClick={handleBackToDossier}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Dossier</span>
          </button>

          <div className="flex items-center space-x-3">
            {/* Bidder Selector Dropdown for Officers Browsing Multiple Reports */}
            {bids.length > 1 && (
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-medium">Bidder:</span>
                <select
                  id="select-report-bidder"
                  value={activeBid.id}
                  onChange={(e) => setCurrentBidId(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold cursor-pointer"
                >
                  {bids.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bidder?.legalName} ({b.bidNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}
=======
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
>>>>>>> origin/satwik-sih-2026-ps26100

            <button
              id="btn-print-report"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN COMPLIANCE ANALYSIS REPORT CONTAINER                                */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 report-container print:p-0 print:border-none print:shadow-none space-y-6">
          {/* Official Government Heading & Report Title */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-mono mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-800">GOVERNMENT OF INDIA</span>
                <span>•</span>
                <span>{activeBid.tender?.department || 'Ministry of Electronics & Information Technology'}</span>
              </div>
              <div className="text-slate-500">
                Bid Ref: <span className="font-semibold text-slate-800">{activeBid.bidNumber}</span>
                <span className="mx-2 text-slate-300">|</span>
                Tender Ref: <span className="font-semibold text-slate-800">{activeBid.tender?.tenderId}</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Compliance Analysis Report
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Detailed evaluation of bidder compliance against tender requirements
            </p>
          </div>

          {/* ========================================================================= */}
          {/* BIDDER PARTICULARS & TENDER PARTICULARS                                   */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BIDDER PARTICULARS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                BIDDER PARTICULARS
              </div>
              <div className="text-sm font-bold text-slate-900">
                {activeBid.bidder?.legalName}
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="font-mono text-[11px]">
                  <span className="text-slate-500">GSTIN:</span>{' '}
                  <span className="font-semibold text-slate-800">{activeBid.bidder?.gstin || 'N/A'}</span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="text-slate-500">PAN:</span>{' '}
                  <span className="font-semibold text-slate-800">{activeBid.bidder?.pan || 'N/A'}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {activeBid.bidder?.address}, {activeBid.bidder?.city}, {activeBid.bidder?.state} - {activeBid.bidder?.pincode}
                </div>
                <div className="text-[11px] font-medium text-slate-700 pt-1">
                  Make in India Local Content:{' '}
                  <span className="font-bold text-slate-900">{activeBid.bidder?.localContentPercentage}%</span>
                </div>
              </div>
            </div>

            {/* TENDER PARTICULARS */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                TENDER PARTICULARS
              </div>
              <div className="text-sm font-bold text-slate-900">
                {activeBid.tender?.title}
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="text-[11px]">
                  <span className="text-slate-500">Estimated Value:</span>{' '}
                  <span className="font-medium text-slate-800">
                    ₹ {((activeBid.tender?.estimatedValue || 0) / 100000).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}{' '}
                    Lakhs
                  </span>
                </div>
                <div className="text-[11px]">
                  <span className="text-slate-500">Quoted Bid Amount:</span>{' '}
                  <span className="font-bold font-mono text-slate-900">
                    ₹ {(activeBid.quotedAmount / 100000).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}{' '}
                    Lakhs
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Evaluation Date: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DETERMINISTIC COMPLIANCE SCORING TABLE                                   */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                DETERMINISTIC COMPLIANCE SCORING TABLE
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-slate-900">
                  TOTAL SCORE: {activeBid.overallScore ?? 0}/100
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    activeBid.riskLevel === 'LOW'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : activeBid.riskLevel === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : activeBid.riskLevel === 'HIGH'
                          ? 'bg-orange-50 text-orange-800 border-orange-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {activeBid.riskLevel || 'EVALUATING'} RISK
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-200">CLAUSE / PARAMETER</th>
                    <th className="py-2.5 px-2.5 text-center border-r border-slate-200 w-16">MAX</th>
                    <th className="py-2.5 px-2.5 text-center border-r border-slate-200 w-20">ACHIEVED</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200 w-24">STATUS</th>
                    <th className="py-2.5 px-3">EVIDENCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px] text-slate-800 bg-white">
                  {activeBid.complianceChecks && activeBid.complianceChecks.length > 0 ? (
                    activeBid.complianceChecks.map((chk) => (
                      <tr key={chk.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                          {chk.requirementName}
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-mono text-slate-600 border-r border-slate-200">
                          {chk.weight}
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-mono font-bold text-slate-900 border-r border-slate-200">
                          {chk.scoreAchieved}
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-200">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              chk.status === 'COMPLIANT' || chk.status === 'EXEMPTED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : chk.status === 'REVIEW'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {chk.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 leading-snug">
                          <div>{chk.evidenceSummary}</div>
                          {chk.issuesFound && chk.issuesFound.length > 0 && (
                            <div className="text-rose-700 font-medium text-[10px] mt-0.5">
                              Discrepancy: {chk.issuesFound.join('; ')}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                        No compliance check records available for this bidder.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* AI DECISION-SUPPORT ADVISORY                                              */}
          {/* ========================================================================= */}
          <div className="border border-purple-200 rounded-xl p-4 bg-purple-50/40 space-y-2 break-inside-avoid">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/70 pb-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-950">
                AI DECISION-SUPPORT ADVISORY
              </div>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  activeBid.aiRecommendation?.recommendation === 'COMPLIANT'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : activeBid.aiRecommendation?.recommendation === 'REVIEW_REQUIRED'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}
              >
                RECOMMENDATION: {activeBid.aiRecommendation?.recommendation || 'NON_COMPLIANT'}
              </span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed">
              {activeBid.aiRecommendation?.reasoningText ||
                'Compliance evaluation processed against tender rules and statutory registries.'}
            </p>
            <div className="text-[10px] text-slate-500 font-medium pt-1">
              STATUTORY DISCLAIMER: AI recommendations are purely assistive and advisory. Autonomous qualification or disqualification is strictly prohibited under GeM GTC.
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FINAL DETERMINATION & SIGN-OFF                                           */}
          {/* ========================================================================= */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4 break-inside-avoid">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                FINAL PROCUREMENT OFFICER DETERMINATION
              </div>
              <span className="text-xs font-mono font-bold text-slate-800">
                DECISION: {activeBid.officerDecision?.decision || 'UNDER EVALUATION'}
              </span>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900">Findings & Justification:</span>{' '}
              {activeBid.officerDecision?.comments ||
                'Evaluation currently underway by the designated Technical Evaluation Committee.'}
            </div>

            {activeBid.officerDecision?.conditions && activeBid.officerDecision.conditions.length > 0 && (
              <div>
                <span className="font-semibold text-slate-900 text-[11px]">Special Conditions of Award:</span>
                <ul className="list-disc list-inside text-[11px] text-slate-700 mt-1">
                  {activeBid.officerDecision.conditions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Signature Block */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 text-center text-xs">
              <div className="border-t border-slate-300 pt-2">
                <div className="font-bold text-slate-900">
                  {activeBid.officerDecision?.officerName || currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {activeBid.officerDecision?.officerDesignation || currentUser.designation}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Digitally Sealed via SATYAM Ledger
                </div>
              </div>
              <div className="border-t border-slate-300 pt-2">
                <div className="font-bold text-slate-900">Dr. Meenakshi Sundaram</div>
                <div className="text-[10px] text-slate-500">Member, Technical Evaluation Committee (GeM QA)</div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Countersigned & Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
