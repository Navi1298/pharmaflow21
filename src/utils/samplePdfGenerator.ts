import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a mock pharmaceutical PDF file containing structured tabular data
 * with typos and format anomalies, allowing instant end-to-end PDF testing.
 */
export function generateTestPharmaPDF(): { blob: Blob; file: File } {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();

  // Header Bar
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pageWidth, 20, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('PHARMAFLOW 21 - BATCH RECORD SOURCE DOCUMENT', 14, 9);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(45, 212, 191);
  pdf.text('FDA 21 CFR PART 11 COMPLIANT SOURCE DATA MANIFEST', 14, 15);

  // Document Title & Metadata
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Batch 702-D: Sterile Lyophilized Formulation Manifest', 14, 30);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);
  pdf.text('Document ID: BMR-PDF-702D | Category: Batch Record | Revision: v1.0.0', 14, 36);
  pdf.text('Author: NAVEEN KUMAR MAJJI | Site: Formulation Plant 4 | Cleanroom Bay: 02', 14, 41);

  // Section 1: Tabular Batch Data (Deliberately includes typos for AI Scanner testing)
  const headers = ['Subject / Operator Name', 'Age', 'Contact Phone', 'Batch ID', 'Parameter', 'Reading', 'Observation / Notes', 'Status'];
  const dataRows = [
    ['johnathan smith', '38', '5558923019', 'LOT-702-01', 'Sterile solusion assay', '99.4%', 'Initial steril solusion check pass without sedimentation', 'Pass'],
    ['SARAH CONNOR', '42', '(555) 304 9912', 'LOT-702-02', 'acetominophen purity', '99.8%', 'Acetominophen concentration meets USP grade specifications', 'Pass'],
    ['david k. banner', '-4', '555-8821', 'LOT-702-03', 'autoclavee temparature', '121.5 C', 'High presure calibaration verified during thermal cycle', 'Warning'],
    ['Dr. amelia warner', '31', '+1-555-901-2244', 'LOT-702-04', 'pencillin potency', '98.9%', 'Filtration complete using 0.22 micron PVDF membrane', 'Pass'],
    ['Robert C. Vance', '145', '5557766554', 'LOT-702-05', 'viscocity measurement', '2.4 cP', 'Standard shear rate applied at 25 degrees C', 'Pass'],
  ];

  autoTable(pdf, {
    startY: 48,
    head: [headers],
    body: dataRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
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

  // Footer notes
  const blob = pdf.output('blob');
  const file = new File([blob], 'Batch_702D_Sterile_Lyophilized_Record.pdf', { type: 'application/pdf' });

  return { blob, file };
}

export function downloadTestPharmaPDF() {
  const { blob, file } = generateTestPharmaPDF();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', file.name);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
