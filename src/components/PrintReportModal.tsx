import React from 'react';
<<<<<<< HEAD
import { ArrowLeft, Printer, X } from 'lucide-react';
=======
import { StateEmblem } from './StateEmblem';
import { X, Printer, Shield, CheckCircle, AlertTriangle, Building, FileCheck } from 'lucide-react';
>>>>>>> origin/satwik-sih-2026-ps26100
import { Bid, User } from '../types';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: Bid;
  currentUser: User;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  bid,
  currentUser,
}) => {
  if (!isOpen || !bid) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl border border-slate-300 max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 print:m-0 print:p-0 print:border-none print:shadow-none report-container">
        {/* ========================================================================= */}
        {/* ACTION ROW (Hidden on Print)                                             */}
        {/* LEFT: [ ← Back to Dossier ]    RIGHT: [ 🖨 Print Report ]                */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <button
            id="btn-modal-back-to-dossier"
            onClick={onClose}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Dossier</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              id="btn-modal-print-report"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

<<<<<<< HEAD
        {/* ========================================================================= */}
        {/* REPORT HEADER                                                            */}
        {/* ========================================================================= */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-mono mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800">GOVERNMENT OF INDIA</span>
              <span>•</span>
              <span>{bid.tender?.department || 'Ministry of Electronics & Information Technology'}</span>
=======
        {/* Printable Official Government Header */}
        <div className="space-y-6 text-slate-900 text-xs font-serif">
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="flex justify-center mb-2">
              <StateEmblem size={56} alt="State Emblem of India" />
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600">GOVERNMENT OF INDIA</div>
            <div className="text-sm font-extrabold uppercase text-slate-800">{bid.tender?.department}</div>
            <h1 className="text-lg font-black uppercase tracking-tight text-slate-950 mt-1">
              RECORD OF TECHNICAL COMPLIANCE & ELIGIBILITY VERIFICATION
            </h1>
            <div className="text-[11px] font-mono text-slate-600 mt-1">
              GeM Bid Ref: <span className="font-bold">{bid.bidNumber}</span> | Tender Ref:{' '}
              <span className="font-bold">{bid.tender?.tenderId}</span>
>>>>>>> origin/satwik-sih-2026-ps26100
            </div>
            <div className="text-slate-500">
              Bid Ref: <span className="font-semibold text-slate-800">{bid.bidNumber}</span>
              <span className="mx-2 text-slate-300">|</span>
              Tender Ref: <span className="font-semibold text-slate-800">{bid.tender?.tenderId}</span>
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
              {bid.bidder?.legalName}
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="font-mono text-[11px]">
                <span className="text-slate-500">GSTIN:</span>{' '}
                <span className="font-semibold text-slate-800">{bid.bidder?.gstin || 'N/A'}</span>
                <span className="mx-2 text-slate-300">|</span>
                <span className="text-slate-500">PAN:</span>{' '}
                <span className="font-semibold text-slate-800">{bid.bidder?.pan || 'N/A'}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                {bid.bidder?.address}, {bid.bidder?.city}, {bid.bidder?.state} - {bid.bidder?.pincode}
              </div>
              <div className="text-[11px] font-medium text-slate-700 pt-1">
                Make in India Local Content:{' '}
                <span className="font-bold text-slate-900">{bid.bidder?.localContentPercentage}%</span>
              </div>
            </div>
          </div>

          {/* TENDER PARTICULARS */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              TENDER PARTICULARS
            </div>
            <div className="text-sm font-bold text-slate-900">
              {bid.tender?.title}
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="text-[11px]">
                <span className="text-slate-500">Estimated Value:</span>{' '}
                <span className="font-medium text-slate-800">
                  ₹ {((bid.tender?.estimatedValue || 0) / 100000).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                  })}{' '}
                  Lakhs
                </span>
              </div>
              <div className="text-[11px]">
                <span className="text-slate-500">Quoted Bid Amount:</span>{' '}
                <span className="font-bold font-mono text-slate-900">
                  ₹ {(bid.quotedAmount / 100000).toLocaleString('en-IN', {
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
                TOTAL SCORE: {bid.overallScore ?? 0}/100
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  bid.riskLevel === 'LOW'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : bid.riskLevel === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : bid.riskLevel === 'HIGH'
                        ? 'bg-orange-50 text-orange-800 border-orange-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {bid.riskLevel || 'EVALUATING'} RISK
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
                {bid.complianceChecks && bid.complianceChecks.length > 0 ? (
                  bid.complianceChecks.map((chk) => (
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
                bid.aiRecommendation?.recommendation === 'COMPLIANT'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : bid.aiRecommendation?.recommendation === 'REVIEW_REQUIRED'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}
            >
              RECOMMENDATION: {bid.aiRecommendation?.recommendation || 'NON_COMPLIANT'}
            </span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed">
            {bid.aiRecommendation?.reasoningText ||
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
              DECISION: {bid.officerDecision?.decision || 'UNDER EVALUATION'}
            </span>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900">Findings & Justification:</span>{' '}
            {bid.officerDecision?.comments ||
              'Evaluation currently underway by the designated Technical Evaluation Committee.'}
          </div>

          {bid.officerDecision?.conditions && bid.officerDecision.conditions.length > 0 && (
            <div>
              <span className="font-semibold text-slate-900 text-[11px]">Special Conditions of Award:</span>
              <ul className="list-disc list-inside text-[11px] text-slate-700 mt-1">
                {bid.officerDecision.conditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Signature Block */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 text-center text-xs">
            <div className="border-t border-slate-300 pt-2">
              <div className="font-bold text-slate-900">
                {bid.officerDecision?.officerName || currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500">
                {bid.officerDecision?.officerDesignation || currentUser.designation}
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
  );
};
