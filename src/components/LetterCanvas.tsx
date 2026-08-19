import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { LetterData, Organization } from '../types';
import { LetterheadBackground } from './LetterheadBackground';
import { FloatingFormatToolbar } from './FloatingFormatToolbar';
import { KeyDetailsTable } from './KeyDetailsTable';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Minimize2,
  Table as TableIcon,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';

interface LetterCanvasProps {
  letterData: LetterData;
  org: Organization;
  onUpdateLetterData: (updated: Partial<LetterData>) => void;
  onUpdateOrg: (updated: Organization) => void;
  onAutoFitPage?: () => void;
  onMakeMoreFormal?: () => void;
  onAiCondense?: () => void;
  showGrid?: boolean;
}

/**
 * Intelligent Document Fitting Engine
 */
function calculateOptimalFontSize(
  textLength: number,
  hasTable: boolean
): { fontSizePt: number; lineHeight: number } {
  const effectiveLength = textLength + (hasTable ? 350 : 0);

  if (effectiveLength > 2800) {
    return { fontSizePt: 8.25, lineHeight: 1.35 };
  } else if (effectiveLength > 2200) {
    return { fontSizePt: 8.75, lineHeight: 1.42 };
  } else if (effectiveLength > 1600) {
    return { fontSizePt: 9.25, lineHeight: 1.48 };
  } else if (effectiveLength > 1100) {
    return { fontSizePt: 10.0, lineHeight: 1.55 };
  } else if (effectiveLength > 600) {
    return { fontSizePt: 10.75, lineHeight: 1.65 };
  } else if (effectiveLength > 250) {
    return { fontSizePt: 11.25, lineHeight: 1.72 };
  } else {
    return { fontSizePt: 11.75, lineHeight: 1.80 };
  }
}

export const LetterCanvas: React.FC<LetterCanvasProps> = ({
  letterData,
  org,
  onUpdateLetterData,
  onAutoFitPage,
  onAiCondense,
  showGrid = true,
}) => {
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const topBodyRef = useRef<HTMLDivElement>(null);
  const bottomBodyRef = useRef<HTMLDivElement>(null);
  const singleBodyRef = useRef<HTMLDivElement>(null);
  const page2BodyRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);

  const isMultiPage = letterData.pageCount === 2;

  // Overflow state tracking
  const [overflowData, setOverflowData] = useState<{
    isOverflowing: boolean;
    fillPercentage: number;
    overflowPixels: number;
    availableHeight: number;
  }>({
    isOverflowing: false,
    fillPercentage: 85,
    overflowPixels: 0,
    availableHeight: 880,
  });

  // Calculate overflow metrics in real time
  const checkOverflow = useCallback(() => {
    if (!contentAreaRef.current) return;
    const el = contentAreaRef.current;
    const clientH = el.clientHeight;
    const scrollH = el.scrollHeight;
    const diff = scrollH - clientH;
    const fillPct = clientH > 0 ? Math.round((scrollH / clientH) * 100) : 100;

    setOverflowData({
      isOverflowing: diff > 6,
      fillPercentage: fillPct,
      overflowPixels: Math.max(0, diff),
      availableHeight: clientH,
    });
  }, []);

  useEffect(() => {
    checkOverflow();
    const timeout = setTimeout(checkOverflow, 80);
    return () => clearTimeout(timeout);
  }, [
    letterData.subject,
    letterData.bodyParagraphs,
    letterData.bodyHtml,
    letterData.fontSizePt,
    letterData.lineSpacing,
    letterData.keyDetailsTable,
    letterData.tablePosition,
    letterData.pageCount,
    checkOverflow,
  ]);

  useEffect(() => {
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [checkOverflow]);

  const paragraphs = useMemo(() => {
    const raw = letterData.bodyParagraphs || [];
    return raw.length > 0 ? raw : ['Body text goes here'];
  }, [letterData.bodyParagraphs]);

  const page2Paragraphs = useMemo(() => {
    const raw = letterData.page2Paragraphs || [];
    return raw.length > 0 ? raw : ['Continuation content on Page 2...'];
  }, [letterData.page2Paragraphs]);

  // Default table position: 1
  const tablePos = useMemo(() => {
    if (typeof letterData.tablePosition === 'number') {
      return Math.max(0, Math.min(letterData.tablePosition, paragraphs.length));
    }
    return paragraphs.length > 1 ? 1 : 1;
  }, [letterData.tablePosition, paragraphs.length]);

  const topParagraphs = useMemo(() => paragraphs.slice(0, tablePos), [paragraphs, tablePos]);
  const bottomParagraphs = useMemo(() => paragraphs.slice(tablePos), [paragraphs, tablePos]);

  // Synchronize headline text content
  useEffect(() => {
    if (headlineRef.current && document.activeElement !== headlineRef.current) {
      if (headlineRef.current.innerText !== (letterData.subject || '')) {
        headlineRef.current.innerText = letterData.subject || '';
      }
    }
  }, [letterData.subject]);

  // Synchronize body contents when changed externally
  useEffect(() => {
    if (letterData.keyDetailsTable) {
      if (topBodyRef.current && document.activeElement !== topBodyRef.current) {
        const text = topParagraphs.join('\n\n');
        if (topBodyRef.current.innerText !== text) {
          topBodyRef.current.innerText = text;
        }
      }
      if (bottomBodyRef.current && document.activeElement !== bottomBodyRef.current) {
        const text = bottomParagraphs.join('\n\n');
        if (bottomBodyRef.current.innerText !== text) {
          bottomBodyRef.current.innerText = text;
        }
      }
    } else {
      if (singleBodyRef.current && document.activeElement !== singleBodyRef.current) {
        const text = paragraphs.join('\n\n');
        if (singleBodyRef.current.innerText !== text) {
          singleBodyRef.current.innerText = text;
        }
      }
    }

    if (page2BodyRef.current && document.activeElement !== page2BodyRef.current) {
      const text = page2Paragraphs.join('\n\n');
      if (page2BodyRef.current.innerText !== text) {
        page2BodyRef.current.innerText = text;
      }
    }
  }, [letterData.keyDetailsTable, topParagraphs, bottomParagraphs, paragraphs, page2Paragraphs]);

  // Headline Scale
  const headlineScale = useMemo(() => {
    const headlineLength = (letterData.subject || '').length;
    if (headlineLength > 160) {
      return { className: 'text-xs md:text-sm', maxHeight: '2.5rem' };
    } else if (headlineLength > 100) {
      return { className: 'text-sm md:text-base', maxHeight: '2.85rem' };
    } else if (headlineLength > 60) {
      return { className: 'text-base md:text-lg', maxHeight: '3.2rem' };
    } else if (headlineLength > 35) {
      return { className: 'text-lg md:text-xl', maxHeight: '3.6rem' };
    } else {
      return { className: 'text-2xl md:text-3xl', maxHeight: '4.2rem' };
    }
  }, [letterData.subject]);

  // Body Auto-Fit Scale
  const bodyStyle = useMemo(() => {
    if (letterData.fontSizePt && letterData.fontSizePt !== 11) {
      let lh = 1.65;
      if (letterData.lineSpacing === 'compact') lh = 1.42;
      else if (letterData.lineSpacing === 'relaxed') lh = 1.85;
      else lh = letterData.fontSizePt >= 11 ? 1.68 : letterData.fontSizePt >= 10 ? 1.58 : 1.48;

      return {
        fontSizePt: letterData.fontSizePt,
        lineHeight: lh,
      };
    }

    const fullText = paragraphs.join('\n\n');
    return calculateOptimalFontSize(fullText.length, !!letterData.keyDetailsTable);
  }, [paragraphs, letterData.fontSizePt, letterData.lineSpacing, letterData.keyDetailsTable]);

  const getFontFamilyStyle = () => {
    switch (letterData.fontFamily) {
      case 'Merriweather':
        return "'Merriweather', Georgia, serif";
      case 'Cormorant Garamond':
        return "'Cormorant Garamond', Garamond, serif";
      case 'Cinzel':
        return "'Cinzel', serif";
      case 'Plus Jakarta Sans':
        return "'Plus Jakarta Sans', sans-serif";
      default:
        return "'Poppins', 'Inter', sans-serif";
    }
  };

  // Keyboard Shortcuts Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        document.execCommand('bold', false);
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        document.execCommand('italic', false);
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        document.execCommand('underline', false);
      }
    }
  };

  // Safe Paste Handler
  const handleBodyPaste = (e: React.ClipboardEvent<HTMLDivElement>, updateCallback: () => void) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    selection.deleteFromDocument();
    const range = selection.getRangeAt(0);
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    updateCallback();
  };

  const handleSingleBodyChange = () => {
    if (singleBodyRef.current) {
      const text = singleBodyRef.current.innerText || '';
      const parsed = text.split('\n\n').filter((p) => p.trim() !== '');
      onUpdateLetterData({
        bodyParagraphs: parsed.length > 0 ? parsed : [text],
      });
      setTimeout(checkOverflow, 40);
    }
  };

  const handleSplitBodyChange = () => {
    const topText = topBodyRef.current?.innerText || '';
    const bottomText = bottomBodyRef.current?.innerText || '';

    const topList = topText ? topText.split('\n\n').filter((p) => p.trim() !== '') : [];
    const bottomList = bottomText ? bottomText.split('\n\n').filter((p) => p.trim() !== '') : [];

    const merged = [...topList, ...bottomList];
    onUpdateLetterData({
      bodyParagraphs: merged.length > 0 ? merged : [''],
      tablePosition: topList.length,
    });
    setTimeout(checkOverflow, 40);
  };

  const handlePage2Change = () => {
    if (page2BodyRef.current) {
      const text = page2BodyRef.current.innerText || '';
      const parsed = text.split('\n\n').filter((p) => p.trim() !== '');
      onUpdateLetterData({
        page2Paragraphs: parsed.length > 0 ? parsed : [text],
      });
    }
  };

  const handleMoveTableUp = () => {
    const newPos = Math.max(0, tablePos - 1);
    onUpdateLetterData({ tablePosition: newPos });
  };

  const handleMoveTableDown = () => {
    const newPos = Math.min(paragraphs.length, tablePos + 1);
    onUpdateLetterData({ tablePosition: newPos });
  };

  const handleSplitAndCenter = () => {
    const fullText = paragraphs.join('\n\n');
    if (!fullText.trim()) return;

    const sentences = fullText.split(/(?<=[.?!])\s+/);
    if (sentences.length > 1) {
      const mid = Math.ceil(sentences.length / 2);
      const top = sentences.slice(0, mid).join(' ');
      const bottom = sentences.slice(mid).join(' ');
      onUpdateLetterData({
        bodyParagraphs: [top, bottom],
        tablePosition: 1,
      });
    } else {
      const half = Math.floor(fullText.length / 2);
      const top = fullText.slice(0, half).trim();
      const bottom = fullText.slice(half).trim();
      onUpdateLetterData({
        bodyParagraphs: [top, bottom],
        tablePosition: 1,
      });
    }
    setTimeout(checkOverflow, 60);
  };

  const handleInsertTableAtCursor = () => {
    const selection = window.getSelection();
    let beforeText = '';
    let afterText = '';

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const activeEl = document.activeElement as HTMLElement | null;

      if (activeEl && (activeEl === singleBodyRef.current || activeEl === topBodyRef.current || activeEl === bottomBodyRef.current)) {
        const fullText = activeEl.innerText || '';
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(activeEl);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        const caretOffset = preCaretRange.toString().length;

        beforeText = fullText.substring(0, caretOffset).trim();
        afterText = fullText.substring(caretOffset).trim();
      }
    }

    if (!beforeText && !afterText) {
      const fullText = paragraphs.join('\n\n');
      const half = Math.floor(fullText.length / 2);
      beforeText = fullText.slice(0, half).trim() || 'Introductory details...';
      afterText = fullText.slice(half).trim() || 'Concluding remarks...';
    }

    onUpdateLetterData({
      keyDetailsTable: letterData.keyDetailsTable || {
        headers: ['Parameter / Item', 'Details / Schedule'],
        rows: [
          ['Event Date & Time', '25th August 2026 | 10:00 AM - 04:00 PM'],
          ['Venue Requisition', 'Central Auditorium / Lab 3'],
        ],
      },
      bodyParagraphs: [beforeText || 'Introductory remarks', afterText || 'Concluding remarks'],
      tablePosition: 1,
    });
    setTimeout(checkOverflow, 80);
  };

  // Add Page 2 handler
  const handleAddPage2 = () => {
    onUpdateLetterData({
      pageCount: 2,
      page2Paragraphs: letterData.page2Paragraphs || [
        'Continuation of letter details, extended terms, participant instructions, or signatory authorizations.',
        'We remain at your disposal should any further information or administrative clarification be required.',
      ],
    });
  };

  // Remove Page 2 handler
  const handleRemovePage2 = () => {
    onUpdateLetterData({
      pageCount: 1,
    });
  };

  const positionLabel = useMemo(() => {
    if (tablePos === 0) return 'Position: Top of Body';
    if (tablePos >= paragraphs.length) return 'Position: Bottom of Body';
    return `Position: In Between (After Para ${tablePos})`;
  }, [tablePos, paragraphs.length]);

  const handleSmartAutoFit = () => {
    if (onAutoFitPage) {
      onAutoFitPage();
    } else {
      const fullText = paragraphs.join('\n\n');
      const optimal = calculateOptimalFontSize(fullText.length, !!letterData.keyDetailsTable);
      onUpdateLetterData({
        fontSizePt: Math.max(8.5, optimal.fontSizePt - 0.75),
        lineSpacing: 'compact',
      });
    }
    setTimeout(checkOverflow, 120);
  };

  return (
    <div className="relative flex flex-col items-center w-full space-y-8">
      {/* Floating Selection Rich-Text Formatting Bar */}
      <FloatingFormatToolbar
        containerRef={page1Ref}
        onContentChange={letterData.keyDetailsTable ? handleSplitBodyChange : handleSingleBodyChange}
        onInsertTableHere={handleInsertTableAtCursor}
      />

      {/* ========================================================================= */}
      {/* PAGE 1: PRIMARY OFFICIAL LETTERHEAD (WITH HEADER, LOGO & HEADLINE)        */}
      {/* ========================================================================= */}
      <div className="flex flex-col items-center w-full">
        {/* Page 1 Header Tab */}
        {isMultiPage && (
          <div className="no-print w-[210mm] flex items-center justify-between pb-1 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-teal-400 font-bold">
              <FileText className="w-3.5 h-3.5" />
              Page 1 of 2 (Official Letterhead)
            </span>
          </div>
        )}

        <div
          id="letter-a4-canvas-page-1"
          ref={page1Ref}
          className="letter-a4-page relative bg-white text-slate-900 shadow-2xl a4-page-shadow rounded-none overflow-hidden"
          style={{
            width: '210mm',
            height: '297mm',
            minHeight: '297mm',
            maxHeight: '297mm',
            fontFamily: getFontFamilyStyle(),
          }}
        >
          {/* Layer 1: Master Official Letterhead Header & Footer */}
          <LetterheadBackground
            org={org}
            showGrid={showGrid}
            isContinuationPage={false}
            pageNumber={1}
            totalPages={isMultiPage ? 2 : 1}
            refNumber={letterData.refNumber}
          />

          {/* Layer 2: Safe Content Area */}
          <div
            ref={contentAreaRef}
            className="relative z-10 flex flex-col justify-start h-full overflow-hidden"
            style={{
              paddingTop: `${org.margins.top}mm`,
              paddingBottom: `${org.margins.bottom + 4}mm`,
              paddingLeft: `${org.margins.left}mm`,
              paddingRight: `${org.margins.right}mm`,
              height: '100%',
              maxHeight: '100%',
            }}
          >
            {/* Main Content Flow */}
            <div className="flex-1 flex flex-col justify-start space-y-2.5 pt-2 h-full overflow-hidden relative">
              {/* ===================== SECTION 1: HEADLINE (PAGE 1 ONLY) ===================== */}
              <div
                className="border-b border-slate-200/80 pb-1.5 flex-shrink-0 overflow-hidden"
                style={{
                  maxHeight: headlineScale.maxHeight,
                }}
              >
                <h1
                  ref={headlineRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => onUpdateLetterData({ subject: e.currentTarget.innerText || '' })}
                  onBlur={(e) => onUpdateLetterData({ subject: e.currentTarget.innerText || '' })}
                  className={`font-mono font-black ${headlineScale.className} text-slate-950 uppercase tracking-tight hover:bg-slate-50 focus:bg-teal-50/70 focus:outline-none px-1 rounded transition-all leading-tight cursor-text`}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.25',
                  }}
                >
                  {letterData.subject || 'This is a headline'}
                </h1>
              </div>

              {/* ===================== SECTION 2: INTERLEAVED BODY & TABLE ===================== */}
              {letterData.keyDetailsTable ? (
                <div className="flex-1 flex flex-col justify-start space-y-2 overflow-hidden">
                  {/* Top Paragraphs */}
                  {tablePos > 0 && (
                    <div
                      ref={topBodyRef}
                      contentEditable
                      suppressContentEditableWarning
                      onKeyDown={handleKeyDown}
                      onPaste={(e) => handleBodyPaste(e, handleSplitBodyChange)}
                      onInput={handleSplitBodyChange}
                      onBlur={handleSplitBodyChange}
                      className="text-slate-800 font-normal hover:bg-slate-50/50 focus:bg-teal-50/40 focus:outline-none p-1 rounded transition-all whitespace-pre-wrap cursor-text"
                      style={{
                        textAlign: letterData.textAlign || 'left',
                        fontSize: `${bodyStyle.fontSizePt}pt`,
                        lineHeight: bodyStyle.lineHeight,
                      }}
                    >
                      {topParagraphs.join('\n\n') || 'Introductory paragraphs go here'}
                    </div>
                  )}

                  {/* Movable Key Details Table */}
                  <div className="flex-shrink-0">
                    <KeyDetailsTable
                      tableData={letterData.keyDetailsTable}
                      onUpdateTable={(updatedTable) =>
                        onUpdateLetterData({ keyDetailsTable: updatedTable })
                      }
                      accentColor="#179091"
                      onMoveUp={handleMoveTableUp}
                      onMoveDown={handleMoveTableDown}
                      canMoveUp={tablePos > 0}
                      canMoveDown={tablePos < paragraphs.length}
                      positionLabel={positionLabel}
                      onSplitAndCenter={handleSplitAndCenter}
                      canSplitAndCenter={paragraphs.length <= 1}
                    />
                  </div>

                  {/* Bottom Paragraphs */}
                  {tablePos < paragraphs.length && (
                    <div
                      ref={bottomBodyRef}
                      contentEditable
                      suppressContentEditableWarning
                      onKeyDown={handleKeyDown}
                      onPaste={(e) => handleBodyPaste(e, handleSplitBodyChange)}
                      onInput={handleSplitBodyChange}
                      onBlur={handleSplitBodyChange}
                      className="flex-1 text-slate-800 font-normal hover:bg-slate-50/50 focus:bg-teal-50/40 focus:outline-none p-1 rounded transition-all whitespace-pre-wrap cursor-text"
                      style={{
                        textAlign: letterData.textAlign || 'left',
                        fontSize: `${bodyStyle.fontSizePt}pt`,
                        lineHeight: bodyStyle.lineHeight,
                      }}
                    >
                      {bottomParagraphs.join('\n\n') || 'Concluding paragraphs go here'}
                    </div>
                  )}
                </div>
              ) : (
                /* Single Seamless Body Paragraph Block */
                <div
                  ref={singleBodyRef}
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                  onPaste={(e) => handleBodyPaste(e, handleSingleBodyChange)}
                  onInput={handleSingleBodyChange}
                  onBlur={handleSingleBodyChange}
                  className="flex-1 text-slate-800 font-normal hover:bg-slate-50/50 focus:bg-teal-50/40 focus:outline-none p-1 rounded transition-all whitespace-pre-wrap cursor-text"
                  style={{
                    textAlign: letterData.textAlign || 'left',
                    fontSize: `${bodyStyle.fontSizePt}pt`,
                    lineHeight: bodyStyle.lineHeight,
                  }}
                >
                  {paragraphs.join('\n\n') || 'Body text goes here'}
                </div>
              )}

              {/* ===================== REAL-TIME OVERFLOW CUTOFF LINE (PAGE 1) ===================== */}
              {!isMultiPage && overflowData.isOverflowing && (
                <div className="no-print absolute left-0 right-0 bottom-0 pointer-events-none z-30 flex flex-col items-center">
                  <div className="w-full border-b-2 border-dashed border-red-500/80" />
                  <div className="bg-red-600 text-white text-[9.5px] font-mono px-2 py-0.5 rounded-b shadow-md flex items-center gap-1 uppercase font-bold tracking-wide">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>✂️ Page 1 Overflow (~{Math.ceil(overflowData.overflowPixels / 22)} lines hidden or add Page 2)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: CONTINUATION SHEET (CLEAN HEADER, NO BIG LOGO / NO HEADLINE)     */}
      {/* ========================================================================= */}
      {isMultiPage && (
        <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Page 2 Header Tab Bar */}
          <div className="no-print w-[210mm] flex items-center justify-between pb-1 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <FileText className="w-3.5 h-3.5" />
              Page 2: Continuation Sheet (No Big Header/Headline)
            </span>
            <button
              type="button"
              onClick={handleRemovePage2}
              className="px-2 py-0.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded text-[10px] flex items-center gap-1 cursor-pointer transition"
              title="Delete Page 2 and return to single page document"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove Page 2</span>
            </button>
          </div>

          <div
            id="letter-a4-canvas-page-2"
            ref={page2Ref}
            className="letter-a4-page relative bg-white text-slate-900 shadow-2xl a4-page-shadow rounded-none overflow-hidden"
            style={{
              width: '210mm',
              height: '297mm',
              minHeight: '297mm',
              maxHeight: '297mm',
              fontFamily: getFontFamilyStyle(),
            }}
          >
            {/* Continuation Sheet Background: Minimal top header with page info */}
            <LetterheadBackground
              org={org}
              showGrid={showGrid}
              isContinuationPage={true}
              pageNumber={2}
              totalPages={2}
              refNumber={letterData.refNumber}
            />

            {/* Page 2 Content Area (Full Height, No Headline Banner) */}
            <div
              className="relative z-10 flex flex-col justify-start h-full overflow-hidden"
              style={{
                paddingTop: '20mm', // Sleek continuation sheet top padding
                paddingBottom: `${org.margins.bottom + 4}mm`,
                paddingLeft: `${org.margins.left}mm`,
                paddingRight: `${org.margins.right}mm`,
                height: '100%',
                maxHeight: '100%',
              }}
            >
              <div
                ref={page2BodyRef}
                contentEditable
                suppressContentEditableWarning
                onKeyDown={handleKeyDown}
                onPaste={(e) => handleBodyPaste(e, handlePage2Change)}
                onInput={handlePage2Change}
                onBlur={handlePage2Change}
                className="flex-1 text-slate-800 font-normal hover:bg-slate-50/50 focus:bg-teal-50/40 focus:outline-none p-1 rounded transition-all whitespace-pre-wrap cursor-text"
                style={{
                  textAlign: letterData.textAlign || 'left',
                  fontSize: `${bodyStyle.fontSizePt}pt`,
                  lineHeight: bodyStyle.lineHeight,
                }}
              >
                {page2Paragraphs.join('\n\n')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REAL-TIME A4 PAGE OVERFLOW GUARD & MULTI-PAGE CONTROLLER BAR              */}
      {/* ========================================================================= */}
      <div className="no-print mt-3 w-full max-w-[210mm] flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-sans transition-all duration-200 shadow-lg border backdrop-blur-md z-20 select-none bg-[#161922] border-[#2e3442]">
        <div className="flex items-center gap-2">
          {isMultiPage ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span className="font-mono text-xs text-teal-300 font-bold">
                Multi-Page Mode (2 Pages Active)
              </span>
            </div>
          ) : overflowData.isOverflowing ? (
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="font-mono text-xs font-bold text-red-400">
                ⚠️ Page 1 Overflow (+{overflowData.fillPercentage - 100}%)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs text-emerald-300 font-medium">
                Single A4 Fit ({overflowData.fillPercentage}% Fill)
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Add / Remove Page 2 Button */}
          {!isMultiPage ? (
            <button
              type="button"
              onClick={handleAddPage2}
              className="px-3 py-1 bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Add a 2nd continuation page without the main header/headline"
            >
              <Plus className="w-3.5 h-3.5 text-teal-400" />
              <span>+ Add Page 2 (Continuation)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRemovePage2}
              className="px-2.5 py-1 bg-[#1e222b] hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-700 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
              <span>1 Page Only</span>
            </button>
          )}

          {!isMultiPage && overflowData.isOverflowing && (
            <button
              type="button"
              onClick={handleSmartAutoFit}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Automatically reduce font size and line spacing to fit 1 page"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>⚡ Fit 1 Page</span>
            </button>
          )}

          {!letterData.keyDetailsTable ? (
            <button
              type="button"
              onClick={handleInsertTableAtCursor}
              className="px-2.5 py-1 bg-[#1e222b] hover:bg-[#282d38] text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <TableIcon className="w-3 h-3 text-teal-400" />
              <span>+ Add Table</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onUpdateLetterData({ keyDetailsTable: undefined })}
              className="px-2.5 py-1 bg-[#1e222b] hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <TableIcon className="w-3 h-3 text-red-400" />
              <span>Hide Table</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
