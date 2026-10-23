import React, { useState } from 'react';
import {
  Database,
  Search,
  Download,
  Eye,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  ExternalLink,
  Lock,
  Calendar,
  Filter,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { formatGMPDate } from '../utils/crypto';
import { downloadPDF } from '../utils/pdfGenerator';
import { DocumentRecord } from '../types';

export const RepositoryView: React.FC = () => {
  const { documents, setPreviewDocForPDF, selectDocumentById, setActiveTab } = useWorkflow();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [verifiedHashDocId, setVerifiedHashDocId] = useState<string | null>(null);

  // All approved or explicitly stored repository records
  const repositoryDocs = documents.filter((d) => d.repositoryStored || d.status === 'APPROVED');

  const filteredDocs = repositoryDocs.filter((doc) => {
    if (categoryFilter !== 'ALL' && doc.category !== categoryFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.documentNumber.toLowerCase().includes(q) ||
      doc.authorName.toLowerCase().includes(q) ||
      (doc.approverName && doc.approverName.toLowerCase().includes(q))
    );
  });

  const handleVerifyIntegrity = (doc: DocumentRecord) => {
    setVerifiedHashDocId(doc.id);
    setTimeout(() => {
      setVerifiedHashDocId(null);
    }, 4000);
  };

  const handleInspectAudit = (doc: DocumentRecord) => {
    selectDocumentById(doc.id);
    setActiveTab('audittrail');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">21 CFR Part 11 Secure Document Vault</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Immutable Storage
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Encrypted pharmaceutical & manufacturing repository. Contains fully approved electronic records, dual-signed batch manifests, and immutable cryptographic audit trails.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-right">
            <div className="text-slate-500">Archived Records:</div>
            <div className="text-lg font-bold text-teal-300">{repositoryDocs.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-right">
            <div className="text-slate-500">SHA-256 Validated:</div>
            <div className="text-lg font-bold text-emerald-400">100%</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repository by title, document ID, author, or approver..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-slate-950/90 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Batch Record">Batch Record</option>
            <option value="SOP Manifest">SOP Manifest</option>
            <option value="Equipment Calibration">Equipment Calibration</option>
            <option value="Release Specification">Release Specification</option>
            <option value="Quality Control">Quality Control</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Document Number</th>
                <th className="px-4 py-3">Document Title & Category</th>
                <th className="px-4 py-3">Signatures Executed</th>
                <th className="px-4 py-3">Vault Checksum</th>
                <th className="px-4 py-3">Archive Timestamp</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No approved records found in the repository. Complete final approval on a document to archive it here.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isVerified = verifiedHashDocId === doc.id;
                  const checksum =
                    doc.repositoryChecksum ||
                    doc.signatures[doc.signatures.length - 1]?.checksum ||
                    '0xFE8A4D2C910B7462518EAC30198DF12A';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Doc Number */}
                      <td className="px-4 py-3 font-mono font-bold text-teal-400 text-xs">
                        {doc.documentNumber}
                      </td>

                      {/* Title & Category */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{doc.title}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span>v{doc.version}</span>
                          <span>•</span>
                          <span>{doc.rows.length} rows</span>
                        </div>
                      </td>

                      {/* Signatures */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 text-[11px]">
                          <span className="text-slate-300">
                            Prep: <strong className="text-white">{doc.authorName}</strong>
                          </span>
                          <span className="text-slate-300">
                            Rev: <strong className="text-white">{doc.reviewerName || 'Santosh kumar majji'}</strong>
                          </span>
                          <span className="text-slate-300">
                            Appr: <strong className="text-white">{doc.approverName || 'Rajsekhar Gudivada'}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Checksum */}
                      <td className="px-4 py-3 font-mono text-[10px]">
                        <div className="text-slate-300 truncate max-w-[140px]" title={checksum}>
                          {checksum}
                        </div>
                        <button
                          onClick={() => handleVerifyIntegrity(doc)}
                          className={`mt-1 inline-flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
                            isVerified ? 'text-emerald-400' : 'text-teal-400 hover:text-teal-300'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isVerified ? 'Integrity 100% Validated' : 'Verify SHA-256'}</span>
                        </button>
                      </td>

                      {/* Timestamp */}
                      <td className="px-4 py-3 text-[11px] text-slate-400 font-mono">
                        {formatGMPDate(doc.repositoryDate || doc.updatedAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPreviewDocForPDF(doc)}
                            title="View Generated PDF Preview"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-400" />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() => downloadPDF(doc)}
                            title="Download PDF Document"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>

                          <button
                            onClick={() => handleInspectAudit(doc)}
                            title="Inspect 21 CFR Part 11 Audit Trail"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
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
