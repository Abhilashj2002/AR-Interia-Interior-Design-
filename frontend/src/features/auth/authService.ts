/**
 * Authentication Service - Centralized auth logic
 * Extracted from main.ts for modularity
 */

import type { User, AdminState, CustomerState } from '../../types';

const AUTH_TOKEN_KEY = 'ar_interia_auth_token';
const AUTH_USER_KEY = 'ar_interia_current_user';
const ADMIN_SESSION_KEY = 'ar_interia_users_current';

export const authService = {
  /**
   * Save auth token
   */
  saveToken: (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  /**
   * Get auth token
   */
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Clear auth token
   */
  clearToken: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  /**
   * Save current user
   */
  saveUser: (user: User) => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    if (user.role === 'admin') {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: (): User | null => {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * Get admin session (fallback for admin context)
   */
  getAdminSession: (): User | null => {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * Clear auth session
   */
  clearSession: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!authService.getToken() && !!authService.getCurrentUser();
  },

  /**
   * Check if user is admin
   */
  isAdmin: (): boolean => {
    return authService.getCurrentUser()?.role === 'admin';
  },

  /**
   * Validate token with backend
   */
  validateToken: async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
};
