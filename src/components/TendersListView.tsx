import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  ShieldCheck,
  Scale,
  Plus,
  ArrowRight,
  Sparkles,
  Upload,
  Check,
  X,
  Edit2,
  AlertCircle,
  HelpCircle,
  FileUp,
  RefreshCw,
  Clock,
  Layers,
  FileCheck,
} from 'lucide-react';
import { Tender, TenderRequirement } from '../types';

interface TendersListViewProps {
  tenders: Tender[];
  onSelectTenderForBids: (tenderId: string) => void;
  onOpenNewTender: () => void;
  onTenderUpdated?: () => void;
}

export const TendersListView: React.FC<TendersListViewProps> = ({
  tenders,
  onSelectTenderForBids,
  onOpenNewTender,
  onTenderUpdated,
}) => {
  const [selectedTender, setSelectedTender] = useState<Tender | null>(
    tenders.length > 0 ? tenders[0] : null
  );

  // AI RFP Extraction states
  const [isExtracting, setIsExtracting] = useState(false);
  const [rfpFile, setRfpFile] = useState<File | null>(null);
  const [rfpTextSample, setRfpTextSample] = useState('');
  const [showRfpExtractor, setShowRfpExtractor] = useState(false);
  const [extractionFeedback, setExtractionFeedback] = useState<string | null>(null);

  // Manual Requirement state
  const [showAddClause, setShowAddClause] = useState(false);
  const [newClause, setNewClause] = useState({
    requirementCode: 'CUSTOM',
    requirementName: '',
    isRequired: true,
    weight: 10,
    minThreshold: '',
    customRuleDescription: '',
    issuingAuthority: 'Government Authority',
    formatRequired: 'PDF Certificate',
    category: 'TECHNICAL',
  });

  // Inline editing state
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TenderRequirement>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeTender = selectedTender ? (tenders.find((t) => t.id === selectedTender.id) || selectedTender) : null;
  const allReqs = activeTender?.requirements || [];
  const activeReqs = allReqs.filter((r) => r.status !== 'REJECTED' && r.status !== 'DRAFT');
  const candidateReqs = allReqs.filter((r) => r.status === 'DRAFT');
  const rejectedReqs = allReqs.filter((r) => r.status === 'REJECTED');

  const totalActiveWeight = activeReqs.reduce((sum, r) => sum + (Number(r.weight) || 0), 0);

  // Handle AI RFP Extraction
  const handleExtractRequirements = async () => {
    if (!activeTender) return;
    setIsExtracting(true);
    setExtractionFeedback(null);
    setStatusMessage(null);

    try {
      let res;
      if (rfpFile) {
        const formData = new FormData();
        formData.append('rfpFile', rfpFile);
        res = await fetch(`/api/tenders/${activeTender.id}/extract-requirements`, {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch(`/api/tenders/${activeTender.id}/extract-requirements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            textContent: rfpTextSample.trim() || undefined,
            fileName: 'tender-rfp-document.pdf',
          }),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Extraction failed');
      }

      const data = await res.json();
      setSelectedTender(data.tender);
      setExtractionFeedback(
        `AI clause intelligence extracted ${data.extraction?.candidateRequirements?.length || 0} candidate clauses from RFP. Extracted clauses are placed in candidate draft status for officer review.`
      );
      if (onTenderUpdated) onTenderUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Extraction failed: ${err.message}` });
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle approve / reject requirement
  const handleUpdateClauseStatus = async (reqId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tenders/requirements/${reqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update requirement');

      if (activeTender) {
        const tenderRes = await fetch(`/api/tenders/${activeTender.id}`);
        if (tenderRes.ok) setSelectedTender(await tenderRes.json());
      }
      if (onTenderUpdated) onTenderUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle save inline edit
  const handleSaveEdit = async (reqId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tenders/requirements/${reqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Failed to save edit');

      setEditingReqId(null);
      if (activeTender) {
        const tenderRes = await fetch(`/api/tenders/${activeTender.id}`);
        if (tenderRes.ok) setSelectedTender(await tenderRes.json());
      }
      if (onTenderUpdated) onTenderUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle publish ruleset
  const handlePublishRuleset = async () => {
    if (!activeTender) return;
    if (!window.confirm(`Publish Ruleset v${(activeTender.rulesetVersion || 1) + 1}? All bids submitted for this tender will be immediately re-evaluated against the approved ruleset.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/tenders/${activeTender.id}/publish-ruleset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish ruleset');
      }
      const data = await res.json();
      setSelectedTender(data.tender);
      setStatusMessage({
        type: 'success',
        text: `Ruleset version ${data.tender.rulesetVersion} published successfully! All submitted bids were deterministically re-evaluated.`,
      });
      if (onTenderUpdated) onTenderUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle create manual clause
  const handleAddManualClause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTender) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tenders/${activeTender.id}/requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClause),
      });
      if (!res.ok) throw new Error('Failed to add requirement');
      const updatedTender = await res.json();
      setSelectedTender(updatedTender);
      setShowAddClause(false);
      setStatusMessage({ type: 'success', text: 'Clause added to active ruleset.' });
      if (onTenderUpdated) onTenderUpdated();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const loadSampleRfpText = () => {
    setRfpTextSample(`GOVERNMENT E-MARKETPLACE (GeM)
BID DOCUMENT / RFP CLAUSES - TECHNICAL & STATUTORY ELIGIBILITY

1. STATUTORY REGISTRATION (MANDATORY):
Bidder must possess a valid, active GSTIN registered in the state of supply. GST returns (GSTR-3B) must be filed up to the preceding month.

2. FINANCIAL TURNOVER (MANDATORY):
Average annual audited turnover of the bidder during the last three financial years (FY 2021-22, 2022-23, 2023-24) must be at least ₹ 5.00 Crores. CA turnover certificate with valid UDIN must be submitted.

3. PREFERENCE TO MAKE IN INDIA (CLASS-I / CLASS-II LOCAL SUPPLIER):
Local content requirement is minimum 50% in accordance with DPIIT Public Procurement Order. Bidder must submit self-declaration or CA-certified local content certificate.

4. OEM AUTHORIZATION:
In case the bidder is not the OEM (Original Equipment Manufacturer), a valid tender-specific OEM Authorization Form (MAF) strictly on OEM letterhead must be furnished.

5. NON-BLACKLISTING DECLARATION:
Bidder must submit a sworn affidavit on ₹100 stamp paper stating that the firm has not been debarred or blacklisted by any Government Ministry, PSU, or Autonomous Body.`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Tender Catalog & Ruleset Intelligence</h1>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">

            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic ruleset management with automated RFP clause extraction and officer approval workflows.
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

      {statusMessage && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${statusMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tender List Cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Tenders ({tenders.length})</h2>
          {tenders.map((t) => {
            const isSelected = activeTender?.id === t.id;
            const tReqs = t.requirements || [];
            const tActive = tReqs.filter((r) => r.status !== 'REJECTED' && r.status !== 'DRAFT');
            const tDraft = tReqs.filter((r) => r.status === 'DRAFT');

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTender(t)}
                className={`p-4 rounded-xl border transition cursor-pointer ${isSelected
                  ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {t.tenderId}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                      v{t.rulesetVersion || 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">{t.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1">{t.department}</p>

                <div className="mt-2.5 flex items-center space-x-3 text-[10px] text-slate-500">
                  <span>{tActive.length} Active Rules</span>
                  {tDraft.length > 0 && (
                    <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      {tDraft.length} AI Drafts
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium">
                  <span className="font-mono font-bold text-slate-900">
                    ₹ {(t.estimatedValue / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakhs
                  </span>
                  <span className="text-slate-400">Deadline: {new Date(t.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Tender Requirement Details & Intelligence Workbench */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs lg:col-span-2 space-y-6">
          {activeTender ? (
            <>
              {/* Tender Header & Ruleset Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {activeTender.tenderId}
                    </span>
                    <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded font-mono">
                      Ruleset v{activeTender.rulesetVersion || 1}
                    </span>
                    {activeTender.rulesetPublishedAt && (
                      <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          Published: {new Date(activeTender.rulesetPublishedAt).toLocaleDateString()} by{' '}
                          {activeTender.rulesetPublishedBy || 'Officer'}
                        </span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">{activeTender.title}</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activeTender.description}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Issuing Authority: <span className="font-bold text-slate-800">{activeTender.department}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowRfpExtractor(!showRfpExtractor)}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Extract RFP</span>
                  </button>

                  <button
                    onClick={() => onSelectTenderForBids(activeTender.id)}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    <span>Inspect Bids</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* AI RFP Extraction Drawer / Box */}
              {showRfpExtractor && (
                <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-700" />
                      <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                        Multimodal RFP Clause Extractor
                      </h3>
                    </div>
                    <span className="text-[10px] text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded">
                      Advisory Extraction Mode
                    </span>
                  </div>

                  <p className="text-xs text-purple-800 leading-relaxed">
                    Upload an official RFP tender PDF or paste document clauses. The extraction pipeline parses structured statutory requirements, minimum financial thresholds, and evaluation weights.
                    <strong className="block mt-1 text-purple-950 font-bold">
                      Mandate: AI extracted clauses are placed in candidate DRAFT status and do not affect scoring until approved and published by an officer.
                    </strong>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Upload Tender RFP Document (PDF/Image)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setRfpFile(e.target.files?.[0] || null)}
                        className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                      />
                      {rfpFile && (
                        <div className="text-[10px] text-slate-500">
                          Selected: <span className="font-mono font-bold text-slate-700">{rfpFile.name}</span> (
                          {Math.round(rfpFile.size / 1024)} KB)
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700">Or Paste / Test with RFP Text</label>
                        <button
                          type="button"
                          onClick={loadSampleRfpText}
                          className="text-[10px] text-purple-700 hover:underline font-bold"
                        >
                          Load Standard GeM RFP Clauses
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={rfpTextSample}
                        onChange={(e) => setRfpTextSample(e.target.value)}
                        placeholder="Paste RFP eligibility clauses or click 'Load Standard GeM RFP Clauses' above..."
                        className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRfpExtractor(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleExtractRequirements}
                      disabled={isExtracting}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-purple-400 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      {isExtracting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Extracting Candidate Clauses...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Extract Candidate Clauses</span>
                        </>
                      )}
                    </button>
                  </div>

                  {extractionFeedback && (
                    <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 text-emerald-900 rounded-lg text-xs">
                      {extractionFeedback}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: CANDIDATE REQUIREMENTS (AI PROPOSED - PENDING OFFICER ACTION) */}
              {candidateReqs.length > 0 && (
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Candidate Clauses (AI-Extracted • {candidateReqs.length} Pending Review)
                      </h3>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-mono px-2 py-0.5 rounded border border-amber-300">
                      Status: DRAFT (Non-Authoritative)
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-800">
                    These clauses were automatically parsed from the RFP. Review each candidate below. Once approved, click{' '}
                    <strong>"Publish Ruleset"</strong> to promote them into an active evaluation version.
                  </p>

                  <div className="border border-amber-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-amber-100/60 text-amber-900 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Code / Category</th>
                          <th className="py-2 px-3">Candidate Requirement</th>
                          <th className="py-2 px-3">Threshold / Authority</th>
                          <th className="py-2 px-3 text-center">Confidence</th>
                          <th className="py-2 px-3 text-right">Officer Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100">
                        {candidateReqs.map((req) => (
                          <tr key={req.id} className="hover:bg-amber-50/40">
                            <td className="py-2.5 px-3">
                              <span className="font-mono font-bold text-slate-800 block">{req.requirementCode}</span>
                              <span className="text-[10px] text-slate-500">{req.category || 'STATUTORY'}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{req.requirementName}</div>
                              <p className="text-[11px] text-slate-600 mt-0.5">{req.customRuleDescription}</p>
                              {req.sourceText && (
                                <p className="text-[10px] text-slate-400 italic mt-0.5 border-l-2 border-amber-300 pl-1.5">
                                  "{req.sourceText.substring(0, 140)}..." (Page {req.sourcePage || 1})
                                </p>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-600">
                              <div>{req.minThreshold ? `Min: ${req.minThreshold}` : 'Standard Declaration'}</div>
                              <span className="text-[10px] text-slate-400">{req.issuingAuthority}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                              {Math.round((req.confidence || 0.95) * 100)}%
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center space-x-1.5">
                                <button
                                  onClick={() => handleUpdateClauseStatus(req.id, 'APPROVED')}
                                  disabled={actionLoading}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-bold shadow-xs"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateClauseStatus(req.id, 'REJECTED')}
                                  disabled={actionLoading}
                                  className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded text-[11px] font-semibold"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: ACTIVE RULESET CLAUSES */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Active Ruleset Clauses (v{activeTender.rulesetVersion || 1} • {activeReqs.length} Approved)
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Total Deterministic Weight: {totalActiveWeight} Points
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowAddClause(true)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Clause</span>
                    </button>

                    <button
                      onClick={handlePublishRuleset}
                      disabled={actionLoading}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Publish Ruleset v{(activeTender.rulesetVersion || 1) + 1}</span>
                    </button>
                  </div>
                </div>

                {/* Add Clause Form Modal/Drawer */}
                {showAddClause && (
                  <form onSubmit={handleAddManualClause} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase">Add Statutory / Technical Clause</h4>
                      <button type="button" onClick={() => setShowAddClause(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block">Requirement Code</label>
                        <input
                          type="text"
                          value={newClause.requirementCode}
                          onChange={(e) => setNewClause({ ...newClause, requirementCode: e.target.value.toUpperCase() })}
                          className="w-full text-xs p-1.5 rounded border border-slate-300 font-mono"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-600 block">Requirement Title</label>
                        <input
                          type="text"
                          value={newClause.requirementName}
                          onChange={(e) => setNewClause({ ...newClause, requirementName: e.target.value })}
                          placeholder="e.g. CMMI Level 3 Certification"
                          className="w-full text-xs p-1.5 rounded border border-slate-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block">Weight (Points)</label>
                        <input
                          type="number"
                          value={newClause.weight}
                          onChange={(e) => setNewClause({ ...newClause, weight: Number(e.target.value) })}
                          className="w-full text-xs p-1.5 rounded border border-slate-300 font-mono"
                          min={1}
                          max={50}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block">Min Threshold (Optional)</label>
                        <input
                          type="text"
                          value={newClause.minThreshold}
                          onChange={(e) => setNewClause({ ...newClause, minThreshold: e.target.value })}
                          placeholder="e.g. 5.0 (Cr) or 50%"
                          className="w-full text-xs p-1.5 rounded border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block">Issuing Authority</label>
                        <input
                          type="text"
                          value={newClause.issuingAuthority}
                          onChange={(e) => setNewClause({ ...newClause, issuingAuthority: e.target.value })}
                          className="w-full text-xs p-1.5 rounded border border-slate-300"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold text-slate-600 block">Rule Evaluation Description</label>
                        <input
                          type="text"
                          value={newClause.customRuleDescription}
                          onChange={(e) => setNewClause({ ...newClause, customRuleDescription: e.target.value })}
                          placeholder="Detailed verification criteria..."
                          className="w-full text-xs p-1.5 rounded border border-slate-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowAddClause(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-bold shadow-xs"
                      >
                        Save to Active Ruleset
                      </button>
                    </div>
                  </form>
                )}

                {/* Table of Active Rules */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Clause / Code</th>
                        <th className="py-2.5 px-3">Requirement Details</th>
                        <th className="py-2.5 px-3">Authority / Format</th>
                        <th className="py-2.5 px-3 text-center">Weight</th>
                        <th className="py-2.5 px-3 text-center">Type</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeReqs.length > 0 ? (
                        activeReqs.map((req) => {
                          const isEditing = editingReqId === req.id;

                          if (isEditing) {
                            return (
                              <tr key={req.id} className="bg-emerald-50/50">
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={editForm.requirementCode || ''}
                                    onChange={(e) => setEditForm({ ...editForm, requirementCode: e.target.value })}
                                    className="w-full text-xs p-1 border rounded font-mono"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={editForm.requirementName || ''}
                                    onChange={(e) => setEditForm({ ...editForm, requirementName: e.target.value })}
                                    className="w-full text-xs p-1 border rounded mb-1"
                                  />
                                  <input
                                    type="text"
                                    value={editForm.customRuleDescription || ''}
                                    onChange={(e) => setEditForm({ ...editForm, customRuleDescription: e.target.value })}
                                    placeholder="Rule description..."
                                    className="w-full text-[11px] p-1 border rounded"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={editForm.issuingAuthority || ''}
                                    onChange={(e) => setEditForm({ ...editForm, issuingAuthority: e.target.value })}
                                    className="w-full text-xs p-1 border rounded mb-1"
                                  />
                                  <input
                                    type="text"
                                    value={editForm.minThreshold || ''}
                                    onChange={(e) => setEditForm({ ...editForm, minThreshold: e.target.value })}
                                    placeholder="Min threshold..."
                                    className="w-full text-[11px] p-1 border rounded font-mono"
                                  />
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <input
                                    type="number"
                                    value={editForm.weight || 0}
                                    onChange={(e) => setEditForm({ ...editForm, weight: Number(e.target.value) })}
                                    className="w-16 text-xs p-1 border rounded font-mono text-center"
                                  />
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <select
                                    value={editForm.isRequired ? 'true' : 'false'}
                                    onChange={(e) => setEditForm({ ...editForm, isRequired: e.target.value === 'true' })}
                                    className="text-xs p-1 border rounded"
                                  >
                                    <option value="true">Mandatory</option>
                                    <option value="false">Optional</option>
                                  </select>
                                </td>
                                <td className="py-2 px-3 text-right space-x-1">
                                  <button
                                    onClick={() => handleSaveEdit(req.id)}
                                    className="px-2 py-1 bg-emerald-700 text-white rounded text-[11px] font-bold"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingReqId(null)}
                                    className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px]"
                                  >
                                    Cancel
                                  </button>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={req.id} className="hover:bg-slate-50">
                              <td className="py-3 px-3 font-bold text-slate-900">
                                <span className="font-mono text-emerald-800">{req.requirementCode}</span>
                                {req.sourcePage && (
                                  <span className="text-[10px] text-slate-400 block font-normal">
                                    p. {req.sourcePage}
                                  </span>
                                )}
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
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => {
                                    setEditingReqId(req.id);
                                    setEditForm({ ...req });
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100"
                                  title="Edit requirement"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">
                            No active requirements published for this tender yet.
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
