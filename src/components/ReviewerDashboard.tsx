import React, { useState } from 'react';
import {
  FileCheck,
  RotateCcw,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  Eye,
  Send,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { EditableTableGrid } from './EditableTableGrid';
import { RoleSegregationAlert } from './RoleSegregationAlert';
import { AuthSignatureModal } from './AuthSignatureModal';
import { formatGMPDate } from '../utils/crypto';

export const ReviewerDashboard: React.FC = () => {
  const {
    currentUser,
    documents,
    activeDocument,
    selectDocumentById,
    canReviewDocument,
    routeReviewWithComments,
    signReviewedDirectPass,
    setActiveTab,
  } = useWorkflow();

  const [commentText, setCommentText] = useState('');
  const [actionRequired, setActionRequired] = useState('');
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const pendingReviewDocs = documents.filter((d) => d.status === 'PENDING_REVIEW');

  const segregationCheck = activeDocument
    ? canReviewDocument(activeDocument)
    : { allowed: true };

  const hasComments = commentText.trim().length > 0;

  const handleRouteBackForRevision = () => {
    if (!commentText.trim()) {
      setFeedbackError('Mandatory 21 CFR Part 11 Rule: You must provide a descriptive comment when routing a record back for author revision.');
      return;
    }
    setFeedbackError(null);
    const success = routeReviewWithComments(commentText, actionRequired);
    if (success) {
      setCommentText('');
      setActionRequired('');
      // Offer prompt to switch to Author to test the revision loop
      setActiveTab('author');
    }
  };

  const handleDirectPassClick = () => {
    setFeedbackError(null);
    setIsSignModalOpen(true);
  };

  const authorSignature = activeDocument?.signatures.find((s) => s.type === 'PREPARED_BY');

  return (
    <div className="space-y-6">
      {/* Top Header & Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Pending Review Queue</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{pendingReviewDocs.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting QA inspection & electronic sign-off</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Segregation of Duties</span>
            <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold text-teal-300">
            {segregationCheck.allowed ? 'Role Segregation Verified' : 'Compliance Barrier Active'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Author ({activeDocument?.authorName || 'NAVEEN KUMAR MAJJI'}) cannot act as Reviewer
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Routing Pathway Mode</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold">
            {hasComments ? (
              <span className="text-amber-400">Revision Loop (Comments Present)</span>
            ) : (
              <span className="text-emerald-400">Direct Pass Rule (Zero Comments)</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {hasComments
              ? 'Will route back to Author with mandatory notes'
              : 'Will bypass revision straight to Approver'}
          </p>
        </div>
      </div>

      {/* Segregation Compliance Alert if User is Author or Mismatched Role */}
      {!segregationCheck.allowed && (
        <RoleSegregationAlert
          type="REVIEWER_AUTHOR_CONFLICT"
          message={segregationCheck.reason || 'Author cannot review their own document.'}
          recommendedRole="REVIEWER"
        />
      )}

      {/* Document Queue Selector */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Inspect Document in QA Queue:</div>
            <select
              value={activeDocument?.id || ''}
              onChange={(e) => selectDocumentById(e.target.value)}
              className="text-xs font-semibold text-white bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 mt-1 focus:outline-none focus:border-blue-500"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  [{doc.documentNumber}] {doc.title} ({doc.status.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-mono">Author: {activeDocument?.authorName}</span>
          <span>•</span>
          <span className="font-mono">Created: {activeDocument && formatGMPDate(activeDocument.createdAt)}</span>
        </div>
      </div>

      {/* Document Details & Author Signature Stamp */}
      {activeDocument && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-blue-400 font-bold">
                  {activeDocument.documentNumber}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400">v{activeDocument.version}</span>
                <span className="text-slate-500">•</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {activeDocument.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">{activeDocument.title}</h2>
            </div>

            {/* Author Verified Stamp */}
            {authorSignature && (
              <div className="p-3 rounded-lg border border-teal-500/30 bg-teal-950/20 text-xs">
                <div className="flex items-center gap-2 text-teal-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Prepared by: {authorSignature.signerName}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Signed: {formatGMPDate(authorSignature.timestamp)}
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate max-w-xs">
                  Hash: {authorSignature.checksum}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabular Data Grid in Inspection Mode */}
      {activeDocument && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inspection Grid (Read-Only 21 CFR Part 11 Inspection)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {activeDocument.rows.length} records ready for QA review
            </span>
          </div>

          <EditableTableGrid
            columns={activeDocument.columns}
            rows={activeDocument.rows}
            isReadOnly={true}
          />
        </div>
      )}

      {/* Conditional Review Routing Module & Commentary */}
      {activeDocument && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Reviewer Inspection & Routing Control</h3>
                <p className="text-xs text-slate-400">
                  Add comments to route back for revision, OR leave blank to apply the Direct Pass Rule.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  hasComments
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {hasComments ? 'Mode: Revision Loop' : 'Mode: Direct Pass'}
              </span>
            </div>
          </div>

          {feedbackError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{feedbackError}</span>
            </div>
          )}

          {/* Comment input textarea */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Reviewer Findings & Mandatory Correction Comments</span>
              <span className="text-[11px] text-slate-400">
                {hasComments ? (
                  <strong className="text-amber-400">Comments detected &rarr; Revision loop will activate</strong>
                ) : (
                  <span className="text-emerald-400">Zero comments &rarr; Direct Pass Rule eligible</span>
                )}
              </span>
            </label>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!segregationCheck.allowed}
              placeholder="If revisions are required, enter specific observations (e.g., 'Row 3 autoclave temperature exceeds tolerance. Correct baseline and re-verify.'). If everything is accurate, leave this box completely empty for Direct Pass."
              className="w-full text-xs p-3 rounded-lg bg-slate-950/80 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Action Required input (visible when comments added) */}
          {hasComments && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-medium text-amber-300">
                Specific Action Required from Author:
              </label>
              <input
                type="text"
                value={actionRequired}
                onChange={(e) => setActionRequired(e.target.value)}
                placeholder="e.g. Rectify cell reading on row 3, run AI check, and re-sign with electronic credentials."
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950/80 border border-amber-500/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {/* Dual Action Buttons per Specification */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>
                {hasComments
                  ? 'Clicking below will send the record BACK to the Author Dashboard for mandatory revision.'
                  : 'Zero comments: The document will bypass revision and route straight to the Approver Dashboard.'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {hasComments ? (
                <button
                  type="button"
                  onClick={handleRouteBackForRevision}
                  disabled={!segregationCheck.allowed}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Route BACK to Author for Revision</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDirectPassClick}
                  disabled={!segregationCheck.allowed}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Direct Pass & Electronic Sign-off ("Reviewed By")</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reviewer Signature Modal */}
      {activeDocument && (
        <AuthSignatureModal
          isOpen={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          signatureType="REVIEWED_BY"
          documentTitle={activeDocument.title}
          documentNumber={activeDocument.documentNumber}
          onSign={signReviewedDirectPass}
        />
      )}
    </div>
  );
};
