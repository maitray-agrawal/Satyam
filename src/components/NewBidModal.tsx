import React, { useState } from 'react';
import { X, Building, Check, Zap } from 'lucide-react';
import { Tender } from '../types';

interface NewBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenders: Tender[];
  onBidCreated: () => void;
}

export const NewBidModal: React.FC<NewBidModalProps> = ({ isOpen, onClose, tenders, onBidCreated }) => {
  const [selectedTenderId, setSelectedTenderId] = useState(tenders.length > 0 ? tenders[0].id : '');
  const [legalName, setLegalName] = useState('INDUS CLOUD & AI SYSTEMS PVT LTD');
  const [tradeName, setTradeName] = useState('INDUS CLOUD');
  const [pan, setPan] = useState('AAACI1111P');
  const [gstin, setGstin] = useState('07AAACI1111P1Z9');
  const [udyamNumber, setUdyamNumber] = useState('UDYAM-DL-01-0089123');
  const [businessType, setBusinessType] = useState('Private Limited');
  const [city, setCity] = useState('New Delhi');
  const [state, setState] = useState('Delhi');
  const [pincode, setPincode] = useState('110025');
  const [contactPerson, setContactPerson] = useState('Sunil Nambiar');
  const [contactEmail, setContactEmail] = useState('bids@induscloud.in');
  const [contactPhone, setContactPhone] = useState('+91 98119 28410');
  const [oemName, setOemName] = useState('Dell Technologies India Pvt Ltd');
  const [localContentPercentage, setLocalContentPercentage] = useState(58.0);
  const [quotedAmount, setQuotedAmount] = useState(41800000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName.trim() || !pan.trim() || !gstin.trim() || !selectedTenderId) {
      alert('Tender, Bidder Legal Name, PAN, and GSTIN are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderId: selectedTenderId,
          quotedAmount: Number(quotedAmount),
          bidder: {
            legalName,
            tradeName,
            pan,
            gstin,
            udyamNumber,
            businessType,
            address: `${city}, ${state} - ${pincode}`,
            city,
            state,
            pincode,
            contactPerson,
            contactEmail,
            contactPhone,
            oemName,
            localContentPercentage: Number(localContentPercentage),
          },
        }),
      });

      if (res.ok) {
        onBidCreated();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to ingest bidder');
      }
    } catch (e) {
      console.error('Ingest bid error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 max-w-3xl w-full p-6 shadow-xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">Ingest New Bidder & Execute Verification</h2>
            <p className="text-xs text-slate-500">
              Registers bidder profile, creates bid, and immediately triggers automated government registry cross-checks.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Target Tender</label>
            <select
              value={selectedTenderId}
              onChange={(e) => setSelectedTenderId(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tenderId} - {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Legal Entity Name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trade Name / Brand (Optional)</label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Corporate GSTIN (15 Digits)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Corporate PAN (10 Digits)</label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">MSME Udyam Number</label>
              <input
                type="text"
                value={udyamNumber}
                onChange={(e) => setUdyamNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State / UT</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pin Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">OEM Partner Name</label>
              <input
                type="text"
                value={oemName}
                onChange={(e) => setOemName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Local Content Claim (%)</label>
              <input
                type="number"
                value={localContentPercentage}
                onChange={(e) => setLocalContentPercentage(Number(e.target.value))}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quoted Bid Amount (INR)</label>
              <input
                type="number"
                value={quotedAmount}
                onChange={(e) => setQuotedAmount(Number(e.target.value))}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Ingesting & Cross-Checking...' : 'Ingest Bidder & Evaluate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
