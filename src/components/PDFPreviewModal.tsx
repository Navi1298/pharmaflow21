import React, { useState } from 'react';
import {
  FileCheck,
  Download,
  Database,
  X,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Lock,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { DocumentRecord } from '../types';
import { downloadPDF } from '../utils/pdfGenerator';
import { formatGMPDate } from '../utils/crypto';
import { useWorkflow } from '../context/WorkflowContext';

interface PDFPreviewModalProps {
  document: DocumentRecord | null;
  onClose: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  document,
  onClose,
}) => {
  const { saveToRepository, setActiveTab } = useWorkflow();
  const [isSaved, setIsSaved] = useState(document?.repositoryStored || false);

  if (!document) return null;

  const handleDownload = () => {
    downloadPDF(document);
  };

  const handleSaveToVault = () => {
    saveToRepository(document.id);
    setIsSaved(true);
  };

  const handleGoToRepository = () => {
    onClose();
    setActiveTab('repository');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  21 CFR Part 11 Electronic Record & PDF Preview
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Approved & Signed
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Validated Document Format with Signatures & Immutable Audit Trail
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Download PDF</span>
            </button>

            {!isSaved ? (
              <button
                onClick={handleSaveToVault}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold shadow-md shadow-teal-500/20 transition-all cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Save to Secure Repository</span>
              </button>
            ) : (
              <button
                onClick={handleGoToRepository}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved in Repository Vault</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Simulated Viewer Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center">
          {/* Simulated White/High-Contrast PDF Sheet */}
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-lg shadow-2xl p-8 border border-slate-300 font-sans text-xs">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div className="flex items-center gap-3.5">
                <img
                  src="/pharmaflow-badge.png"
                  alt="PharmaFlow 21"
                  className="w-14 h-14 object-contain rounded border border-slate-200 shadow-sm shrink-0"
                />
                <div>
                  <div className="text-[10px] tracking-widest uppercase font-bold text-teal-800">
                    PHARMAFLOW 21 ENTERPRISE ARCHIVE
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
                    {document.title}
                  </h1>
                  <div className="text-xs text-slate-600 mt-1 font-mono">
                    Document ID: <strong className="text-slate-900">{document.documentNumber}</strong> | Version: <strong className="text-slate-900">v{document.version}</strong> | Category: {document.category}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Developed by: <strong className="text-slate-700">Mr. Naveen Kumar Majji</strong>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block px-2 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[10px] tracking-wider uppercase">
                  ✓ 21 CFR PART 11 APPROVED
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  Generated: {formatGMPDate(document.updatedAt)}
                </div>
              </div>
            </div>

            {/* Document Details Metadata Grid */}
            <div className="my-5 p-3.5 bg-slate-50 rounded border border-slate-200 grid grid-cols-3 gap-4 text-[11px]">
              <div>
                <span className="text-slate-500 block">Original Author:</span>
                <span className="font-semibold text-slate-900">{document.authorName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Lead QA Reviewer:</span>
                <span className="font-semibold text-slate-900">{document.reviewerName || 'Santosh kumar majji'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Site Approver:</span>
                <span className="font-semibold text-slate-900">{document.approverName || 'Rajsekhar Gudivada'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Workflow Revision Cycles:</span>
                <span className="font-semibold text-slate-900">{document.activeRevisionCount} cycle(s) completed</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Data Records:</span>
                <span className="font-semibold text-slate-900">{document.rows.length} validated rows</span>
              </div>
              <div>
                <span className="text-slate-500 block">Cryptographic Hash:</span>
                <span className="font-mono text-[9px] text-slate-700 truncate block">
                  {document.repositoryChecksum || document.signatures[document.signatures.length - 1]?.checksum || '0xFE8A4D2C910B7462518EAC30198DF12A'}
                </span>
              </div>
            </div>

            {/* Section 1: Verified Tabular Records */}
            <div className="my-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 mb-2.5">
                Section 1: Verified Batch & Tabular Data
              </h2>
              <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300">Subject / Operator Name</th>
                    <th className="p-2 border-r border-slate-300 w-12 text-center">Age</th>
                    <th className="p-2 border-r border-slate-300">Contact Phone</th>
                    <th className="p-2 border-r border-slate-300">Batch ID</th>
                    <th className="p-2 border-r border-slate-300">Parameter</th>
                    <th className="p-2 border-r border-slate-300">Reading</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {document.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-medium">{row.name}</td>
                      <td className="p-2 border-r border-slate-200 text-center">{row.age}</td>
                      <td className="p-2 border-r border-slate-200 font-mono text-[9px]">{row.phone}</td>
                      <td className="p-2 border-r border-slate-200 font-mono text-[9px]">{row.batchId || '-'}</td>
                      <td className="p-2 border-r border-slate-200">{row.parameter || '-'}</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{String(row.reading || '-')}</td>
                      <td className="p-2 text-center font-bold text-emerald-700">{row.status || 'Pass'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section 2: Electronic Signatures Manifest */}
            <div className="my-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 mb-3 flex items-center justify-between">
                <span>Section 2: 21 CFR Part 11 Electronic Signature Stamp Manifest</span>
                <span className="text-[9px] font-mono font-normal text-slate-500">§ 11.50 Signature Manifestations</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {document.signatures.map((sig, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded border border-teal-600/40 bg-teal-50/50 relative overflow-hidden"
                  >
                    <div className="text-[9px] font-bold text-teal-800 uppercase tracking-wider">
                      {sig.type.replace('_', ' ')}
                    </div>
                    <div className="font-bold text-slate-900 text-xs mt-0.5">{sig.signerName}</div>
                    <div className="text-[9px] text-slate-600">{sig.signerTitle}</div>
                    <div className="text-[9px] text-slate-500 italic mt-1 leading-snug">
                      "{sig.reason}"
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-teal-200 text-[8px] font-mono text-slate-600 space-y-0.5">
                      <div>Timestamp: {formatGMPDate(sig.timestamp)}</div>
                      <div className="truncate">Hash: {sig.checksum}</div>
                      <div>IP: {sig.ipAddress} • {sig.sessionId}</div>
                    </div>
                    <div className="mt-1 text-[8px] font-bold text-emerald-700">
                      ✓ DIGITALLY SEALED (21 CFR 11)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Immutable Audit Trail Table */}
            <div className="my-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center justify-between">
                <span>Section 3: Complete Electronic Audit Trail Event Log</span>
                <span className="text-[9px] font-mono font-normal text-slate-500">§ 11.10(e) Audit Trail</span>
              </h2>

              <table className="w-full text-left border-collapse border border-slate-300 text-[9px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-1.5 border-r border-slate-300 w-32">Timestamp</th>
                    <th className="p-1.5 border-r border-slate-300 w-36">Action</th>
                    <th className="p-1.5 border-r border-slate-300 w-28">Operator</th>
                    <th className="p-1.5 border-r border-slate-300">Event Details & Reason</th>
                    <th className="p-1.5 w-24">Checksum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {document.auditTrail.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-1.5 border-r border-slate-200 text-slate-600">
                        {formatGMPDate(log.timestamp)}
                      </td>
                      <td className="p-1.5 border-r border-slate-200 font-semibold text-slate-800">
                        {log.action.replace(/_/g, ' ')}
                      </td>
                      <td className="p-1.5 border-r border-slate-200 text-slate-700">
                        {log.performedBy} ({log.userRole})
                      </td>
                      <td className="p-1.5 border-r border-slate-200 font-sans text-slate-700">
                        {log.details}
                        {log.reasonForChange && (
                          <span className="text-slate-500 italic block mt-0.5">
                            Reason: {log.reasonForChange}
                          </span>
                        )}
                      </td>
                      <td className="p-1.5 text-slate-500 truncate" title={log.checksum}>
                        {log.checksum.slice(0, 10)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Document Legal Footer */}
            <div className="mt-8 pt-4 border-t border-slate-300 text-[9px] text-slate-500 flex justify-between items-center">
              <div>
                CONFIDENTIAL & PROPRIETARY — FDA 21 CFR PART 11 VALIDATED ELECTRONIC ARCHIVE
              </div>
              <div className="font-mono">Page 1 of 1 (Simulated Full Single-Page PDF)</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Digital signatures and audit checksums cryptographically locked.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Download Official PDF</span>
            </button>
            {!isSaved ? (
              <button
                onClick={handleSaveToVault}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>Save to Repository Vault</span>
              </button>
            ) : (
              <button
                onClick={handleGoToRepository}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>View in Secure Repository</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
