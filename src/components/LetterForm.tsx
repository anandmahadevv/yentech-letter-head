import React, { useState } from 'react';
import { Organization, RecipientInfo } from '../types';
import { LETTER_PRESETS } from '../data/letterTemplates';
import {
  Sparkles,
  Building,
  Layers,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface LetterFormProps {
  organizations: Organization[];
  activeOrg: Organization;
  onSelectOrg: (org: Organization) => void;
  onGenerate: (params: {
    org: Organization;
    letterTypeId: string;
    letterTypeName: string;
    recipient: RecipientInfo;
    subject: string;
    context: string;
    dateStr: string;
    signatoryName: string;
    signatoryDesignation: string;
  }) => void;
  isGenerating: boolean;
}

export const LetterForm: React.FC<LetterFormProps> = ({
  organizations,
  activeOrg,
  onSelectOrg,
  onGenerate,
  isGenerating,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(LETTER_PRESETS[0].id);
  const [recipientTitle, setRecipientTitle] = useState<string>(LETTER_PRESETS[0].defaultRecipientTitle);
  const [recipientDept, setRecipientDept] = useState<string>(LETTER_PRESETS[0].defaultRecipientDept);
  const [subject, setSubject] = useState<string>(LETTER_PRESETS[0].defaultSubject);
  const [context, setContext] = useState<string>(LETTER_PRESETS[0].sampleContextPrompt);

  const handlePresetChange = (presetId: string) => {
    const preset = LETTER_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPresetId(presetId);
      setSubject(preset.defaultSubject);
      setRecipientTitle(preset.defaultRecipientTitle);
      setRecipientDept(preset.defaultRecipientDept);
      setContext(preset.sampleContextPrompt);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = LETTER_PRESETS.find((p) => p.id === selectedPresetId);
    onGenerate({
      org: activeOrg,
      letterTypeId: selectedPresetId,
      letterTypeName: preset ? preset.name : 'Official Letter',
      recipient: {
        title: recipientTitle,
        department: recipientDept,
        institution: activeOrg.parentInstitution,
        location: 'Academic Campus',
      },
      subject: subject || (preset ? preset.defaultSubject : 'Official Representation'),
      context: context,
      dateStr: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      signatoryName: activeOrg.defaultSignatoryName,
      signatoryDesignation: activeOrg.defaultDesignation,
    });
  };

  const currentPreset = LETTER_PRESETS.find((p) => p.id === selectedPresetId) || LETTER_PRESETS[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-sm flex flex-col text-slate-200">
      {/* Organization Switcher */}
      <div className="mb-4">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Select Official Letterhead
        </label>
        <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
          {organizations.map((org) => {
            const isSelected = org.id === activeOrg.id;
            return (
              <button
                key={org.id}
                type="button"
                onClick={() => onSelectOrg(org)}
                className={`py-2 px-2.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-200" />}
                <span className="truncate">{org.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Letter Type */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Letter Purpose / Type
          </label>
          <div className="relative">
            <select
              value={selectedPresetId}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none transition appearance-none cursor-pointer"
            >
              {LETTER_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-slate-900">
                  {preset.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Recipient Title */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Building className="w-3 h-3 text-indigo-400" />
            To / Recipient
          </label>
          <input
            type="text"
            placeholder="e.g. The Head of Department"
            value={recipientTitle}
            onChange={(e) => setRecipientTitle(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
          />
        </div>

        {/* Context / Prompt */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              What is this letter about?
            </span>
            <span className="text-[10px] text-slate-500 font-normal">Context</span>
          </label>
          <textarea
            rows={4}
            placeholder="Enter key details: what permission is needed, date, student count, venue..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none leading-relaxed font-mono"
          />

          {/* Quick chip helpers */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {currentPreset.quickTags.map((tag, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setContext((prev) => (prev ? `${prev} (includes ${tag})` : tag))}
                className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/40"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Drafting Letter...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Generate Letter On Canvas</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
