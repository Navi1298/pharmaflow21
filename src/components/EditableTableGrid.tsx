import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  ArrowUpDown,
  Search,
  Check,
  AlertCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { TableRow, TableColumn } from '../types';
import { useWorkflow } from '../context/WorkflowContext';

interface EditableTableGridProps {
  columns: TableColumn[];
  rows: TableRow[];
  isReadOnly?: boolean;
}

export const EditableTableGrid: React.FC<EditableTableGridProps> = ({
  columns,
  rows,
  isReadOnly = false,
}) => {
  const {
    currentUser,
    updateCell,
    addRow,
    deleteRow,
    aiFixes,
    validateAuthorAccess,
    triggerComplianceAlert,
  } = useWorkflow();

  const authorAccess = validateAuthorAccess(currentUser);
  const isAuthor = authorAccess.allowed;
  const effectiveReadOnly = isReadOnly || !isAuthor;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleStartEdit = (rowId: string, colKey: string, initialVal: unknown) => {
    if (!isAuthor) {
      triggerComplianceAlert(authorAccess.message, `Modify Table Cell [${colKey}]`);
      return;
    }
    if (effectiveReadOnly) return;
    setEditingCell({ rowId, colKey });
    setEditValue(initialVal !== undefined && initialVal !== null ? String(initialVal) : '');
  };

  const handleSaveEdit = (rowId: string, colKey: string) => {
    if (editingCell) {
      updateCell(rowId, colKey, editValue);
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowId: string, colKey: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(rowId, colKey);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  // Filter & Sort
  const filteredRows = rows.filter((row) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (row.name && row.name.toLowerCase().includes(q)) ||
      (row.phone && row.phone.toLowerCase().includes(q)) ||
      (row.batchId && row.batchId.toLowerCase().includes(q)) ||
      (row.parameter && row.parameter.toLowerCase().includes(q)) ||
      (row.notes && row.notes.toLowerCase().includes(q))
    );
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortColumn) return 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valA = (a as any)[sortColumn];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valB = (b as any)[sortColumn];

    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    const cmp = valA > valB ? 1 : -1;
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  // Check if a cell has an active AI flag
  const isCellFlagged = (rowId: string, colKey: string) => {
    return aiFixes.some((f) => f.rowId === rowId && f.columnKey === colKey && f.status === 'PENDING');
  };

  return (
    <div className="space-y-3">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records by name, batch, parameter..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {!isAuthor ? (
            <button
              onClick={() => triggerComplianceAlert(authorAccess.message, 'Add Record Row')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-400 text-xs font-medium border border-slate-700/80 opacity-60 cursor-not-allowed hover:bg-slate-800 transition-colors"
              title={authorAccess.message}
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Add Record Row</span>
              <span className="text-[10px] text-rose-300 font-mono font-normal">(Author Only)</span>
            </button>
          ) : (
            !effectiveReadOnly && (
              <button
                onClick={() => addRow()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-teal-400" />
                <span>Add Record Row</span>
              </button>
            )
          )}

          <div className="text-xs text-slate-400 font-mono">
            {sortedRows.length} of {rows.length} rows
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-10">
                <th className="px-3.5 py-3 font-semibold text-slate-400 uppercase tracking-wider text-[10px] w-12 text-center">
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    onClick={() => handleSort(String(col.key))}
                    className="px-3.5 py-3 font-semibold text-slate-300 uppercase tracking-wider text-[10px] cursor-pointer hover:text-teal-400 transition-colors select-none"
                    style={{ width: col.width }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                ))}
                {!effectiveReadOnly && (
                  <th className="px-3.5 py-3 font-semibold text-slate-400 uppercase tracking-wider text-[10px] w-14 text-center">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (effectiveReadOnly ? 1 : 2)}
                    className="px-4 py-8 text-center text-slate-500 text-xs"
                  >
                    No records found matching search query.
                  </td>
                </tr>
              ) : (
                sortedRows.map((row, index) => {
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="px-3.5 py-2.5 text-center text-slate-500 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Dynamic Columns */}
                      {columns.map((col) => {
                        const colKey = String(col.key);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const cellVal = (row as any)[colKey];
                        const isEditing =
                          editingCell?.rowId === row.id && editingCell?.colKey === colKey;
                        const flagged = isCellFlagged(row.id, colKey);
                        const aiModified = row._modifiedByAI;

                        if (isEditing) {
                          return (
                            <td key={colKey} className="px-2 py-1.5">
                              <div className="flex items-center gap-1">
                                <input
                                  type={col.type === 'number' ? 'number' : 'text'}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => handleSaveEdit(row.id, colKey)}
                                  onKeyDown={(e) => handleKeyDown(e, row.id, colKey)}
                                  autoFocus
                                  className="w-full px-2 py-1 text-xs rounded bg-slate-950 border border-teal-500 text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(row.id, colKey)}
                                  className="p-1 rounded bg-teal-500 text-slate-950 hover:bg-teal-400"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          );
                        }

                        // Status Badge Rendering
                        if (col.type === 'status' || colKey === 'status') {
                          const statusStr = String(cellVal || 'Pass');
                          return (
                            <td
                              key={colKey}
                              onClick={() => handleStartEdit(row.id, colKey, cellVal)}
                              className={`px-3.5 py-2.5 ${!isReadOnly ? 'cursor-pointer' : ''}`}
                            >
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                                  statusStr === 'Pass'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : statusStr === 'Fail'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : statusStr === 'Warning'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-slate-700 text-slate-300'
                                }`}
                              >
                                {statusStr}
                              </span>
                            </td>
                          );
                        }

                        // Standard Cell Rendering
                        return (
                          <td
                            key={colKey}
                            onClick={() => handleStartEdit(row.id, colKey, cellVal)}
                            className={`px-3.5 py-2.5 transition-colors relative ${
                              !effectiveReadOnly ? 'cursor-pointer hover:bg-slate-800/80' : 'cursor-not-allowed'
                            } ${
                              flagged
                                ? 'bg-amber-500/10 border-l-2 border-amber-500 text-amber-200'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span
                                className={`truncate font-normal ${
                                  colKey === 'name' ? 'font-medium text-slate-100' : 'text-slate-300'
                                }`}
                              >
                                {cellVal !== undefined && cellVal !== null ? String(cellVal) : '-'}
                              </span>

                              {/* AI Flag / AI Modified Pill */}
                              {flagged && (
                                <span
                                  title="Flagged by AI Scanner for review"
                                  className="p-0.5 rounded bg-amber-500/20 text-amber-400 shrink-0"
                                >
                                  <AlertCircle className="w-3 h-3" />
                                </span>
                              )}
                              {!flagged && aiModified && colKey === 'name' && (
                                <span
                                  title="Standardized via AI Scanner"
                                  className="p-0.5 rounded bg-teal-500/20 text-teal-300 shrink-0"
                                >
                                  <Sparkles className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Row Action: Delete */}
                      {!effectiveReadOnly && (
                        <td className="px-3.5 py-2.5 text-center">
                          <button
                            onClick={() => deleteRow(row.id)}
                            title="Delete Row per Audit Trail"
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {!isAuthor
                ? 'Role Segregation Active: Non-Author persona active. Records are locked against mutation per FDA 21 CFR Part 11.'
                : !effectiveReadOnly
                ? 'Click any cell to edit inline. Changes are timestamped in the 21 CFR Part 11 Audit Trail.'
                : 'Inspection Mode: Records are locked against direct mutation in this review/approval stage.'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              <span>AI Flagged</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
              <span>AI Standardized</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
