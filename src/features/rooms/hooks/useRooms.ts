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

  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  const { rooms, isLoading, error, isSubscribed } = useRoomsStore(
    useShallow((state) => ({
      rooms: roomsSelectors.selectFilteredRooms(state),
      isLoading: roomsSelectors.selectIsLoading(state),
      error: roomsSelectors.selectError(state),
      isSubscribed: roomsSelectors.selectIsSubscribed(state),
    }))
  );

  const updateStoreSearchQuery = useCallback((query: string) => {
    useRoomsStore.getState().setSearchQuery(query);
  }, []);

  useEffect(() => {
    updateStoreSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, updateStoreSearchQuery]);

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

  const setSearchQuery = useCallback(
    (query: string) => {
      setLocalSearchQuery(query);
    },
    []
  );

  const refresh = useCallback(async () => {
    if (!user) return;

    const state = useRoomsStore.getState();

    try {
      state.setLoading(true);
      state.setError(null);
      const fetchedRooms = await roomsService.getAll({
        userId: user.uid,
        limit: 100,
      });
      state.setRooms(fetchedRooms);
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
