import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  UploadCloud,
  ShieldCheck,
  AlertTriangle,
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileSpreadsheet,
  Lock,
  RefreshCw,
  FolderOpen,
  FilePlus,
  UserCheck,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { EditableTableGrid } from './EditableTableGrid';
import { DocumentUploadModal } from './DocumentUploadModal';
import { AuthSignatureModal } from './AuthSignatureModal';
import { formatGMPDate } from '../utils/crypto';

export const AuthorDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    setCurrentUser,
    documents,
    activeDocument,
    selectDocumentById,
    runAIScanner,
    isScanning,
    aiFixes,
    setIsSidePanelOpen,
    signPreparedBy,
    setActiveTab,
    validateAuthorAccess,
    triggerComplianceAlert,
    setIsAddAuthorModalOpen,
  } = useWorkflow();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Validate active persona author rights per 21 CFR Part 11
  const authorAccess = validateAuthorAccess(currentUser);
  const isAuthor = authorAccess.allowed;
  const authorUser = users.find((u) => u.role === 'AUTHOR');

  // Author's assigned tasks (Drafts, In-Revision, and records authored by active user)
  const authorTasks = documents.filter(
    (d) => d.status === 'DRAFT' || d.status === 'IN_REVISION' || d.authorId === currentUser.id
  );

  const pendingAIFixesCount = aiFixes.filter((f) => f.status === 'PENDING').length;

  const preparedBySignature = activeDocument?.signatures.find((s) => s.type === 'PREPARED_BY');
  const isInRevision = activeDocument?.status === 'IN_REVISION';
  const isDraft = activeDocument?.status === 'DRAFT';
  const canAuthorEdit = isAuthor && (isDraft || isInRevision);

  const handlePrepareNewDocument = () => {
    const access = validateAuthorAccess(currentUser);
    if (!access.allowed) {
      triggerComplianceAlert(access.message, 'Prepare New Document');
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleImportDocument = () => {
    const access = validateAuthorAccess(currentUser);
    if (!access.allowed) {
      triggerComplianceAlert(access.message, 'Import Document (PDF/CSV/JSON)');
      return;
    }
    setIsUploadModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Task Assignment Card */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Assigned Authoring Tasks</span>
            <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {authorTasks.filter((t) => t.status === 'DRAFT' || t.status === 'IN_REVISION').length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending author signature & submission</p>
        </div>

        {/* In-Revision Cycle Card */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">In-Revision Loop</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <RefreshCw className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-300">
            {authorTasks.filter((t) => t.status === 'IN_REVISION').length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Returned by QA Reviewer for edits</p>
        </div>

        {/* AI Scanner Health */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">AI Quality Checker</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {pendingAIFixesCount > 0 ? (
              <span className="text-amber-400">{pendingAIFixesCount} Flags</span>
            ) : (
              <span className="text-emerald-400">Clean</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Nomenclature, typos & format scan</p>
        </div>

        {/* 21 CFR Part 11 Electronic Signature Stamp */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Author Signature</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold truncate">
            {preparedBySignature ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Signed & Verified
              </span>
            ) : (
              <span className="text-slate-400">Not Signed Yet</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono truncate">
            {preparedBySignature ? preparedBySignature.checksum.slice(0, 16) + '...' : 'Requires Password Authentication'}
          </p>
        </div>
      </div>

      {/* 21 CFR Part 11 Role Segregation Notice (When Non-Author Persona Active) */}
      {!isAuthor && (
        <div className="p-4 rounded-xl border-2 border-rose-500/50 bg-rose-950/25 backdrop-blur-md shadow-lg shadow-rose-950/30 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  FDA 21 CFR Part 11 Segregation Barrier Active
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/30 font-mono font-bold">
                  Read-Only Mode
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Active Persona: <strong className="text-white">{currentUser.name}</strong> (
                <span className="text-amber-300 font-mono font-bold">{currentUser.role}</span>). Under FDA 21 CFR § 11.10 and GMP rules, only accounts with the Author role can create documents, click "Prepare New Document", or edit draft tables.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {authorUser && (
              <button
                onClick={() => setCurrentUser(authorUser)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <UserCheck className="w-4 h-4" />
                <span>Switch to Author ({authorUser.name})</span>
              </button>
            )}
            <button
              onClick={() => setIsAddAuthorModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-medium text-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Author</span>
            </button>
          </div>
        </div>
      )}

      {/* Document Selector & Upload Toolbar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-teal-400">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Active Authoring Task:</div>
            <select
              value={activeDocument?.id || ''}
              onChange={(e) => selectDocumentById(e.target.value)}
              className="text-xs font-semibold text-white bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 mt-1 focus:outline-none focus:border-teal-500"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  [{doc.documentNumber}] {doc.title} ({doc.status.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Prepare New Document Button (With Role Segregation Intercept) */}
          <button
            onClick={handlePrepareNewDocument}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              isAuthor
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-400 border border-slate-700/80 opacity-60 cursor-not-allowed hover:bg-slate-800/90'
            }`}
            title={!isAuthor ? authorAccess.message : 'Prepare a new pharmaceutical draft record from template or scratch'}
          >
            {isAuthor ? <FilePlus className="w-4 h-4 text-slate-950" /> : <Lock className="w-4 h-4 text-rose-400" />}
            <span>Prepare New Document</span>
            {!isAuthor && <span className="text-[10px] text-rose-300 font-mono font-normal">(Author Only)</span>}
          </button>

          {/* Import Document Button (With Role Segregation Intercept) */}
          <button
            onClick={handleImportDocument}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
              isAuthor
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer'
                : 'bg-slate-800/60 text-slate-400 border-slate-800 opacity-60 cursor-not-allowed hover:bg-slate-800/70'
            }`}
            title={!isAuthor ? authorAccess.message : 'Import PDF, CSV or JSON source document into authoring grid'}
          >
            {isAuthor ? <UploadCloud className="w-4 h-4 text-teal-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
            <span>Import Document (PDF/CSV/JSON)</span>
            {!isAuthor && <span className="text-[10px] text-rose-300 font-mono font-normal">(Author Only)</span>}
          </button>

          <button
            onClick={() => {
              runAIScanner();
              setIsSidePanelOpen(true);
            }}
            disabled={isScanning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-semibold shadow-md shadow-teal-500/20 transition-all cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Tabular Data...' : 'Run AI Scanner'}</span>
            {pendingAIFixesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-teal-300 text-[10px] font-bold">
                {pendingAIFixesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsAddAuthorModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-medium transition-colors cursor-pointer"
            title="Enroll a new Author persona into the project"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Author</span>
          </button>
        </div>
      </div>

      {/* Revision Loop Feedback Banner (if IN_REVISION) */}
      {isInRevision && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono uppercase font-bold">
                  Revision Cycle #{activeDocument?.activeRevisionCount}
                </span>
                <span className="text-xs text-amber-200 font-semibold">
                  Returned by QA Reviewer: {activeDocument?.reviewerName || 'Santosh kumar majji'}
                </span>
              </div>
              {activeDocument?.reviewComments && activeDocument.reviewComments.length > 0 && (
                <div className="mt-2 p-3 rounded-lg bg-slate-900/80 border border-amber-500/20 text-xs text-amber-100/90 leading-relaxed">
                  <div className="font-semibold text-amber-300 mb-1">Reviewer's Feedback & Comments:</div>
                  <p>"{activeDocument.reviewComments[0].comment}"</p>
                  {activeDocument.reviewComments[0].actionRequired && (
                    <div className="mt-1.5 pt-1.5 border-t border-amber-500/20 text-[11px] text-amber-200/80">
                      <strong>Mandatory Action Required:</strong> {activeDocument.reviewComments[0].actionRequired}
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-300 mt-2">
                Please correct the tabular entries below, re-run the <strong>AI Scanner</strong> to ensure zero errors, and re-sign with your electronic credentials to route the record back for QA review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Active Header */}
      {activeDocument && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-teal-400 font-bold">
                {activeDocument.documentNumber}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">v{activeDocument.version}</span>
              <span className="text-slate-500">•</span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  activeDocument.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : activeDocument.status === 'IN_REVISION'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : activeDocument.status === 'PENDING_REVIEW'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {activeDocument.status.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">{activeDocument.title}</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Author: <strong className="text-slate-200">{activeDocument.authorName}</strong> | Created: {formatGMPDate(activeDocument.createdAt)}
            </div>
          </div>

          {/* Electronic Signature / Submission Button */}
          <div className="flex items-center gap-3">
            {canAuthorEdit ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isInRevision ? 'Re-Authenticate & Re-Submit to Reviewer' : 'Submit & Sign ("Prepared By")'}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            ) : !isAuthor && (isDraft || isInRevision) ? (
              <button
                onClick={() => triggerComplianceAlert(authorAccess.message, 'Submit & Sign ("Prepared By")')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/80 opacity-60 cursor-not-allowed text-xs font-semibold hover:bg-slate-800/90 transition-colors"
                title={authorAccess.message}
              >
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Submit & Sign ("Prepared By")</span>
                <span className="text-[10px] text-rose-300 font-mono font-normal">(Author Role Required)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Document Signed & In Review Workflow</span>
                <button
                  onClick={() => setActiveTab('reviewer')}
                  className="text-teal-400 hover:underline font-semibold ml-1 cursor-pointer"
                >
                  View Reviewer Dashboard &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Editable Table Grid */}
      {activeDocument ? (
        <div className="space-y-4">
          <EditableTableGrid
            columns={activeDocument.columns}
            rows={activeDocument.rows}
            isReadOnly={!canAuthorEdit}
          />

          {/* 21 CFR Part 11 Electronic Signature Stamp Card */}
          {preparedBySignature && (
            <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-950/15 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-teal-300 flex items-center gap-2">
                      <span>Electronic Signature Stamp: Prepared By</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 border border-teal-500/30 font-mono">
                        21 CFR Part 11 Compliant
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      Prepared by: {preparedBySignature.signerName}
                    </div>
                    <div className="text-xs text-slate-300">
                      {preparedBySignature.signerTitle} • {formatGMPDate(preparedBySignature.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="text-slate-400 font-mono text-[10px]">
                    Hash: {preparedBySignature.checksum}
                  </div>
                  <div className="text-emerald-400 font-semibold text-[11px] mt-0.5">
                    ✓ Non-Repudiation Verified
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 rounded-xl border border-slate-800 bg-slate-900/50">
          No active document selected. Import a file or select a task from the dropdown.
        </div>
      )}

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {activeDocument && (
        <AuthSignatureModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          signatureType="PREPARED_BY"
          documentTitle={activeDocument.title}
          documentNumber={activeDocument.documentNumber}
          onSign={signPreparedBy}
        />
      )}
    </div>
  );
};
