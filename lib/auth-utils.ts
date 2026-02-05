/**
 * Authentication utility functions for validation and error handling.
 */

import { ApiError } from './types';

/**
 * Validates email format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength.
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formats authentication API errors for display.
 */
export function formatAuthError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    
    if (apiError.detail) {
      return apiError.detail;
    }

    if (apiError.errors && apiError.errors.length > 0) {
      return apiError.errors.map((e) => e.message).join(', ');
    }
  }

  return 'An unexpected error occurred';
}

/**
 * Checks if a JWT token is expired.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true; // If we can't parse it, consider it expired
  }
}

/**
 * Extracts user info from JWT token.
 */
export function decodeToken(token: string): {
  userId?: number;
  email?: string;
  exp?: number;
} | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.sub || payload.user_id || payload.id,
      email: payload.email,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
