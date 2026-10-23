import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, X, Stamp, CheckCircle2 } from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

interface AuthSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  signatureType: 'PREPARED_BY' | 'REVIEWED_BY' | 'APPROVED_BY';
  documentTitle: string;
  documentNumber: string;
  onSign: (password: string, reason: string) => Promise<{ success: boolean; error?: string }>;
}

export const AuthSignatureModal: React.FC<AuthSignatureModalProps> = ({
  isOpen,
  onClose,
  signatureType,
  documentTitle,
  documentNumber,
  onSign,
}) => {
  const { currentUser } = useWorkflow();

  const getDefaultReason = () => {
    switch (signatureType) {
      case 'PREPARED_BY':
        return 'I author and verify the accuracy of this record per SOP-2104';
      case 'REVIEWED_BY':
        return 'I confirm data integrity, zero discrepancies, and procedural adherence';
      case 'APPROVED_BY':
        return 'Authorized for commercial release and GMP archive per 21 CFR Part 11';
    }
  };

  const getRoleLabel = () => {
    switch (signatureType) {
      case 'PREPARED_BY':
        return 'Author Sign-off ("Prepared By")';
      case 'REVIEWED_BY':
        return 'QA Reviewer Sign-off ("Reviewed By")';
      case 'APPROVED_BY':
        return 'Final Site Authorization ("Approved By")';
    }
  };

  const [password, setPassword] = useState('');
  const [reason, setReason] = useState(getDefaultReason());
  const [hasAcknowledged, setHasAcknowledged] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.trim().length === 0) {
      setError('Please enter your authentication password.');
      return;
    }
    if (!hasAcknowledged) {
      setError('You must acknowledge the 21 CFR Part 11 electronic signature disclaimer.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSign(password, reason);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Authentication challenge failed.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">21 CFR Part 11 Electronic Signature</h3>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  § 11.200
                </span>
              </div>
              <p className="text-xs text-slate-400">{getRoleLabel()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Document Info */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs">
            <div className="text-slate-400">Target Document:</div>
            <div className="font-semibold text-slate-200 mt-0.5">{documentNumber} — {documentTitle}</div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Signer Identity (Pre-filled & Verified) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Authenticated Signer Identity</span>
              <span className="text-teal-400 font-mono text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Identity Bound
              </span>
            </label>
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-700">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border border-teal-500/40 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.title} • ID: {currentUser.employeeId}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Meaning of Signature */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Meaning / Legal Intent of Signature (21 CFR §11.50)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-slate-200 focus:outline-none focus:border-teal-500"
            >
              {signatureType === 'PREPARED_BY' && (
                <>
                  <option value="I author and verify the accuracy of this record per SOP-2104">
                    Author - I author and verify the accuracy of this record per SOP-2104
                  </option>
                  <option value="Original draft compilation based on qualified batch instrumentation">
                    Author - Original draft compilation based on qualified batch instrumentation
                  </option>
                  <option value="Re-submitted revision post corrective feedback and AI verification">
                    Author - Re-submitted revision post corrective feedback and AI verification
                  </option>
                </>
              )}
              {signatureType === 'REVIEWED_BY' && (
                <>
                  <option value="I confirm data integrity, zero discrepancies, and procedural adherence">
                    Reviewer - Direct Pass: I confirm data integrity, zero discrepancies, and procedural adherence
                  </option>
                  <option value="Verified analytical limits against USP / EP pharmacopeial specifications">
                    Reviewer - Verified analytical limits against USP / EP pharmacopeial specifications
                  </option>
                </>
              )}
              {signatureType === 'APPROVED_BY' && (
                <>
                  <option value="Authorized for commercial release and GMP archive per 21 CFR Part 11">
                    Approver - Authorized for commercial release and GMP archive per 21 CFR Part 11
                  </option>
                  <option value="Executive site release and formal archive authorization">
                    Approver - Executive site release and formal archive authorization
                  </option>
                </>
              )}
            </select>
          </div>

          {/* Password Authentication */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Re-enter Password / Credential Challenge</span>
              <span className="text-[11px] text-slate-400">Demo test password: any value or <code className="text-teal-300">pharma123</code></span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your system password..."
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg bg-slate-950/80 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                autoFocus
              />
            </div>
          </div>

          {/* Legal Compliance Acknowledgment Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/40 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAcknowledged}
              onChange={(e) => setHasAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-teal-500 focus:ring-0 bg-slate-900 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 leading-snug">
              I acknowledge that this electronic signature is the legally binding equivalent of my handwritten signature under FDA 21 CFR Part 11, and cannot be retracted once committed.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Validating Signature...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Stamp Electronic Signature</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
