import React, { useRef, useEffect, useMemo } from 'react';
import { LetterData, Organization } from '../types';
import { LetterheadBackground } from './LetterheadBackground';

interface LetterCanvasProps {
  letterData: LetterData;
  org: Organization;
  onUpdateLetterData: (updated: Partial<LetterData>) => void;
  onUpdateOrg: (updated: Organization) => void;
  onAutoFitPage?: () => void;
  onMakeMoreFormal?: () => void;
  showGrid?: boolean;
}

/**
 * Intelligent Document Fitting Engine
 * Maximizes readability and fills the single A4 page from top to bottom gracefully.
 */
function getOptimalBodySize(paragraphs: string[]): { fontSizePt: number; lineHeight: number } {
  const fullText = (paragraphs || []).join('\n\n');
  if (!fullText.trim()) {
    return { fontSizePt: 11.2, lineHeight: 1.70 };
  }

  const rawLines = fullText.split('\n');
  let physicalLines = 0;

  for (const line of rawLines) {
    if (!line.trim()) {
      physicalLines += 0.6; // blank separator
    } else {
      physicalLines += Math.max(1, Math.ceil(line.length / 75));
    }
  }

  // Choose the largest font size and line height that fills the page up to 725px
  if (physicalLines > 55) {
    return { fontSizePt: 8.25, lineHeight: 1.35 };
  } else if (physicalLines > 42) {
    return { fontSizePt: 9.0, lineHeight: 1.45 };
  } else if (physicalLines > 32) {
    return { fontSizePt: 9.75, lineHeight: 1.52 };
  } else if (physicalLines > 22) {
    return { fontSizePt: 10.5, lineHeight: 1.62 };
  } else if (physicalLines > 12) {
    return { fontSizePt: 11.0, lineHeight: 1.68 };
  } else {
    return { fontSizePt: 11.5, lineHeight: 1.75 };
  }
}

export const LetterCanvas: React.FC<LetterCanvasProps> = ({
  letterData,
  org,
  onUpdateLetterData,
  showGrid = true,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Synchronize canvas text content when changed externally from sidebar
  useEffect(() => {
    if (headlineRef.current && document.activeElement !== headlineRef.current) {
      if (headlineRef.current.innerText !== (letterData.subject || '')) {
        headlineRef.current.innerText = letterData.subject || '';
      }
    }
  }, [letterData.subject]);

  useEffect(() => {
    if (bodyRef.current && document.activeElement !== bodyRef.current) {
      const currentBodyText = (letterData.bodyParagraphs || []).join('\n\n');
      if (bodyRef.current.innerText !== currentBodyText) {
        bodyRef.current.innerText = currentBodyText;
      }
    }
  }, [letterData.bodyParagraphs]);

  // 1. HEADLINE SCALE (STRICT MAX 2 LINES): Dynamically scales down font size so headline never exceeds 2 lines
  const headlineScale = useMemo(() => {
    const headlineLength = (letterData.subject || '').length;
    if (headlineLength > 160) {
      return {
        className: 'text-xs md:text-sm',
        maxHeight: '2.5rem',
      };
    } else if (headlineLength > 100) {
      return {
        className: 'text-sm md:text-base',
        maxHeight: '2.85rem',
      };
    } else if (headlineLength > 60) {
      return {
        className: 'text-base md:text-lg',
        maxHeight: '3.2rem',
      };
    } else if (headlineLength > 35) {
      return {
        className: 'text-lg md:text-xl',
        maxHeight: '3.6rem',
      };
    } else {
      return {
        className: 'text-2xl md:text-3xl',
        maxHeight: '4.2rem',
      };
    }
  }, [letterData.subject]);

  // 2. BODY AUTO-FIT SCALE: Maximizes single-page fill with generous, legible sizing
  const bodyStyle = useMemo(() => {
    // If user explicitly set custom fontSizePt in sidebar, respect it; otherwise use smart auto
    if (letterData.fontSizePt && letterData.fontSizePt !== 11) {
      return {
        fontSizePt: letterData.fontSizePt,
        lineHeight: letterData.fontSizePt >= 11 ? 1.68 : letterData.fontSizePt >= 10 ? 1.60 : 1.50,
      };
    }
    return getOptimalBodySize(letterData.bodyParagraphs || []);
  }, [letterData.bodyParagraphs, letterData.fontSizePt]);

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

  // Safe Paste Handler: allows clean plain text pasting of any length/paragraphs
  const handleBodyPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    // Insert clean text at current selection cursor
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    selection.deleteFromDocument();
    const range = selection.getRangeAt(0);
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    
    // Move cursor after pasted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    // Sync state
    if (bodyRef.current) {
      const fullText = bodyRef.current.innerText || '';
      const paragraphs = fullText.split('\n\n').filter((p) => p.trim() !== '');
      onUpdateLetterData({
        bodyParagraphs: paragraphs.length > 0 ? paragraphs : [fullText],
      });
    }
  };

  const handleBodyInput = () => {
    if (bodyRef.current) {
      const fullText = bodyRef.current.innerText || '';
      const paragraphs = fullText.split('\n\n').filter((p) => p.trim() !== '');
      onUpdateLetterData({
        bodyParagraphs: paragraphs.length > 0 ? paragraphs : [fullText],
      });
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* ========================================================================= */}
      {/* DIRECT ON-CANVAS DOCUMENT (US LETTER / A4 CANVAS - STRICT 1 PAGE)          */}
      {/* Standard dimensions: 210mm wide x 297mm high (1123px)                     */}
      {/* ========================================================================= */}
      <div
        id="letter-a4-canvas"
        ref={canvasRef}
        className="relative bg-white text-slate-900 shadow-2xl a4-page-shadow rounded-none overflow-hidden"
        style={{
          width: '210mm',
          height: '297mm', // Strict single-page A4 height (1123px)
          minHeight: '297mm',
          maxHeight: '297mm',
          fontFamily: getFontFamilyStyle(),
        }}
      >
        {/* Layer 1: Master Official Letterhead Header & Footer */}
        <LetterheadBackground org={org} showGrid={showGrid} />

        {/* Layer 2: Safe Content Area - Strictly Clamped Between Header & Footer */}
        <div
          className="relative z-10 flex flex-col justify-start h-full overflow-hidden"
          style={{
            paddingTop: `${org.margins.top}mm`,
            paddingBottom: `${org.margins.bottom + 6}mm`,
            paddingLeft: `${org.margins.left}mm`,
            paddingRight: `${org.margins.right}mm`,
            height: '100%',
            maxHeight: '100%',
          }}
        >
          {/* Main Content (Headline & Body as 2 Independent Sections) */}
          <div className="flex-1 flex flex-col justify-start space-y-3 pt-2 h-full overflow-hidden">
            {/* ===================== INDEPENDENT SECTION 1: HEADLINE (MAX 2 LINES CLAMPED) ===================== */}
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

            {/* ===================== INDEPENDENT SECTION 2: BODY (FULL PAGE AUTO-FIT) ===================== */}
            <div
              ref={bodyRef}
              contentEditable
              suppressContentEditableWarning
              onPaste={handleBodyPaste}
              onInput={handleBodyInput}
              onBlur={handleBodyInput}
              className="flex-1 text-slate-800 font-normal hover:bg-slate-50/50 focus:bg-teal-50/40 focus:outline-none p-1 rounded transition-all whitespace-pre-wrap cursor-text"
              style={{
                textAlign: letterData.textAlign || 'left',
                fontSize: `${bodyStyle.fontSizePt}pt`,
                lineHeight: bodyStyle.lineHeight,
              }}
            >
              {(letterData.bodyParagraphs || []).join('\n\n') || 'Body text goes here'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
