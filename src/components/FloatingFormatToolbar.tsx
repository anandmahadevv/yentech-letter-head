import React, { useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Highlighter,
  RemoveFormatting,
  Table as TableIcon,
} from 'lucide-react';

interface FloatingFormatToolbarProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onContentChange: () => void;
  onInsertTableHere?: () => void;
}

export const FloatingFormatToolbar: React.FC<FloatingFormatToolbarProps> = ({
  containerRef,
  onContentChange,
  onInsertTableHere,
}) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        setPosition(null);
        setShowHighlightMenu(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;
      
      // Ensure selection is inside our container
      if (
        containerRef.current &&
        containerRef.current.contains(
          commonAncestor.nodeType === Node.TEXT_NODE
            ? commonAncestor.parentElement
            : commonAncestor
        )
      ) {
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setPosition({
            top: rect.top - 48,
            left: rect.left + rect.width / 2,
          });
          return;
        }
      }

      setPosition(null);
      setShowHighlightMenu(false);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [containerRef]);

  if (!position) return null;

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    onContentChange();
  };

  const applyHighlight = (color: string) => {
    if (color === 'transparent') {
      document.execCommand('removeFormat', false);
    } else {
      document.execCommand('hiliteColor', false, color);
    }
    setShowHighlightMenu(false);
    onContentChange();
  };

  return (
    <div
      className="no-print fixed z-50 transform -translate-x-1/2 bg-[#161922] border border-[#2e3442] shadow-2xl rounded-lg px-2 py-1.5 flex items-center gap-1 text-white text-xs select-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: `${Math.max(10, position.top)}px`,
        left: `${position.left}px`,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        type="button"
        onClick={() => executeCommand('bold')}
        className="p-1.5 hover:bg-[#282d38] hover:text-amber-400 rounded transition cursor-pointer text-slate-200"
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => executeCommand('italic')}
        className="p-1.5 hover:bg-[#282d38] hover:text-amber-400 rounded transition cursor-pointer text-slate-200"
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => executeCommand('underline')}
        className="p-1.5 hover:bg-[#282d38] hover:text-amber-400 rounded transition cursor-pointer text-slate-200"
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => executeCommand('strikeThrough')}
        className="p-1.5 hover:bg-[#282d38] hover:text-amber-400 rounded transition cursor-pointer text-slate-200"
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-slate-700 mx-0.5" />

      {/* Highlighter Button & Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowHighlightMenu(!showHighlightMenu)}
          className="p-1.5 hover:bg-[#282d38] hover:text-teal-300 rounded transition cursor-pointer text-slate-200"
          title="Highlight Text"
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>

        {showHighlightMenu && (
          <div className="absolute left-0 bottom-full mb-1.5 bg-[#1e222b] border border-[#2e3442] rounded-lg shadow-xl p-1.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyHighlight('#fef08a')}
              className="w-5 h-5 rounded-full bg-yellow-300 hover:scale-110 transition border border-yellow-500/50"
              title="Yellow Highlight"
            />
            <button
              type="button"
              onClick={() => applyHighlight('#99f6e4')}
              className="w-5 h-5 rounded-full bg-teal-200 hover:scale-110 transition border border-teal-500/50"
              title="Teal Highlight"
            />
            <button
              type="button"
              onClick={() => applyHighlight('#fed7aa')}
              className="w-5 h-5 rounded-full bg-orange-200 hover:scale-110 transition border border-orange-500/50"
              title="Orange Highlight"
            />
            <button
              type="button"
              onClick={() => applyHighlight('transparent')}
              className="w-5 h-5 rounded-full bg-slate-700 hover:bg-slate-600 text-[10px] text-slate-300 flex items-center justify-center transition border border-slate-500"
              title="Remove Highlight"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => executeCommand('insertUnorderedList')}
        className="p-1.5 hover:bg-[#282d38] hover:text-teal-300 rounded transition cursor-pointer text-slate-200"
        title="Bullet List"
      >
        <List className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => executeCommand('insertOrderedList')}
        className="p-1.5 hover:bg-[#282d38] hover:text-teal-300 rounded transition cursor-pointer text-slate-200"
        title="Numbered List"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>

      {onInsertTableHere && (
        <>
          <div className="h-4 w-px bg-slate-700 mx-0.5" />
          <button
            type="button"
            onClick={onInsertTableHere}
            className="px-2 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 rounded transition cursor-pointer text-[10.5px] font-medium flex items-center gap-1"
            title="Split text at selection and insert Table right in between"
          >
            <TableIcon className="w-3 h-3" />
            <span>Table Here</span>
          </button>
        </>
      )}

      <div className="h-4 w-px bg-slate-700 mx-0.5" />

      <button
        type="button"
        onClick={() => executeCommand('removeFormat')}
        className="p-1.5 hover:bg-[#282d38] hover:text-red-400 rounded transition cursor-pointer text-slate-400 hover:text-white"
        title="Clear Formatting"
      >
        <RemoveFormatting className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
