import React from 'react';
import {
  Shield,
  Building2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Activity,
  Database,
  Scale,
  UserCheck,
  Sparkles,
  ChevronDown,
  Layers,
  FileSpreadsheet,
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
  onOpenNewTender,
  onOpenNewBid,
  onSelectDemoBid,
}) => {
  return (
    <header id="satyam-header" className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-colors">
      {/* Top Official Sub-Bar: Clean, Authoritative, Subtle */}
      <div className="bg-slate-900 text-slate-200 text-[11px] font-medium tracking-wide py-1 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
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
            className="flex items-center space-x-3 cursor-pointer group select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg text-slate-900 tracking-tight">SATYAM</span>
                <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-200">
                  SIH 2026 PS 26100
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight">
                AI-Powered Integrated Bid Compliance Verification Platform
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-tenders"
              onClick={() => setActiveTab('tenders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'tenders'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Tenders</span>
            </button>

            <button
              id="nav-tab-bids"
              onClick={() => setActiveTab('bids')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'bids' || activeTab === 'dossier'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Bidders</span>
            </button>

            <button
              id="nav-tab-evaluations"
              onClick={() => setActiveTab('evaluations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'evaluations'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Evaluations</span>
            </button>

            <button
              id="nav-tab-apis"
              onClick={() => setActiveTab('apis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'apis'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Verification</span>
            </button>

            <button
              id="nav-tab-reports"
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'reports'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Reports</span>
            </button>

            <button
              id="nav-tab-audit"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'audit'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit</span>
            </button>

            <a
              id="nav-tab-openapi"
              href="/api/docs"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200"
            >
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>OpenAPI</span>
            </a>
          </nav>

          {/* Right Action & Officer Switcher */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-quick-new-bid"
              onClick={onOpenNewBid}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <span>+ Ingest Bid</span>
            </button>

            {/* Officer Profile Badge */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 hover:border-slate-300 transition-colors">
              <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
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
                      {u.name} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                  {currentUser.designation}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
