/**
 * Form validation utilities
 *
 * Provides client-side validation for task forms
 * Backend is source of truth, this is for UX only
 */

import { TaskCreateInput, TaskUpdateInput } from '@/types/task';

export interface ValidationErrors {
  title?: string;
  description?: string;
}

/**
 * Validate task creation/update form
 *
 * Validation Rules:
 * - Title: Required, non-empty, max 1000 characters
 * - Description: Optional, max 5000 characters
 */
export function validateTaskForm(
  data: TaskCreateInput | TaskUpdateInput
): ValidationErrors {
  const errors: ValidationErrors = {};

  // Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (data.title.length > 1000) {
    errors.title = 'Title must be 1000 characters or less';
  }

  // Description validation (optional field)
  if (data.description && data.description.length > 5000) {
    errors.description = 'Description must be 5000 characters or less';
  }

  return errors;
}
