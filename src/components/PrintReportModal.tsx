import React from 'react';
import { X, Printer, Shield, CheckCircle, AlertTriangle, Building, FileCheck } from 'lucide-react';
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
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-300 max-w-4xl w-full p-8 shadow-2xl space-y-6 my-8 print:m-0 print:p-0 print:border-none print:shadow-none">
        {/* Top Control Header (Hidden on Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm font-black uppercase text-slate-900">
              Technical Evaluation Committee (TEC) Official Report
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Government Header */}
        <div className="space-y-6 text-slate-900 text-xs font-serif">
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600">GOVERNMENT OF INDIA</div>
            <div className="text-sm font-extrabold uppercase text-slate-800">{bid.tender?.department}</div>
            <h1 className="text-lg font-black uppercase tracking-tight text-slate-950 mt-1">
              RECORD OF TECHNICAL COMPLIANCE & ELIGIBILITY VERIFICATION
            </h1>
            <div className="text-[11px] font-mono text-slate-600 mt-1">
              GeM Bid Ref: <span className="font-bold">{bid.bidNumber}</span> | Tender Ref:{' '}
              <span className="font-bold">{bid.tender?.tenderId}</span>
            </div>
            <div className="text-[10px] text-amber-800 font-sans font-bold mt-1 bg-amber-50 py-0.5 border border-amber-200">
              SIMULATED GOVERNMENT REGISTRY VERIFICATION ENVIRONMENT • GEV-VERIFY PLATFORM
            </div>
          </div>

          {/* Section 1: Bidder & Tender Particulars */}
          <div className="grid grid-cols-2 gap-4 border border-slate-300 p-4 bg-slate-50/50">
            <div>
              <div className="font-sans font-bold text-[11px] uppercase text-slate-500 mb-1">Bidder Particulars</div>
              <div className="font-bold text-sm text-slate-900">{bid.bidder?.legalName}</div>
              <div className="text-slate-700 mt-0.5 font-mono text-[11px]">
                GSTIN: {bid.bidder?.gstin} | PAN: {bid.bidder?.pan}
              </div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                Address: {bid.bidder?.address}, {bid.bidder?.city}, {bid.bidder?.state} - {bid.bidder?.pincode}
              </div>
              <div className="text-slate-700 text-[11px] mt-1">
                Make in India Local Content: <span className="font-bold">{bid.bidder?.localContentPercentage}%</span>
              </div>
            </div>

            <div>
              <div className="font-sans font-bold text-[11px] uppercase text-slate-500 mb-1">Tender Particulars</div>
              <div className="font-bold text-xs text-slate-900">{bid.tender?.title}</div>
              <div className="text-slate-700 text-[11px] mt-1">
                Estimated Value: ₹{' '}
                {((bid.tender?.estimatedValue || 0) / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })}{' '}
                Lakhs
              </div>
              <div className="text-slate-700 text-[11px] font-mono font-bold">
                Quoted Bid Value: ₹ {(bid.quotedAmount / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })}{' '}
                Lakhs
              </div>
              <div className="text-slate-600 text-[11px] mt-1">
                Evaluation Date: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Compliance Scoring Summary */}
          <div className="space-y-2">
            <div className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center justify-between">
              <span>Deterministic Compliance Scoring Table</span>
              <span className="font-mono">
                Total Score: {bid.overallScore}/100 ({bid.riskLevel} Risk)
              </span>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-left text-[11px]">
              <thead className="bg-slate-100 font-sans font-bold uppercase text-[10px]">
                <tr>
                  <th className="border border-slate-300 p-2">Clause / Parameter</th>
                  <th className="border border-slate-300 p-2">Max Weight</th>
                  <th className="border border-slate-300 p-2">Achieved</th>
                  <th className="border border-slate-300 p-2">Status</th>
                  <th className="border border-slate-300 p-2">Verified Portal Record & Evidence</th>
                </tr>
              </thead>
              <tbody>
                {bid.complianceChecks?.map((chk) => (
                  <tr key={chk.id}>
                    <td className="border border-slate-300 p-2 font-bold font-sans">{chk.requirementName}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{chk.weight}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono font-bold">{chk.scoreAchieved}</td>
                    <td className="border border-slate-300 p-2 font-bold font-sans">
                      <span
                        className={
                          chk.status === 'COMPLIANT'
                            ? 'text-emerald-800'
                            : chk.status === 'REVIEW'
                            ? 'text-amber-800'
                            : 'text-rose-800'
                        }
                      >
                        {chk.status}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-700">
                      {chk.evidenceSummary}
                      {chk.issuesFound.length > 0 && (
                        <div className="text-rose-700 font-bold mt-0.5">Discrepancy: {chk.issuesFound.join('; ')}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: AI Advisory Synopsis (Explicitly Decision Support) */}
          <div className="border border-purple-200 p-3 bg-purple-50/40 rounded-lg space-y-1">
            <div className="font-sans font-bold text-[10px] uppercase text-purple-900 flex items-center justify-between">
              <span>AI Decision-Support Advisory (Gemini 3.7 Flash)</span>
              <span>Recommendation: {bid.aiRecommendation?.recommendation}</span>
            </div>
            <p className="text-[11px] text-slate-800 italic">{bid.aiRecommendation?.reasoningText}</p>
            <div className="font-sans text-[9px] text-slate-500 font-bold mt-1">
              DISCLAIMER: AI recommendations are purely assistive and advisory. Autonomous qualification/disqualification is legally prohibited under GeM GTC.
            </div>
          </div>

          {/* Section 4: Final Procurement Officer Decision & Sign-off */}
          <div className="border-2 border-slate-900 p-4 space-y-3">
            <div className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center justify-between">
              <span>Official Determination of the Procurement Officer</span>
              <span className="font-mono font-bold text-sm">
                DECISION: {bid.officerDecision?.decision || 'UNDER EVALUATION'}
              </span>
            </div>

            <div className="text-slate-800 leading-relaxed text-xs">
              <span className="font-sans font-bold">Officer Justification & Findings:</span>{' '}
              {bid.officerDecision?.comments || 'Evaluation currently underway by the Technical Evaluation Committee.'}
            </div>

            {bid.officerDecision?.conditions && bid.officerDecision.conditions.length > 0 && (
              <div>
                <span className="font-sans font-bold text-[11px]">Special Conditions of Award:</span>
                <ul className="list-disc list-inside text-[11px] text-slate-700 mt-0.5">
                  {bid.officerDecision.conditions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Signature Block */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center font-sans">
              <div className="border-t border-slate-400 pt-2">
                <div className="font-bold text-slate-900">{bid.officerDecision?.officerName || currentUser.name}</div>
                <div className="text-[10px] text-slate-500">
                  {bid.officerDecision?.officerDesignation || currentUser.designation}
                </div>
                <div className="text-[9px] text-slate-400 mt-1 font-mono">
                  Digitally Sealed at {new Date(bid.officerDecision?.decidedAt || Date.now()).toISOString()}
                </div>
              </div>

              <div className="border-t border-slate-400 pt-2">
                <div className="font-bold text-slate-900">Dr. Meenakshi Sundaram</div>
                <div className="text-[10px] text-slate-500">Member, Technical Evaluation Committee (GeM QA)</div>
                <div className="text-[9px] text-slate-400 mt-1 font-mono">Countersigned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
