import { User, UserRole } from '../types';

export const AUTHOR_ACCESS_DENIED_MESSAGE =
  'Access Denied: Segregation of Duties (FDA 21 CFR Part 11). Only accounts with the Author role are permitted to create or modify draft records.';

export interface AuthorAccessValidationResult {
  allowed: boolean;
  message?: string;
  violatingRole?: UserRole | string;
  requiredRole: 'AUTHOR';
}

/**
 * Validates whether the active persona session has the AUTHOR role.
 * In accordance with FDA 21 CFR Part 11 and EU GMP Annex 11, Reviewers and Approvers
 * are strictly prohibited from creating new documents, clicking "Prepare New Document",
 * or modifying existing draft records.
 *
 * @param activeSession Current active user persona or session object
 * @returns AuthorAccessValidationResult
 */
export function validateAuthorAccess(
  activeSession?: { role?: string; name?: string } | User | null
): AuthorAccessValidationResult {
  if (!activeSession || activeSession.role !== 'AUTHOR') {
    return {
      allowed: false,
      message: AUTHOR_ACCESS_DENIED_MESSAGE,
      violatingRole: activeSession?.role || 'UNKNOWN',
      requiredRole: 'AUTHOR',
    };
  }

  return {
    allowed: true,
    requiredRole: 'AUTHOR',
  };
}
