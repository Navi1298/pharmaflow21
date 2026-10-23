import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  User,
  DocumentRecord,
  DocumentStatus,
  TableRow,
  TableColumn,
  AIFixItem,
  AuditLogEntry,
  SignatureStamp,
  ReviewComment,
  NotificationItem,
} from '../types';
import { INITIAL_USERS, INITIAL_DOCUMENTS, STANDARD_COLUMNS } from '../data/mockData';
import { scanTableData } from '../utils/aiScanner';
import { generateChecksum, getGMPTimestamp } from '../utils/crypto';
import {
  validateAuthorAccess,
  AUTHOR_ACCESS_DENIED_MESSAGE,
  AuthorAccessValidationResult,
} from '../utils/complianceGuards';
import confetti from 'canvas-confetti';

interface WorkflowContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  activeTab: 'author' | 'reviewer' | 'approver' | 'repository' | 'audittrail' | 'compliance' | 'guide';
  setActiveTab: (tab: 'author' | 'reviewer' | 'approver' | 'repository' | 'audittrail' | 'compliance' | 'guide') => void;
  documents: DocumentRecord[];
  activeDocument: DocumentRecord | null;
  setActiveDocument: (doc: DocumentRecord | null) => void;
  selectDocumentById: (id: string) => void;
  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;

  // AI Scanner
  aiFixes: AIFixItem[];
  isScanning: boolean;
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: (open: boolean) => void;
  runAIScanner: () => void;
  applyFix: (fixId: string) => void;
  applyAllFixes: () => void;
  rejectFix: (fixId: string) => void;

  // Document Editing
  updateCell: (rowId: string, columnKey: string, newValue: string | number, reason?: string) => void;
  addRow: (newRow?: Partial<TableRow>) => void;
  deleteRow: (rowId: string, reason?: string) => void;
  createDocumentFromTemplate: (title: string, category: DocumentRecord['category'], initialRows: TableRow[]) => DocumentRecord;
  importDocumentFromFile: (title: string, columns: TableColumn[], rows: TableRow[]) => DocumentRecord;

  // Signatures & Workflow Lifecycle
  signPreparedBy: (password: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  routeReviewWithComments: (commentText: string, actionRequired?: string) => boolean;
  signReviewedDirectPass: (password: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  signApprovedBy: (password: string, reason: string) => Promise<{ success: boolean; error?: string }>;

  // Repository & PDF
  saveToRepository: (docId: string) => void;
  previewDocForPDF: DocumentRecord | null;
  setPreviewDocForPDF: (doc: DocumentRecord | null) => void;

  // Compliance & Segregation Guards
  validateAuthorAccess: (activeSession?: { role?: string; name?: string } | User | null) => AuthorAccessValidationResult;
  canReviewDocument: (doc: DocumentRecord) => { allowed: boolean; reason?: string };
  canApproveDocument: (doc: DocumentRecord) => { allowed: boolean; reason?: string };

  // Compliance Alert Modal
  complianceAlert: { isOpen: boolean; message: string; attemptedAction?: string } | null;
  triggerComplianceAlert: (message?: string, attemptedAction?: string) => void;
  closeComplianceAlert: () => void;

  // Author Persona Management
  addNewAuthor: (authorData: {
    name: string;
    employeeId: string;
    title?: string;
    department?: string;
    email?: string;
    avatar?: string;
  }) => User;
  isAddAuthorModalOpen: boolean;
  setIsAddAuthorModalOpen: (open: boolean) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default: NAVEEN KUMAR MAJJI (Author)
  const [isAddAuthorModalOpen, setIsAddAuthorModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'author' | 'reviewer' | 'approver' | 'repository' | 'audittrail' | 'compliance' | 'guide'>('author');
  const [documents, setDocuments] = useState<DocumentRecord[]>(INITIAL_DOCUMENTS);
  const [activeDocumentId, setActiveDocumentId] = useState<string>(INITIAL_DOCUMENTS[0].id);

  // AI State
  const [aiFixes, setAiFixes] = useState<AIFixItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // PDF Preview State
  const [previewDocForPDF, setPreviewDocForPDF] = useState<DocumentRecord | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Task Assigned',
      message: 'Batch 409-B Release Record draft is ready for tabular authoring & AI scanning.',
      timestamp: new Date().toISOString(),
      type: 'INFO',
      read: false,
    },
  ]);

  const activeDocument = useMemo(() => {
    return documents.find((d) => d.id === activeDocumentId) || documents[0] || null;
  }, [documents, activeDocumentId]);

  const selectDocumentById = (id: string) => {
    setActiveDocumentId(id);
    setAiFixes([]);
    setIsSidePanelOpen(false);
  };

  const addNotification = (title: string, message: string, type: NotificationItem['type'], documentId?: string) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      type,
      documentId,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // --- 21 CFR Part 11 Compliance Alert Modal State ---
  const [complianceAlert, setComplianceAlert] = useState<{
    isOpen: boolean;
    message: string;
    attemptedAction?: string;
  } | null>(null);

  const triggerComplianceAlert = (message?: string, attemptedAction?: string) => {
    const finalMsg = message || AUTHOR_ACCESS_DENIED_MESSAGE;
    setComplianceAlert({
      isOpen: true,
      message: finalMsg,
      attemptedAction: attemptedAction || 'Drafting Action',
    });

    addNotification(
      '21 CFR Part 11 Access Control Intercept',
      `${finalMsg} [Attempted Action: ${attemptedAction || 'Drafting Action'}]`,
      'ALERT',
      activeDocument?.id
    );

    // Record violation in document audit trail if document is active
    if (activeDocument) {
      const violationAudit: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        documentId: activeDocument.id,
        timestamp: getGMPTimestamp(),
        action: 'ROLE_CONFLICT_BLOCKED',
        performedBy: currentUser.name,
        userRole: currentUser.role,
        details: `Access Denied: Persona ${currentUser.name} (${currentUser.role}) attempted unauthorized draft modification: "${attemptedAction || 'Drafting'}". Blocked under FDA 21 CFR § 11.10.`,
        ipAddress: '192.168.10.45',
        checksum: generateChecksum(`${activeDocument.id}-blocked-${currentUser.id}-${Date.now()}`),
      };
      setDocuments((prev) =>
        prev.map((d) => (d.id === activeDocument.id ? { ...d, auditTrail: [...d.auditTrail, violationAudit] } : d))
      );
    }
  };

  const closeComplianceAlert = () => {
    setComplianceAlert(null);
  };

  // --- Dynamic Author Persona Enrollment ---
  const addNewAuthor = (authorData: {
    name: string;
    employeeId: string;
    title?: string;
    department?: string;
    email?: string;
    avatar?: string;
  }): User => {
    const cleanName = authorData.name.trim();
    const cleanId = authorData.employeeId.trim().toUpperCase();
    const initials =
      cleanName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 3) || 'AUTH';

    const cleanEmail =
      authorData.email?.trim() ||
      `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@pharmatech.com`;

    const newUser: User = {
      id: `user-author-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: 'AUTHOR', // Guaranteed AUTHOR role
      title: authorData.title?.trim() || 'Process & Formulation Engineer',
      department: authorData.department?.trim() || 'Manufacturing Operations (Shift C)',
      employeeId: cleanId,
      avatar: authorData.avatar || '/avatars/naveen_author1.jpg',
      digitalSignatureId: `SIG-AUTH-${cleanId}-${initials}`,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Confetti fallback
    }

    addNotification(
      'New Author Persona Enrolled',
      `Author "${newUser.name}" (${newUser.employeeId}) registered and assigned AUTHOR credentials.`,
      'SUCCESS'
    );

    return newUser;
  };

  // --- Strict Segregation Rule Helpers ---
  const canReviewDocument = (doc: DocumentRecord): { allowed: boolean; reason?: string } => {
    if (currentUser.role !== 'REVIEWER') {
      return {
        allowed: false,
        reason: `Current role (${currentUser.role}) does not have QA Review privileges. Switch to Reviewer (e.g. Santosh kumar majji).`,
      };
    }
    // Strict Separation Rule: The Author cannot act as the Reviewer
    if (doc.authorId === currentUser.id) {
      return {
        allowed: false,
        reason: `21 CFR Part 11 Segregation of Duties Violation: ${doc.authorName} is the Author of this document and is strictly prohibited from reviewing their own submission.`,
      };
    }
    return { allowed: true };
  };

  const canApproveDocument = (doc: DocumentRecord): { allowed: boolean; reason?: string } => {
    if (currentUser.role !== 'APPROVER') {
      return {
        allowed: false,
        reason: `Current role (${currentUser.role}) does not possess final release authority. Switch to Approver (e.g. Rajsekhar Gudivada).`,
      };
    }
    // Strict Separation Rule: The Reviewer or Author CANNOT act as the Approver
    if (doc.authorId === currentUser.id) {
      return {
        allowed: false,
        reason: `21 CFR Part 11 Segregation of Duties Violation: The Author cannot act as the Final Approver. An independent site executive must approve.`,
      };
    }
    if (doc.reviewerId === currentUser.id) {
      return {
        allowed: false,
        reason: `21 CFR Part 11 Segregation of Duties Violation: The QA Reviewer cannot act as the Final Approver. Dual-signoff segregation required.`,
      };
    }
    return { allowed: true };
  };

  // --- AI Scanner Implementation ---
  const runAIScanner = () => {
    if (!activeDocument) return;
    setIsScanning(true);
    setIsSidePanelOpen(true);

    setTimeout(() => {
      const detectedFixes = scanTableData(activeDocument.rows);
      setAiFixes(detectedFixes);
      setIsScanning(false);

      // Audit log entry for AI scan
      const scanAudit: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        documentId: activeDocument.id,
        timestamp: getGMPTimestamp(),
        action: 'AI_SCAN_PERFORMED',
        performedBy: currentUser.name,
        userRole: currentUser.role,
        details: `AI Scanner analyzed ${activeDocument.rows.length} rows. Found ${detectedFixes.length} potential anomalies/fixes.`,
        ipAddress: '192.168.10.45',
        checksum: generateChecksum(`${activeDocument.id}-ai-scan-${detectedFixes.length}`),
      };

      setDocuments((prev) =>
        prev.map((d) => (d.id === activeDocument.id ? { ...d, auditTrail: [...d.auditTrail, scanAudit] } : d))
      );

      addNotification(
        'AI Scanner Complete',
        `Analyzed ${activeDocument.rows.length} records; flagged ${detectedFixes.length} anomalies for review.`,
        detectedFixes.length > 0 ? 'WARNING' : 'SUCCESS',
        activeDocument.id
      );
    }, 600);
  };

  const applyFix = (fixId: string) => {
    const authCheck = validateAuthorAccess(currentUser);
    if (!authCheck.allowed) {
      triggerComplianceAlert(authCheck.message, 'Apply AI Fix');
      return;
    }
    const fix = aiFixes.find((f) => f.id === fixId);
    if (!fix || !activeDocument) return;

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== activeDocument.id) return d;
        const updatedRows = d.rows.map((row) => {
          if (row.id === fix.rowId) {
            return {
              ...row,
              [fix.columnKey]: fix.suggestedValue,
              _modifiedByAI: true,
            };
          }
          return row;
        });

        const auditEntry: AuditLogEntry = {
          id: `audit-${Date.now()}`,
          documentId: d.id,
          timestamp: getGMPTimestamp(),
          action: 'AI_FIX_APPLIED',
          performedBy: currentUser.name,
          userRole: currentUser.role,
          details: `AI fix accepted for [${fix.columnKey}]: "${fix.originalValue}" -> "${fix.suggestedValue}"`,
          fieldChanged: fix.columnKey,
          oldValue: String(fix.originalValue),
          newValue: String(fix.suggestedValue),
          reasonForChange: `AI Correction: ${fix.explanation}`,
          ipAddress: '192.168.10.45',
          checksum: generateChecksum(`${d.id}-${fix.rowId}-${fix.suggestedValue}`),
        };

        return {
          ...d,
          rows: updatedRows,
          updatedAt: getGMPTimestamp(),
          auditTrail: [...d.auditTrail, auditEntry],
        };
      })
    );

    setAiFixes((prev) => prev.map((f) => (f.id === fixId ? { ...f, status: 'ACCEPTED' } : f)));
  };

  const applyAllFixes = () => {
    const authCheck = validateAuthorAccess(currentUser);
    if (!authCheck.allowed) {
      triggerComplianceAlert(authCheck.message, 'Apply All AI Corrections');
      return;
    }
    if (!activeDocument) return;
    const pendingFixes = aiFixes.filter((f) => f.status === 'PENDING');
    if (pendingFixes.length === 0) return;

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== activeDocument.id) return d;
        const updatedRows = d.rows.map((row) => {
          const rowFixes = pendingFixes.filter((f) => f.rowId === row.id);
          if (rowFixes.length === 0) return row;

          const updatedRow = { ...row, _modifiedByAI: true };
          rowFixes.forEach((fix) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (updatedRow as any)[fix.columnKey] = fix.suggestedValue;
          });
          return updatedRow;
        });

        const auditEntry: AuditLogEntry = {
          id: `audit-${Date.now()}`,
          documentId: d.id,
          timestamp: getGMPTimestamp(),
          action: 'AI_ALL_FIXES_APPLIED',
          performedBy: currentUser.name,
          userRole: currentUser.role,
          details: `Batch accepted ${pendingFixes.length} AI corrections across table rows.`,
          reasonForChange: 'Batch standardization per AI Scanner recommendations',
          ipAddress: '192.168.10.45',
          checksum: generateChecksum(`${d.id}-batch-ai-${pendingFixes.length}`),
        };

        return {
          ...d,
          rows: updatedRows,
          updatedAt: getGMPTimestamp(),
          auditTrail: [...d.auditTrail, auditEntry],
        };
      })
    );

    setAiFixes((prev) => prev.map((f) => ({ ...f, status: 'ACCEPTED' })));
    addNotification('All AI Fixes Applied', `Standardized ${pendingFixes.length} entries successfully.`, 'SUCCESS', activeDocument.id);
  };

  const rejectFix = (fixId: string) => {
    setAiFixes((prev) => prev.map((f) => (f.id === fixId ? { ...f, status: 'REJECTED' } : f)));
  };

  // --- Document Cell & Row Editing ---
  const updateCell = (rowId: string, columnKey: string, newValue: string | number, reason?: string) => {
    const authCheck = validateAuthorAccess(currentUser);
    if (!authCheck.allowed) {
      triggerComplianceAlert(authCheck.message, 'Modify Table Cell');
      return;
    }
    if (!activeDocument) return;

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== activeDocument.id) return d;
        let oldValue = '';
        const updatedRows = d.rows.map((row) => {
          if (row.id === rowId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            oldValue = String((row as any)[columnKey] ?? '');
            return {
              ...row,
              [columnKey]: newValue,
            };
          }
          return row;
        });

        const auditEntry: AuditLogEntry = {
          id: `audit-${Date.now()}`,
          documentId: d.id,
          timestamp: getGMPTimestamp(),
          action: 'ROW_EDITED',
          performedBy: currentUser.name,
          userRole: currentUser.role,
          details: `Field [${columnKey}] modified on row ${rowId}`,
          fieldChanged: columnKey,
          oldValue,
          newValue: String(newValue),
          reasonForChange: reason || 'Manual cell update during authoring',
          ipAddress: '192.168.10.45',
          checksum: generateChecksum(`${d.id}-${rowId}-${newValue}`),
        };

        return {
          ...d,
          rows: updatedRows,
          updatedAt: getGMPTimestamp(),
          auditTrail: [...d.auditTrail, auditEntry],
        };
      })
    );
  };

  const addRow = (newRow?: Partial<TableRow>) => {
    const authCheck = validateAuthorAccess(currentUser);
    if (!authCheck.allowed) {
      triggerComplianceAlert(authCheck.message, 'Add Record Row');
      return;
    }
    if (!activeDocument) return;
    const newId = `row-${Date.now()}`;
    const constructedRow: TableRow = {
      id: newId,
      name: 'New Operator / Subject',
      age: 30,
      phone: '+1 (555) 000-0000',
      batchId: `LOT-${Math.floor(100 + Math.random() * 900)}`,
      parameter: 'Assay Measurement',
      reading: '100.0%',
      notes: 'Entry created per GMP procedure',
      status: 'Pass',
      ...newRow,
    };

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== activeDocument.id) return d;
        const auditEntry: AuditLogEntry = {
          id: `audit-${Date.now()}`,
          documentId: d.id,
          timestamp: getGMPTimestamp(),
          action: 'ROW_ADDED',
          performedBy: currentUser.name,
          userRole: currentUser.role,
          details: `Appended row ${newId} with name "${constructedRow.name}"`,
          ipAddress: '192.168.10.45',
          checksum: generateChecksum(`${d.id}-add-${newId}`),
        };
        return {
          ...d,
          rows: [...d.rows, constructedRow],
          updatedAt: getGMPTimestamp(),
          auditTrail: [...d.auditTrail, auditEntry],
        };
      })
    );
  };

  const deleteRow = (rowId: string, reason?: string) => {
    const authCheck = validateAuthorAccess(currentUser);
    if (!authCheck.allowed) {
      triggerComplianceAlert(authCheck.message, 'Delete Record Row');
      return;
    }
    if (!activeDocument) return;
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== activeDocument.id) return d;
        const rowToDelete = d.rows.find((r) => r.id === rowId);
        const auditEntry: AuditLogEntry = {
          id: `audit-${Date.now()}`,
          documentId: d.id,
          timestamp: getGMPTimestamp(),
          action: 'ROW_DELETED',
          performedBy: currentUser.name,
          userRole: currentUser.role,
          details: `Deleted row ${rowId} (Name: "${rowToDelete?.name || 'Unknown'}")`,
          reasonForChange: reason || 'Deleted row deemed superfluous during pre-review checks',
          ipAddress: '192.168.10.45',
          checksum: generateChecksum(`${d.id}-del-${rowId}`),
        };
        return {
          ...d,
          rows: d.rows.filter((r) => r.id !== rowId),
          updatedAt: getGMPTimestamp(),
          auditTrail: [...d.auditTrail, auditEntry],
        };
      })
    );
  };

  const createDocumentFromTemplate = (
    title: string,
    category: DocumentRecord['category'],
    initialRows: TableRow[]
  ): DocumentRecord => {
    const authCheck = validateAuthorAccess(currentUser);
    if (!authCheck.allowed) {
      triggerComplianceAlert(authCheck.message, 'Prepare New Document from Template');
      return activeDocument || documents[0];
    }

    const newDocId = `doc-${Date.now()}`;
    const docNumber = `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newDoc: DocumentRecord = {
      id: newDocId,
      documentNumber: docNumber,
      title,
      category,
      version: '1.0.0',
      status: 'DRAFT',
      createdAt: getGMPTimestamp(),
      updatedAt: getGMPTimestamp(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      activeRevisionCount: 0,
      columns: STANDARD_COLUMNS,
      rows: initialRows,
      signatures: [],
      reviewComments: [],
      auditTrail: [
        {
          id: `audit-${Date.now()}`,
          documentId: newDocId,
          timestamp: getGMPTimestamp(),
          action: 'DOCUMENT_CREATED',
          performedBy: currentUser.name,
          userRole: currentUser.role,
          details: `Record created from template "${title}"`,
          ipAddress: '192.168.10.45',
          checksum: generateChecksum(`${newDocId}-create`),
        },
      ],
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocumentId(newDocId);
    addNotification('Template Loaded', `New draft record "${title}" initialized.`, 'SUCCESS', newDocId);
    return newDoc;
  };

  const importDocumentFromFile = (
    title: string,
    columns: TableColumn[],
    rows: TableRow[]
  ): DocumentRecord => {
    const authCheck = validateAuthorAccess(currentUser);
    if (!authCheck.allowed) {
      triggerComplianceAlert(authCheck.message, 'Import Document File');
      return activeDocument || documents[0];
    }

    const newDocId = `doc-imp-${Date.now()}`;
    const docNumber = `IMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDoc: DocumentRecord = {
      id: newDocId,
      documentNumber: docNumber,
      title,
      category: 'Batch Record',
      version: '1.0.0',
      status: 'DRAFT',
      createdAt: getGMPTimestamp(),
      updatedAt: getGMPTimestamp(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      activeRevisionCount: 0,
      columns: columns.length > 0 ? columns : STANDARD_COLUMNS,
      rows,
      signatures: [],
      reviewComments: [],
      auditTrail: [
        {
          id: `audit-${Date.now()}`,
          documentId: newDocId,
          timestamp: getGMPTimestamp(),
          action: 'DOCUMENT_UPLOADED',
          performedBy: currentUser.name,
          userRole: currentUser.role,
          details: `Source file parsed into interactive grid with ${rows.length} rows`,
          ipAddress: '192.168.10.45',
          checksum: generateChecksum(`${newDocId}-upload-${rows.length}`),
        },
      ],
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocumentId(newDocId);
    addNotification('Document Imported', `Imported ${rows.length} records into "${title}".`, 'SUCCESS', newDocId);
    return newDoc;
  };

  // --- 21 CFR Part 11 Electronic Signature ("Prepared By") ---
  const signPreparedBy = async (password: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    const authCheck = validateAuthorAccess(currentUser);
    if (!authCheck.allowed) {
      triggerComplianceAlert(authCheck.message, 'Sign "Prepared By"');
      return { success: false, error: authCheck.message };
    }
    if (!activeDocument) return { success: false, error: 'No active document selected' };
    if (!password || password.trim().length < 3) {
      return { success: false, error: 'Electronic credential verification failed: Password required.' };
    }

    const stampChecksum = generateChecksum(`${activeDocument.id}-prep-${currentUser.id}-${Date.now()}`);
    const signatureStamp: SignatureStamp = {
      type: 'PREPARED_BY',
      signerName: currentUser.name,
      signerEmail: currentUser.email,
      signerRole: currentUser.role,
      signerTitle: currentUser.title,
      timestamp: getGMPTimestamp(),
      reason: reason || 'I author and verify the accuracy of this record per SOP-2104',
      checksum: stampChecksum,
      ipAddress: '192.168.10.45',
      sessionId: `SESS-${currentUser.employeeId}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      documentId: activeDocument.id,
      timestamp: getGMPTimestamp(),
      action: 'SIGNATURE_PREPARED',
      performedBy: currentUser.name,
      userRole: currentUser.role,
      details: `Electronic signature applied: "Prepared by: ${currentUser.name}" (Intent: ${signatureStamp.reason})`,
      reasonForChange: signatureStamp.reason,
      ipAddress: signatureStamp.ipAddress,
      checksum: stampChecksum,
    };

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== activeDocument.id) return d;
        // Keep any prior reviewer/approver signatures wiped if this is a re-preparation after revision
        return {
          ...d,
          status: 'PENDING_REVIEW' as DocumentStatus,
          signatures: [signatureStamp],
          updatedAt: getGMPTimestamp(),
          auditTrail: [...d.auditTrail, auditEntry],
        };
      })
    );

    addNotification(
      'Document Submitted to Reviewer',
      `"${activeDocument.title}" signed with "Prepared by: ${currentUser.name}" and routed to Reviewer queue.`,
      'SUCCESS',
      activeDocument.id
    );

    return { success: true };
  };

  // --- Reviewer Action 1: Route Back with Comments ---
  const routeReviewWithComments = (commentText: string, actionRequired?: string): boolean => {
    if (!activeDocument) return false;
    const segregation = canReviewDocument(activeDocument);
    if (!segregation.allowed) return false;

    if (!commentText || commentText.trim().length === 0) {
      return false;
    }

    const newComment: ReviewComment = {
      id: `rev-comm-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      timestamp: getGMPTimestamp(),
      comment: commentText.trim(),
      resolved: false,
      actionRequired: actionRequired || 'Author must rectify flagged items, run AI check, and re-authenticate.',
    };

    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      documentId: activeDocument.id,
      timestamp: getGMPTimestamp(),
      action: 'ROUTED_FOR_REVISION',
      performedBy: currentUser.name,
      userRole: currentUser.role,
      details: `Reviewer rejected document back to Author. Comment: "${commentText}"`,
      reasonForChange: `Revision Required: ${commentText}`,
      ipAddress: '192.168.10.12',
      checksum: generateChecksum(`${activeDocument.id}-revision-${Date.now()}`),
    };

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== activeDocument.id) return d;
        return {
          ...d,
          status: 'IN_REVISION' as DocumentStatus,
          activeRevisionCount: d.activeRevisionCount + 1,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name,
          reviewComments: [newComment, ...d.reviewComments],
          updatedAt: getGMPTimestamp(),
          auditTrail: [...d.auditTrail, auditEntry],
        };
      })
    );

    addNotification(
      'Document Returned for Revision',
      `"${activeDocument.title}" has been sent back to Author with mandatory review comments.`,
      'WARNING',
      activeDocument.id
    );

    return true;
  };

  // --- Reviewer Action 2: Direct Pass Rule (No Comments) ---
  const signReviewedDirectPass = async (password: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    if (!activeDocument) return { success: false, error: 'No active document selected' };
    const segregation = canReviewDocument(activeDocument);
    if (!segregation.allowed) return { success: false, error: segregation.reason };

    if (!password || password.trim().length < 3) {
      return { success: false, error: 'Electronic credential verification failed: Password required.' };
    }

    const stampChecksum = generateChecksum(`${activeDocument.id}-revpass-${currentUser.id}-${Date.now()}`);
    const signatureStamp: SignatureStamp = {
      type: 'REVIEWED_BY',
      signerName: currentUser.name,
      signerEmail: currentUser.email,
      signerRole: currentUser.role,
      signerTitle: currentUser.title,
      timestamp: getGMPTimestamp(),
      reason: reason || 'Direct Pass: Zero discrepancies noted. Data integrity verified per GMP criteria.',
      checksum: stampChecksum,
      ipAddress: '192.168.10.12',
      sessionId: `SESS-${currentUser.employeeId}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      documentId: activeDocument.id,
      timestamp: getGMPTimestamp(),
      action: 'REVIEW_PASSED',
      performedBy: currentUser.name,
      userRole: currentUser.role,
      details: `Direct Pass Rule applied: No comments added. Document signed: "Reviewed by: ${currentUser.name}" and routed straight to Approver.`,
      reasonForChange: signatureStamp.reason,
      ipAddress: signatureStamp.ipAddress,
      checksum: stampChecksum,
    };

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== activeDocument.id) return d;
        return {
          ...d,
          status: 'PENDING_APPROVAL' as DocumentStatus,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name,
          signatures: [...d.signatures, signatureStamp],
          updatedAt: getGMPTimestamp(),
          auditTrail: [...d.auditTrail, auditEntry],
        };
      })
    );

    addNotification(
      'Review Passed Straight to Approver',
      `"${activeDocument.title}" passed with zero comments. Stamped "Reviewed by: ${currentUser.name}" and routed to Approver queue.`,
      'SUCCESS',
      activeDocument.id
    );

    return { success: true };
  };

  // --- Approver Action: Final Approval & Electronic Sign-off ---
  const signApprovedBy = async (password: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    if (!activeDocument) return { success: false, error: 'No active document selected' };
    const segregation = canApproveDocument(activeDocument);
    if (!segregation.allowed) return { success: false, error: segregation.reason };

    if (!password || password.trim().length < 3) {
      return { success: false, error: 'Electronic credential verification failed: Password required.' };
    }

    const stampChecksum = generateChecksum(`${activeDocument.id}-appr-${currentUser.id}-${Date.now()}`);
    const signatureStamp: SignatureStamp = {
      type: 'APPROVED_BY',
      signerName: currentUser.name,
      signerEmail: currentUser.email,
      signerRole: currentUser.role,
      signerTitle: currentUser.title,
      timestamp: getGMPTimestamp(),
      reason: reason || 'Authorized for commercial release and GMP archive per 21 CFR Part 11',
      checksum: stampChecksum,
      ipAddress: '192.168.10.02',
      sessionId: `SESS-${currentUser.employeeId}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      documentId: activeDocument.id,
      timestamp: getGMPTimestamp(),
      action: 'SIGNATURE_APPROVED',
      performedBy: currentUser.name,
      userRole: currentUser.role,
      details: `Final approval electronic sign-off completed: "Approved by: ${currentUser.name}"`,
      reasonForChange: signatureStamp.reason,
      ipAddress: signatureStamp.ipAddress,
      checksum: stampChecksum,
    };

    const updatedDocument: DocumentRecord = {
      ...activeDocument,
      status: 'APPROVED' as DocumentStatus,
      approverId: currentUser.id,
      approverName: currentUser.name,
      signatures: [...activeDocument.signatures, signatureStamp],
      updatedAt: getGMPTimestamp(),
      auditTrail: [...activeDocument.auditTrail, auditEntry],
    };

    setDocuments((prev) => prev.map((d) => (d.id === activeDocument.id ? updatedDocument : d)));

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    addNotification(
      'Document Officially Approved & Released!',
      `"${activeDocument.title}" signed by ${currentUser.name}. PDF preview ready for repository archiving.`,
      'SUCCESS',
      activeDocument.id
    );

    // Automatically render the PDF preview modal per requirement!
    setPreviewDocForPDF(updatedDocument);

    return { success: true };
  };

  // --- Save to Repository ---
  const saveToRepository = (docId: string) => {
    const targetDoc = documents.find((d) => d.id === docId);
    if (!targetDoc) return;

    const repositoryChecksum = generateChecksum(`vault-${targetDoc.id}-${Date.now()}`);
    const timestamp = getGMPTimestamp();

    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      documentId: targetDoc.id,
      timestamp,
      action: 'SAVED_TO_REPOSITORY',
      performedBy: currentUser.name,
      userRole: currentUser.role,
      details: 'Pushed to 21 CFR Part 11 compliant Secure Repository Vault with cryptographic verification stamp.',
      ipAddress: '192.168.10.02',
      checksum: repositoryChecksum,
    };

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        return {
          ...d,
          repositoryStored: true,
          repositoryDate: timestamp,
          repositoryChecksum,
          auditTrail: [...d.auditTrail, auditEntry],
        };
      })
    );

    addNotification(
      'Record Archived in Secure Repository',
      `"${targetDoc.title}" archived with Vault Checksum: ${repositoryChecksum}`,
      'SUCCESS',
      targetDoc.id
    );
  };

  return (
    <WorkflowContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        activeTab,
        setActiveTab,
        documents,
        activeDocument,
        setActiveDocument: (doc) => setActiveDocumentId(doc?.id || ''),
        selectDocumentById,
        notifications,
        dismissNotification,
        aiFixes,
        isScanning,
        isSidePanelOpen,
        setIsSidePanelOpen,
        runAIScanner,
        applyFix,
        applyAllFixes,
        rejectFix,
        updateCell,
        addRow,
        deleteRow,
        createDocumentFromTemplate,
        importDocumentFromFile,
        signPreparedBy,
        routeReviewWithComments,
        signReviewedDirectPass,
        signApprovedBy,
        saveToRepository,
        previewDocForPDF,
        setPreviewDocForPDF,
        canReviewDocument,
        canApproveDocument,
        validateAuthorAccess,
        complianceAlert,
        triggerComplianceAlert,
        closeComplianceAlert,
        addNewAuthor,
        isAddAuthorModalOpen,
        setIsAddAuthorModalOpen,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error('useWorkflow must be used within a WorkflowProvider');
  return context;
};
