import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  FileCheck2,
  Award,
  Database,
  History,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  FlaskConical,
  Activity,
  Layers,
  ChevronDown,
  BookOpen,
  UserPlus,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    documents,
    currentUser,
    users,
    setCurrentUser,
    setIsAddAuthorModalOpen,
  } = useWorkflow();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentUtc, setCurrentUtc] = useState<string>('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentUtc(
        now.toUTCString().split(' ').slice(1, 5).join(' ') + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute Badge Counts
  const authorCount = documents.filter(
    (d) => d.status === 'DRAFT' || d.status === 'IN_REVISION'
  ).length;
  const reviewerCount = documents.filter((d) => d.status === 'PENDING_REVIEW').length;
  const approverCount = documents.filter((d) => d.status === 'PENDING_APPROVAL').length;
  const repositoryCount = documents.filter((d) => d.repositoryStored || d.status === 'APPROVED').length;
  const auditLogsCount = documents.reduce((acc, d) => acc + d.auditTrail.length, 0);

  const navItems = [
    {
      id: 'author' as const,
      label: 'Author Dashboard',
      description: 'Document upload & AI error check',
      icon: FileEdit,
      badge: authorCount,
      badgeColor: authorCount > 0 ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' : 'bg-slate-800 text-slate-400',
    },
    {
      id: 'reviewer' as const,
      label: 'Reviewer Dashboard',
      description: 'Inspection & revision routing',
      icon: FileCheck2,
      badge: reviewerCount,
      badgeColor: reviewerCount > 0 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-slate-800 text-slate-400',
    },
    {
      id: 'approver' as const,
      label: 'Approver Dashboard',
      description: 'Final release sign-off & PDF',
      icon: Award,
      badge: approverCount,
      badgeColor: approverCount > 0 ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-slate-800 text-slate-400',
    },
    {
      id: 'repository' as const,
      label: 'Secure Repository',
      description: 'Archived records & PDF vault',
      icon: Database,
      badge: repositoryCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'audittrail' as const,
      label: 'Audit Trail Ledger',
      description: '21 CFR Part 11 immutable logs',
      icon: History,
      badge: auditLogsCount,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'compliance' as const,
      label: 'Compliance Matrix',
      description: 'Regulatory rules & segregation',
      icon: ShieldCheck,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'guide' as const,
      label: 'System Guide & Manual',
      description: 'How it works & testing guide',
      icon: BookOpen,
      badge: 'Guide',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-teal-500/30 p-1 flex items-center justify-center shadow-lg shadow-teal-500/10 shrink-0">
              <img
                src="/pharmaflow-icon-transparent.png"
                alt="PharmaFlow 21 Logo"
                className="w-10 h-10 object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight leading-tight">PharmaFlow 21</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono font-bold">
                  v2.4
                </span>
              </div>
              <div className="text-[10px] text-teal-400 font-medium flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>21 CFR Part 11 Validated</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5 font-medium">
                Developed by: <span className="text-teal-300 font-semibold">Mr. Naveen Kumar Majji</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Role Switcher Quick Pill */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-slate-900 border border-slate-800 relative">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 px-1">
            <span>Active Session Account</span>
            <span className="font-mono text-[10px] text-teal-400">Mock Switcher</span>
          </div>

          <div
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 transition-all cursor-pointer group"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full border border-teal-500/40 object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate group-hover:text-teal-300 transition-colors">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser.title}</div>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                currentUser.role === 'AUTHOR'
                  ? 'bg-teal-500/20 text-teal-300'
                  : currentUser.role === 'REVIEWER'
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-purple-500/20 text-purple-300'
              }`}
            >
              {currentUser.role}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          </div>

          {/* Role Dropdown Menu */}
          {isRoleDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 p-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Test Persona:
              </div>
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                    currentUser.id === u.id
                      ? 'bg-teal-500/20 text-white'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{u.title}</div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {u.role}
                  </span>
                </div>
              ))}
              <div className="pt-1.5 mt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    setIsAddAuthorModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add New Author Persona</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Lifecycle Dashboards
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-teal-500/5 text-white border border-teal-500/30 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className={`text-xs ${isActive ? 'font-bold text-white' : 'font-medium'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{item.description}</div>
                  </div>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live GMP System Clock & Compliance Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950 space-y-2">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-teal-400" />
                <span>GMP System Clock</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <div className="text-xs font-bold font-mono text-white mt-1">
              {currentTime || '13:45:00 Local'}
            </div>
            <div className="text-[10px] font-mono text-slate-400">{currentUtc}</div>
          </div>

          <div className="text-[10px] text-slate-500 text-center font-mono">
            FDA CFR 21.11 • GAMP 5 • EU Annex 11
          </div>
        </div>
      </aside>
    </>
  );
};
