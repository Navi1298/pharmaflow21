import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileText,
  KeyRound,
  RotateCcw,
  Award,
  Sparkles,
  ExternalLink,
  UserPlus,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

export const ComplianceMatrixView: React.FC = () => {
  const { users, setIsAddAuthorModalOpen } = useWorkflow();

  const authorUsers = users.filter((u) => u.role === 'AUTHOR');
  const reviewerUser = users.find((u) => u.role === 'REVIEWER');
  const approverUser = users.find((u) => u.role === 'APPROVER');
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Regulatory Compliance Matrix</h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              FDA 21 CFR Part 11 & EU GMP Annex 11
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            This system enforces electronic record validation, dual/triple segregation of duties, non-repudiation of electronic signatures, and automated audit trails required for pharmaceutical and regulated manufacturing industries.
          </p>
        </div>
      </div>

      {/* Compliance Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Electronic Signatures */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 w-fit">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">21 CFR § 11.50 & § 11.70: Signatures</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Electronic signatures must contain printed name of signer, date/time, and meaning (author, review, approval). Signatures are irrevocably bound to records using cryptographic checksums to prevent repudiation or record tampering.
          </p>
          <div className="text-[11px] font-mono text-teal-400 space-y-1 pt-1">
            <div>✓ Prepared By: Author verification</div>
            <div>✓ Reviewed By: Quality assurance check</div>
            <div>✓ Approved By: Commercial release authority</div>
          </div>
        </div>

        {/* Pillar 2: Segregation of Duties */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Segregation of Duties & Dual Control</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            GMP Annex 11 mandates strict separation between operational authoring, QA oversight, and management release. A user cannot review or approve their own record.
          </p>
          <div className="text-[11px] font-mono text-amber-300 space-y-1 pt-1">
            <div>✓ Author cannot act as Reviewer</div>
            <div>✓ Reviewer cannot act as Approver</div>
            <div>✓ Author cannot act as Approver</div>
          </div>
        </div>

        {/* Pillar 3: Immutable Audit Trails */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">21 CFR § 11.10(e): Audit Trails</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Secure, computer-generated, time-stamped audit trails to independently record all operator creations, cell modifications, deletions, AI standardizations, and routing decisions without obscuring previous states.
          </p>
          <div className="text-[11px] font-mono text-indigo-300 space-y-1 pt-1">
            <div>✓ Preserves Old vs New values</div>
            <div>✓ Requires justification for revisions</div>
            <div>✓ Exportable to CSV / JSON</div>
          </div>
        </div>
      </div>

      {/* Role Segregation & Routing Policy Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Workflow Role & Routing Rule Matrix</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            Active System Policy
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="p-3">Role Category</th>
                <th className="p-3">Designated Personnel</th>
                <th className="p-3">Permitted Actions</th>
                <th className="p-3">Strict Separation Guardrails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="p-3 font-semibold text-teal-300">AUTHOR</td>
                <td className="p-3 text-slate-300">
                  <div className="flex flex-wrap items-center gap-2">
                    {authorUsers.map((u) => (
                      <span
                        key={u.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white"
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                        <span className="font-medium">{u.name}</span>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsAddAuthorModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold cursor-pointer transition-colors"
                      title="Enroll a new Author persona"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add Author</span>
                    </button>
                  </div>
                </td>
                <td className="p-3 text-slate-300">
                  Upload CSV/JSON/PDF, load templates, edit tabular data, run AI scanner, sign "Prepared By".
                </td>
                <td className="p-3 text-rose-300 font-mono text-[11px]">
                  Prohibited from QA review or Final approval of own records.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-blue-300">REVIEWER</td>
                <td className="p-3 text-slate-300">
                  {reviewerUser ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white">
                      <img
                        src={reviewerUser.avatar}
                        alt={reviewerUser.name}
                        className="w-4 h-4 rounded-full object-cover shrink-0"
                      />
                      <span className="font-medium">{reviewerUser.name}</span>
                      <span className="text-[10px] text-slate-400">({reviewerUser.title})</span>
                    </span>
                  ) : (
                    'Santosh kumar majji (Lead QA Auditor)'
                  )}
                </td>
                <td className="p-3 text-slate-300">
                  Inspect record data, add mandatory feedback comments to route back for revision, OR apply Direct Pass Rule to route straight to Approver.
                </td>
                <td className="p-3 text-rose-300 font-mono text-[11px]">
                  Strictly barred from creating or modifying drafts (Author-only restriction); cannot review if they authored the record; cannot act as site approver.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-purple-300">APPROVER</td>
                <td className="p-3 text-slate-300">
                  {approverUser ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white">
                      <img
                        src={approverUser.avatar}
                        alt={approverUser.name}
                        className="w-4 h-4 rounded-full object-cover shrink-0"
                      />
                      <span className="font-medium">{approverUser.name}</span>
                      <span className="text-[10px] text-slate-400">({approverUser.title})</span>
                    </span>
                  ) : (
                    'Rajsekhar Gudivada (Site VP)'
                  )}
                </td>
                <td className="p-3 text-slate-300">
                  Inspect complete 3-tier history, verify AI compliance, credential sign-off "Approved By", trigger PDF conversion, and archive to Vault.
                </td>
                <td className="p-3 text-rose-300 font-mono text-[11px]">
                  Strictly barred from creating or modifying drafts (Author-only restriction); must be distinct from Author and Reviewer.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
