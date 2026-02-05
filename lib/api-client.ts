/**
 * Centralized API client with automatic JWT attachment and error handling.
 *
 * This client creates JWT tokens for backend API authentication using
 * the same secret that Better Auth and the backend use for verification.
 */

import * as jose from 'jose';
import type { ApiError, ApiResponse } from './types';

class ApiClient {
  private baseUrl: string;
  private secret: Uint8Array | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  /**
   * Get the secret key for JWT signing.
   * Uses the same secret as Better Auth and the backend.
   */
  private getSecret(): Uint8Array {
    if (!this.secret) {
      const secretStr = process.env.BETTER_AUTH_SECRET || '';
      this.secret = new TextEncoder().encode(secretStr);
    }
    return this.secret;
  }

  /**
   * Create a JWT token for the given user.
   * This token will be verified by the backend using the same secret.
   */
  async createToken(userId: string | number, email?: string): Promise<string> {
    const secret = this.getSecret();

    const token = await new jose.SignJWT({
      sub: String(userId),
      email: email || undefined,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    return token;
  }

  /**
   * Make authenticated API request.
   * Requires userId and optionally email for JWT creation.
   */
  async request<T>(
    endpoint: string,
    options: RequestInit & { userId?: string | number; email?: string } = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { userId, email, ...fetchOptions } = options;

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
      };

      // Create and attach JWT token if userId is provided
      if (userId) {
        const token = await this.createToken(userId, email);
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Make request
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: undefined as unknown as T };
      }

      // Handle 401 Unauthorized
      if (response.status === 401) {
        return {
          error: {
            detail: 'Unauthorized - please login',
          },
        };
      }

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        return {
          error: typeof data === 'object' ? data as ApiError : { detail: String(data) },
        };
      }

      return {
        data: data as T,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: {
          detail: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, userId?: string | number, email?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', userId, email });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: unknown, userId?: string | number, email?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      userId,
      email,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body: unknown, userId?: string | number, email?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      userId,
      email,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, userId?: string | number, email?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      userId,
      email,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, userId?: string | number, email?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', userId, email });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
