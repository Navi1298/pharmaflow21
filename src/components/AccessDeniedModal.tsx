import React from 'react';
import {
  ShieldAlert,
  Lock,
  UserCheck,
  X,
  AlertTriangle,
  ArrowRight,
  FileEdit,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  attemptedAction?: string;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  isOpen,
  onClose,
  message,
  attemptedAction = 'Drafting Action',
}) => {
  const { currentUser, users, setCurrentUser } = useWorkflow();

  if (!isOpen) return null;

  // Find author personas to switch to
  const authorUsers = users.filter((u) => u.role === 'AUTHOR');
  const defaultAuthor = authorUsers[0];

  const displayMessage =
    message ||
    'Access Denied: Segregation of Duties (FDA 21 CFR Part 11). Only accounts with the Author role are permitted to create or modify draft records.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-rose-500/50 bg-slate-900 shadow-2xl overflow-hidden shadow-rose-950/50">
        {/* Top Warning Glow Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-pulse" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
            <ShieldAlert className="w-7 h-7 animate-pulse" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono uppercase font-bold tracking-wider">
                FDA 21 CFR § 11.10
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono uppercase font-bold">
                GMP Annex 11 §12
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
              <span>Access Denied: Segregation of Duties</span>
              <Lock className="w-4 h-4 text-rose-400" />
            </h2>
            <p className="text-xs text-rose-300/80 mt-0.5 font-medium">
              Attempted Action: <span className="font-semibold text-rose-200">"{attemptedAction}"</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-2 space-y-4">
          {/* Official Compliance Statement Box */}
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-slate-200 text-xs leading-relaxed shadow-inner">
            <p className="font-semibold text-rose-200 text-sm">
              {displayMessage}
            </p>
          </div>

          {/* Persona Conflict Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Active Persona:</span>
              <span className="font-semibold text-white flex items-center gap-2">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-amber-400 shrink-0"
                />
                <span>{currentUser.name}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Active System Role:</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold text-[11px] border border-slate-700">
                {currentUser.role}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Permitted Drafting Role:</span>
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold text-[11px] border border-teal-500/30">
                AUTHOR ONLY
              </span>
            </div>
          </div>

          {/* Explanatory Regulatory Context */}
          <p className="text-[11px] text-slate-400 leading-relaxed">
            In pharmaceutical and regulated manufacturing, reviewers and approvers provide
            independent oversight. To ensure strict non-repudiation and prevent data tampering,
            QA Reviewers and Executive Approvers cannot create, import, or modify draft batch records.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Acknowledge & Dismiss
          </button>

          {defaultAuthor && (
            <button
              onClick={() => {
                setCurrentUser(defaultAuthor);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
            >
              <img
                src={defaultAuthor.avatar}
                alt={defaultAuthor.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-950 shrink-0"
              />
              <span>Switch to {defaultAuthor.name} (Author)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
