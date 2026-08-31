import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building2,
  Clock,
  ArrowLeft,
  RefreshCw,
  Printer,
  Sparkles,
  Upload,
  FileText,
  Check,
  X,
  Send,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Lock,
  Scale,
  Award,
  Hash,
  AlertCircle,
  ChevronRight,
  Database,
  FileCode,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Bid,
  Document,
  ExtractedField,
  RequirementCode,
  User,
  ComplianceCheck,
  Verification,
} from '../types';

interface BidderDossierViewProps {
  bid: Bid;
  currentUser: User;
  onBack: () => void;
  onRefreshBid: () => Promise<void>;
  onPrintReport: () => void;
}

export const BidderDossierView: React.FC<BidderDossierViewProps> = ({
  bid,
  currentUser,
  onBack,
  onRefreshBid,
  onPrintReport,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'documents' | 'verifications' | 'compliance' | 'ai-copilot' | 'decision'
  >('overview');

  // File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocType, setUploadDocType] = useState<RequirementCode>('GST');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedDocForInspect, setSelectedDocForInspect] = useState<Document | null>(
    bid.documents && bid.documents.length > 0 ? bid.documents[0] : null
  );

  // Re-verification loading state
  const [isReVerifying, setIsReVerifying] = useState(false);

  // Decision Form State
  const [decisionType, setDecisionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_CLARIFICATION' | 'HOLD'>(
    bid.officerDecision?.decision || 'APPROVE'
  );
  const [officerComments, setOfficerComments] = useState(bid.officerDecision?.comments || '');
  const [condition1, setCondition1] = useState(true);
  const [condition2, setCondition2] = useState(true);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionSuccessMessage, setDecisionSuccessMessage] = useState<string | null>(null);

  // Copilot Chat State
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<Array<{ sender: 'user' | 'gemini'; text: string; time: string }>>([
    {
      sender: 'gemini',
      text: `Greetings, Officer ${currentUser.name}. I am your GeM Statutory Compliance Decision-Support Copilot. I have analyzed Bid ${bid.bidNumber} submitted by "${bid.bidder?.legalName}". You may ask me about specific GeM GTC clauses, local content thresholds, shortfall procedures, or request a drafted clarification letter.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleReVerify = async () => {
    setIsReVerifying(true);
    try {
      const res = await fetch(`/api/bids/${bid.id}/re-verify`, { method: 'POST' });
      if (res.ok) {
        await onRefreshBid();
      }
    } catch (e) {
      console.error('Re-verify error:', e);
    } finally {
      setIsReVerifying(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('bidId', bid.id);
    formData.append('bidderId', bid.bidderId);
    formData.append('tenderId', bid.tenderId);
    formData.append('documentType', uploadDocType);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadMessage({
          type: 'success',
          text: `Document "${uploadFile.name}" analyzed with Gemini OCR. Compliance rules re-calculated.`,
        });
        setUploadFile(null);
        await onRefreshBid();
        if (data.document) {
          setSelectedDocForInspect(data.document);
        }
      } else {
        setUploadMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.message || 'Upload error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDecision = async () => {
    if (!officerComments.trim()) {
      alert('Officer comments and justification are mandatory under GeM GTC guidelines.');
      return;
    }

    setIsSubmittingDecision(true);
    try {
      const conditions: string[] = [];
      if (condition1) conditions.push('Furnish Performance Security (e-PBG) of 3% contract value within 15 days');
      if (condition2) conditions.push('OEM SLA and Warranty certificate to be verified during inspection');

      const res = await fetch(`/api/bids/${bid.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName: currentUser.name,
          officerDesignation: currentUser.designation,
          decision: decisionType,
          comments: officerComments,
          conditions,
        }),
      });

      if (res.ok) {
        if (decisionType === 'APPROVE') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        setDecisionSuccessMessage('Official Decision recorded and sealed in immutable audit ledger.');
        await onRefreshBid();
      }
    } catch (e) {
      console.error('Save decision error:', e);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleSendCopilotQuery = async (queryText?: string) => {
    const q = queryText || copilotQuery;
    if (!q.trim() || copilotLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setCopilotMessages((prev) => [...prev, userMsg]);
    setCopilotQuery('');
    setCopilotLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          bidContext: bid,
        }),
      });
      const data = await res.json();
      const aiMsg = {
        sender: 'gemini' as const,
        text: data.response || 'No response generated.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCopilotMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        sender: 'gemini' as const,
        text: 'Error contacting AI Copilot. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCopilotMessages((prev) => [...prev, errMsg]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'LOW':
        return 'text-emerald-700 bg-emerald-50 border-emerald-300';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-50 border-amber-300';
      case 'HIGH':
        return 'text-orange-700 bg-orange-50 border-orange-300';
      case 'CRITICAL':
        return 'text-rose-700 bg-rose-50 border-rose-300';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Back and Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <button
          id="btn-back-to-list"
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Evaluation Matrix</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            id="btn-reverify-bid"
            onClick={handleReVerify}
            disabled={isReVerifying}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReVerifying ? 'animate-spin' : ''}`} />
            <span>{isReVerifying ? 'Verifying Registries...' : 'Re-Run Verification'}</span>
          </button>

          <button
            id="btn-print-tec-report"
            onClick={onPrintReport}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print TEC Report</span>
          </button>
        </div>
      </div>

      {/* Dossier Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Bidder Details */}
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-slate-300">
                BID REF: {bid.bidNumber}
              </span>
              <span className="bg-blue-50 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200">
                TENDER: {bid.tender?.tenderId}
              </span>
              {bid.officerDecision?.decision && (
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                    bid.officerDecision.decision === 'APPROVE'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : bid.officerDecision.decision === 'REJECT'
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  OFFICER STATUS: {bid.officerDecision.decision}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{bid.bidder?.legalName}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 text-xs text-slate-600 font-medium">
              <div>
                <span className="text-slate-400">GSTIN:</span> <span className="font-mono font-bold">{bid.bidder?.gstin}</span>
              </div>
              <div>
                <span className="text-slate-400">PAN:</span> <span className="font-mono font-bold">{bid.bidder?.pan}</span>
              </div>
              <div>
                <span className="text-slate-400">MSME Udyam:</span>{' '}
                <span className="font-mono">{bid.bidder?.udyamNumber || 'N/A (Exempt)'}</span>
              </div>
              <div>
                <span className="text-slate-400">Location:</span> {bid.bidder?.city}, {bid.bidder?.state}
              </div>
              <div>
                <span className="text-slate-400">Local Content (MII):</span>{' '}
                <span className="font-bold text-slate-900">{bid.bidder?.localContentPercentage}%</span>
              </div>
              <div>
                <span className="text-slate-400">OEM Partner:</span> {bid.bidder?.oemName || 'Direct Manufacturer'}
              </div>
            </div>
          </div>

          {/* Right: Scores & Risk Badge */}
          <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Deterministic Score</div>
              <div
                className={`text-3xl font-black font-mono mt-0.5 ${
                  (bid.overallScore || 0) >= 90
                    ? 'text-emerald-700'
                    : (bid.overallScore || 0) >= 70
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {bid.overallScore ?? '--'}<span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Weighted Rule Engine</div>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div className="text-center">
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Assessed Risk</div>
              <div className="mt-1">
                <span
                  className={`inline-block px-2.5 py-1 rounded text-xs font-black border ${getRiskColor(
                    bid.riskLevel
                  )}`}
                >
                  {bid.riskLevel || 'EVALUATING'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{bid.riskAssessment?.failedChecksCount ?? 0} Discrepancies</div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-slate-200 mt-6 -mb-6 overflow-x-auto space-x-1">
          <button
            id="subtab-overview"
            onClick={() => setActiveSubTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'overview'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Executive Summary & Flags
          </button>

          <button
            id="subtab-documents"
            onClick={() => setActiveSubTab('documents')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeSubTab === 'documents'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>2. Uploads & Gemini OCR</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full">
              {bid.documents?.length || 0}
            </span>
          </button>

          <button
            id="subtab-verifications"
            onClick={() => setActiveSubTab('verifications')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeSubTab === 'verifications'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>3. Govt Registry Cross-Checks</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full">
              {bid.verifications?.length || 0} APIs
            </span>
          </button>

          <button
            id="subtab-compliance"
            onClick={() => setActiveSubTab('compliance')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'compliance'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Deterministic Rule Breakdown
          </button>

          <button
            id="subtab-ai-copilot"
            onClick={() => setActiveSubTab('ai-copilot')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeSubTab === 'ai-copilot'
                ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                : 'border-transparent text-purple-900 hover:text-purple-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>5. AI Advisory & Copilot</span>
          </button>

          <button
            id="subtab-decision"
            onClick={() => setActiveSubTab('decision')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeSubTab === 'decision'
                ? 'border-slate-900 text-slate-900 bg-slate-100'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>6. Officer Decision Board</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: EXECUTIVE SUMMARY & RED FLAGS */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Critical Red Flags Alert Box */}
          {bid.riskAssessment?.criticalFlags && bid.riskAssessment.criticalFlags.length > 0 ? (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 shadow-xs">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-rose-900 uppercase tracking-wide">
                    Critical Compliance Red Flags Detected ({bid.riskAssessment.criticalFlags.length})
                  </h3>
                  <p className="text-xs text-rose-800 mt-1">
                    The following statutory disqualification criteria or significant mismatches were flagged during automated simulated government registry cross-checks:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-rose-900 font-semibold list-disc list-inside">
                    {bid.riskAssessment.criticalFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900">Zero Critical Disqualifications</h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  No active debarment or invalid statutory records found across simulated GSTN, PAN, and Central Debarment repositories.
                </p>
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">Statutory Checks Summary</div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5" /> Passed Checks
                  </span>
                  <span className="font-bold text-emerald-700">{bid.riskAssessment?.passedChecksCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mr-1.5" /> Failed / Shortfall
                  </span>
                  <span className="font-bold text-rose-700">{bid.riskAssessment?.failedChecksCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center">
                    <Clock className="w-3.5 h-3.5 text-amber-600 mr-1.5" /> Pending Officer Review
                  </span>
                  <span className="font-bold text-amber-700">{bid.riskAssessment?.pendingChecksCount ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">Commercial & Quoted Amount</div>
              <div className="mt-2">
                <div className="text-xl font-black font-mono text-slate-900">
                  ₹ {(bid.quotedAmount / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakhs
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Estimated Tender Value: ₹{' '}
                  {((bid.tender?.estimatedValue || 0) / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })}{' '}
                  Lakhs
                </p>
                <div className="mt-2 text-[11px] text-slate-600 font-medium">
                  Financial Status: <span className="font-bold">{bid.financialStatus}</span> (Opened only after Technical Qualification)
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">AI Recommendation Synopsis</div>
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-black uppercase px-2.5 py-1 rounded border ${
                      bid.aiRecommendation?.recommendation === 'COMPLIANT'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : bid.aiRecommendation?.recommendation === 'NON_COMPLIANT'
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {bid.aiRecommendation?.recommendation || 'EVALUATING'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Gemini Flash</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {bid.aiRecommendation?.reasoningText}
                </p>
              </div>
            </div>
          </div>

          {/* Tender Requirements Quick Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Tender Compliance Checklist Breakdown</h3>
            <div className="space-y-2.5">
              {bid.complianceChecks?.map((check) => (
                <div
                  key={check.id}
                  className="flex items-start justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition text-xs"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{check.requirementName}</span>
                      <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                        Weight: {check.weight} pts
                      </span>
                      {check.isRequired && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px]">{check.evidenceSummary}</p>
                    {check.issuesFound.length > 0 && (
                      <div className="text-rose-700 text-[11px] font-medium">
                        Issue: {check.issuesFound.join('; ')}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        check.status === 'COMPLIANT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : check.status === 'REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {check.status} ({check.scoreAchieved}/{check.weight} pts)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: UPLOADS & GEMINI OCR EXTRACTOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'documents' && (
        <div className="space-y-6">
          {/* Upload New Document Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Upload Bidder Compliance Document</h3>
            <p className="text-xs text-slate-500 mb-4">
              PDF or High-Resolution Scans (Max 15MB). Automated multimodal OCR via Gemini will extract structured metadata, verify signatures & CA UDIN.
            </p>

            {uploadMessage && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs font-medium ${
                  uploadMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {uploadMessage.text}
              </div>
            )}

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Document Category</label>
                  <select
                    id="select-upload-doc-type"
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value as RequirementCode)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="GST">GST Registration Certificate (REG-06)</option>
                    <option value="PAN">Corporate PAN Card</option>
                    <option value="UDYAM">MSME Udyam Registration Certificate</option>
                    <option value="OEM_AUTHORIZATION">OEM Manufacturer Authorization (MAF)</option>
                    <option value="MAKE_IN_INDIA">Make in India CA UDIN Local Content</option>
                    <option value="INCOME_TAX">3-Year Audited Financials & ITR</option>
                    <option value="EPFO">EPFO Monthly ECR Challan</option>
                    <option value="ESIC">ESIC Registration / Exemption Undertaking</option>
                    <option value="STARTUP_INDIA">DPIIT Startup Recognition Certificate</option>
                    <option value="BLACKLISTING">Non-Debarment Stamp Affidavit</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select PDF/Image File</label>
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  id="btn-submit-doc-upload"
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-xs font-bold transition shadow-xs"
                >
                  <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-bounce' : ''}`} />
                  <span>{isUploading ? 'Gemini Analyzing Document...' : 'Upload & Extract with Gemini OCR'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Side-by-Side: Document List and Extracted Structured Fields Viewer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Document List */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase">Ingested Documents ({bid.documents?.length || 0})</h3>
                <span className="text-[10px] text-slate-500">SHA256 Verified</span>
              </div>
              <div className="space-y-2">
                {bid.documents && bid.documents.length > 0 ? (
                  bid.documents.map((doc) => {
                    const isSelected = selectedDocForInspect?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocForInspect(doc)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="font-bold text-slate-900 truncate max-w-[180px]">
                            {doc.fileOriginalName}
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              doc.verificationStatus === 'VALID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {doc.verificationStatus}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Type: <span className="font-semibold text-slate-700">{doc.documentType}</span> • {Math.round(doc.fileSize / 1024)} KB
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1 truncate" title={doc.sha256Hash}>
                          Hash: {doc.sha256Hash.substring(0, 16)}...
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">No documents uploaded yet.</div>
                )}
              </div>
            </div>

            {/* Right: Extracted Fields Inspector */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
              {selectedDocForInspect ? (
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">
                          {selectedDocForInspect.fileOriginalName}
                        </span>
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200">
                          Gemini 3.7 Flash OCR Extracted
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Category: {selectedDocForInspect.documentType} • Ingested: {new Date(selectedDocForInspect.uploadTimestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Structured Fields Extracted (Deterministic JSON)
                    </h4>

                    {selectedDocForInspect.extractedFields && selectedDocForInspect.extractedFields.length > 0 ? (
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                            <tr>
                              <th className="py-2.5 px-3">Field Name</th>
                              <th className="py-2.5 px-3">Extracted Value</th>
                              <th className="py-2.5 px-3 text-center">Confidence</th>
                              <th className="py-2.5 px-3">Raw Snippet / Page</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-mono">
                            {selectedDocForInspect.extractedFields.map((f, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">{f.fieldName}</td>
                                <td className="py-2.5 px-3 font-bold text-emerald-800">
                                  {f.fieldValue || <span className="text-slate-400 italic font-sans font-normal">Not Found</span>}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">
                                    {Math.round(f.confidence * 100)}%
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-500 font-sans text-[11px]">
                                  {f.rawSnippet || `Page ${f.sourcePage || 1}`}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                        Document analyzed and verified directly against Registry API.
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono">
                      <div className="text-[10px] uppercase font-bold text-slate-400 font-sans">Document Integrity Verification</div>
                      <div className="mt-1 break-all">SHA-256 Checksum: {selectedDocForInspect.sha256Hash}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Select a document from the left list to view structured extracted fields.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: GOVT REGISTRY CROSS-CHECKS */}
      {/* ========================================================================= */}
      {activeSubTab === 'verifications' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start space-x-3">
            <Database className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">SIMULATED GOVERNMENT REGISTRY INTEGRATION ENVIRONMENT:</span>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                The verification responses below simulate direct portal integration with GST Common Portal (GSTN), Income Tax e-Filing, MSME Udyam, EPFO, ESIC, DPIIT, and Central Public Procurement Portal (CPPP) Debarment Repository.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Government Portal Cross-Verification Matrix</h3>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                {bid.verifications?.length || 0} APIs Queried
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Statutory Registry / Portal</th>
                    <th className="py-3 px-4">Bidder Claim / Identifier</th>
                    <th className="py-3 px-4">Simulated Portal Record</th>
                    <th className="py-3 px-4 text-center">Match Status</th>
                    <th className="py-3 px-4">Verification Evidence & Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bid.verifications && bid.verifications.length > 0 ? (
                    bid.verifications.map((v) => {
                      const isMatch = v.matchStatus === 'MATCH';
                      const isMismatch = v.matchStatus === 'MISMATCH' || v.matchStatus === 'INVALID';
                      return (
                        <tr key={v.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center space-x-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>{v.requirementCode}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              {v.apiEndpoint}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                            {v.requirementCode === 'GST'
                              ? bid.bidder?.gstin
                              : v.requirementCode === 'PAN'
                              ? bid.bidder?.pan
                              : v.requirementCode === 'UDYAM'
                              ? bid.bidder?.udyamNumber || 'N/A'
                              : v.requirementCode === 'MAKE_IN_INDIA'
                              ? `${bid.bidder?.localContentPercentage}% Claimed`
                              : v.requirementCode === 'OEM_AUTHORIZATION'
                              ? bid.bidder?.oemName || 'OEM Authorized'
                              : bid.bidder?.legalName}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            {v.verifiedDataJson?.legalName ? (
                              <div>
                                <span className="font-bold text-slate-900">{v.verifiedDataJson.legalName}</span>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Status: <span className="font-bold">{v.verifiedDataJson.status}</span>
                                  {v.verifiedDataJson.localContentVerified && (
                                    <span> • Verified MII: {v.verifiedDataJson.localContentVerified}%</span>
                                  )}
                                  {v.verifiedDataJson.isBlacklisted && (
                                    <span className="text-rose-700 font-bold"> • DEBARRED</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 font-sans">
                                {JSON.stringify(v.verifiedDataJson).substring(0, 60)}...
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${
                                isMatch
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isMismatch
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {isMatch ? (
                                <Check className="w-3 h-3 mr-1" />
                              ) : (
                                <X className="w-3 h-3 mr-1" />
                              )}
                              {v.matchStatus}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-700 text-xs">
                            <p>{v.evidenceDetails}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                              Synced: {new Date(v.apiTimestamp).toLocaleTimeString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400">
                        No verifications executed. Click "Re-Run Verification" above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: DETERMINISTIC COMPLIANCE RULE BREAKDOWN */}
      {/* ========================================================================= */}
      {activeSubTab === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Deterministic Mathematical Compliance Scoring</h3>
                <p className="text-xs text-slate-500">
                  Compliance scores are computed strictly through business logic rules in TypeScript (no probabilistic AI hallucinations).
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Score</span>
                <div className="text-2xl font-black font-mono text-slate-900">
                  {bid.riskAssessment?.overallScore || 0} / 100
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {bid.complianceChecks?.map((chk) => (
                <div key={chk.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{chk.requirementName}</span>
                        <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold">
                          Weight: {chk.weight} pts
                        </span>
                        {chk.isRequired && (
                          <span className="bg-rose-50 text-rose-700 text-[10px] px-1.5 py-0.5 rounded font-bold border border-rose-200">
                            MANDATORY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{chk.evidenceSummary}</p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                          chk.status === 'COMPLIANT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : chk.status === 'REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {chk.scoreAchieved} / {chk.weight} pts
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <div>Rule: {chk.deterministicRuleEvaluated}</div>
                    {chk.issuesFound.length > 0 && (
                      <div className="text-rose-600 font-sans font-bold">
                        Issues: {chk.issuesFound.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: AI ADVISORY & INTERACTIVE COPILOT */}
      {/* ========================================================================= */}
      {activeSubTab === 'ai-copilot' && (
        <div className="space-y-6">
          {/* AI Structured Recommendation Card */}
          <div className="bg-white rounded-xl border border-purple-200 p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Gemini Decision-Support Advisory (GeM GTC / GFR 2017)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Engineered from verified evidence & deterministic compliance results
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                  bid.aiRecommendation?.recommendation === 'COMPLIANT'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : bid.aiRecommendation?.recommendation === 'NON_COMPLIANT'
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                RECOMMENDATION: {bid.aiRecommendation?.recommendation || 'PENDING'}
              </span>
            </div>

            {/* Advisory Text */}
            <div className="space-y-4 text-xs leading-relaxed">
              <p className="text-slate-800 font-medium bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                {bid.aiRecommendation?.reasoningText}
              </p>

              {/* Critical Issues & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mr-1.5" />
                    Critical Issues / Non-Compliances
                  </h4>
                  {bid.aiRecommendation?.criticalIssues && bid.aiRecommendation.criticalIssues.length > 0 ? (
                    <ul className="space-y-1.5 list-disc list-inside text-rose-800 font-medium">
                      {bid.aiRecommendation.criticalIssues.map((ci, idx) => (
                        <li key={idx}>{ci}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500">None detected. Bid meets baseline eligibility requirements.</p>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                    Recommended Officer Actions
                  </h4>
                  {bid.aiRecommendation?.recommendedActions && bid.aiRecommendation.recommendedActions.length > 0 ? (
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                      {bid.aiRecommendation.recommendedActions.map((ra, idx) => (
                        <li key={idx}>{ra}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500">Proceed with standard evaluation protocol.</p>
                  )}
                </div>
              </div>

              {/* Legal Mandate Disclaimer */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 font-semibold flex items-start space-x-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{bid.aiRecommendation?.disclaimerText}</span>
              </div>
            </div>
          </div>

          {/* Interactive AI Copilot for Procurement Officer */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Procurement Officer Contextual Copilot</h3>
            </div>

            {/* Chat History Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 h-64 overflow-y-auto space-y-3 text-xs mb-3">
              {copilotMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span className={`text-[9px] mt-1 block ${msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex items-center space-x-2 text-slate-500 text-xs italic">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-600" />
                  <span>Gemini is generating procurement guidance...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() =>
                  handleSendCopilotQuery(
                    'Can we seek 48-hour shortfall clarification for the missing document under GeM GTC?'
                  )
                }
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full border border-slate-300 transition"
              >
                Shortfall Clarification Procedure?
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendCopilotQuery(
                    'Draft an official technical clarification notice to this bidder detailing non-compliant clauses.'
                  )
                }
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full border border-slate-300 transition"
              >
                Draft Shortfall Notice Letter
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendCopilotQuery(
                    'What is the Class-I Local Supplier minimum threshold for this category under Make in India Order?'
                  )
                }
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full border border-slate-300 transition"
              >
                Check MII Threshold Rules
              </button>
            </div>

            {/* Input Row */}
            <div className="flex items-center space-x-2">
              <input
                id="input-copilot-query"
                type="text"
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCopilotQuery()}
                placeholder="Ask GeM Copilot about compliance clauses, GTC rules, or draft notices..."
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                id="btn-send-copilot"
                onClick={() => handleSendCopilotQuery()}
                disabled={!copilotQuery.trim() || copilotLoading}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 6: OFFICER DECISION BOARD & AUDIT LOG */}
      {/* ========================================================================= */}
      {activeSubTab === 'decision' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Procurement Officer Technical Evaluation Decision Console
                </h3>
                <p className="text-xs text-slate-500">
                  Officer: <span className="font-bold text-slate-800">{currentUser.name}</span> ({currentUser.designation})
                </p>
              </div>
              <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded border border-slate-300">
                Statutory Authority: GeM GTC / GFR Rule 144
              </span>
            </div>

            {decisionSuccessMessage && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold">
                {decisionSuccessMessage}
              </div>
            )}

            <div className="space-y-5">
              {/* Radio Group for Decision */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Evaluation Decision
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <label
                    className={`p-3.5 rounded-xl border-2 flex items-center space-x-2.5 cursor-pointer transition ${
                      decisionType === 'APPROVE'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decisionType"
                      value="APPROVE"
                      checked={decisionType === 'APPROVE'}
                      onChange={() => setDecisionType('APPROVE')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs">QUALIFY / APPROVE</div>
                      <div className="text-[10px] text-slate-500 font-normal">Eligible for Financial Opening</div>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border-2 flex items-center space-x-2.5 cursor-pointer transition ${
                      decisionType === 'REJECT'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decisionType"
                      value="REJECT"
                      checked={decisionType === 'REJECT'}
                      onChange={() => setDecisionType('REJECT')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs">DISQUALIFY / REJECT</div>
                      <div className="text-[10px] text-slate-500 font-normal">Fails Statutory Criteria</div>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border-2 flex items-center space-x-2.5 cursor-pointer transition ${
                      decisionType === 'REQUEST_CLARIFICATION'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decisionType"
                      value="REQUEST_CLARIFICATION"
                      checked={decisionType === 'REQUEST_CLARIFICATION'}
                      onChange={() => setDecisionType('REQUEST_CLARIFICATION')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="text-xs">REQUEST CLARIFICATION</div>
                      <div className="text-[10px] text-slate-500 font-normal">48-Hr Shortfall Window</div>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border-2 flex items-center space-x-2.5 cursor-pointer transition ${
                      decisionType === 'HOLD'
                        ? 'border-slate-600 bg-slate-100 text-slate-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decisionType"
                      value="HOLD"
                      checked={decisionType === 'HOLD'}
                      onChange={() => setDecisionType('HOLD')}
                      className="text-slate-600 focus:ring-slate-500"
                    />
                    <div>
                      <div className="text-xs">HOLD / TEC COMMITTEE</div>
                      <div className="text-[10px] text-slate-500 font-normal">Pending Committee Meeting</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Justification / Reasoning Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Procurement Officer Rationale & Statutory Justification (Mandatory)
                </label>
                <textarea
                  id="textarea-officer-comments"
                  rows={4}
                  value={officerComments}
                  onChange={(e) => setOfficerComments(e.target.value)}
                  placeholder="State the explicit factual rationale referencing tender clauses, verified government records, and compliance scores..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Conditional Qualifications Checklist */}
              {decisionType === 'APPROVE' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Conditional Qualification Terms (GeM GTC)
                  </div>
                  <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={condition1}
                      onChange={(e) => setCondition1(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Furnish Performance Security (e-PBG) of 3% contract value within 15 days of award.</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={condition2}
                      onChange={(e) => setCondition2(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Original OEM Authorization SLA warranty certificate to be verified during site inspection.</span>
                  </label>
                </div>
              )}

              {/* Save Button */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-400">
                  Recording this decision seals an immutable event in the central GeM Audit Ledger with your digital timestamp.
                </p>
                <button
                  id="btn-save-officer-decision"
                  onClick={handleSaveDecision}
                  disabled={isSubmittingDecision || !officerComments.trim()}
                  className="px-6 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold text-xs transition shadow-sm"
                >
                  {isSubmittingDecision ? 'Sealing Decision...' : 'Save & Record Official Decision'}
                </button>
              </div>
            </div>
          </div>

          {/* Immutable Audit Log for This Bid */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Bid Audit Log & Chronology</h3>
            <div className="space-y-2">
              {bid.auditLogs && bid.auditLogs.length > 0 ? (
                bid.auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{log.eventType}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                          {log.actorName} ({log.actorRole})
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{log.actionSummary}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-4">No audit logs recorded for this bid.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
