import React from 'react';
import { Shield, Building2, CheckCircle, AlertTriangle, FileText, Activity, Database, Scale, UserCheck, Sparkles } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  onOpenNewTender: () => void;
  onOpenNewBid: () => void;
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
  onOpenNewTender,
  onOpenNewBid,
}) => {
  return (
    <header id="gem-header" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Government Official Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-emerald-700 to-blue-800 text-white text-[11px] font-medium tracking-wide py-1 px-4 text-center flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">GOVERNMENT OF INDIA</span>
          <span>GeM Procurement Decision-Support & Compliance Verification System</span>
        </div>
        <div className="flex items-center space-x-3 text-amber-200">
          <span className="hidden md:inline font-mono">GFR 2017 & GeM GTC Compliant</span>
          <span className="bg-amber-500/30 text-amber-100 px-2 py-0.5 rounded-full border border-amber-400/40 text-[10px] font-semibold">
            DEMO / SIMULATED GOVT REGISTRY DATA
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-inner font-black text-xl tracking-tighter border border-emerald-400/50">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-tight">GEV-VERIFY</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                  v2.6 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">AI Integrated Bid Verification Platform</p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-tenders"
              onClick={() => setActiveTab('tenders')}
              className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'tenders'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Tenders & Clauses</span>
            </button>

            <button
              id="nav-tab-bids"
              onClick={() => setActiveTab('bids')}
              className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'bids' || activeTab === 'dossier'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Bidder Dossiers</span>
            </button>

            <button
              id="nav-tab-apis"
              onClick={() => setActiveTab('apis')}
              className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'apis'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Govt API Sandbox</span>
            </button>

            <button
              id="nav-tab-audit"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'audit'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Audit Ledger</span>
            </button>

            <a
              id="nav-tab-openapi"
              href="/api/docs"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-md text-xs font-semibold flex items-center space-x-1.5 text-amber-300 hover:bg-slate-800 hover:text-white transition-all border border-amber-500/30 bg-amber-500/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>OpenAPI Docs</span>
            </a>
          </nav>

          {/* Right Action Area & User Profile Switcher */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-quick-new-bid"
              onClick={onOpenNewBid}
              className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <span>+ Ingest Bidder</span>
            </button>

            {/* Officer Role Selector */}
            <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700 rounded-lg p-1.5">
              <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300">
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-left pr-2">
                <select
                  id="select-user-profile"
                  value={currentUser.id}
                  onChange={(e) => {
                    const found = USERS.find((u) => u.id === e.target.value);
                    if (found) setCurrentUser(found);
                  }}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                >
                  {USERS.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                      {u.name} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{currentUser.designation}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
