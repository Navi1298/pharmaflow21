import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  CheckCheck,
  ChevronRight,
  X,
  FileCheck2,
  Type,
  PhoneCall,
  SlidersHorizontal,
  Lock,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { AIFixItem } from '../types';

export const AISidePanel: React.FC = () => {
  const {
    currentUser,
    isSidePanelOpen,
    setIsSidePanelOpen,
    aiFixes,
    isScanning,
    runAIScanner,
    applyFix,
    applyAllFixes,
    rejectFix,
    activeDocument,
    validateAuthorAccess,
  } = useWorkflow();

  const authorAccess = validateAuthorAccess(currentUser);
  const isAuthor = authorAccess.allowed;

  const [filterType, setFilterType] = useState<string>('ALL');

  if (!isSidePanelOpen) return null;

  const pendingFixes = aiFixes.filter((f) => f.status === 'PENDING');
  const acceptedFixes = aiFixes.filter((f) => f.status === 'ACCEPTED');
  const rejectedFixes = aiFixes.filter((f) => f.status === 'REJECTED');

  const filteredList = aiFixes.filter((f) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'PENDING') return f.status === 'PENDING';
    if (filterType === 'TYPO') return f.issueType === 'TYPO';
    if (filterType === 'CAPITALIZATION') return f.issueType === 'CAPITALIZATION';
    if (filterType === 'PHONE') return f.issueType === 'PHONE_FORMAT';
    if (filterType === 'RANGE') return f.issueType === 'RANGE_ANOMALY';
    return true;
  });

  const getIssueBadge = (type: AIFixItem['issueType']) => {
    switch (type) {
      case 'TYPO':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Type className="w-3 h-3" /> Typo
          </span>
        );
      case 'CAPITALIZATION':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Type className="w-3 h-3" /> Casing
          </span>
        );
      case 'PHONE_FORMAT':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <PhoneCall className="w-3 h-3" /> Phone
          </span>
        );
      case 'RANGE_ANOMALY':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <SlidersHorizontal className="w-3 h-3" /> Range Outlier
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-300">
            Format
          </span>
        );
    }
  };

  const getSeverityBadge = (sev: AIFixItem['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="text-[10px] font-bold text-rose-400">CRITICAL</span>;
      case 'MAJOR':
        return <span className="text-[10px] font-semibold text-amber-400">MAJOR</span>;
      case 'FORMAT':
        return <span className="text-[10px] font-medium text-teal-400">STANDARD</span>;
      default:
        return <span className="text-[10px] text-slate-400">MINOR</span>;
    }
  };

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-96 max-w-full bg-slate-900 border-l border-slate-800 shadow-2xl z-40 flex flex-col animate-slide-left">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">AI Scanner & Correction</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                GPT-Pharma
              </span>
            </div>
            <p className="text-[11px] text-slate-400">21 CFR Part 11 Tabular Error Verification</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidePanelOpen(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Control Banner */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Pending Flags:</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendingFixes.length}
            </span>
          </div>
          <button
            onClick={runAIScanner}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>Re-Scan</span>
          </button>
        </div>

        {pendingFixes.length > 0 && (
          <button
            onClick={applyAllFixes}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              isAuthor
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-teal-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-400 border border-slate-700/80 opacity-60 cursor-not-allowed hover:bg-slate-800/90'
            }`}
            title={!isAuthor ? authorAccess.message : 'Accept all detected AI corrections with 1-click'}
          >
            {isAuthor ? <CheckCheck className="w-4 h-4" /> : <Lock className="w-4 h-4 text-rose-400" />}
            <span>Accept All ({pendingFixes.length}) Fixes</span>
            {!isAuthor && <span className="text-[10px] text-rose-300 font-mono font-normal">(Author Only)</span>}
          </button>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['ALL', 'PENDING', 'TYPO', 'CAPITALIZATION', 'PHONE', 'RANGE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                filterType === f
                  ? 'bg-teal-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content / Findings List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isScanning ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 animate-spin">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-xs font-semibold text-slate-200">Analyzing Tabular Data...</div>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Checking nomenclature dictionaries, Title Case standards, telephone patterns, and numeric tolerances.
            </p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-200">Zero AI Anomalies Detected</div>
            <p className="text-xs text-slate-400 max-w-xs">
              All records conform to GMP nomenclature, phone formatting, and numeric bounds. Ready for author electronic signature.
            </p>
          </div>
        ) : (
          filteredList.map((fix) => {
            const isPending = fix.status === 'PENDING';
            const isAccepted = fix.status === 'ACCEPTED';
            const isRejected = fix.status === 'REJECTED';

            return (
              <div
                key={fix.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isAccepted
                    ? 'border-emerald-500/30 bg-emerald-950/10 opacity-75'
                    : isRejected
                    ? 'border-slate-800 bg-slate-950/40 opacity-50'
                    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Top row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {getIssueBadge(fix.issueType)}
                    {getSeverityBadge(fix.severity)}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Col: {fix.columnKey}
                  </span>
                </div>

                {/* Diff Comparison */}
                <div className="mt-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-rose-400 font-mono w-14 shrink-0">Current:</span>
                    <span className="line-through text-slate-400 truncate font-mono">
                      {String(fix.originalValue)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-mono w-14 shrink-0">AI Fix:</span>
                    <span className="text-emerald-300 font-semibold truncate font-mono">
                      {String(fix.suggestedValue)}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <p className="mt-2 text-[11px] text-slate-300 leading-relaxed">
                  {fix.explanation}
                </p>

                {/* Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Row: {fix.rowId}
                  </span>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => rejectFix(fix.id)}
                        className="px-2 py-1 rounded text-[11px] font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => applyFix(fix.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                          isAuthor
                            ? 'bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 border-teal-500/30 cursor-pointer'
                            : 'bg-slate-800 text-slate-400 border-slate-700/80 opacity-60 cursor-not-allowed hover:bg-slate-800'
                        }`}
                        title={!isAuthor ? authorAccess.message : 'Accept AI correction'}
                      >
                        {isAuthor ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-rose-400" />}
                        <span>Accept Fix</span>
                        {!isAuthor && <span className="text-[9px] text-rose-300 font-mono">(Author Only)</span>}
                      </button>
                    </div>
                  )}

                  {isAccepted && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fixed & Audited
                    </span>
                  )}

                  {isRejected && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Rejected by Operator
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Summary */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Accepted: <strong className="text-emerald-400">{acceptedFixes.length}</strong></span>
        <span>Rejected: <strong className="text-slate-400">{rejectedFixes.length}</strong></span>
        <span>Total Scanned: <strong className="text-white">{aiFixes.length}</strong></span>
      </div>
    </aside>
  );
};
