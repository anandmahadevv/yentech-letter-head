import React from 'react';
import { LetterData, Organization } from '../types';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Trash2,
  FileDown,
  Grid,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface LayerSidebarProps {
  letterData: LetterData;
  activeOrg: Organization;
  onUpdateLetterData: (updated: Partial<LetterData>) => void;
  onUpdateOrg: (updated: Organization) => void;
  onGenerate: (params: any) => void;
  isGenerating: boolean;
  showGrid: boolean;
  onToggleGrid: () => void;
  onExportPdf?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const LayerSidebar: React.FC<LayerSidebarProps> = ({
  letterData,
  activeOrg,
  onUpdateLetterData,
  onExportPdf,
  onToggleFullscreen,
  isFullscreen = false,
  showGrid,
  onToggleGrid,
}) => {
  const [isTextBoxOpen, setIsTextBoxOpen] = React.useState(true);

  const handleBodyChange = (value: string) => {
    const paragraphs = value.split('\n\n').filter((p) => p.trim() !== '');
    onUpdateLetterData({
      bodyParagraphs: paragraphs.length > 0 ? paragraphs : [value],
    });
  };

  const handleReset = () => {
    onUpdateLetterData({
      subject: 'This is a headline',
      bodyParagraphs: ['Body text goes here'],
    });
  };

  return (
    <aside className="no-print w-80 bg-[#161922] border-r border-[#232730] text-slate-300 flex flex-col h-full select-none text-xs">
      {/* Document Header */}
      <div className="p-3.5 border-b border-[#232730] flex items-center justify-between">
        <div>
          <h2 className="font-mono text-xs font-bold text-white tracking-tight">
            Official Letterhead
          </h2>
          <span className="text-[10px] text-teal-400 font-mono">
            {activeOrg.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReset}
            title="Reset to blank template"
            className="p-1.5 hover:text-red-400 hover:bg-[#232730] rounded transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer List / Inspector */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* TEXT BOX Layer Component */}
        <div className="border border-[#2e3442] bg-[#1a1d26] rounded-lg overflow-hidden">
          {/* Layer Header */}
          <div
            onClick={() => setIsTextBoxOpen(!isTextBoxOpen)}
            className="px-3 py-2 bg-[#202531] flex items-center justify-between cursor-pointer hover:bg-[#252b39] transition"
          >
            <div className="flex items-center gap-2">
              {isTextBoxOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="px-1.5 py-0.5 bg-teal-500/20 text-teal-300 text-[9.5px] font-mono font-bold rounded">
                TEXT BOX
              </span>
              <span className="font-mono text-[11px] text-slate-200 truncate max-w-[110px]">
                {letterData.subject || 'Letter Content'}
              </span>
            </div>
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Layer Properties */}
          {isTextBoxOpen && (
            <div className="p-3 space-y-3">
              {/* HeadLine Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  HeadLine
                </label>
                <input
                  type="text"
                  value={letterData.subject}
                  onChange={(e) => onUpdateLetterData({ subject: e.target.value })}
                  placeholder="THIS IS A HEADLINE"
                  className="w-full bg-[#0d1017] border border-slate-700 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              {/* Body Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Body
                </label>
                <textarea
                  rows={8}
                  value={letterData.bodyParagraphs.join('\n\n')}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  placeholder="Body text goes here"
                  className="w-full bg-[#0d1017] border border-slate-700 rounded p-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none leading-relaxed font-sans"
                />
              </div>

              {/* Text Size Selectors */}
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Text Size:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateLetterData({ fontSizePt: 11 })}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition cursor-pointer ${
                      letterData.fontSizePt === 11 || !letterData.fontSizePt
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold'
                        : 'bg-[#0d1017] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateLetterData({ fontSizePt: 10.5 })}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition cursor-pointer ${
                      letterData.fontSizePt === 10.5
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold'
                        : 'bg-[#0d1017] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    10.5
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateLetterData({ fontSizePt: 9.5 })}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition cursor-pointer ${
                      letterData.fontSizePt === 9.5
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold'
                        : 'bg-[#0d1017] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    9.5
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateLetterData({ fontSizePt: 8.5 })}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition cursor-pointer ${
                      letterData.fontSizePt === 8.5
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold'
                        : 'bg-[#0d1017] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    8.5
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Preview & Download Actions */}
        <div className="pt-2 space-y-2">
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="w-full py-2 bg-[#1e222b] hover:bg-[#282d38] border border-[#2e3442] hover:border-teal-500/50 text-slate-200 hover:text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Fullscreen Preview</span>
                </>
              )}
            </button>
          )}

          {onExportPdf && (
            <button
              type="button"
              onClick={onExportPdf}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Controls: Background Grid Toggle */}
      <div className="p-3 border-t border-[#232730] flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <Grid className="w-3.5 h-3.5 text-slate-500" />
          <span>Background Grid</span>
        </div>
        <button
          type="button"
          onClick={onToggleGrid}
          className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition ${
            showGrid
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
              : 'bg-[#0d1017] text-slate-500 border border-slate-800'
          }`}
        >
          {showGrid ? 'ON' : 'OFF'}
        </button>
      </div>
    </aside>
  );
};
