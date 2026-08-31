import React, { useState } from 'react';
import { X, Plus, Trash2, Building2 } from 'lucide-react';
import { RequirementCode, TenderRequirement } from '../types';

interface NewTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenderCreated: () => void;
}

export const NewTenderModal: React.FC<NewTenderModalProps> = ({ isOpen, onClose, onTenderCreated }) => {
  const [tenderId, setTenderId] = useState(`GEM/2026/B/${Math.floor(100000 + Math.random() * 900000)}`);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Ministry of Health & Family Welfare');
  const [category, setCategory] = useState('IT & Enterprise Hardware');
  const [estimatedValue, setEstimatedValue] = useState(50000000);
  const [deadline, setDeadline] = useState('2026-11-30T17:00:00.000Z');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [requirements, setRequirements] = useState<Array<Omit<TenderRequirement, 'id' | 'tenderId'>>>([
    { requirementCode: 'GST', requirementName: 'Active GSTIN Registration (REG-06)', isRequired: true, weight: 15, customRuleDescription: 'GSTIN must be ACTIVE; regular return filing.', issuingAuthority: 'GSTN', formatRequired: 'GST REG-06' },
    { requirementCode: 'PAN', requirementName: 'Permanent Account Number (PAN)', isRequired: true, weight: 10, customRuleDescription: 'Corporate PAN in operative status.', issuingAuthority: 'ITD', formatRequired: 'PAN Card' },
    { requirementCode: 'OEM_AUTHORIZATION', requirementName: 'OEM Manufacturer Authorization Form (MAF)', isRequired: true, weight: 25, customRuleDescription: 'Direct OEM MAF with 24x7 4hr SLA.', issuingAuthority: 'Authorized OEM', formatRequired: 'Signed MAF' },
    { requirementCode: 'MAKE_IN_INDIA', requirementName: 'Make in India Local Content (>= 50%)', isRequired: true, weight: 20, minThreshold: 50, customRuleDescription: 'Class-I Local Supplier CA UDIN Certificate.', issuingAuthority: 'Chartered Accountant', formatRequired: 'CA UDIN Cert' },
    { requirementCode: 'INCOME_TAX', requirementName: '3-Year Audited Balance Sheets & ITR', isRequired: true, weight: 15, customRuleDescription: 'Average turnover >= 15 Cr.', issuingAuthority: 'ITD', formatRequired: 'ITR-6' },
    { requirementCode: 'BLACKLISTING', requirementName: 'Non-Debarment Affidavit', isRequired: true, weight: 15, customRuleDescription: 'No blacklisting on Central GeM/CPPP.', issuingAuthority: 'Notary', formatRequired: 'Affidavit' },
  ]);

  if (!isOpen) return null;

  const handleAddRequirement = () => {
    setRequirements((prev) => [
      ...prev,
      {
        requirementCode: 'CUSTOM',
        requirementName: 'Custom Technical Requirement',
        isRequired: true,
        weight: 10,
        customRuleDescription: 'Custom eligibility verification rule.',
        issuingAuthority: 'Competent Authority',
        formatRequired: 'Official Certificate',
      },
    ]);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !department.trim()) {
      alert('Tender Title and Department are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tender: {
            tenderId,
            title,
            department,
            category,
            estimatedValue: Number(estimatedValue),
            deadline,
            description,
            status: 'ACTIVE',
          },
          requirements,
        }),
      });

      if (res.ok) {
        onTenderCreated();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create tender');
      }
    } catch (e) {
      console.error('Create tender error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalWeight = requirements.reduce((sum, r) => sum + Number(r.weight || 0), 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 max-w-3xl w-full p-6 shadow-xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">Create New GeM Procurement Tender</h2>
            <p className="text-xs text-slate-500">Define tender parameters and statutory compliance weights.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tender ID / Ref Number</label>
              <input
                type="text"
                value={tenderId}
                onChange={(e) => setTenderId(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Procuring Ministry / Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tender Subject / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Supply and Installation of High Density GPU Servers..."
              required
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="IT & Enterprise Hardware">IT & Enterprise Hardware</option>
                <option value="Medical & Diagnostic Equipment">Medical & Diagnostic Equipment</option>
                <option value="Renewable Energy & Solar Infrastructure">Renewable Energy & Solar</option>
                <option value="Vehicles & Transport">Vehicles & Transport</option>
                <option value="General Services & Facility Management">General Services</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Value (INR)</label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Submission Deadline</label>
              <input
                type="date"
                value={deadline.split('T')[0]}
                onChange={(e) => setDeadline(new Date(e.target.value).toISOString())}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tender Scope / Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed scope of supply, warranty obligations, and delivery terms..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Compliance Clauses Editor */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Statutory Compliance Clauses (Total Weight: {totalWeight} pts)
              </label>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="inline-flex items-center space-x-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Clause</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto p-1">
              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg items-center text-xs"
                >
                  <div className="col-span-3">
                    <select
                      value={req.requirementCode}
                      onChange={(e) => {
                        const val = e.target.value as RequirementCode;
                        const copy = [...requirements];
                        copy[idx].requirementCode = val;
                        setRequirements(copy);
                      }}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold"
                    >
                      <option value="GST">GST</option>
                      <option value="PAN">PAN</option>
                      <option value="UDYAM">UDYAM</option>
                      <option value="OEM_AUTHORIZATION">OEM_MAF</option>
                      <option value="MAKE_IN_INDIA">MAKE_IN_INDIA</option>
                      <option value="INCOME_TAX">INCOME_TAX</option>
                      <option value="EPFO">EPFO</option>
                      <option value="ESIC">ESIC</option>
                      <option value="STARTUP_INDIA">STARTUP_INDIA</option>
                      <option value="BLACKLISTING">BLACKLISTING</option>
                      <option value="CUSTOM">CUSTOM</option>
                    </select>
                  </div>

                  <div className="col-span-5">
                    <input
                      type="text"
                      value={req.requirementName}
                      onChange={(e) => {
                        const copy = [...requirements];
                        copy[idx].requirementName = e.target.value;
                        setRequirements(copy);
                      }}
                      placeholder="Requirement name..."
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-medium"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={req.weight}
                      onChange={(e) => {
                        const copy = [...requirements];
                        copy[idx].weight = Number(e.target.value);
                        setRequirements(copy);
                      }}
                      placeholder="Weight"
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-center"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-end space-x-2">
                    <label className="text-[10px] flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={req.isRequired}
                        onChange={(e) => {
                          const copy = [...requirements];
                          copy[idx].isRequired = e.target.checked;
                          setRequirements(copy);
                        }}
                      />
                      <span>Mandatory</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
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
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              {isSubmitting ? 'Publishing Tender...' : 'Publish Tender & Clauses'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
