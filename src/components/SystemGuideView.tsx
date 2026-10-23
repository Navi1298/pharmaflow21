import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  Download,
  AlertTriangle,
  RotateCcw,
  Award,
  Database,
  History,
  FileCheck2,
  ArrowRight,
  Lock,
  Layers,
  HelpCircle,
  ExternalLink,
  Search,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

export const SystemGuideView: React.FC = () => {
  const { setActiveTab } = useWorkflow();
  const [activeSection, setActiveSection] = useState<'overview' | 'phases' | 'testing'>('overview');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">System Architecture & Complete Operational Guide</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Official User Manual
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Complete reference manual explaining every page, module, role segregation rule, and step-by-step instructions on how to test every scenario in PharmaFlow 21.
            </p>
          </div>
        </div>

        <a
          href="/PharmaFlow21_Comprehensive_Project_Guide.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download="PharmaFlow21_Comprehensive_Project_Guide.pdf"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Official PDF Guide</span>
        </a>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSection === 'overview'
              ? 'bg-indigo-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          1. System Purpose & Core Concepts
        </button>
        <button
          onClick={() => setActiveSection('phases')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSection === 'phases'
              ? 'bg-indigo-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          2. All Webpage Phases & Role Breakdown
        </button>
        <button
          onClick={() => setActiveSection('testing')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSection === 'testing'
              ? 'bg-indigo-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          3. How to Test & Verify the Project (Hands-On Scenarios)
        </button>
      </div>

      {/* SECTION 1: SYSTEM PURPOSE & CORE CONCEPTS */}
      {activeSection === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Card 1: The Problem and Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-950/10 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>The Industry Problem (Paper Batch Records)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                In pharmaceutical manufacturing, every single medicine batch requires strict documentation called a <strong>Batch Manufacturing Record (BMR)</strong>. Traditionally, factories used physical clipboards, paper logbooks, and binders. This led to:
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li><strong className="text-slate-200">Transcription errors:</strong> Illegible handwriting or miscalculated dosages causing multi-million dollar product recalls.</li>
                <li><strong className="text-slate-200">Conflict of interest:</strong> Operators who made mistakes reviewing or signing off on their own work without independent oversight.</li>
                <li><strong className="text-slate-200">Untracked alterations:</strong> White-out, crossed-out numbers, or missing pages with no audit trail, violating FDA regulations.</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-teal-500/30 bg-teal-950/10 space-y-2.5">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>The PharmaFlow 21 Solution</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                PharmaFlow 21 is a 100% digital, paperless workflow system strictly engineered to comply with <strong>FDA 21 CFR Part 11</strong> and <strong>EU GMP Annex 11</strong>:
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li><strong className="text-slate-200">Native Ingestion:</strong> Drag and drop PDF, CSV, or JSON files to automatically extract and populate editable tables.</li>
                <li><strong className="text-slate-200">AI Quality Gating:</strong> Scans for compound typos, casing anomalies, and out-of-range parameters before submission.</li>
                <li><strong className="text-slate-200">Strict Segregation of Duties:</strong> Authors cannot review; neither Authors nor Reviewers can grant final approval.</li>
                <li><strong className="text-slate-200">Immutable Audit Trail:</strong> Every cell edit, previous value, new value, and signature is cryptographically stamped.</li>
              </ul>
            </div>
          </div>

          {/* Core Regulatory Pillars */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>What is FDA 21 CFR Part 11? (The Legal Standard)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Title 21 of the Code of Federal Regulations Part 11 is the United States FDA law establishing criteria under which electronic records and electronic signatures are considered trustworthy, reliable, and legally equivalent to paper records. PharmaFlow 21 enforces all key clauses:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-teal-300">§ 11.10(e) Audit Trails</div>
                <div className="text-slate-400 text-[11px]">
                  Computer-generated, time-stamped audit trails independently recording all operator creations, edits, and deletions without overwriting previous data.
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-teal-300">§ 11.50 Signature Intent</div>
                <div className="text-slate-400 text-[11px]">
                  Every signature includes the printed name of the signer, date/time, and the explicit legal meaning (e.g. "Prepared By", "Reviewed By", "Approved By").
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-teal-300">§ 11.200 Non-Repudiation</div>
                <div className="text-slate-400 text-[11px]">
                  Requires two distinct identification components (username + password challenge). Signatures cannot be falsified, copied, or repudiated.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ALL WEBPAGE PHASES & ROLE BREAKDOWN */}
      {activeSection === 'phases' && (
        <div className="space-y-6 animate-fade-in">
          {/* Phase 1: Author Dashboard */}
          <div className="p-5 rounded-xl border border-teal-500/30 bg-slate-900/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs">Phase 1</span>
                <h3 className="text-sm font-bold text-white">Author Dashboard & Data Preparation</h3>
              </div>
              <button
                onClick={() => setActiveTab('author')}
                className="text-xs text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Go to Dashboard &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <strong className="text-teal-300 block mb-1">What It Represents:</strong>
                <p className="text-slate-300 leading-relaxed">
                  The operational origin of manufacturing documentation. Formulation scientists (e.g. NAVEEN KUMAR MAJJI) or process engineers enter assay readings, lot numbers, sensor measurements, and operator notes.
                </p>
              </div>
              <div>
                <strong className="text-teal-300 block mb-1">Key Actions on This Page:</strong>
                <ul className="text-slate-400 space-y-1 list-disc pl-4">
                  <li><strong>Document Import:</strong> Drag & drop source PDFs, CSVs, or select pre-loaded GMP templates.</li>
                  <li><strong>Editable Grid:</strong> Click any cell to edit inline; add or delete rows with audit timestamps.</li>
                  <li><strong>AI Scanner:</strong> Run the AI Scanner to catch typos and casing errors before submission.</li>
                  <li><strong>Electronic Signature:</strong> Authenticate credentials to apply "Prepared by: [User Name]".</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Phase 2: Reviewer Dashboard */}
          <div className="p-5 rounded-xl border border-blue-500/30 bg-slate-900/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-blue-500/20 text-blue-300 font-bold text-xs">Phase 2</span>
                <h3 className="text-sm font-bold text-white">Reviewer Dashboard & The Need for QA</h3>
              </div>
              <button
                onClick={() => setActiveTab('reviewer')}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Go to Dashboard &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <strong className="text-blue-300 block mb-1">What is the Need of a Reviewer?</strong>
                <p className="text-slate-300 leading-relaxed">
                  In pharma, <strong>an author can never approve their own work</strong>. Quality Assurance (QA) auditors like Santosh kumar majji provide independent verification to ensure temperature logs, chemical purities, and sterilization cycles strictly adhere to SOPs and FDA licenses.
                </p>
              </div>
              <div>
                <strong className="text-blue-300 block mb-1">The Two Conditional Routing Pathways:</strong>
                <div className="space-y-2 mt-1">
                  <div className="p-2 rounded bg-amber-950/20 border border-amber-500/30 text-amber-200 text-[11px]">
                    <strong>Pathway A (Revision Loop):</strong> If the reviewer finds an error, they write mandatory comments and click <em>"Route BACK to Author for Revision"</em>. The document moves to <code>IN_REVISION</code>, and the author must rectify the data, re-scan with AI, and re-sign.
                  </div>
                  <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-[11px]">
                    <strong>Pathway B (Direct Pass Rule):</strong> If the reviewer finds zero errors and leaves comments empty, the system activates the Direct Pass Rule, stamping <em>"Reviewed by: [Name]"</em> and routing straight to Approver.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 3: Approver Dashboard */}
          <div className="p-5 rounded-xl border border-purple-500/30 bg-slate-900/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs">Phase 3</span>
                <h3 className="text-sm font-bold text-white">Approver Dashboard & Final Commercial Release</h3>
              </div>
              <button
                onClick={() => setActiveTab('approver')}
                className="text-xs text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Go to Dashboard &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <strong className="text-purple-300 block mb-1">What is the Need of an Approver?</strong>
                <p className="text-slate-300 leading-relaxed">
                  Under 21 CFR §211.22, final release authorization for commercial drug distribution must be executed by a designated executive Site Head or VP of Manufacturing (e.g. Rajsekhar Gudivada). The Approver inspects the complete 3-tier chain: Author &rarr; Reviewer &rarr; Approver.
                </p>
              </div>
              <div>
                <strong className="text-purple-300 block mb-1">Key Actions on This Page:</strong>
                <ul className="text-slate-400 space-y-1 list-disc pl-4">
                  <li><strong>Triple Segregation Guard:</strong> Prohibits anyone who Authored or Reviewed the record from acting as Approver.</li>
                  <li><strong>Final Electronic Sign-off:</strong> Approver enters password to stamp "Approved by: Rajsekhar Gudivada".</li>
                  <li><strong>Automated PDF Render:</strong> Approval triggers celebratory confetti and immediately displays the certified PDF document.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Phase 4 & 5: Repository Vault & Audit Trail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Database className="w-4 h-4" />
                  <span>Secure Repository Vault</span>
                </div>
                <button
                  onClick={() => setActiveTab('repository')}
                  className="text-xs text-teal-400 hover:underline cursor-pointer"
                >
                  View &rarr;
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Represents the permanent, tamper-evident document archive. Stores all released records with automated SHA-256 integrity checksums, PDF download links, and fast search filtering by Batch ID, Category, or Approver.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <History className="w-4 h-4" />
                  <span>21 CFR Part 11 Audit Trail Ledger</span>
                </div>
                <button
                  onClick={() => setActiveTab('audittrail')}
                  className="text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  View &rarr;
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The chronological forensic ledger tracking every user action: cell diffs (Old Value &rarr; New Value), row deletions, AI corrections, electronic signatures, and revision loops. Fully exportable to CSV for FDA inspectors.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: HOW TO TEST & CHECK HOW THE PROJECT WORKS */}
      {activeSection === 'testing' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 text-xs text-indigo-200">
            <strong className="font-semibold block mb-1">Live Interactive Testing Guide:</strong>
            Follow the 5 scenarios below directly on the web application to test every feature, role segregation rule, and workflow loop.
          </div>

          {/* Test Scenario 1 */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs">1</span>
              <span>Test Scenario 1: The Standard Complete Lifecycle (Happy Path)</span>
            </div>
            <div className="text-xs text-slate-300 space-y-2 pl-8">
              <div className="flex items-start gap-2">
                <span className="font-mono text-teal-400">Step 1:</span>
                <span>Select <strong>NAVEEN KUMAR MAJJI (Author)</strong> from the top role switcher. Go to the <strong>Author Dashboard</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-teal-400">Step 2:</span>
                <span>Click <strong>"Run AI Scanner"</strong>. The AI drawer opens, flagging chemical spelling typos (`acetominophen`, `pencillin`) and casing. Click <strong>"Accept All Fixes with 1-Click"</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-teal-400">Step 3:</span>
                <span>Click <strong>"Submit & Sign ('Prepared By')"</strong>. Enter password challenge (e.g. <code>pharma123</code>), check the legal disclaimer, and click <strong>Authenticate</strong>. Notice the signature stamp appears and status turns to <code>PENDING_REVIEW</code>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-teal-400">Step 4:</span>
                <span>Go to <strong>Reviewer Dashboard</strong> &rarr; Switch role to <strong>Santosh kumar majji (Reviewer)</strong>. Leave the comments box empty &rarr; Notice mode says <em>"Direct Pass"</em> &rarr; Click <strong>"Direct Pass & Electronic Sign-off"</strong>. Document routes to <code>PENDING_APPROVAL</code>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-teal-400">Step 5:</span>
                <span>Go to <strong>Approver Dashboard</strong> &rarr; Switch role to <strong>Rajsekhar Gudivada (Approver)</strong> &rarr; Click <strong>"Authorize Final Release & Sign ('Approved By')"</strong> &rarr; Authenticate. Confetti fires, and the <strong>Official PDF Preview Modal opens automatically</strong>!</span>
              </div>
            </div>
          </div>

          {/* Test Scenario 2 */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">2</span>
              <span>Test Scenario 2: The Mandatory Reviewer Revision Loop</span>
            </div>
            <div className="text-xs text-slate-300 space-y-2 pl-8">
              <div className="flex items-start gap-2">
                <span className="font-mono text-amber-400">Step 1:</span>
                <span>In the <strong>Reviewer Dashboard</strong> (as Santosh kumar majji), select a pending document.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-amber-400">Step 2:</span>
                <span>In the feedback comments box, type: <em>"Row 2 reading exceeds batch tolerance. Please recalibrate and resubmit."</em></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-amber-400">Step 3:</span>
                <span>Notice the button turns amber: <strong>"Route BACK to Author for Revision"</strong>. Click it. Document status changes to <code>IN_REVISION</code>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-amber-400">Step 4:</span>
                <span>Switch back to <strong>NAVEEN KUMAR MAJJI (Author)</strong> on the <strong>Author Dashboard</strong>. Notice the prominent <strong>Revision Cycle Alert banner</strong> displaying Santosh kumar majji's comments. Edit the table and re-sign to send it back!</span>
              </div>
            </div>
          </div>

          {/* Test Scenario 3 */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs">3</span>
              <span>Test Scenario 3: Negative Compliance Testing (Role Segregation Barrier)</span>
            </div>
            <div className="text-xs text-slate-300 space-y-2 pl-8">
              <div className="flex items-start gap-2">
                <span className="font-mono text-rose-400">Step 1:</span>
                <span>Switch your user role to <strong>NAVEEN KUMAR MAJJI (Author)</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-rose-400">Step 2:</span>
                <span>Click on the <strong>Reviewer Dashboard</strong> to view document `BMR-2026-409B` (which was authored by NAVEEN KUMAR MAJJI).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-rose-400">Step 3:</span>
                <span>The system displays an alert: <strong>"Segregation of Duties Violation: NAVEEN KUMAR MAJJI is the Author and cannot review this submission."</strong> All review buttons are disabled, proving non-repudiation.</span>
              </div>
            </div>
          </div>

          {/* Test Scenario 4 */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3">
            <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">4</span>
              <span>Test Scenario 4: Native PDF Document Ingestion & Table Extraction</span>
            </div>
            <div className="text-xs text-slate-300 space-y-2 pl-8">
              <div className="flex items-start gap-2">
                <span className="font-mono text-blue-400">Step 1:</span>
                <span>On the <strong>Author Dashboard</strong>, click <strong>"Import Document (PDF/CSV/JSON)"</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-blue-400">Step 2:</span>
                <span>Click the 1-click button: <strong>"Auto-Parse Sample PDF Now"</strong> (or download the test PDF and drag it into the dropzone).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-blue-400">Step 3:</span>
                <span>The `pdfjs-dist` engine extracts the structured batch table rows. Click <strong>"Populate Editable Table Grid"</strong> to load them immediately into the authoring grid!</span>
              </div>
            </div>
          </div>

          {/* Test Scenario 5 */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs">5</span>
              <span>Test Scenario 5: Author Role Guard Testing (Reviewer / Approver Drafting Interception)</span>
            </div>
            <div className="text-xs text-slate-300 space-y-2 pl-8">
              <div className="flex items-start gap-2">
                <span className="font-mono text-rose-400">Step 1:</span>
                <span>In the top header role switcher, select <strong>Santosh kumar majji (Reviewer)</strong> or <strong>Rajsekhar Gudivada (Approver)</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-rose-400">Step 2:</span>
                <span>Navigate to the <strong>Author Dashboard</strong>. Notice the prominent <strong>21 CFR Part 11 Segregation Barrier Active</strong> banner and disabled drafting button states.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-rose-400">Step 3:</span>
                <span>Click <strong>"Prepare New Document"</strong>, <strong>"Import Document"</strong>, <strong>"Add Record Row"</strong>, or try clicking on any cell in the table grid.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-rose-400">Step 4:</span>
                <span>The system intercepts the attempt and triggers the compliance modal: <em>"Access Denied: Segregation of Duties (FDA 21 CFR Part 11). Only accounts with the Author role are permitted to create or modify draft records."</em></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
