import React, { useState } from 'react';
import { Database, Search, CheckCircle, AlertTriangle, ShieldAlert, Sparkles, Terminal, Copy, Check } from 'lucide-react';

interface ApiPreset {
  id: string;
  name: string;
  endpoint: string;
  description: string;
  defaultParam: string;
  sampleValue: string;
  paramKey: string;
}

const API_PRESETS: ApiPreset[] = [
  {
    id: 'gst',
    name: 'GST Common Portal (GSTN)',
    endpoint: '/api/verify/gst',
    description: 'Verifies GSTIN registration status, legal entity name, taxpayer type, and return compliance.',
    defaultParam: '07AAACT2727Q1ZB',
    sampleValue: '07AAACT2727Q1ZB (Active) or 08AAACO4444N1ZP (Cancelled)',
    paramKey: 'gstin',
  },
  {
    id: 'pan',
    name: 'Income Tax PAN Registry (ITD)',
    endpoint: '/api/verify/pan',
    description: 'Verifies Permanent Account Number (PAN) operational status, Aadhaar linkage, and entity category.',
    defaultParam: 'AAACT2727Q',
    sampleValue: 'AAACT2727Q (Company) or AABCA1234F',
    paramKey: 'pan',
  },
  {
    id: 'udyam',
    name: 'Ministry of MSME (Udyam Portal)',
    endpoint: '/api/verify/udyam',
    description: 'Verifies Udyam registration number, enterprise classification (Micro/Small/Medium), and NIC codes.',
    defaultParam: 'UDYAM-DL-01-0045892',
    sampleValue: 'UDYAM-DL-01-0045892 (Small Enterprise)',
    paramKey: 'udyam',
  },
  {
    id: 'income-tax',
    name: 'Income Tax e-Filing (3-Year ITR)',
    endpoint: '/api/verify/income-tax',
    description: 'Verifies 3-year ITR filing history, turnover averages, and tax audit reports under Section 44AB.',
    defaultParam: 'AAACT2727Q',
    sampleValue: 'AAACT2727Q (Audited) or AAACG9999K (Defaulter)',
    paramKey: 'pan',
  },
  {
    id: 'epfo',
    name: 'Employees’ Provident Fund Org (EPFO)',
    endpoint: '/api/verify/epfo',
    description: 'Verifies establishment coverage code, monthly ECR challan filing frequency, and active subscribers.',
    defaultParam: 'DSNHP0048192000',
    sampleValue: 'DSNHP0048192000 (Active, 142 Subscribers)',
    paramKey: 'estId',
  },
  {
    id: 'esic',
    name: 'Employees’ State Insurance (ESIC)',
    endpoint: '/api/verify/esic',
    description: 'Verifies 17-digit employer code, statutory exemption status, and contribution compliance.',
    defaultParam: '11000847190001001',
    sampleValue: '11000847190001001 (Active) or Micro Exemption',
    paramKey: 'code',
  },
  {
    id: 'startup',
    name: 'DPIIT Startup India Portal',
    endpoint: '/api/verify/startup',
    description: 'Verifies DPIIT Recognition Number for Prior Turnover & Experience exemptions on GeM.',
    defaultParam: 'DIPP98412',
    sampleValue: 'DIPP98412 (Valid DPIIT Startup)',
    paramKey: 'dpiit',
  },
  {
    id: 'blacklist',
    name: 'Central GeM & CPPP Debarment Registry',
    endpoint: '/api/verify/blacklist',
    description: 'Central debarment repository search across GeM, Ministry debarment orders, and GFR Rule 151.',
    defaultParam: 'AAACG9999K',
    sampleValue: 'AAACG9999K (Blacklisted for forging certificates)',
    paramKey: 'pan',
  },
  {
    id: 'oem',
    name: 'OEM Manufacturer Authorization Portal',
    endpoint: '/api/verify/oem',
    description: 'Cross-verifies MAF authorization code, tender reference, and 24x7 on-site warranty SLA backing.',
    defaultParam: 'DELL-AUTH-2026-DL8941',
    sampleValue: 'DELL-AUTH-2026-DL8941 or HP-AUTH-EXPIRED',
    paramKey: 'authCode',
  },
];

export const SimulatedApiSandbox: React.FC = () => {
  const [selectedApi, setSelectedApi] = useState<ApiPreset>(API_PRESETS[0]);
  const [paramValue, setParamValue] = useState(API_PRESETS[0].defaultParam);
  const [responseJson, setResponseJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectApi = (api: ApiPreset) => {
    setSelectedApi(api);
    setParamValue(api.defaultParam);
    setResponseJson(null);
  };

  const handleExecuteQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const url = `${selectedApi.endpoint}?${selectedApi.paramKey}=${encodeURIComponent(paramValue)}`;
      const res = await fetch(url);
      const data = await res.json();
      setResponseJson(data);
    } catch (err: any) {
      setResponseJson({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!responseJson) return;
    navigator.clipboard.writeText(JSON.stringify(responseJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xs">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase mb-1">
          <Database className="w-4 h-4" />
          <span>Simulated Government Verification Registry Explorer</span>
        </div>
        <h1 className="text-xl font-black tracking-tight">Interactive Government Registry API Sandbox</h1>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Direct interactive tester for all 9 simulated government verification endpoints. 
          <span className="text-amber-300 font-bold ml-1">
            Note: All responses are clearly stamped "DEMO / SIMULATED GOVERNMENT DATA" in strict adherence to security and verification guidelines.
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: API Endpoints Selector */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Available Registries ({API_PRESETS.length})
          </h2>
          {API_PRESETS.map((api) => {
            const isSelected = selectedApi.id === api.id;
            return (
              <div
                key={api.id}
                onClick={() => handleSelectApi(api)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                  isSelected
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{api.name}</span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                    GET
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-700 mt-1">{api.endpoint}</div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{api.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right: API Request & Live JSON Response Viewer */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs lg:col-span-2 space-y-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                SIMULATED REST API
              </span>
              <span className="text-xs text-slate-400 font-mono">Status: LIVE</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">{selectedApi.name}</h2>
            <p className="text-xs text-slate-600 mt-0.5">{selectedApi.description}</p>
          </div>

          {/* Query Form */}
          <form onSubmit={handleExecuteQuery} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Query Parameter: <span className="font-mono text-emerald-700">{selectedApi.paramKey}</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={paramValue}
                  onChange={(e) => setParamValue(e.target.value)}
                  placeholder={`Enter ${selectedApi.paramKey}...`}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !paramValue.trim()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{loading ? 'Querying Registry...' : 'Execute Query'}</span>
                </button>
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5">
                Suggested Test Value: <span className="font-mono text-slate-700 font-semibold">{selectedApi.sampleValue}</span>
              </div>
            </div>
          </form>

          {/* JSON Response Terminal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Terminal className="w-3.5 h-3.5 text-slate-600" />
                <span>Simulated Government JSON Response Payload</span>
              </div>
              {responseJson && (
                <button
                  onClick={handleCopyJson}
                  className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96 border border-slate-800 shadow-inner">
              {responseJson ? (
                <pre>{JSON.stringify(responseJson, null, 2)}</pre>
              ) : (
                <div className="text-slate-500 italic">Click "Execute Query" to inspect simulated government API payload...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
