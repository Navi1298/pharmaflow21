import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { formatGMPDate } from '../utils/crypto';
import { AuditLogEntry } from '../types';

export const AuditTrailView: React.FC = () => {
  const { documents, activeDocument } = useWorkflow();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [docFilter, setDocFilter] = useState<string>('ALL');

  // Collect all audit trails across documents
  const allLogs: AuditLogEntry[] = documents.flatMap((d) => d.auditTrail);

  // Sort descending by timestamp
  const sortedLogs = [...allLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredLogs = sortedLogs.filter((log) => {
    if (docFilter !== 'ALL' && log.documentId !== docFilter) return false;
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.performedBy.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.checksum.toLowerCase().includes(q) ||
      (log.fieldChanged && log.fieldChanged.toLowerCase().includes(q))
    );
  });

  const exportAuditCSV = () => {
    const headers = [
      'ID',
      'Document ID',
      'Timestamp (ISO)',
      'Action',
      'Operator',
      'Role',
      'Details',
      'Field Changed',
      'Old Value',
      'New Value',
      'Reason For Change',
      'IP Address',
      'Cryptographic Checksum',
    ];

    const rows = filteredLogs.map((l) => [
      l.id,
      l.documentId,
      l.timestamp,
      l.action,
      `"${l.performedBy}"`,
      l.userRole,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.fieldChanged || '',
      `"${(l.oldValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`,
      `"${(l.reasonForChange || '').replace(/"/g, '""')}"`,
      l.ipAddress,
      l.checksum,
    ]);

    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `21_CFR_Part_11_Audit_Trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: AuditLogEntry['action']) => {
    if (action.includes('SIGNATURE') || action.includes('APPROVED')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    if (action.includes('AI')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    if (action.includes('REVISION')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {action.replace(/_/g, ' ')}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
        {action.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <History className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">21 CFR Part 11 Electronic Audit Trail</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                § 11.10(e) Immutable Log
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Computer-generated, time-stamped ledger recording all operator entries, AI suggestions, edits, deletions, electronic signatures, and revision loops with cryptographic checksums.
            </p>
          </div>
        </div>

        <button
          onClick={exportAuditCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-lg transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by operator, details, field, or checksum..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={docFilter}
            onChange={(e) => setDocFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Documents ({documents.length})</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.documentNumber} - {d.title}
              </option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Actions</option>
            <option value="DOCUMENT_CREATED">Document Created</option>
            <option value="ROW_EDITED">Row Edited</option>
            <option value="AI_SCAN_PERFORMED">AI Scan Performed</option>
            <option value="AI_FIX_APPLIED">AI Fix Applied</option>
            <option value="AI_ALL_FIXES_APPLIED">AI All Fixes Applied</option>
            <option value="SIGNATURE_PREPARED">Signature Prepared By</option>
            <option value="ROUTED_FOR_REVISION">Routed For Revision</option>
            <option value="REVIEW_PASSED">Review Passed (Direct Pass)</option>
            <option value="SIGNATURE_APPROVED">Signature Approved By</option>
            <option value="SAVED_TO_REPOSITORY">Saved To Repository</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                <th className="px-4 py-3">Timestamp (GMP)</th>
                <th className="px-4 py-3">Event Action</th>
                <th className="px-4 py-3">Operator & Role</th>
                <th className="px-4 py-3">Change Details & Rationale</th>
                <th className="px-4 py-3">Diff (Old &rarr; New)</th>
                <th className="px-4 py-3">IP / Checksum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500 font-sans">
                    No audit records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const hasDiff = log.oldValue !== undefined || log.newValue !== undefined;
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Timestamp */}
                      <td className="px-4 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                        {formatGMPDate(log.timestamp)}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Operator & Role */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-sans font-semibold text-white">{log.performedBy}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Role: {log.userRole}</div>
                      </td>

                      {/* Details & Reason */}
                      <td className="px-4 py-3 font-sans text-slate-300 max-w-sm">
                        <div>{log.details}</div>
                        {log.reasonForChange && (
                          <div className="mt-0.5 text-[11px] text-amber-300/80 italic">
                            Reason: {log.reasonForChange}
                          </div>
                        )}
                      </td>

                      {/* Diff */}
                      <td className="px-4 py-3">
                        {hasDiff ? (
                          <div className="text-[11px] space-y-0.5">
                            <div className="text-rose-400 line-through truncate max-w-[150px]">
                              {log.oldValue || '—'}
                            </div>
                            <div className="text-emerald-300 font-bold truncate max-w-[150px]">
                              {log.newValue || '—'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* IP & Checksum */}
                      <td className="px-4 py-3 text-[10px]">
                        <div className="text-slate-400">{log.ipAddress}</div>
                        <div className="text-indigo-400 truncate max-w-[120px]" title={log.checksum}>
                          {log.checksum}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
