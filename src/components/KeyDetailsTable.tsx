import React from 'react';
import { Plus, Trash2, X, ArrowUp, ArrowDown, Split } from 'lucide-react';

interface KeyDetailsTableProps {
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  onUpdateTable: (updatedTable?: { headers: string[]; rows: string[][] }) => void;
  accentColor?: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  positionLabel?: string;
  onSplitAndCenter?: () => void;
  canSplitAndCenter?: boolean;
}

export const KeyDetailsTable: React.FC<KeyDetailsTableProps> = ({
  tableData,
  onUpdateTable,
  accentColor = '#179091',
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  positionLabel,
  onSplitAndCenter,
  canSplitAndCenter = false,
}) => {
  if (!tableData || !tableData.headers || tableData.headers.length === 0) {
    return null;
  }

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...tableData.headers];
    newHeaders[index] = value;
    onUpdateTable({
      headers: newHeaders,
      rows: tableData.rows,
    });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = tableData.rows.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      const newRow = [...row];
      newRow[colIndex] = value;
      return newRow;
    });
    onUpdateTable({
      headers: tableData.headers,
      rows: newRows,
    });
  };

  const handleAddRow = () => {
    const newRow = new Array(tableData.headers.length).fill('');
    onUpdateTable({
      headers: tableData.headers,
      rows: [...tableData.rows, newRow],
    });
  };

  const handleDeleteRow = (rowIndex: number) => {
    const newRows = tableData.rows.filter((_, idx) => idx !== rowIndex);
    onUpdateTable({
      headers: tableData.headers,
      rows: newRows,
    });
  };

  const handleRemoveTable = () => {
    onUpdateTable(undefined);
  };

  return (
    <div className="relative my-2.5 group/table select-text">
      {/* Floating Table Action Bar (Move Up / Down / Center / Remove) */}
      <div className="no-print absolute -top-3.5 right-0 opacity-90 group-hover/table:opacity-100 transition flex items-center gap-1.5 z-20 bg-[#161922] border border-[#2e3442] shadow-md px-2 py-0.5 rounded-md text-[10px] text-slate-300">
        {positionLabel && (
          <span className="text-teal-400 font-mono text-[9.5px] font-bold mr-1">
            {positionLabel}
          </span>
        )}

        {canSplitAndCenter && onSplitAndCenter && (
          <button
            type="button"
            onClick={onSplitAndCenter}
            className="px-1.5 py-0.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded border border-teal-500/40 transition cursor-pointer text-[9.5px] flex items-center gap-1 font-mono"
            title="Split text into Introduction and Conclusion paragraphs, placing table in between"
          >
            <Split className="w-2.5 h-2.5" />
            <span>Place In Middle</span>
          </button>
        )}

        {onMoveUp && (
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1 hover:bg-[#282d38] hover:text-teal-300 disabled:opacity-30 rounded transition cursor-pointer text-slate-300"
            title="Move Table Up (before previous paragraph)"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
        )}

        {onMoveDown && (
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1 hover:bg-[#282d38] hover:text-teal-300 disabled:opacity-30 rounded transition cursor-pointer text-slate-300"
            title="Move Table Down (after next paragraph)"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        )}

        <div className="h-3 w-px bg-slate-700 mx-0.5" />

        <button
          type="button"
          onClick={handleRemoveTable}
          className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition cursor-pointer text-slate-400"
          title="Remove Table"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-300 rounded shadow-xs bg-white">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="bg-slate-100/90 text-slate-800 font-semibold border-b border-slate-300">
              {tableData.headers.map((header, colIdx) => (
                <th
                  key={colIdx}
                  className="px-3 py-1.5 border-r border-slate-200 last:border-r-0"
                  style={{ color: accentColor }}
                >
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                    className="w-full bg-transparent font-bold focus:outline-none focus:bg-teal-50/80 px-1 py-0.5 rounded cursor-text"
                    placeholder={`Column ${colIdx + 1}`}
                  />
                </th>
              ))}
              <th className="no-print w-8 px-1 py-1 text-center bg-slate-100 border-l border-slate-200"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {tableData.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/80 transition group/row">
                {tableData.headers.map((_, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-3 py-1.5 border-r border-slate-200 last:border-r-0"
                  >
                    <input
                      type="text"
                      value={row[colIdx] || ''}
                      onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                      className="w-full bg-transparent text-slate-800 focus:outline-none focus:bg-teal-50/80 px-1 py-0.5 rounded cursor-text text-xs"
                      placeholder="—"
                    />
                  </td>
                ))}
                <td className="no-print w-8 px-1 py-1 text-center border-l border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(rowIdx)}
                    className="opacity-0 group-hover/row:opacity-100 p-1 hover:text-red-500 hover:bg-red-50 rounded transition cursor-pointer text-slate-400"
                    title="Delete row"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row Button */}
      <div className="no-print mt-1 flex justify-start">
        <button
          type="button"
          onClick={handleAddRow}
          className="text-[10px] text-teal-600 hover:text-teal-700 hover:bg-teal-50/60 font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Add Row</span>
        </button>
      </div>
    </div>
  );
};
