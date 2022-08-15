/**
 * useRooms Hook
 *
 * Hook اصلی برای مدیریت لیست اتاق‌ها با Real-time sync
 *
 * @module features/rooms/hooks/useRooms
 */

import { useEffect, useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useRoomsStore, roomsSelectors } from '../stores/roomsStore';
import { roomsService } from '../services/rooms.service';
import { useAuth } from '@/features/auth';
import { useDebounce } from '@/shared/hooks/useDebounce';

/**
 * useRooms Return Type
 */
export interface UseRoomsReturn {
  rooms: ReturnType<typeof roomsSelectors.selectFilteredRooms>;
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refresh: () => Promise<void>;
}

/**
 * useRooms Hook
 */
export const useRooms = (): UseRoomsReturn => {
  const { user } = useAuth();

  // State محلی برای search query
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Debounce روی search query
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // استفاده از useShallow برای جلوگیری از re-render غیرضروری
  const { rooms, isLoading, error, isSubscribed } = useRoomsStore(
    useShallow((state) => ({
      rooms: roomsSelectors.selectFilteredRooms(state),
      isLoading: roomsSelectors.selectIsLoading(state),
      error: roomsSelectors.selectError(state),
      isSubscribed: roomsSelectors.selectIsSubscribed(state),
    }))
  );

  /**
   * Stable function to update store search query
   *
   * با useCallback و dependency خالی، این تابع همیشه reference ثابتی دارد
   * و باعث اجرای مجدد useEffect نمی‌شود
   */
  const updateStoreSearchQuery = useCallback((query: string) => {
    useRoomsStore.getState().setSearchQuery(query);
  }, []); // ← dependency خالی = reference ثابت

  /**
   * Update store search query when debounced value changes
   */
  useEffect(() => {
    updateStoreSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, updateStoreSearchQuery]);

  /**
   * Subscribe to real-time room updates
   */
  useEffect(() => {
    if (!user || isSubscribed) {
      return;
    }

    const state = useRoomsStore.getState();
    state.setLoading(true);

    const unsubscribe = roomsService.subscribeToAll(
      (rooms) => {
        const currentState = useRoomsStore.getState();
        currentState.setRooms(rooms);
        currentState.setLoading(false);
        currentState.setError(null);
      },
      {
        userId: user.uid,
        limit: 100,
      }
    );

    useRoomsStore.getState().setSubscribed(true);

    return () => {
      unsubscribe();
      useRoomsStore.getState().setSubscribed(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  /**
   * Search query handler
   */
  const setSearchQuery = useCallback(
    (query: string) => {
      setLocalSearchQuery(query);
    },
    []
  );

  /**
   * Manual refresh (fallback)
   */
  const refresh = useCallback(async () => {
    if (!user) return;

    const state = useRoomsStore.getState();

    try {
      state.setLoading(true);
      const fetchedRooms = await roomsService.getAll();
      state.setRooms(fetchedRooms);
      state.setError(null);
    } catch (error) {
      state.setError(error as Error);
    } finally {
      state.setLoading(false);
    }
  }, [user]);

  return {
    rooms,
    isLoading,
    error,
    searchQuery: localSearchQuery,
    setSearchQuery,
    refresh,
  };
};