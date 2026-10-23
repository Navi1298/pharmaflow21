import React from 'react';
import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

interface RoleSegregationAlertProps {
  type: 'REVIEWER_AUTHOR_CONFLICT' | 'APPROVER_ROLE_CONFLICT' | 'ROLE_MISMATCH';
  message: string;
  recommendedRole: 'REVIEWER' | 'APPROVER' | 'AUTHOR';
}

export const RoleSegregationAlert: React.FC<RoleSegregationAlertProps> = ({
  message,
  recommendedRole,
}) => {
  const { users, setCurrentUser } = useWorkflow();

  const targetUser = users.find((u) => u.role === recommendedRole) || users[0];

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-5 backdrop-blur-md shadow-lg shadow-amber-950/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              21 CFR Part 11 Compliance Enforcement
            </span>
            <span className="text-xs text-amber-400/80 font-mono">GMP Annex 11 §12</span>
          </div>
          <h3 className="text-base font-semibold text-amber-200 mt-1">
            Segregation of Duties Violation
          </h3>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            {message}
          </p>

          <div className="mt-4 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              To proceed compliantly, switch to a designated{' '}
              <strong className="text-amber-300 font-medium">{recommendedRole}</strong> role account.
            </div>
            <button
              onClick={() => setCurrentUser(targetUser)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs transition-colors shadow-sm cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to {targetUser.name} ({targetUser.title})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
