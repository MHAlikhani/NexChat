/**
 * useRooms Hook
 *
 * @module features/rooms/hooks/useRooms
 */

import { useEffect, useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useRoomsStore, roomsSelectors } from '../stores/roomsStore';
import { roomsService } from '../services/rooms.service';
import { useAuth } from '@/features/auth';
import { useDebounce } from '@/shared/hooks/useDebounce';

export interface UseRoomsReturn {
  rooms: ReturnType<typeof roomsSelectors.selectFilteredRooms>;
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refresh: () => Promise<void>;
}

export const useRooms = (): UseRoomsReturn => {
  const { user } = useAuth();
  const userUid = user?.uid;

  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  const { rooms, isLoading, error } = useRoomsStore(
    useShallow((state) => ({
      rooms: roomsSelectors.selectFilteredRooms(state),
      isLoading: roomsSelectors.selectIsLoading(state),
      error: roomsSelectors.selectError(state),
    }))
  );

  const updateStoreSearchQuery = useCallback((query: string) => {
    useRoomsStore.getState().setSearchQuery(query);
  }, []);

  useEffect(() => {
    updateStoreSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, updateStoreSearchQuery]);

  /**
   * Subscribe to real-time room updates for the current user.
   *
   * Uses `useRoomsStore.getState()` to check subscription status
   * instead of the closure value, avoiding stale closure issues
   * and the need for eslint-disable comments.
   *
   * The effect only re-runs when the user's UID changes (i.e., when
   * the user logs in or out), ensuring we don't create duplicate
   * subscriptions.
   */
  useEffect(() => {
    if (!userUid) {
      return;
    }

    // Check subscription status from store directly to avoid stale closure
    const currentState = useRoomsStore.getState();
    if (currentState.isSubscribed) {
      return;
    }

    currentState.setLoading(true);

    const unsubscribe = roomsService.subscribeToAll(
      (rooms) => {
        const state = useRoomsStore.getState();
        state.setRooms(rooms);
        state.setLoading(false);
        state.setError(null);
      },
      {
        userId: userUid,
        limit: 100,
      }
    );

    useRoomsStore.getState().setSubscribed(true);

    return () => {
      unsubscribe();
      useRoomsStore.getState().setSubscribed(false);
    };
  }, [userUid]);

  const setSearchQuery = useCallback((query: string) => {
    setLocalSearchQuery(query);
  }, []);

  const refresh = useCallback(async () => {
    if (!userUid) return;

    const state = useRoomsStore.getState();

    try {
      state.setLoading(true);
      state.setError(null);
      const fetchedRooms = await roomsService.getAll({
        userId: userUid,
        limit: 100,
      });
      state.setRooms(fetchedRooms);
    } catch (error) {
      state.setError(error as Error);
    } finally {
      state.setLoading(false);
    }
  }, [userUid]);

  return {
    rooms,
    isLoading,
    error,
    searchQuery: localSearchQuery,
    setSearchQuery,
    refresh,
  };
};
