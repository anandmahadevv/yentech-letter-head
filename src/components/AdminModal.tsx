import React, { useState } from 'react';
import { AdminSettings, GeneratedDocumentLog, Organization } from '../types';
import {
  Lock,
  Unlock,
  Upload,
  Sliders,
  Building,
  Key,
  History,
  Trash2,
  Check,
  X,
  Eye,
  Plus,
  RotateCcw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: Organization[];
  activeOrg: Organization;
  onUpdateOrganization: (updated: Organization) => void;
  onAddOrganization: (newOrg: Organization) => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  historyLogs: GeneratedDocumentLog[];
  onRestoreHistory: (log: GeneratedDocumentLog) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  organizations,
  activeOrg,
  onUpdateOrganization,
  onAddOrganization,
  adminSettings,
  onUpdateAdminSettings,
  historyLogs,
  onRestoreHistory,
  onDeleteHistory,
  onClearHistory,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'letterhead' | 'margins' | 'profile' | 'history' | 'api'>(
    'letterhead'
  );
  const [selectedOrgId, setSelectedOrgId] = useState<string>(activeOrg.id);

  const currentOrg = organizations.find((o) => o.id === selectedOrgId) || activeOrg;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === adminSettings.passcode) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect admin passcode.');
    }
  };

  const handleLetterheadFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        onUpdateOrganization({
          ...currentOrg,
          letterheadType: 'custom-image',
          customLetterheadUrl: base64Url,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToBuiltin = () => {
    onUpdateOrganization({
      ...currentOrg,
      letterheadType: 'built-in',
      customLetterheadUrl: undefined,
    });
  };

  const handleAddNewOrg = () => {
    const newId = 'org_' + Date.now();
    const newOrg: Organization = {
      id: newId,
      name: 'New Student Committee',
      shortName: 'NEW COUNCIL',
      tagline: 'Student Executive Body',
      parentInstitution: currentOrg.parentInstitution,
      affiliationText: 'Autonomous Campus Council',
      refCodePrefix: 'ORG/2026/',
      themeColor: '#1e293b',
      accentColor: '#4f46e5',
      contactEmail: 'committee@institute.ac.in',
      contactPhone: '+91 80 2345 0000',
      website: 'www.institute.ac.in/council',
      campusAddress: 'Student Centre, Room 101',
      defaultSignatoryName: 'Student Convener',
      defaultDesignation: 'Executive Member',
      defaultSignatoryDept: 'Executive Council',
      letterheadType: 'built-in',
      margins: { top: 42, bottom: 30, left: 22, right: 22 },
    };
    onAddOrganization(newOrg);
    setSelectedOrgId(newId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              {isAuthenticated ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold">Admin Master Control Panel</h2>
              <p className="text-xs text-slate-400">
                Official Letterhead Master Backgrounds & Organization Defaults
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Barrier if Not Authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-md mx-auto w-full my-auto text-center">
            <div className="w-14 h-14 bg-indigo-950 border border-indigo-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold mb-1">Enter Admin Passcode</h3>
            <p className="text-xs text-slate-400 mb-6">
              Only authorized club administrators can upload official letterheads and modify fixed templates.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter admin passcode"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-center text-sm font-mono tracking-widest focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
                {authError && (
                  <p className="text-rose-400 text-xs mt-2 flex items-center justify-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {authError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                Access Admin Controls
              </button>
            </form>
            <p className="text-[11px] text-slate-500 mt-4">
              Regular users only generate letters; they never see template uploads.
            </p>
          </div>
        ) : (
          /* Authenticated Admin Workspace */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Tabs Bar */}
            <div className="w-full md:w-56 bg-slate-950/60 border-r border-slate-800 p-3 space-y-1">
              <div className="mb-3 px-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Target Organization
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-800 pt-2 space-y-1">
                <button
                  onClick={() => setActiveTab('letterhead')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                    activeTab === 'letterhead'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Letterhead</span>
                </button>

                <button
                  onClick={() => setActiveTab('margins')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                    activeTab === 'margins'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Margin Calibrator</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                    activeTab === 'profile'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Org Defaults</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                    activeTab === 'history'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Document Logs ({historyLogs.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('api')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                    activeTab === 'api'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>AI API & Security</span>
                </button>
              </div>

              <div className="pt-4 mt-auto">
                <button
                  onClick={handleAddNewOrg}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Club</span>
                </button>
              </div>
            </div>

            {/* Right Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
              {/* TAB 1: UPLOAD / REPLACE LETTERHEAD */}
              {activeTab === 'letterhead' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      Official Letterhead Master for {currentOrg.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Upload your official scanned or PDF-exported A4 letterhead graphic once. Every user who visits will automatically have this master letterhead locked as their background.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Letterhead State */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Current Status
                          </span>
                          <span
                            className={`text-[10.5px] px-2 py-0.5 rounded font-semibold ${
                              currentOrg.letterheadType === 'custom-image'
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            }`}
                          >
                            {currentOrg.letterheadType === 'custom-image'
                              ? 'Custom Uploaded Image'
                              : 'Built-in Vector SVG'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {currentOrg.letterheadType === 'custom-image'
                            ? 'Custom letterhead image is active and rendering on all student letters.'
                            : 'Using built-in high-resolution official vector letterhead with heraldic emblem and accreditation marks.'}
                        </p>
                      </div>

                      {currentOrg.letterheadType === 'custom-image' && (
                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Reset to official vector:</span>
                          <button
                            onClick={handleResetToBuiltin}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded border border-slate-700 flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset Built-in
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Upload Box */}
                    <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-950/40 transition">
                      <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                      <p className="text-xs font-bold text-slate-200 mb-1">
                        Upload New Official Letterhead
                      </p>
                      <p className="text-[11px] text-slate-500 mb-3">
                        PNG, JPG, SVG or High-DPI scanned A4 image
                      </p>

                      <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-md shadow-indigo-600/30">
                        <span>Select Letterhead Image</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/svg+xml"
                          onChange={handleLetterheadFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Letterhead Preview Thumbnail */}
                  {currentOrg.customLetterheadUrl && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Uploaded Image Preview
                      </p>
                      <div className="w-40 h-56 border border-slate-700 rounded overflow-hidden mx-auto bg-white shadow">
                        <img
                          src={currentOrg.customLetterheadUrl}
                          alt="Custom Letterhead"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MARGIN CALIBRATOR */}
              {activeTab === 'margins' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      Printable Area Margin Calibrator ({currentOrg.name})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Adjust top and bottom clearances so letter text never overlaps your official header logos or footer stamps.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Clearance (Header clearance) */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-300">
                          Top Header Clearance
                        </label>
                        <span className="font-mono text-xs text-indigo-400 font-bold">
                          {currentOrg.margins.top} mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={80}
                        value={currentOrg.margins.top}
                        onChange={(e) =>
                          onUpdateOrganization({
                            ...currentOrg,
                            margins: { ...currentOrg.margins, top: parseInt(e.target.value) },
                          })
                        }
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                      <p className="text-[10.5px] text-slate-500 mt-1">
                        Space reserved for official letterhead header
                      </p>
                    </div>

                    {/* Bottom Clearance (Footer clearance) */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-300">
                          Bottom Footer Clearance
                        </label>
                        <span className="font-mono text-xs text-indigo-400 font-bold">
                          {currentOrg.margins.bottom} mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={15}
                        max={60}
                        value={currentOrg.margins.bottom}
                        onChange={(e) =>
                          onUpdateOrganization({
                            ...currentOrg,
                            margins: { ...currentOrg.margins, bottom: parseInt(e.target.value) },
                          })
                        }
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                      <p className="text-[10.5px] text-slate-500 mt-1">
                        Space reserved for footer contact info and signatures
                      </p>
                    </div>

                    {/* Left Margin */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-300">Left Side Margin</label>
                        <span className="font-mono text-xs text-indigo-400 font-bold">
                          {currentOrg.margins.left} mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={40}
                        value={currentOrg.margins.left}
                        onChange={(e) =>
                          onUpdateOrganization({
                            ...currentOrg,
                            margins: { ...currentOrg.margins, left: parseInt(e.target.value) },
                          })
                        }
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    {/* Right Margin */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-300">Right Side Margin</label>
                        <span className="font-mono text-xs text-indigo-400 font-bold">
                          {currentOrg.margins.right} mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={40}
                        value={currentOrg.margins.right}
                        onChange={(e) =>
                          onUpdateOrganization({
                            ...currentOrg,
                            margins: { ...currentOrg.margins, right: parseInt(e.target.value) },
                          })
                        }
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ORGANIZATION DEFAULTS */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      Organization & Default Signatory Configuration
                    </h3>
                    <p className="text-xs text-slate-400">
                      These values are used on the letterhead and auto-populate in user letters.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={currentOrg.name}
                        onChange={(e) => onUpdateOrganization({ ...currentOrg, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Parent Institution
                      </label>
                      <input
                        type="text"
                        value={currentOrg.parentInstitution}
                        onChange={(e) =>
                          onUpdateOrganization({ ...currentOrg, parentInstitution: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Tagline / Subtitle
                      </label>
                      <input
                        type="text"
                        value={currentOrg.tagline}
                        onChange={(e) =>
                          onUpdateOrganization({ ...currentOrg, tagline: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Reference Number Prefix
                      </label>
                      <input
                        type="text"
                        value={currentOrg.refCodePrefix}
                        onChange={(e) =>
                          onUpdateOrganization({ ...currentOrg, refCodePrefix: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Default Signatory Name
                      </label>
                      <input
                        type="text"
                        value={currentOrg.defaultSignatoryName}
                        onChange={(e) =>
                          onUpdateOrganization({ ...currentOrg, defaultSignatoryName: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Default Designation
                      </label>
                      <input
                        type="text"
                        value={currentOrg.defaultDesignation}
                        onChange={(e) =>
                          onUpdateOrganization({ ...currentOrg, defaultDesignation: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Official Email
                      </label>
                      <input
                        type="text"
                        value={currentOrg.contactEmail}
                        onChange={(e) =>
                          onUpdateOrganization({ ...currentOrg, contactEmail: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Official Contact Phone
                      </label>
                      <input
                        type="text"
                        value={currentOrg.contactPhone}
                        onChange={(e) =>
                          onUpdateOrganization({ ...currentOrg, contactPhone: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DOCUMENT LOGS & HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-white">Generated Document Archive</h3>
                      <p className="text-xs text-slate-400">
                        List of recent official letters drafted and downloaded by users.
                      </p>
                    </div>
                    {historyLogs.length > 0 && (
                      <button
                        onClick={onClearHistory}
                        className="px-2.5 py-1 bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 rounded text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear All
                      </button>
                    )}
                  </div>

                  {historyLogs.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">No generated documents recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                      {historyLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                                {log.orgName}
                              </span>
                              <span className="text-xs font-mono text-slate-400">{log.refNumber}</span>
                              <span className="text-[11px] text-slate-500">• {log.date}</span>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-200 truncate">
                              {log.subject}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate">{log.recipient}</p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                onRestoreHistory(log);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Load
                            </button>
                            <button
                              onClick={() => onDeleteHistory(log.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: AI API & SECURITY */}
              {activeTab === 'api' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Gemini AI API & Passcode</h3>
                    <p className="text-xs text-slate-400">
                      Configure your Google Gemini API Key for smart online generation and change the admin password.
                    </p>
                  </div>

                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Google Gemini API Key (Optional)
                      </label>
                      <input
                        type="password"
                        placeholder="AIzaSy..."
                        value={adminSettings.geminiApiKey}
                        onChange={(e) =>
                          onUpdateAdminSettings({ ...adminSettings, geminiApiKey: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                      />
                      <p className="text-[10.5px] text-slate-500 mt-1">
                        If left blank, the app uses its built-in rule-based intelligent offline drafting engine.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-indigo-400" />
                        Change Admin Passcode
                      </label>
                      <input
                        type="text"
                        value={adminSettings.passcode}
                        onChange={(e) =>
                          onUpdateAdminSettings({ ...adminSettings, passcode: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-between items-center bg-slate-950/80 text-xs text-slate-500">
          <span>Master letterhead is stored and applied automatically to all users.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
