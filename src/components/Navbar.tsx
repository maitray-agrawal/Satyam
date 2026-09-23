import React from 'react';
import { StateEmblem } from './StateEmblem';
import {
  Building2,
  Activity,
  Database,
  Scale,
  UserCheck,
  Layers,
  FileSpreadsheet,
  FileText,
  FileCheck,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  onOpenNewTender: () => void;
  onOpenNewBid: () => void;
  onSelectDemoBid?: (bidId: string) => void;
}

export const USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Rajiv K. Sharma',
    email: 'rajiv.sharma@gem.gov.in',
    role: 'PROCUREMENT_OFFICER',
    department: 'Ministry of Electronics & IT (MeitY)',
    designation: 'Director (Procurement & Contracts)',
  },
  {
    id: 'usr-2',
    name: 'Dr. Meenakshi Sundaram',
    email: 'm.sundaram@gem.gov.in',
    role: 'TECHNICAL_EVALUATOR',
    department: 'GeM Quality Assurance Cell',
    designation: 'Senior Technical Evaluator',
  },
  {
    id: 'usr-3',
    name: 'Anand Vardhan, IA&AS',
    email: 'a.vardhan@cag.gov.in',
    role: 'AUDITOR',
    department: 'Comptroller and Auditor General (CAG)',
    designation: 'Principal Auditor (Procurement)',
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  onOpenNewBid,
}) => {
  return (
<<<<<<< HEAD
    <header
      id="satyam-header"
      className="sticky top-0 z-40 transition-colors print:hidden shadow-xs"
    >
      {/* ========================================================================= */}
      {/* TOP OFFICIAL INSTITUTIONAL BAR (Matches Reference Image)                  */}
      {/* ========================================================================= */}
      <div className="bg-[#051329] text-slate-200 border-b border-slate-800/90 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          {/* LEFT SIDE: National Emblem Area | Divider | SATYAM Identity */}
          <div className="flex items-center space-x-3.5 min-w-0">
            {/* National Emblem & Government Identity Area */}
            <div className="flex items-center space-x-2.5 flex-shrink-0">
              {/* Ashoka Emblem Graphic with 'सत्यमेव जयते' */}
              <div className="flex flex-col items-center justify-center flex-shrink-0">
                <img
                  src="/assets/emblem.png"
                  alt="National Emblem of India"
                  className="h-12 w-auto flex-shrink-0 object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </div>

              {/* Bilingual Government Text + Tricolor Accent */}
              <div className="flex flex-col justify-center select-none">
                <span className="text-[11px] font-semibold text-slate-200 tracking-wide font-sans leading-none">
                  भारत सरकार
                </span>
                <span className="text-[10px] font-bold text-white tracking-wider uppercase font-sans mt-1 leading-none">
                  GOVERNMENT OF INDIA
                </span>
                {/* Indian Tricolor Stripe Accent (Saffron, White, Green) */}
                <div className="w-full h-1 mt-1.5 flex rounded-full overflow-hidden shadow-2xs">
                  <span className="h-full w-1/3 bg-[#FF9933]"></span>
                  <span className="h-full w-1/3 bg-white"></span>
                  <span className="h-full w-1/3 bg-[#138808]"></span>
                </div>
              </div>
=======
    <header id="satyam-header" className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-colors">
      {/* Top Official Sub-Bar: Clean, Authoritative, Subtle */}
      <div className="bg-slate-900 text-slate-200 text-[11px] font-medium tracking-wide py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <StateEmblem size={22} inverted alt="State Emblem of India" className="shrink-0" />
          <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-700">
            GOVERNMENT OF INDIA
          </span>
          <span className="hidden sm:inline text-slate-300">
            GeM Procurement Compliance Intelligence & Decision-Support System
          </span>
          <span className="sm:hidden text-slate-300">GeM SATYAM Platform</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400">
          <span className="hidden md:inline font-mono text-[10px] text-slate-300">
            GFR 2017 Rule 144 Compliant
          </span>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-teal-300 border border-teal-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>Simulated Govt Registries</span>
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Subtitle */}
          <div
            className="flex items-center space-x-3.5 cursor-pointer group select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="flex items-center space-x-3">
              <StateEmblem size={44} alt="State Emblem of India" className="transition-transform group-hover:scale-105 shrink-0" />
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
>>>>>>> origin/satwik-sih-2026-ps26100
            </div>

            {/* Clean Thin Vertical Divider */}
            <div className="h-9 w-px bg-slate-700/80 mx-1 hidden sm:block flex-shrink-0" />

            {/* SATYAM Institutional Identity */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer group select-none flex-shrink-0"
              onClick={() => setActiveTab('dashboard')}
            >
              {/* Minimal Verification & Trust Shield Mark */}
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors flex-shrink-0">
                <svg
                  className="w-4.5 h-4.5 text-teal-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" strokeWidth="2.2" />
                </svg>
              </div>

              <div className="leading-tight">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-base text-white tracking-tight">SATYAM</span>
                  {/* Subtle Sanskrit Meaning Detail with Interactive Tooltip */}
                  <div className="relative group/satyam inline-block">
                    <span
                      tabIndex={0}
                      className="text-[10px] text-teal-300 font-medium px-1.5 py-0.5 rounded bg-teal-950/80 border border-teal-700/60 cursor-help flex items-center space-x-1"
                    >
                      <span>सत्यम्</span>
                      <span className="text-slate-500">•</span>
                      <span>Truth</span>
                    </span>
                    {/* Tooltip on Hover / Focus */}
                    <div className="absolute left-0 top-full mt-1.5 hidden group-hover/satyam:block group-focus/satyam:block z-50 w-64 p-3 bg-slate-900 text-slate-200 text-xs rounded-xl shadow-2xl border border-slate-700 pointer-events-none">
                      <div className="font-bold text-slate-100 flex items-center justify-between">
                        <span>SATYAM (सत्यम्)</span>
                        <span className="text-[10px] text-teal-400 font-mono">Sanskrit: Truth</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        Named for the foundational principle of truthful, transparent, and evidence-based procurement verification.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight whitespace-nowrap">
                  Bid Compliance Verification Platform
                </p>
              </div>
            </div>
          </div>

          {/* CENTER: Platform Title & Descriptor (Matches Reference Image) */}
          <div className="hidden lg:flex flex-col items-center justify-center text-center px-4">
            <div className="text-xs sm:text-sm font-semibold text-white tracking-wide">
              GeM Procurement Compliance Intelligence & Decision-Support System
            </div>
            <div className="text-[11px] text-slate-400 font-normal tracking-wide mt-0.5 flex items-center space-x-2">
              <span>Transparent</span>
              <span className="text-slate-600">|</span>
              <span>Compliant</span>
              <span className="text-slate-600">|</span>
              <span>Trusted Procurement</span>
            </div>
          </div>

          {/* RIGHT SIDE: Rule 144 Status Pill (Matches Reference Image) */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs font-medium shadow-2xs whitespace-nowrap">
              <FileCheck className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              <span className="font-sans">GFR 2017 Rule 144 Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN NAVIGATION ROW                                                       */}
      {/* ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/90">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 gap-3">
            {/* Navigation Links: 7 Items, balanced spacing, OpenAPI completely removed */}
            <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-1">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                id="nav-tab-tenders"
                onClick={() => setActiveTab('tenders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'tenders'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Tenders</span>
              </button>

              <button
                id="nav-tab-bids"
                onClick={() => setActiveTab('bids')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'bids' || activeTab === 'dossier'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Scale className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Bidders</span>
              </button>

              <button
                id="nav-tab-evaluations"
                onClick={() => setActiveTab('evaluations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'evaluations'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Evaluations</span>
              </button>

              <button
                id="nav-tab-apis"
                onClick={() => setActiveTab('apis')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'apis'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Database className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Verification</span>
              </button>

              <button
                id="nav-tab-reports"
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Reports</span>
              </button>

              <button
                id="nav-tab-audit"
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Audit</span>
              </button>
            </nav>

            {/* Right Action: Ingest Bid + Officer Profile */}
            <div className="flex items-center space-x-3 flex-shrink-0 ml-auto">
              <button
                id="btn-quick-new-bid"
                onClick={onOpenNewBid}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs flex-shrink-0 cursor-pointer"
              >
                <span>+ Ingest Bid</span>
              </button>

              {/* Officer Profile Badge with Dropdown */}
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 hover:border-slate-300 transition-colors flex-shrink-0">
                <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-left pr-1">
                  <select
                    id="select-user-profile"
                    value={currentUser.id}
                    onChange={(e) => {
                      const found = USERS.find((u) => u.id === e.target.value);
                      if (found) setCurrentUser(found);
                    }}
                    className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    {USERS.map((u) => (
                      <option key={u.id} value={u.id} className="text-slate-900 bg-white">
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                    {currentUser.role === 'PROCUREMENT_OFFICER'
                      ? 'Procurement Officer'
                      : currentUser.role === 'TECHNICAL_EVALUATOR'
                        ? 'Technical Evaluator'
                        : 'Auditor'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
