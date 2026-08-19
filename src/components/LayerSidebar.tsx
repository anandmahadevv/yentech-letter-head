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
  Type,
  AlignLeft,
  AlignJustify,
  Table as TableIcon,
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
  onAutoFitPage?: () => void;
  onAiCondense?: () => void;
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
  onAutoFitPage,
}) => {
  const [isTextBoxOpen, setIsTextBoxOpen] = React.useState(true);
  const [isTypographyOpen, setIsTypographyOpen] = React.useState(true);

  const fontOptions: Array<LetterData['fontFamily']> = [
    'Plus Jakarta Sans',
    'Inter',
    'Merriweather',
    'Cormorant Garamond',
    'Cinzel',
  ];

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
      bodyHtml: undefined,
      keyDetailsTable: undefined,
      fontSizePt: 11,
      lineSpacing: 'normal',
      textAlign: 'left',
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
            className="p-1.5 hover:text-red-400 hover:bg-[#232730] rounded transition cursor-pointer text-slate-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer List / Inspector */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* TEXT BOX Layer Component */}
        <div className="border border-[#2e3442] bg-[#1a1d26] rounded-lg overflow-hidden">
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
                CONTENT
              </span>
              <span className="font-mono text-[11px] text-slate-200 truncate max-w-[110px]">
                {letterData.subject || 'Letter Content'}
              </span>
            </div>
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {isTextBoxOpen && (
            <div className="p-3 space-y-3">
              {/* HeadLine Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  HeadLine / Subject
                </label>
                <input
                  type="text"
                  value={letterData.subject}
                  onChange={(e) => onUpdateLetterData({ subject: e.target.value })}
                  placeholder="THIS IS A HEADLINE"
                  className="w-full bg-[#0d1017] border border-slate-700 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none font-mono"
                />
              </div>

              {/* Body Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Body Content
                </label>
                <textarea
                  rows={7}
                  value={letterData.bodyParagraphs.join('\n\n')}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  placeholder="Body text goes here"
                  className="w-full bg-[#0d1017] border border-slate-700 rounded p-2.5 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none leading-relaxed font-sans"
                />
              </div>

              {/* Table Toggle & Position */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <TableIcon className="w-3.5 h-3.5 text-teal-400" />
                    Key Details Table
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateLetterData({
                        tablePosition: 1,
                        keyDetailsTable: letterData.keyDetailsTable
                          ? undefined
                          : {
                              headers: ['Parameter / Item', 'Details / Schedule'],
                              rows: [
                                ['Event Date & Time', '25th August 2026 | 10:00 AM - 04:00 PM'],
                                ['Venue Requisition', 'Central Auditorium / Lab 3'],
                              ],
                            },
                      })
                    }
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                      letterData.keyDetailsTable
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 font-bold'
                        : 'bg-[#0d1017] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {letterData.keyDetailsTable ? 'ON' : 'OFF'}
                  </button>
                </div>

                {letterData.keyDetailsTable && (
                  <div className="p-2 bg-[#0d1017] rounded-lg border border-slate-800 flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-400">Position:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-teal-400 font-mono font-bold">
                        {typeof letterData.tablePosition === 'number'
                          ? letterData.tablePosition === 0
                            ? 'Top'
                            : letterData.tablePosition >= (letterData.bodyParagraphs || []).length
                            ? 'Bottom'
                            : `After Para ${letterData.tablePosition}`
                          : 'After Para 1'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateLetterData({
                              tablePosition: Math.max(0, (letterData.tablePosition ?? 1) - 1),
                            })
                          }
                          disabled={(letterData.tablePosition ?? 1) <= 0}
                          className="px-1.5 py-0.5 bg-[#1a1d26] hover:bg-[#252a36] disabled:opacity-30 rounded border border-slate-700 text-slate-300 transition cursor-pointer"
                          title="Move Table Up"
                        >
                          ⬆ Up
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateLetterData({
                              tablePosition: Math.min(
                                (letterData.bodyParagraphs || []).length,
                                (letterData.tablePosition ?? 1) + 1
                              ),
                            })
                          }
                          disabled={
                            (letterData.tablePosition ?? 1) >=
                            (letterData.bodyParagraphs || []).length
                          }
                          className="px-1.5 py-0.5 bg-[#1a1d26] hover:bg-[#252a36] disabled:opacity-30 rounded border border-slate-700 text-slate-300 transition cursor-pointer"
                          title="Move Table Down"
                        >
                          ⬇ Down
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* DOCUMENT PAGES (MULTI-PAGE) Component */}
        <div className="border border-[#2e3442] bg-[#1a1d26] rounded-lg overflow-hidden">
          <div className="px-3 py-2.5 bg-[#202531] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[9.5px] font-mono font-bold rounded">
                PAGES
              </span>
              <span className="font-mono text-[11px] text-slate-200">
                {letterData.pageCount === 2 ? '2 Pages' : '1 Page'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onUpdateLetterData({ pageCount: 1 })}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                  letterData.pageCount !== 2
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 font-bold'
                    : 'bg-[#0d1017] border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                1 Page
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateLetterData({
                    pageCount: 2,
                    page2Paragraphs: letterData.page2Paragraphs || [
                      'Continuation of letter details, extended terms, participant instructions, or signatory authorizations.',
                      'We remain at your disposal should any further information or administrative clarification be required.',
                    ],
                  })
                }
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                  letterData.pageCount === 2
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 font-bold'
                    : 'bg-[#0d1017] border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                2 Pages
              </button>
            </div>
          </div>

          {letterData.pageCount === 2 && (
            <div className="p-3 bg-[#161922] border-t border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Page 2 Header:</span>
                <span className="text-emerald-400 font-mono text-[10px]">No Banner (Continuation)</span>
              </div>
              <textarea
                rows={4}
                value={(letterData.page2Paragraphs || []).join('\n\n')}
                onChange={(e) =>
                  onUpdateLetterData({
                    page2Paragraphs: e.target.value.split('\n\n').filter((p) => p.trim() !== ''),
                  })
                }
                placeholder="Page 2 continuation paragraphs..."
                className="w-full bg-[#0d1017] border border-slate-700 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none leading-relaxed font-sans"
              />
            </div>
          )}
        </div>

        {/* TYPOGRAPHY & LAYOUT Layer Component */}
        <div className="border border-[#2e3442] bg-[#1a1d26] rounded-lg overflow-hidden">
          <div
            onClick={() => setIsTypographyOpen(!isTypographyOpen)}
            className="px-3 py-2 bg-[#202531] flex items-center justify-between cursor-pointer hover:bg-[#252b39] transition"
          >
            <div className="flex items-center gap-2">
              {isTypographyOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[9.5px] font-mono font-bold rounded">
                FORMATTING
              </span>
              <span className="font-mono text-[11px] text-slate-200">
                Font & Spacing
              </span>
            </div>
            <Type className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {isTypographyOpen && (
            <div className="p-3 space-y-3">
              {/* Font Family Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Font Family
                </label>
                <select
                  value={letterData.fontFamily}
                  onChange={(e) =>
                    onUpdateLetterData({ fontFamily: e.target.value as LetterData['fontFamily'] })
                  }
                  className="w-full bg-[#0d1017] border border-slate-700 rounded p-1.5 text-xs text-white focus:border-teal-500 focus:outline-none cursor-pointer font-sans"
                >
                  {fontOptions.map((font) => (
                    <option key={font} value={font} className="bg-slate-900">
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Alignment & Line Spacing */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Align
                  </label>
                  <div className="flex items-center bg-[#0d1017] rounded border border-slate-700 p-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateLetterData({ textAlign: 'left' })}
                      className={`flex-1 py-1 flex justify-center rounded transition ${
                        letterData.textAlign === 'left' || !letterData.textAlign
                          ? 'bg-teal-500/20 text-teal-300 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateLetterData({ textAlign: 'justify' })}
                      className={`flex-1 py-1 flex justify-center rounded transition ${
                        letterData.textAlign === 'justify'
                          ? 'bg-teal-500/20 text-teal-300 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Spacing
                  </label>
                  <select
                    value={letterData.lineSpacing || 'normal'}
                    onChange={(e) =>
                      onUpdateLetterData({
                        lineSpacing: e.target.value as LetterData['lineSpacing'],
                      })
                    }
                    className="w-full bg-[#0d1017] border border-slate-700 rounded p-1.5 text-xs text-white focus:border-teal-500 focus:outline-none cursor-pointer"
                  >
                    <option value="compact">Compact</option>
                    <option value="normal">Normal</option>
                    <option value="relaxed">Spacious</option>
                  </select>
                </div>
              </div>

              {/* Text Size Presets */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold">
                  <span>Font Size</span>
                  <span className="text-teal-400 font-bold">{letterData.fontSizePt || 11} pt</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[11.5, 10.5, 9.5, 8.5].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onUpdateLetterData({ fontSizePt: size })}
                      className={`py-1 rounded text-[10.5px] font-mono border transition cursor-pointer ${
                        letterData.fontSizePt === size
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold'
                          : 'bg-[#0d1017] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-Click Auto Fit Page */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onAutoFitPage}
                  className="w-full py-1.5 bg-[#0d1017] hover:bg-teal-950/40 border border-teal-500/40 text-teal-300 hover:text-teal-200 font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>⚡ Smart Auto-Fit 1 Page</span>
                </button>
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
