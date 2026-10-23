import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();

function drawHeader(title, subtitle) {
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 14, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(45, 212, 191); // Teal 400
  doc.text(subtitle, 14, 17);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text('FDA 21 CFR PART 11 & EU GMP ANNEX 11 COMPLIANT ARCHITECTURE', pageWidth - 14, 17, { align: 'right' });
}

function drawFooter(pageNumber, totalPages) {
  doc.setDrawColor(203, 213, 225);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PharmaFlow 21 — Paperless Document & Compliance Workflow System | Project Architecture Guide', 14, pageHeight - 8);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
}

// ==========================================
// PAGE 1: EXECUTIVE SUMMARY & ELEVATOR PITCH
// ==========================================
drawHeader('PHARMAFLOW 21 — COMPLETE PROJECT GUIDE & SYSTEM ARCHITECTURE', 'Executive Project Summary, Industry Problem & Presentation Guide');

let y = 32;

// Overview Box
doc.setFillColor(248, 250, 252);
doc.setDrawColor(226, 232, 240);
doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(15, 23, 42);
doc.text('1. Project Overview (What is this application?)', 18, y + 7);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(51, 65, 85);
const overviewText = 'PharmaFlow 21 is an enterprise-grade, paperless document authoring, AI-assisted review, electronic signature authentication, and approval workflow web application. It is purpose-built for the pharmaceutical, biotech, and high-precision manufacturing industries to replace prone-to-error manual paper batch records, clinical forms, and SOP manifests with a 100% compliant electronic record system.';
const splitOverview = doc.splitTextToSize(overviewText, pageWidth - 36);
doc.text(splitOverview, 18, y + 13);

y += 34;

// Elevator Pitch & Presentation Scripts
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(13, 148, 136);
doc.text('2. How to Explain This Project in 60 Seconds (Elevator Pitch)', 14, y);
y += 4;

const pitchText = '"In regulated industries like pharma, the FDA mandates strict compliance with 21 CFR Part 11. Traditional paper records suffer from transcription errors, illegible signatures, and falsification risks. I built PharmaFlow 21: a full-stack paperless document workflow that ingests PDFs, CSVs, and JSON files, automatically extracts and structures tabular data, runs an AI scanner to correct spelling typos and casing anomalies, enforces strict segregation of duties so authors cannot review or approve their own submissions, stamps tamper-proof electronic signatures with SHA-256 cryptographic hashes, and automatically renders and archives certified PDFs into an immutable audit vault."';

doc.setFillColor(240, 253, 250);
doc.setDrawColor(94, 234, 212);
doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'FD');
doc.setFont('helvetica', 'italic');
doc.setFontSize(7.5);
doc.setTextColor(15, 23, 42);
doc.text(doc.splitTextToSize(pitchText, pageWidth - 36), 18, y + 6);

y += 36;

// Problem & Solution Table
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(15, 23, 42);
doc.text('3. The Business Problem vs. PharmaFlow 21 Solution', 14, y);
y += 3;

autoTable(doc, {
  startY: y,
  head: [['Industry Challenge (Paper & Legacy Systems)', 'PharmaFlow 21 Enterprise Solution', 'Regulatory Impact']],
  body: [
    ['Paper Batch Manufacturing Records (BMR) get lost, torn, or illegibly filled out by operators.', 'Interactive, editable digital grid with drag-and-drop PDF, CSV, and JSON auto-extraction.', 'Zero missing records; 100% searchable archive.'],
    ['Human typos in chemical compounds (e.g. "pencillin") cause multi-million dollar batch recalls.', 'AI Error Scanner identifies misspellings, non-standard naming casing, and range breaches.', 'Pre-submission quality gating.'],
    ['Conflict of interest: authors reviewing or approving their own manufacturing logs.', 'Role Segregation Barrier: Author cannot Review; neither Author nor Reviewer can Approve.', 'Strict compliance with 21 CFR §11.10 & GMP.'],
    ['Vague electronic signatures or signature forgery without audit context.', 'Secure credentials modal stamping: Signer Name, Title, Meaning/Intent, Timestamp, and SHA-256 hash.', 'Full non-repudiation per 21 CFR §11.50 & §11.200.'],
    ['Audit trails are often untracked or easily edited in basic spreadsheets.', 'Immutable, chronological ledger tracking who, what, when, old value, new value, reason & IP.', 'Complete tamper evidence per 21 CFR §11.10(e).']
  ],
  theme: 'grid',
  styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
  headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
  margin: { left: 14, right: 14 },
});

drawFooter(1, 4);

// ==========================================
// PAGE 2: MODULE-BY-MODULE BREAKDOWN & USE
// ==========================================
doc.addPage();
drawHeader('MODULE-BY-MODULE ARCHITECTURE & UTILITY', 'What Every Feature Does, Why It Exists, and Real-World Usage');

y = 30;

const modules = [
  [
    '1. Author Dashboard & Task Queue',
    'Assigns drafting tasks (SOPs, Batch Release Records, Calibration Logs). Allows authors to edit table cells inline, add/delete rows, and monitor revision cycles.',
    'Formulation Scientists and Process Engineers preparing daily batch records.'
  ],
  [
    '2. Drag-and-Drop Ingest (PDF, CSV, JSON)',
    'Natively parses PDF text and coordinate-aligned tables using pdfjs-dist. Also parses CSV (PapaParse) and JSON. Includes pre-loaded 1-click GMP templates.',
    'Eliminates manual re-typing of paper logs; ingests supplier certificates & equipment logs in 2 seconds.'
  ],
  [
    '3. AI Scanner & Auto-Fix Drawer',
    'Scans dataset for chemical typos (e.g., "acetominophen" -> "Acetaminophen"), Title Case inconsistencies, phone format normalization (+1 555-XXX), and out-of-spec limits.',
    'Serves as an automated quality assurance gatekeeper before formal regulatory submission.'
  ],
  [
    '4. Electronic Signature Modal (Prepared By)',
    'Requires re-authentication (username, password challenge, signature intent). Generates an unalterable stamp: "Prepared by: [User]" with timestamp & SHA-256 hash.',
    'Enforces 21 CFR §11.50 legal non-repudiation—signer legally certifies record accuracy.'
  ],
  [
    '5. Reviewer Dashboard & Conditional Routing',
    'Segregation barrier: Authors cannot review their own records. Reviewers inspect data and have 2 pathways: (1) Add comments -> Route BACK for Revision, (2) No comments -> Direct Pass.',
    'QA Managers auditing analytical data before passing to management for release.'
  ],
  [
    '6. Approver Dashboard & Site Release',
    'Strict 3-tier separation: Neither author nor reviewer can approve. Approver authenticates credentials to stamp "Approved by: [Approver]" and authorize commercial distribution.',
    'VP of Manufacturing / Site Director giving final release authorization.'
  ],
  [
    '7. Automated PDF Generator & Vault Preview',
    'Automatically converts approved records into official, formatted PDFs with headers, batch metadata, table data, signature boxes, and full audit trail tables.',
    'Provides the legally binding PDF archive document required during FDA inspections.'
  ],
  [
    '8. Secure Repository Vault',
    'Simulated encrypted database storing approved records. Users can search by Doc ID, filter by category, verify SHA-256 checksum integrity, and re-download PDFs.',
    'Centralized document control center replacing physical file cabinets.'
  ],
  [
    '9. 21 CFR Part 11 Audit Trail Ledger',
    'Chronological, immutable event log tracking every action: row edits, cell diffs (old vs new), AI fixes, signatures, and review decisions. Exportable to CSV.',
    'Presented to FDA or EMA auditors during compliance inspections.'
  ],
  [
    '10. Interactive Persona Switcher',
    'Allows live switching between Authors (NAVEEN KUMAR MAJJI & NAVEEN KUMAR MAJJI - 2), Reviewer (Santosh kumar majji), and Approver (Rajsekhar Gudivada) with real-time segregation status.',
    'Enables live demonstrations of multi-author scaling and 21 CFR segregation of duties.'
  ]
];

autoTable(doc, {
  startY: y,
  head: [['System Module / Feature', 'What It Does & Key Technical Capability', 'Who Uses It & Real-World Utility']],
  body: modules,
  theme: 'grid',
  styles: { fontSize: 7, cellPadding: 2.2, textColor: [15, 23, 42] },
  headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold' },
  columnStyles: {
    0: { cellWidth: 45, fontStyle: 'bold' },
    1: { cellWidth: 85 },
    2: { cellWidth: 52 }
  },
  margin: { left: 14, right: 14 }
});

drawFooter(2, 4);

// ==========================================
// PAGE 3: WORKFLOW LIFECYCLE & SEGREGATION
// ==========================================
doc.addPage();
drawHeader('WORKFLOW LIFECYCLE & STRICT ROLE SEGREGATION', 'The 4-Stage Regulatory Lifecycle & 21 CFR Part 11 Compliance Rules');

y = 30;

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(15, 23, 42);
doc.text('1. The Complete Document Lifecycle (Step-by-Step)', 14, y);
y += 4;

const workflowSteps = [
  ['Stage 1: Authoring & Ingest', 'Author Dashboard', '1. Drag-and-drop upload PDF, CSV, or select GMP template.\n2. Table auto-populates with verified editable rows.\n3. Author edits cells or adds records directly in the grid.'],
  ['Stage 2: AI Pre-Submission Scan', 'AI Scanner Drawer', '1. Click "Run AI Scanner".\n2. System detects spelling typos, improper casing, phone format errors, and range outliers.\n3. 1-Click "Accept All Fixes" standardizes the entire table.'],
  ['Stage 3: Author Credential Sign-off', 'Auth Modal ("Prepared By")', '1. Author clicks "Submit & Sign".\n2. Enters password challenge, selects signature intent.\n3. Stamped: "Prepared by: NAVEEN KUMAR MAJJI" with SHA-256 hash.\n4. Document status transitions to PENDING_REVIEW.'],
  ['Stage 4A: QA Review (Revision Loop)', 'Reviewer Dashboard', '1. QA Reviewer Santosh kumar majji inspects table.\n2. Adds mandatory feedback comment.\n3. Clicks "Route BACK for Revision" -> status becomes IN_REVISION.\n4. Author is notified, edits data, and re-submits.'],
  ['Stage 4B: QA Review (Direct Pass)', 'Reviewer Dashboard', '1. QA Reviewer inspects data; finds zero errors.\n2. Leaves comment box EMPTY.\n3. System activates Direct Pass Rule.\n4. Stamped: "Reviewed by: Santosh kumar majji" -> status PENDING_APPROVAL.'],
  ['Stage 5: Final Site Release', 'Approver Dashboard', '1. Approver Rajsekhar Gudivada inspects complete history.\n2. Re-authenticates credentials ("Approved By").\n3. Confetti triggers; PDF preview modal opens automatically.\n4. Document transitions to APPROVED.'],
  ['Stage 6: Archival & Vault Storing', 'Secure Repository Vault', '1. Approved PDF downloaded or saved to Repository.\n2. Cryptographic vault hash stamped.\n3. Stored in searchable vault for lifetime auditability.']
];

autoTable(doc, {
  startY: y,
  head: [['Lifecycle Stage', 'Active Dashboard', 'Operational Actions & Compliance Enforcement']],
  body: workflowSteps,
  theme: 'grid',
  styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
  headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
  columnStyles: {
    0: { cellWidth: 45, fontStyle: 'bold' },
    1: { cellWidth: 40 },
    2: { cellWidth: 97 }
  },
  margin: { left: 14, right: 14 }
});

y = doc.lastAutoTable.finalY + 8;

// Strict Segregation Rule Box
doc.setFillColor(254, 243, 199); // Amber 100
doc.setDrawColor(245, 158, 11); // Amber 500
doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(146, 64, 14); // Amber 900
doc.text('2. 21 CFR Part 11 Strict Segregation of Duties Rules (Dual-Control Enforcement)', 18, y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(120, 53, 15);
const rule1 = '• Rule 1 (Author Cannot Review): NAVEEN KUMAR MAJJI authored the document. If the author accesses the Reviewer Dashboard, the system blocks the action and displays a Role Segregation Barrier.';
const rule2 = '• Rule 2 (Reviewer Cannot Approve): Santosh kumar majji reviewed the document. He is strictly prohibited from granting final site approval, preventing self-authorization.';
const rule3 = '• Rule 3 (Author Cannot Approve): The original author cannot approve their own document. Final release requires an independent Site Approver (Rajsekhar Gudivada).';
const rule4 = '• Rule 4 (Author-Only Drafting): Reviewers & Approvers cannot create or edit draft records. Non-author attempts trigger 21 CFR Part 11 Access Denied alerts.';
const rule5 = '• Rule 5 (Non-Repudiation): Every signature is bound to user identity, timestamp, intent, and digital checksum. Once committed, signatures cannot be altered.';

doc.text(rule1, 18, y + 12);
doc.text(rule2, 18, y + 17);
doc.text(rule3, 18, y + 22);
doc.text(rule4, 18, y + 27);
doc.text(rule5, 18, y + 32);

drawFooter(3, 4);

// ==========================================
// PAGE 4: TECH STACK, INTERVIEW Q&A, AND DEMO
// ==========================================
doc.addPage();
drawHeader('TECHNICAL SPECIFICATION & DEMO SCRIPT', 'Technology Stack, Interview Q&A, and Recommended Live Demo Script');

y = 30;

// Tech Stack Table
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(15, 23, 42);
doc.text('1. Full Technology Stack', 14, y);
y += 3;

autoTable(doc, {
  startY: y,
  head: [['Layer', 'Technology', 'Purpose in PharmaFlow 21']],
  body: [
    ['Frontend Framework', 'React 19 + TypeScript + Vite 8', 'Ultra-fast responsive single-page application with type-safe state.'],
    ['Styling & Theme', 'Tailwind CSS (Clinical Dark Palette)', 'Modern enterprise pharma UI with responsive sidebar & status pills.'],
    ['PDF Text/Table Engine', 'pdfjs-dist (Mozilla PDF.js)', 'In-browser native PDF parsing with coordinate-aligned table extraction.'],
    ['PDF Document Generator', 'jsPDF + jsPDF-AutoTable', 'Client-side generation of certified, formatted regulatory PDF documents.'],
    ['CSV Data Parsing', 'PapaParse', 'High-performance CSV parsing with automatic header-to-column mapping.'],
    ['Icons & Visuals', 'Lucide React + Canvas-Confetti', 'Crisp enterprise iconography and celebratory approval feedback.']
  ],
  theme: 'grid',
  styles: { fontSize: 7, cellPadding: 1.8, textColor: [30, 41, 59] },
  headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
  margin: { left: 14, right: 14 }
});

y = doc.lastAutoTable.finalY + 8;

// Interview Q&A Box
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(13, 148, 136);
doc.text('2. Top 3 Interview / Client Presentation Questions & Answers', 14, y);
y += 4;

const qas = [
  ['Q1: What is 21 CFR Part 11 and how does your app satisfy it?', 'FDA 21 CFR Part 11 regulates electronic records and electronic signatures. PharmaFlow 21 satisfies it through: (1) Re-authentication password challenges for signatures (§11.200), (2) Stamping printed name, timestamp, and legal intent (§11.50), (3) Immutable computer-generated audit trail tracking all edits and previous values (§11.10e), and (4) Strict segregation of duties.'],
  ['Q2: How does the PDF table extraction work on the frontend?', 'We use pdfjs-dist with a dedicated web worker. The parser reads text glyphs along with their transform coordinates. It groups text items sharing identical or close vertical Y-coordinates into rows, sorts them horizontally by X-coordinate, strips header boilerplate, and dynamically maps tokens into standard pharma fields.'],
  ['Q3: What makes the Reviewer routing "conditional"?', 'It features dual pathways: if the reviewer types feedback comments, the system forces a "Route BACK for Revision" loop back to the Author. If zero comments are entered, the system activates the "Direct Pass Rule", allowing the document to bypass revision and route straight to the Approver Dashboard.']
];

autoTable(doc, {
  startY: y,
  head: [['Question', 'Ideal Response']],
  body: qas,
  theme: 'grid',
  styles: { fontSize: 7, cellPadding: 2, textColor: [15, 23, 42] },
  headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold' },
  columnStyles: {
    0: { cellWidth: 55, fontStyle: 'bold' },
    1: { cellWidth: 127 }
  },
  margin: { left: 14, right: 14 }
});

y = doc.lastAutoTable.finalY + 6;

// 3-Minute Live Demo Walkthrough
doc.setFillColor(241, 245, 249);
doc.setDrawColor(203, 213, 225);
doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(15, 23, 42);
doc.text('3. Recommended 3-Minute Live Demo Flow to Impress Anyone:', 18, y + 5);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7);
doc.setTextColor(51, 65, 85);
doc.text('1. Start on Author Dashboard -> Show editable grid -> Click "Import Document" -> Click "Auto-Parse Sample PDF Now".', 18, y + 10);
doc.text('2. Click "Run AI Scanner" -> Point out detected typos & casing flags -> Click "Accept All Fixes" -> Click "Submit & Sign".', 18, y + 14);
doc.text('3. Switch to Reviewer -> Demonstrate Segregation Alert -> Switch to Marcus -> Show Direct Pass vs Revision comment.', 18, y + 18);

drawFooter(4, 4);

// Save PDF to project directory
const outputPath = path.resolve('PharmaFlow21_Comprehensive_Project_Guide.pdf');
const publicOutputPath = path.resolve('public', 'PharmaFlow21_Comprehensive_Project_Guide.pdf');

const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
fs.writeFileSync(publicOutputPath, Buffer.from(pdfBytes));

console.log(`PDF successfully generated at: ${outputPath}`);
console.log(`Public PDF generated at: ${publicOutputPath}`);
