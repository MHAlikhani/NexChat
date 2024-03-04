/**
 * Rooms Store (Zustand)
 *
 * @module features/rooms/stores/roomsStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Room } from '../types';

interface RoomsState {
  rooms: Room[];
  activeRoomId: string | null;
  isLoading: boolean;
  error: Error | null;
  isCreateModalOpen: boolean;
  searchQuery: string;
  isSubscribed: boolean;
}

interface RoomsActions {
  setRooms: (rooms: Room[]) => void;
  setActiveRoom: (roomId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSubscribed: (isSubscribed: boolean) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  removeRoom: (roomId: string) => void;
  reset: () => void;
}

type RoomsStore = RoomsState & RoomsActions;

const initialState: RoomsState = {
  rooms: [],
  activeRoomId: null,
  isLoading: false,
  error: null,
  isCreateModalOpen: false,
  searchQuery: '',
  isSubscribed: false,
};

function deduplicateRooms(rooms: Room[]): Room[] {
  const map = new Map<string, Room>();
  rooms.forEach((room) => {
    map.set(room.id, room);
  });
  return Array.from(map.values());
}

function haveRoomsChanged(oldRooms: Room[], newRooms: Room[]): boolean {
  if (oldRooms.length !== newRooms.length) {
    return true;
  }

  return newRooms.some((room, index) => {
    const oldRoom = oldRooms[index];
    return (
      !oldRoom ||
      room.id !== oldRoom.id ||
      room.lastActivityAt !== oldRoom.lastActivityAt ||
      room.memberCount !== oldRoom.memberCount
    );
  });
}

export const useRoomsStore = create<RoomsStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setRooms: (rooms) =>
        set((state) => {
          const uniqueRooms = deduplicateRooms(rooms);

          if (!haveRoomsChanged(state.rooms, uniqueRooms)) {
            return state;
          }

          return { rooms: uniqueRooms };
        }),

      setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSubscribed: (isSubscribed) => set({ isSubscribed }),

      addRoom: (room) =>
        set((state) => {
          const existingIndex = state.rooms.findIndex(
            (r) => r.id === room.id
          );

          if (existingIndex !== -1) {
            const updatedRooms = [...state.rooms];
            updatedRooms[existingIndex] = {
              ...updatedRooms[existingIndex],
              ...room,
            };
            return { rooms: updatedRooms };
          }

          return { rooms: [room, ...state.rooms] };
        }),

      updateRoom: (roomId, updates) =>
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId ? { ...room, ...updates } : room
          ),
        })),

      removeRoom: (roomId) =>
        set((state) => ({
          rooms: state.rooms.filter((room) => room.id !== roomId),
          activeRoomId:
            state.activeRoomId === roomId ? null : state.activeRoomId,
        })),

      reset: () => set(initialState),
    }),
    { name: 'RoomsStore' }
  )
);

export const roomsSelectors = {
  selectAllRooms: (state: RoomsStore): Room[] => state.rooms,

  selectActiveRoomId: (state: RoomsStore): string | null =>
    state.activeRoomId,

  selectActiveRoom: (state: RoomsStore): Room | null => {
    if (!state.activeRoomId) return null;
    return state.rooms.find((room) => room.id === state.activeRoomId) || null;
  },

  selectIsLoading: (state: RoomsStore): boolean => state.isLoading,

  selectError: (state: RoomsStore): Error | null => state.error,

  selectIsCreateModalOpen: (state: RoomsStore): boolean =>
    state.isCreateModalOpen,

  selectSearchQuery: (state: RoomsStore): string => state.searchQuery,

  selectIsSubscribed: (state: RoomsStore): boolean => state.isSubscribed,

  selectFilteredRooms: (state: RoomsStore): Room[] => {
    const { rooms, searchQuery } = state;

    const uniqueRooms = deduplicateRooms(rooms);

    if (!searchQuery.trim()) {
      return uniqueRooms;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();

    return uniqueRooms.filter(
      (room) =>
        room.name.toLowerCase().includes(normalizedQuery) ||
        room.description?.toLowerCase().includes(normalizedQuery)
    );
  },

  selectRoomById:
    (state: RoomsStore) =>
    (roomId: string): Room | null =>
      state.rooms.find((room) => room.id === roomId) || null,
};
