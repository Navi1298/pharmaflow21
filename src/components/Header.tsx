import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  FileCheck2,
  Users,
  ChevronDown,
  BookOpen,
  UserPlus,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    activeTab,
    currentUser,
    users,
    setCurrentUser,
    activeDocument,
    canReviewDocument,
    canApproveDocument,
    aiFixes,
    runAIScanner,
    isScanning,
    setIsSidePanelOpen,
    notifications,
    dismissNotification,
    setIsAddAuthorModalOpen,
  } = useWorkflow();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const pendingAIFixes = aiFixes.filter((f) => f.status === 'PENDING').length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const getTitle = () => {
    switch (activeTab) {
      case 'author':
        return {
          title: 'Author Dashboard — Task Assignment & Data Preparation',
          subtitle: 'Upload batch files, edit tabular data, run AI error checker & sign "Prepared By"',
        };
      case 'reviewer':
        return {
          title: 'Reviewer Dashboard — Quality Inspection & Routing',
          subtitle: 'Enforce strict author segregation: Route back for revision OR apply Direct Pass Rule',
        };
      case 'approver':
        return {
          title: 'Approver Dashboard — Site Release Authorization',
          subtitle: 'Dual-segregated executive sign-off, automatic PDF generation & secure vault storage',
        };
      case 'repository':
        return {
          title: 'Secure Document Repository — 21 CFR Part 11 Archive',
          subtitle: 'Browse, verify SHA-256 integrity, and download certified regulatory PDFs',
        };
      case 'audittrail':
        return {
          title: 'Audit Trail Ledger — 21 CFR § 11.10(e) Event Chronicle',
          subtitle: 'Immutable record of all creations, AI fixes, edits, electronic stamps, and decisions',
        };
      case 'compliance':
        return {
          title: 'Compliance & Segregation Policy Matrix',
          subtitle: 'Good Manufacturing Practice (GMP Annex 11) & FDA 21 CFR Part 11 specifications',
        };
      case 'guide':
        return {
          title: 'System Guide & Operational Manual',
          subtitle: 'End-to-end walkthrough of all phases, the need for reviewer/approver, and testing scenarios',
        };
    }
  };

  const headerInfo = getTitle();

  // Check segregation for current document in active view
  const isReviewConflict =
    activeTab === 'reviewer' && activeDocument && !canReviewDocument(activeDocument).allowed;
  const isApprovalConflict =
    activeTab === 'approver' && activeDocument && !canApproveDocument(activeDocument).allowed;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand Logo, Mobile hamburger & Active view info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white lg:hidden cursor-pointer shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Integrated App Logo next to title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-teal-500/30 p-1 flex items-center justify-center shadow-md shadow-teal-500/10">
              <img
                src="/pharmaflow-icon-transparent.png"
                alt="PharmaFlow 21 Logo"
                className="w-7 h-7 object-contain"
              />
            </div>
            {/* Mobile / Tablet Brand Title */}
            <div className="lg:hidden flex items-center gap-1.5">
              <span className="font-bold text-white text-sm tracking-tight">PharmaFlow 21</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-mono font-bold">
                v2.4
              </span>
            </div>
          </div>

          <div className="hidden lg:block h-6 w-px bg-slate-800"></div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm lg:text-base font-bold text-white tracking-tight truncate">
                {headerInfo.title}
              </h1>
              {isReviewConflict && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  <ShieldAlert className="w-3 h-3" /> Segregation Barrier
                </span>
              )}
              {isApprovalConflict && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                  <ShieldAlert className="w-3 h-3" /> Approver Barrier
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5 truncate">{headerInfo.subtitle}</p>
          </div>
        </div>

        {/* Right: Quick Role Switcher, AI Button, Notifications */}
        <div className="flex items-center gap-3">
          {/* AI Scanner Button */}
          {activeTab === 'author' && (
            <button
              onClick={() => {
                runAIScanner();
                setIsSidePanelOpen(true);
              }}
              disabled={isScanning}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>AI Scanner</span>
              {pendingAIFixes > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {pendingAIFixes}
                </span>
              )}
            </button>
          )}

          {/* Project Guide PDF Download Button */}
          <a
            href="/PharmaFlow21_Comprehensive_Project_Guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download="PharmaFlow21_Comprehensive_Project_Guide.pdf"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
            title="Download Comprehensive Project Explanation Guide PDF"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Project Guide (PDF)</span>
          </a>

          {/* Quick Mock Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-teal-400/60 shadow-sm shrink-0"
              />
              <span className="font-semibold hidden md:inline">{currentUser.name}</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                  currentUser.role === 'AUTHOR'
                    ? 'bg-teal-500/20 text-teal-300'
                    : currentUser.role === 'REVIEWER'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-purple-500/20 text-purple-300'
                }`}
              >
                {currentUser.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown popup */}
            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Active Role (Test 21 CFR Rules):
                </div>
                <div className="mt-1 space-y-1">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setIsRoleMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        currentUser.id === user.id
                          ? 'bg-teal-500/20 text-white border border-teal-500/30'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate">{user.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{user.title}</div>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add New Author Action Button */}
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      setIsAddAuthorModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add New Author Persona</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 animate-fade-in max-h-96 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">System Notifications</span>
                  <span className="text-[10px] text-teal-400 font-mono">
                    {notifications.length} events
                  </span>
                </div>
                <div className="overflow-y-auto space-y-2 py-2 flex-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{notif.title}</span>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
