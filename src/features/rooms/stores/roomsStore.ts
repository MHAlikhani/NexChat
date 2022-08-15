/**
 * Rooms Store (Zustand)
 *
 * مدیریت state سراسری اتاق‌ها
 *
 * @module features/rooms/stores/roomsStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Room } from '../types';

/**
 * Rooms Store State
 */
interface RoomsState {
  rooms: Room[];
  activeRoomId: string | null;
  isLoading: boolean;
  error: Error | null;
  isCreateModalOpen: boolean;
  searchQuery: string;
  isSubscribed: boolean;
}

/**
 * Rooms Store Actions
 */
interface RoomsActions {
  // State setters
  setRooms: (rooms: Room[]) => void;
  setActiveRoom: (roomId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSubscribed: (isSubscribed: boolean) => void;

  // Room operations
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  removeRoom: (roomId: string) => void;

  // Reset
  reset: () => void;
}

type RoomsStore = RoomsState & RoomsActions;

/**
 * Initial State
 */
const initialState: RoomsState = {
  rooms: [],
  activeRoomId: null,
  isLoading: false,
  error: null,
  isCreateModalOpen: false,
  searchQuery: '',
  isSubscribed: false,
};

/**
 * Rooms Store Hook
 */
export const useRoomsStore = create<RoomsStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setRooms: (rooms) => set({ rooms }),

      setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSubscribed: (isSubscribed) => set({ isSubscribed }),

      addRoom: (room) =>
        set((state) => ({
          rooms: [room, ...state.rooms],
        })),

      updateRoom: (roomId, updates) =>
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId ? { ...room, ...updates } : room
          ),
        })),

      removeRoom: (roomId) =>
        set((state) => ({
          rooms: state.rooms.filter((room) => room.id !== roomId),
          activeRoomId: state.activeRoomId === roomId ? null : state.activeRoomId,
        })),

      reset: () => set(initialState),
    }),
    { name: 'RoomsStore' }
  )
);

/**
 * Selectors - برای دسترسی بهینه به state
 */
export const roomsSelectors = {
  selectRooms: (state: RoomsStore) => state.rooms,
  selectActiveRoomId: (state: RoomsStore) => state.activeRoomId,
  selectActiveRoom: (state: RoomsStore) =>
    state.rooms.find((room) => room.id === state.activeRoomId) || null,
  selectIsLoading: (state: RoomsStore) => state.isLoading,
  selectError: (state: RoomsStore) => state.error,
  selectIsCreateModalOpen: (state: RoomsStore) => state.isCreateModalOpen,
  selectSearchQuery: (state: RoomsStore) => state.searchQuery,
  selectIsSubscribed: (state: RoomsStore) => state.isSubscribed,

  selectFilteredRooms: (state: RoomsStore) => {
    const { rooms, searchQuery } = state;

    if (!searchQuery.trim()) {
      return rooms;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(normalizedQuery) ||
        room.description?.toLowerCase().includes(normalizedQuery)
    );
  },

  selectRoomById: (state: RoomsStore) => (roomId: string) =>
    state.rooms.find((room) => room.id === roomId) || null,
};