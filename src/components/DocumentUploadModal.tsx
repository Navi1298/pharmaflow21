import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Sparkles,
  FileCode,
  Loader2,
  FileType,
} from 'lucide-react';
import Papa from 'papaparse';
import { TableRow } from '../types';
import { SAMPLE_TEMPLATES, STANDARD_COLUMNS } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { parsePDFIntoTableRows } from '../utils/pdfParser';
import { downloadTestPharmaPDF, generateTestPharmaPDF } from '../utils/samplePdfGenerator';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    importDocumentFromFile,
    createDocumentFromTemplate,
    validateAuthorAccess,
    triggerComplianceAlert,
  } = useWorkflow();

  const authorAccess = validateAuthorAccess(currentUser);
  const isAuthor = authorAccess.allowed;

  const [activeTab, setActiveTab] = useState<'upload' | 'templates'>('upload');
  const [docTitle, setDocTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState<TableRow[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    setPdfPageCount(null);
    if (!docTitle) {
      setDocTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
    const isJson = file.name.toLowerCase().endsWith('.json') || file.type === 'application/json';

    // 1. PDF File Processing (pdfjs-dist engine)
    if (isPdf) {
      setIsExtractingPdf(true);
      try {
        const extracted = await parsePDFIntoTableRows(file);
        if (!extracted.rows || extracted.rows.length === 0) {
          setError('Could not extract structured data rows from this PDF file.');
        } else {
          setParsedRows(extracted.rows);
          setPdfPageCount(extracted.pageCount);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? `PDF parsing failed: ${err.message}` : 'Failed to extract text from PDF document.');
      } finally {
        setIsExtractingPdf(false);
      }
    }
    // 2. CSV File Processing (PapaParse)
    else if (isCsv) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            setError('The selected CSV file appears to be empty.');
            return;
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rows: TableRow[] = (results.data as any[]).map((row, idx) => ({
            id: `row-imp-${idx + 1}`,
            name: row.Name || row.name || row['Subject Name'] || row.subject || `Operator ${idx + 1}`,
            age: row.Age || row.age || 35,
            phone: row.Phone || row.phone || row['Contact Phone'] || '+1 (555) 000-0000',
            batchId: row.BatchId || row['Batch ID'] || row.batch || `LOT-IMP-${idx + 1}`,
            parameter: row.Parameter || row.parameter || 'Assay Concentration',
            reading: row.Reading || row.reading || '100%',
            notes: row.Notes || row.notes || 'Imported via CSV file',
            status: 'Pass',
          }));

          setParsedRows(rows);
        },
        error: (err) => {
          setError(`CSV parse failure: ${err.message}`);
        },
      });
    }
    // 3. JSON File Processing
    else if (isJson) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          const rawRows = Array.isArray(json) ? json : json.rows || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rows: TableRow[] = rawRows.map((r: any, idx: number) => ({
            id: `row-imp-${idx + 1}`,
            name: r.name || r.Name || `Operator ${idx + 1}`,
            age: r.age || 35,
            phone: r.phone || '+1 (555) 000-0000',
            batchId: r.batchId || `LOT-${idx + 1}`,
            parameter: r.parameter || 'Assay Reading',
            reading: r.reading || '100%',
            notes: r.notes || 'Imported from JSON',
            status: r.status || 'Pass',
          }));
          setParsedRows(rows);
        } catch {
          setError('Invalid JSON structure.');
        }
      };
      reader.readAsText(file);
    } else {
      setError('Please upload a valid .pdf, .csv, or .json file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSamplePDFDirectly = async () => {
    const { file } = generateTestPharmaPDF();
    await processFile(file);
  };

  const handleConfirmImport = () => {
    const access = validateAuthorAccess(currentUser);
    if (!access.allowed) {
      onClose();
      triggerComplianceAlert(access.message, 'Confirm Document Import');
      return;
    }
    if (!parsedRows || parsedRows.length === 0) {
      setError('No rows available to import.');
      return;
    }
    const finalTitle = docTitle.trim() || 'Imported Pharmaceutical Record';
    importDocumentFromFile(finalTitle, STANDARD_COLUMNS, parsedRows);
    onClose();
  };

  const handleSelectTemplate = (template: typeof SAMPLE_TEMPLATES[0]) => {
    const access = validateAuthorAccess(currentUser);
    if (!access.allowed) {
      onClose();
      triggerComplianceAlert(access.message, `Prepare Document from Template ("${template.name}")`);
      return;
    }
    createDocumentFromTemplate(template.name, template.category, template.rows);
    onClose();
  };

  const downloadSampleCSV = () => {
    const csvContent =
      'Name,Age,Phone,Batch ID,Parameter,Reading,Notes,Status\n' +
      'johnathan smith,38,5558923019,LOT-409-01,Sterile solusion assay,99.4%,Initial steril solusion check pass,Pass\n' +
      'SARAH CONNOR,42,(555) 304 9912,LOT-409-02,acetominophen purity,99.8%,Acetominophen concentration meets USP,Pass\n' +
      'david k. banner,-4,555-8821,LOT-409-03,autoclavee temparature,121.5 C,High presure calibaration verified,Warning\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_pharma_batch_record.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">Import Source Documents</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono font-bold">
                  PDF • CSV • JSON
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Native PDF text & table parser, CSV/JSON ingest, or GMP templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Non-Author Role Warning */}
        {!isAuthor && (
          <div className="px-6 py-2.5 bg-rose-950/40 border-b border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping shrink-0" />
              <span>
                Active persona is <strong>{currentUser.name}</strong> ({currentUser.role}). Creation/Import actions are blocked under 21 CFR Part 11.
              </span>
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold shrink-0">
              Author Required
            </span>
          </div>
        )}

        {/* Tab switcher */}
        <div className="px-6 pt-3 border-b border-slate-800 flex gap-4">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            File Upload (.pdf, .csv, .json)
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pre-loaded Pharma Templates (Instant 1-Click)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div className="space-y-4">
              {/* Document Title input */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Document Title / Manifest Name
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Batch 702-D: Sterile Lyophilized Formulation Manifest"
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Drag and drop zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isExtractingPdf && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-teal-400 bg-teal-500/10'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-950/40'
                } ${isExtractingPdf ? 'pointer-events-none opacity-80' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.csv,.json"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {isExtractingPdf ? (
                  <div className="py-2 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                    <div className="text-xs font-bold text-teal-300">
                      Extracting PDF Text & Structured Tables...
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Parsing page layers, tabular rows, and chemical parameters via PDF.js engine
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 text-teal-400 flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-slate-200">
                      {fileName ? (
                        <span className="text-teal-300">{fileName} selected</span>
                      ) : (
                        'Click to upload or drag & drop source file'
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supported formats: <strong>PDF (.pdf)</strong>, CSV (.csv), JSON (.json)
                    </p>

                    <div className="mt-4 flex items-center justify-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                        <FileType className="w-3 h-3" /> .PDF
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                        .CSV
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                        .JSON
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Instant Test Helpers Bar */}
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Test with ready-made pharma files:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadTestPharmaPDF}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-medium border border-teal-500/30 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-teal-400" />
                      <span>Download Test PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadSampleCSV}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-slate-400" />
                      <span>Sample CSV</span>
                    </button>
                  </div>
                </div>

                {/* Instant 1-click test button */}
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-teal-400/90">
                    Want to test PDF parsing without downloading?
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadSamplePDFDirectly}
                    disabled={isExtractingPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 text-xs font-semibold border border-teal-500/40 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Parse Sample PDF Now</span>
                  </button>
                </div>
              </div>

              {/* Parsed Preview */}
              {parsedRows && parsedRows.length > 0 && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold text-teal-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Extracted & Mapped {parsedRows.length} Rows Successfully
                      {pdfPageCount && (
                        <span className="text-slate-400 font-normal">({pdfPageCount} PDF page(s))</span>
                      )}
                    </span>
                    <span className="text-slate-400">Previewing first 4 rows:</span>
                  </div>

                  <div className="rounded-lg border border-slate-700 overflow-hidden text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-800 text-slate-300">
                        <tr>
                          <th className="p-2">Subject / Operator</th>
                          <th className="p-2">Age</th>
                          <th className="p-2">Contact Phone</th>
                          <th className="p-2">Batch Lot</th>
                          <th className="p-2">Parameter</th>
                          <th className="p-2">Reading</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-900">
                        {parsedRows.slice(0, 4).map((r) => (
                          <tr key={r.id}>
                            <td className="p-2 font-medium text-slate-200">{r.name}</td>
                            <td className="p-2 text-slate-300">{r.age}</td>
                            <td className="p-2 text-slate-300 font-mono text-[10px]">{r.phone}</td>
                            <td className="p-2 text-slate-400 font-mono text-[10px]">{r.batchId}</td>
                            <td className="p-2 text-slate-300">{r.parameter}</td>
                            <td className="p-2 text-slate-400 font-mono text-[10px]">{String(r.reading)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Choose a pre-configured pharmaceutical manufacturing protocol to load immediately into your Author Dashboard:
              </p>

              <div className="grid gap-3">
                {SAMPLE_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="p-4 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800/80 hover:border-teal-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                        <h4 className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors">
                          {tmpl.name}
                        </h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{tmpl.description}</p>
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-2">
                      <span>Includes {tmpl.rows.length} pre-configured audit test rows</span>
                      <span>•</span>
                      <span className="text-teal-400 group-hover:underline">Click to Load & Author &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'upload' && (
          <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {parsedRows ? `${parsedRows.length} rows ready to populate editable grid` : 'No file imported yet'}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={!parsedRows || parsedRows.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Populate Editable Table Grid</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
