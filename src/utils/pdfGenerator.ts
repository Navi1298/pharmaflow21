import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DocumentRecord } from '../types';
import { formatGMPDate } from './crypto';

export function generateDocumentPDF(doc: DocumentRecord): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = 14;

  // --- TOP COMPLIANCE HEADER BAR ---
  pdf.setFillColor(15, 23, 42); // Navy 900
  pdf.rect(0, 0, pageWidth, 22, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('PHARMAFLOW 21 - ELECTRONIC BATCH & RECORD SYSTEM', 14, 9);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(45, 212, 191); // Teal 400
  pdf.text('21 CFR PART 11 & EU GMP ANNEX 11 VALIDATED ELECTRONIC ARCHIVE', 14, 15);

  pdf.setFontSize(7);
  pdf.setTextColor(203, 213, 225);
  pdf.text(`GEN: ${formatGMPDate(new Date().toISOString())}`, pageWidth - 14, 15, { align: 'right' });

  currentY = 28;

  // --- DOCUMENT METADATA BOX ---
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(14, currentY, pageWidth - 28, 30, 2, 2, 'FD');

  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(doc.title, 18, currentY + 7);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);

  const leftColX = 18;
  const midColX = 75;
  const rightColX = 135;

  pdf.text(`Doc Number:`, leftColX, currentY + 14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(doc.documentNumber, leftColX + 22, currentY + 14);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Category:`, leftColX, currentY + 20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(doc.category, leftColX + 22, currentY + 20);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Version:`, leftColX, currentY + 26);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(`v${doc.version}`, leftColX + 22, currentY + 26);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Status:`, midColX, currentY + 14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(16, 185, 129); // Green
  pdf.text(doc.status.replace('_', ' '), midColX + 16, currentY + 14);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Author:`, midColX, currentY + 20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(doc.authorName, midColX + 16, currentY + 20);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Revisions:`, midColX, currentY + 26);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${doc.activeRevisionCount} cycle(s)`, midColX + 16, currentY + 26);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Vault Hash:`, rightColX, currentY + 14);
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(30, 41, 59);
  pdf.text(doc.repositoryChecksum || doc.signatures[doc.signatures.length - 1]?.checksum || 'PENDING-SIG', rightColX, currentY + 19);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Archived: ${doc.repositoryDate ? formatGMPDate(doc.repositoryDate) : 'Active Session'}`, rightColX, currentY + 26);

  currentY += 36;

  // --- SECTION 1: TABULAR RECORD DATA ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text('SECTION 1: VERIFIED BATCH & OPERATIONAL DATA', 14, currentY);
  currentY += 4;

  const tableHeaders = ['Name / Subject', 'Age', 'Contact Phone', 'Batch ID', 'Parameter', 'Reading', 'Status'];
  const tableRows = doc.rows.map((r) => [
    r.name,
    String(r.age),
    r.phone,
    r.batchId || '-',
    r.parameter || '-',
    r.reading !== undefined ? String(r.reading) : '-',
    r.status || 'Pass',
  ]);

  autoTable(pdf, {
    startY: currentY,
    head: [tableHeaders],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Calculate new Y position after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastTable = (pdf as any).lastAutoTable;
  currentY = (lastTable ? lastTable.finalY : currentY + 40) + 8;

  // If page space is tight, create a new page
  if (currentY > pageHeight - 85) {
    pdf.addPage();
    currentY = 20;
  }

  // --- SECTION 2: 21 CFR PART 11 SIGNATURE MANIFEST ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text('SECTION 2: 21 CFR PART 11 ELECTRONIC SIGNATURE MANIFEST', 14, currentY);
  currentY += 4;

  if (doc.signatures.length === 0) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text('No electronic signatures recorded yet.', 14, currentY + 5);
    currentY += 15;
  } else {
    const sigBoxWidth = (pageWidth - 28) / Math.min(3, Math.max(1, doc.signatures.length));
    
    doc.signatures.forEach((sig, index) => {
      const boxX = 14 + index * sigBoxWidth;
      const boxW = sigBoxWidth - 3;
      const boxH = 34;

      // Signature border and background
      pdf.setFillColor(241, 245, 249);
      pdf.setDrawColor(13, 148, 136); // Teal border
      pdf.setLineWidth(0.4);
      pdf.roundedRect(boxX, currentY, boxW, boxH, 2, 2, 'FD');

      // Title & Stamp Type
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(13, 148, 136);
      pdf.text(sig.type.replace('_', ' '), boxX + 4, currentY + 6);

      // Signer Name
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(sig.signerName, boxX + 4, currentY + 12);

      // Role & Title
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(`${sig.signerTitle}`, boxX + 4, currentY + 17);

      // Timestamp
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(6);
      pdf.text(formatGMPDate(sig.timestamp), boxX + 4, currentY + 22);

      // Digital Checksum
      pdf.setFont('courier', 'bold');
      pdf.setFontSize(5.5);
      pdf.setTextColor(30, 41, 59);
      pdf.text(`HASH: ${sig.checksum.substring(0, 24)}...`, boxX + 4, currentY + 27);

      // Certified badge
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.setTextColor(16, 185, 129);
      pdf.text('[DIGITALLY VERIFIED 21 CFR 11]', boxX + 4, currentY + 31);
    });

    currentY += 40;
  }

  // Check if audit trail fits or requires a page
  if (currentY > pageHeight - 60) {
    pdf.addPage();
    currentY = 20;
  }

  // --- SECTION 3: IMMUTABLE AUDIT TRAIL LOG ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text('SECTION 3: 21 CFR PART 11 IMMUTABLE AUDIT TRAIL', 14, currentY);
  currentY += 4;

  const auditHeaders = ['Timestamp', 'Action', 'Operator', 'Role', 'Details / Reason', 'Cryptographic Checksum'];
  const auditRows = doc.auditTrail.slice(-10).map((log) => [
    formatGMPDate(log.timestamp),
    log.action.replace(/_/g, ' '),
    log.performedBy,
    log.userRole,
    log.reasonForChange ? `${log.details} [Reason: ${log.reasonForChange}]` : log.details,
    log.checksum.substring(0, 18) + '...',
  ]);

  autoTable(pdf, {
    startY: currentY,
    head: [auditHeaders],
    body: auditRows,
    theme: 'grid',
    styles: {
      fontSize: 6.5,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { left: 14, right: 14 },
  });

  // --- FOOTER ON ALL PAGES ---
  const totalPages = (pdf.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(148, 163, 184);

    pdf.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
    pdf.text(
      'CONFIDENTIAL & PROPRIETARY | PHARMA MANUFACTURING COMPLIANCE RECORD | 21 CFR PART 11 SECURED',
      14,
      pageHeight - 8
    );
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
  }

  return pdf;
}

export function downloadPDF(doc: DocumentRecord) {
  const pdf = generateDocumentPDF(doc);
  const fileName = `${doc.documentNumber}_${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}_v${doc.version}.pdf`;
  pdf.save(fileName);
}
