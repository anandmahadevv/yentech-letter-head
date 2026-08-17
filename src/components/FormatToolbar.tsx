import React from 'react';
import { LetterData } from '../types';
import {
  Type,
  AlignJustify,
  AlignLeft,
  Sparkles,
  Download,
  Printer,
  Copy,
  FileCode,
  Check,
  Minimize2,
  Table as TableIcon,
  ShieldCheck,
} from 'lucide-react';

interface FormatToolbarProps {
  letterData: LetterData;
  onUpdateLetterData: (updated: Partial<LetterData>) => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onPrint: () => void;
  onCopy: () => void;
  onAutoFit: () => void;
  onMakeMoreFormal: () => void;
  onToggleTable: () => void;
  isExportingPdf: boolean;
  copied: boolean;
}

export const FormatToolbar: React.FC<FormatToolbarProps> = ({
  letterData,
  onUpdateLetterData,
  onExportPdf,
  onExportDocx,
  onPrint,
  onCopy,
  onAutoFit,
  onMakeMoreFormal,
  onToggleTable,
  isExportingPdf,
  copied,
}) => {
  const fontFamilies: Array<LetterData['fontFamily']> = [
    'Inter',
    'Merriweather',
    'Cormorant Garamond',
    'Plus Jakarta Sans',
    'Cinzel',
  ];

  return (
    <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-2.5 shadow-xl flex flex-wrap items-center justify-between gap-3 text-slate-200">
      {/* Left: Typography & Layout Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Font Family Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          <Type className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={letterData.fontFamily}
            onChange={(e) =>
              onUpdateLetterData({ fontFamily: e.target.value as LetterData['fontFamily'] })
            }
            className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font} className="bg-slate-900">
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size Adjuster */}
        <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5 text-xs">
          <button
            type="button"
            title="Decrease Font Size"
            onClick={() =>
              onUpdateLetterData({ fontSizePt: Math.max(8.5, letterData.fontSizePt - 0.5) })
            }
            className="px-2 py-0.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded font-bold"
          >
            A-
          </button>
          <span className="px-1.5 font-mono text-[11px] text-indigo-400">
            {letterData.fontSizePt}pt
          </span>
          <button
            type="button"
            title="Increase Font Size"
            onClick={() =>
              onUpdateLetterData({ fontSizePt: Math.min(14, letterData.fontSizePt + 0.5) })
            }
            className="px-2 py-0.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded font-bold"
          >
            A+
          </button>
        </div>

        {/* Line Spacing */}
        <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onUpdateLetterData({ lineSpacing: 'compact' })}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              letterData.lineSpacing === 'compact'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Compact
          </button>
          <button
            type="button"
            onClick={() => onUpdateLetterData({ lineSpacing: 'normal' })}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              letterData.lineSpacing === 'normal'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => onUpdateLetterData({ lineSpacing: 'relaxed' })}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              letterData.lineSpacing === 'relaxed'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Spacious
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
          <button
            type="button"
            title="Justify Text (Official Style)"
            onClick={() => onUpdateLetterData({ textAlign: 'justify' })}
            className={`p-1.5 rounded transition ${
              letterData.textAlign === 'justify'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Left Align Text"
            onClick={() => onUpdateLetterData({ textAlign: 'left' })}
            className={`p-1.5 rounded transition ${
              letterData.textAlign === 'left'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: AI Quick Actions */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onMakeMoreFormal}
          title="Enhance tone to strict academic/institutional phrasing"
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Formalize Tone
        </button>

        <button
          type="button"
          onClick={onAutoFit}
          title="Adjust font size and spacing to fit exactly 1 A4 page"
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
        >
          <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
          Auto-Fit 1 Page
        </button>

        <button
          type="button"
          onClick={onToggleTable}
          title="Toggle schedule / budget breakdown table"
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
        >
          <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
          {letterData.keyDetailsTable ? 'Hide Table' : 'Add Table'}
        </button>
      </div>

      {/* Right: Export & Download Action Hub */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
          title="Copy formatted text to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
          title="Print official letter"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>

        <button
          type="button"
          onClick={onExportDocx}
          className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 text-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-blue-700/60 transition"
          title="Download editable Microsoft Word .docx"
        >
          <FileCode className="w-3.5 h-3.5 text-blue-400" />
          <span>Word (.DOCX)</span>
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExportingPdf}
          className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/25 transition disabled:opacity-50 cursor-pointer"
          title="Download high-resolution official A4 PDF"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExportingPdf ? 'Rendering PDF...' : 'Download PDF'}</span>
        </button>
      </div>
    </div>
  );
};
