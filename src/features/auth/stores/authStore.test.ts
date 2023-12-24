/**
 * Auth Store Tests
 *
 * تست‌های جامع برای Zustand Auth Store
 * بررسی state، actions، selectors و persistence
 *
 * @module features/auth/stores/authStore.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAuthStore, authSelectors } from './authStore';
import type { User } from '../types';

describe('Auth Store', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
  };

  beforeEach(() => {
    // پاکسازی store قبل از هر تست
    useAuthStore.setState({
      user: null,
      isLoading: true,
      error: null,
      isInitialized: false,
    });
    localStorage.clear();
  });

  afterEach(() => {
    useAuthStore.setState({
      user: null,
      isLoading: true,
      error: null,
      isInitialized: false,
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.isInitialized).toBe(false);
    });
  });

  describe('Actions', () => {
    it('should set user and clear loading/error', () => {
      useAuthStore.getState().setUser(mockUser);
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
      
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should set error and clear loading', () => {
      const mockError = { code: 'auth/invalid-credential', message: 'Invalid credentials' };
      useAuthStore.getState().setError(mockError);
      
      const state = useAuthStore.getState();
      expect(state.error).toEqual(mockError);
      expect(state.isLoading).toBe(false);
    });

    it('should set initialized state', () => {
      useAuthStore.getState().setInitialized(true);
      expect(useAuthStore.getState().isInitialized).toBe(true);
    });

    it('should reset to initial state', () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setError({ code: 'test', message: 'test' });
      
      useAuthStore.getState().reset();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('Selectors', () => {
    it('selectUser should return current user', () => {
      useAuthStore.getState().setUser(mockUser);
      expect(authSelectors.selectUser(useAuthStore.getState())).toEqual(mockUser);
    });

    it('selectIsLoading should return loading state', () => {
      useAuthStore.getState().setLoading(true);
      expect(authSelectors.selectIsLoading(useAuthStore.getState())).toBe(true);
    });

    it('selectIsAuthenticated should return true when user exists', () => {
      useAuthStore.getState().setUser(mockUser);
      expect(authSelectors.selectIsAuthenticated(useAuthStore.getState())).toBe(true);
      
      useAuthStore.getState().setUser(null);
      expect(authSelectors.selectIsAuthenticated(useAuthStore.getState())).toBe(false);
    });

    it('selectError should return current error', () => {
      const mockError = { code: 'test', message: 'test' };
      useAuthStore.getState().setError(mockError);
      expect(authSelectors.selectError(useAuthStore.getState())).toEqual(mockError);
    });

    it('selectIsInitialized should return initialized state', () => {
      useAuthStore.getState().setInitialized(true);
      expect(authSelectors.selectIsInitialized(useAuthStore.getState())).toBe(true);
    });
  });

  describe('Persistence', () => {
    it('should persist user and isInitialized to localStorage', () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setInitialized(true);
      
      const stored = localStorage.getItem('nexchat-auth-storage');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.state.user).toEqual(mockUser);
      expect(parsed.state.isInitialized).toBe(true);
    });

    it('should NOT persist isLoading and error to localStorage', () => {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setError({ code: 'test', message: 'test' });
      
      const stored = localStorage.getItem('nexchat-auth-storage');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.state.isLoading).toBeUndefined();
      expect(parsed.state.error).toBeUndefined();
    });
  });
});
