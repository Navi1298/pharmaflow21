export type UserRole = 'AUTHOR' | 'REVIEWER' | 'APPROVER' | 'AUDITOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  employeeId: string;
  avatar: string;
  digitalSignatureId: string;
}

export type DocumentStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'IN_REVISION'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';

export interface TableRow {
  id: string;
  name: string;
  age: number | string;
  phone: string;
  batchId?: string;
  parameter?: string;
  reading?: string | number;
  minLimit?: number | string;
  maxLimit?: number | string;
  customFields?: Record<string, string>;
  notes?: string;
  status?: 'Pass' | 'Fail' | 'Pending' | 'Warning';
  _modifiedByAI?: boolean;
  _flagged?: boolean;
}

export interface TableColumn {
  key: keyof TableRow | string;
  label: string;
  type: 'text' | 'number' | 'select' | 'status';
  options?: string[];
  required?: boolean;
  width?: string;
}

export interface SignatureStamp {
  type: 'PREPARED_BY' | 'REVIEWED_BY' | 'APPROVED_BY';
  signerName: string;
  signerEmail: string;
  signerRole: UserRole;
  signerTitle: string;
  timestamp: string; // ISO String
  reason: string;
  checksum: string; // Digital hash
  ipAddress: string;
  sessionId: string;
}

export interface ReviewComment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  timestamp: string;
  comment: string;
  resolved: boolean;
  rowId?: string;
  field?: string;
  actionRequired?: string;
}

export interface AIFixItem {
  id: string;
  rowId: string;
  columnKey: string;
  originalValue: string | number;
  suggestedValue: string | number;
  issueType: 'TYPO' | 'CAPITALIZATION' | 'PHONE_FORMAT' | 'RANGE_ANOMALY' | 'MISSING_DATA';
  explanation: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'FORMAT';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface AuditLogEntry {
  id: string;
  documentId: string;
  timestamp: string;
  action:
    | 'DOCUMENT_CREATED'
    | 'DOCUMENT_UPLOADED'
    | 'ROW_EDITED'
    | 'ROW_ADDED'
    | 'ROW_DELETED'
    | 'AI_SCAN_PERFORMED'
    | 'AI_FIX_APPLIED'
    | 'AI_ALL_FIXES_APPLIED'
    | 'SIGNATURE_PREPARED'
    | 'REVIEW_COMMENT_ADDED'
    | 'ROUTED_FOR_REVISION'
    | 'REVIEW_PASSED'
    | 'SIGNATURE_REVIEWED'
    | 'SIGNATURE_APPROVED'
    | 'PDF_GENERATED'
    | 'SAVED_TO_REPOSITORY'
    | 'ROLE_CONFLICT_BLOCKED';
  performedBy: string;
  userRole: UserRole;
  details: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  reasonForChange?: string;
  ipAddress: string;
  checksum: string;
}

export interface DocumentRecord {
  id: string;
  documentNumber: string; // e.g. SOP-BMR-2026-089
  title: string;
  category: 'Batch Record' | 'SOP Manifest' | 'Equipment Calibration' | 'Release Specification' | 'Quality Control';
  version: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  reviewerId?: string;
  reviewerName?: string;
  approverId?: string;
  approverName?: string;
  columns: TableColumn[];
  rows: TableRow[];
  signatures: SignatureStamp[];
  reviewComments: ReviewComment[];
  auditTrail: AuditLogEntry[];
  pdfGenerated?: boolean;
  repositoryStored?: boolean;
  repositoryDate?: string;
  repositoryChecksum?: string;
  activeRevisionCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  documentId?: string;
  read: boolean;
}
