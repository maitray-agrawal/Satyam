import React, { useState, useEffect } from 'react';
import { Navbar, USERS } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BidderDossierView } from './components/BidderDossierView';
import { TendersListView } from './components/TendersListView';
import { SimulatedApiSandbox } from './components/SimulatedApiSandbox';
import { AuditLedgerView } from './components/AuditLedgerView';
import { NewTenderModal } from './components/NewTenderModal';
import { NewBidModal } from './components/NewBidModal';
import { PrintReportModal } from './components/PrintReportModal';
import { Bid, DashboardStats, Tender, User, AuditLog } from './types';
import { RefreshCw, Scale } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
  const [selectedBidDetails, setSelectedBidDetails] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isNewTenderOpen, setIsNewTenderOpen] = useState(false);
  const [isNewBidOpen, setIsNewBidOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, tendersRes, bidsRes, logsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/tenders'),
        fetch('/api/bids'),
        fetch('/api/audit-logs'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (tendersRes.ok) setTenders(await tendersRes.json());
      if (bidsRes.ok) {
        const bidsData = await bidsRes.json();
        setBids(bidsData);
        // If there's an active selected bid, reload its details
        if (selectedBidId) {
          const detailRes = await fetch(`/api/bids/${selectedBidId}`);
          if (detailRes.ok) setSelectedBidDetails(await detailRes.json());
        }
      }
      if (logsRes.ok) setAuditLogs(await logsRes.json());
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectBid = async (bidId: string) => {
    setSelectedBidId(bidId);
    setLoading(true);
    try {
      const res = await fetch(`/api/bids/${bidId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedBidDetails(data);
        setActiveTab('dossier');
      }
    } catch (e) {
      console.error('Error fetching bid details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSingleBid = async () => {
    if (!selectedBidId) return;
    try {
      const res = await fetch(`/api/bids/${selectedBidId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedBidDetails(data);
      }
      // Also refresh dashboard stats and bids list in background
      const [statsRes, bidsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/bids'),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (bidsRes.ok) setBids(await bidsRes.json());
    } catch (e) {
      console.error('Error refreshing bid:', e);
    }
  };

  const handleSelectTenderForBids = (tenderId: string) => {
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Official Government Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'bids') {
            if (bids.length > 0 && !selectedBidId) {
              handleSelectBid(bids[0].id);
            }
          }
        }}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onOpenNewTender={() => setIsNewTenderOpen(true)}
        onOpenNewBid={() => setIsNewBidOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading && !selectedBidDetails && bids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Initializing GEV-VERIFY Platform & Simulated Government Registries...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                bids={bids}
                tenders={tenders}
                onSelectBid={handleSelectBid}
                onRefreshAll={loadData}
                onOpenNewTender={() => setIsNewTenderOpen(true)}
                onOpenNewBid={() => setIsNewBidOpen(true)}
                loading={loading}
              />
            )}

            {(activeTab === 'dossier' || activeTab === 'bids') && selectedBidDetails && (
              <BidderDossierView
                bid={selectedBidDetails}
                currentUser={currentUser}
                onBack={() => setActiveTab('dashboard')}
                onRefreshBid={handleRefreshSingleBid}
                onPrintReport={() => setIsPrintReportOpen(true)}
              />
            )}

            {(activeTab === 'dossier' || activeTab === 'bids') && !selectedBidDetails && (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
                <Scale className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Bidder Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select a bidder from the matrix to inspect their verification dossier and extracted documents.
                </p>
                <button
                  onClick={() => {
                    if (bids.length > 0) handleSelectBid(bids[0].id);
                    else setActiveTab('dashboard');
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  {bids.length > 0 ? 'Open First Bidder Dossier' : 'Go to Dashboard'}
                </button>
              </div>
            )}

            {activeTab === 'tenders' && (
              <TendersListView
                tenders={tenders}
                onSelectTenderForBids={handleSelectTenderForBids}
                onOpenNewTender={() => setIsNewTenderOpen(true)}
              />
            )}

            {activeTab === 'apis' && <SimulatedApiSandbox />}

            {activeTab === 'audit' && (
              <AuditLedgerView logs={auditLogs} onRefreshLogs={loadData} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-slate-200">GEV-VERIFY Platform</span>
            <span>•</span>
            <span>Government e-Marketplace (GeM) Decision-Support System</span>
          </div>
          <div className="text-slate-400 font-mono text-center sm:text-right">
            <span>GFR 2017 Rule 144 Compliant • Simulated Govt Data</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewTenderModal
        isOpen={isNewTenderOpen}
        onClose={() => setIsNewTenderOpen(false)}
        onTenderCreated={loadData}
      />

      <NewBidModal
        isOpen={isNewBidOpen}
        onClose={() => setIsNewBidOpen(false)}
        tenders={tenders}
        onBidCreated={loadData}
      />

      {selectedBidDetails && (
        <PrintReportModal
          isOpen={isPrintReportOpen}
          onClose={() => setIsPrintReportOpen(false)}
          bid={selectedBidDetails}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

export default App;
