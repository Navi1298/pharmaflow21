import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Lock,
  ArrowRight,
  Download,
  Database,
  FileCheck2,
  History,
  AlertCircle,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { EditableTableGrid } from './EditableTableGrid';
import { RoleSegregationAlert } from './RoleSegregationAlert';
import { AuthSignatureModal } from './AuthSignatureModal';
import { formatGMPDate } from '../utils/crypto';
import { downloadPDF } from '../utils/pdfGenerator';

export const ApproverDashboard: React.FC = () => {
  const {
    currentUser,
    documents,
    activeDocument,
    selectDocumentById,
    canApproveDocument,
    signApprovedBy,
    setPreviewDocForPDF,
    setActiveTab,
  } = useWorkflow();

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  const pendingApprovalDocs = documents.filter((d) => d.status === 'PENDING_APPROVAL');

  const segregationCheck = activeDocument
    ? canApproveDocument(activeDocument)
    : { allowed: true };

  const isApproved = activeDocument?.status === 'APPROVED';
  const isPendingApproval = activeDocument?.status === 'PENDING_APPROVAL';

  const preparedBySignature = activeDocument?.signatures.find((s) => s.type === 'PREPARED_BY');
  const reviewedBySignature = activeDocument?.signatures.find((s) => s.type === 'REVIEWED_BY');
  const approvedBySignature = activeDocument?.signatures.find((s) => s.type === 'APPROVED_BY');

  const handleOpenPDFPreview = () => {
    if (activeDocument) {
      setPreviewDocForPDF(activeDocument);
    }
  };

  const handleDownloadDirect = () => {
    if (activeDocument) {
      downloadPDF(activeDocument);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Pending Final Release</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{pendingApprovalDocs.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting Executive site approval sign-off</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Dual Segregation Status</span>
            <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold text-teal-300">
            {segregationCheck.allowed ? '3-Tier Segregation Verified' : 'Conflict Detected'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Approver must be distinct from Author and Reviewer
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Prior Reviewer Stamp</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold">
            {reviewedBySignature ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Direct Pass Approved
              </span>
            ) : (
              <span className="text-slate-400">Awaiting QA Stamp</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {reviewedBySignature ? `Signed by ${reviewedBySignature.signerName}` : 'No QA signature'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Final Approval Status</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold">
            {isApproved ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Released & Sealed
              </span>
            ) : (
              <span className="text-amber-400">Pending Execution</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {approvedBySignature ? `Approved by ${approvedBySignature.signerName}` : 'Ready for credential sign-off'}
          </p>
        </div>
      </div>

      {/* Segregation Compliance Alert if User is Author or Reviewer */}
      {!segregationCheck.allowed && (
        <RoleSegregationAlert
          type="APPROVER_ROLE_CONFLICT"
          message={segregationCheck.reason || 'Author or Reviewer cannot approve this record.'}
          recommendedRole="APPROVER"
        />
      )}

      {/* Document Queue Selector */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-purple-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Select Document in Approver Queue:</div>
            <select
              value={activeDocument?.id || ''}
              onChange={(e) => selectDocumentById(e.target.value)}
              className="text-xs font-semibold text-white bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 mt-1 focus:outline-none focus:border-purple-500"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  [{doc.documentNumber}] {doc.title} ({doc.status.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isApproved && (
            <>
              <button
                onClick={handleOpenPDFPreview}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-teal-400" />
                <span>View Generated PDF Preview</span>
              </button>
              <button
                onClick={handleDownloadDirect}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold shadow-md shadow-teal-500/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Active Document Overview & 3-Tier Signature Manifest */}
      {activeDocument && (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-purple-400 font-bold">
                  {activeDocument.documentNumber}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400">v{activeDocument.version}</span>
                <span className="text-slate-500">•</span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    isApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {activeDocument.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{activeDocument.title}</h2>
              <div className="text-xs text-slate-400 mt-0.5">
                Category: <strong className="text-slate-300">{activeDocument.category}</strong> | Created: {formatGMPDate(activeDocument.createdAt)}
              </div>
            </div>

            {/* Approval Execution Trigger Button */}
            <div>
              {isPendingApproval ? (
                <button
                  onClick={() => setIsSignModalOpen(true)}
                  disabled={!segregationCheck.allowed}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs font-bold shadow-xl shadow-purple-500/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Award className="w-5 h-5" />
                  <span>Authorize Final Release & Sign ("Approved By")</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              ) : isApproved ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Officially Approved & Released</span>
                </div>
              ) : (
                <div className="px-4 py-2.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700">
                  Document status is {activeDocument.status}. Requires prior Author & Reviewer stamps before final approval.
                </div>
              )}
            </div>
          </div>

          {/* 3-Tier Electronic Signature Manifest View */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              21 CFR Part 11 Electronic Signature Stamp Manifest
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Box 1: Prepared By */}
              <div className="p-3.5 rounded-lg border border-teal-500/30 bg-teal-950/20">
                <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                  Tier 1: Prepared By (Author)
                </div>
                {preparedBySignature ? (
                  <div className="mt-1 space-y-1">
                    <div className="text-xs font-bold text-white">{preparedBySignature.signerName}</div>
                    <div className="text-[11px] text-slate-300">{preparedBySignature.signerTitle}</div>
                    <div className="text-[10px] text-slate-400 italic">"{preparedBySignature.reason}"</div>
                    <div className="text-[9px] font-mono text-slate-500 pt-1 border-t border-teal-500/20 truncate">
                      {preparedBySignature.checksum}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-slate-500 italic">Not signed yet</div>
                )}
              </div>

              {/* Box 2: Reviewed By */}
              <div className="p-3.5 rounded-lg border border-blue-500/30 bg-blue-950/20">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Tier 2: Reviewed By (Lead QA)
                </div>
                {reviewedBySignature ? (
                  <div className="mt-1 space-y-1">
                    <div className="text-xs font-bold text-white">{reviewedBySignature.signerName}</div>
                    <div className="text-[11px] text-slate-300">{reviewedBySignature.signerTitle}</div>
                    <div className="text-[10px] text-slate-400 italic">"{reviewedBySignature.reason}"</div>
                    <div className="text-[9px] font-mono text-slate-500 pt-1 border-t border-blue-500/20 truncate">
                      {reviewedBySignature.checksum}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-slate-500 italic">Pending QA Review</div>
                )}
              </div>

              {/* Box 3: Approved By */}
              <div className="p-3.5 rounded-lg border border-purple-500/30 bg-purple-950/20">
                <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Tier 3: Approved By (Site VP)
                </div>
                {approvedBySignature ? (
                  <div className="mt-1 space-y-1">
                    <div className="text-xs font-bold text-white">{approvedBySignature.signerName}</div>
                    <div className="text-[11px] text-slate-300">{approvedBySignature.signerTitle}</div>
                    <div className="text-[10px] text-slate-400 italic">"{approvedBySignature.reason}"</div>
                    <div className="text-[9px] font-mono text-slate-500 pt-1 border-t border-purple-500/20 truncate">
                      {approvedBySignature.checksum}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-purple-300/80 font-medium">
                    Awaiting Site Approver Sign-off
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabular Records in Read-Only Inspection Mode */}
      {activeDocument && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Tabular Dataset
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Ready for commercial distribution sign-off
            </span>
          </div>

          <EditableTableGrid
            columns={activeDocument.columns}
            rows={activeDocument.rows}
            isReadOnly={true}
          />
        </div>
      )}

      {/* Approver Signature Modal */}
      {activeDocument && (
        <AuthSignatureModal
          isOpen={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          signatureType="APPROVED_BY"
          documentTitle={activeDocument.title}
          documentNumber={activeDocument.documentNumber}
          onSign={signApprovedBy}
        />
      )}
    </div>
  );
};
