/**
 * Rooms Store Tests
 *
 * تست‌های جامع برای Zustand Rooms Store
 * بررسی deduplication، optimistic updates، فیلتر کردن و selectors
 *
 * @module features/rooms/stores/roomsStore.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useRoomsStore, roomsSelectors } from './roomsStore';
import type { Room } from '../types';

describe('Rooms Store', () => {
  const mockRooms: Room[] = [
    {
      id: 'room-1',
      name: 'General',
      description: 'General discussion',
      createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
      lastActivityAt: new Date('2024-01-01T12:00:00Z').toISOString(),
      memberCount: 5,
      creatorId: 'user-1',
      members: ['user-1'],
      type: 'public' as const,
      isActive: true,
    },
    {
      id: 'room-2',
      name: 'Development',
      description: 'Dev team chat',
      createdAt: new Date('2024-01-02T10:00:00Z').toISOString(),
      lastActivityAt: new Date('2024-01-02T11:00:00Z').toISOString(),
      memberCount: 3,
      creatorId: 'user-2',
      members: ['user-2'],
      type: 'private' as const,
      isActive: true,
    },
  ];

  beforeEach(() => {
    useRoomsStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useRoomsStore.getState();
      expect(state.rooms).toEqual([]);
      expect(state.activeRoomId).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isCreateModalOpen).toBe(false);
      expect(state.searchQuery).toBe('');
      expect(state.isSubscribed).toBe(false);
    });
  });

  describe('Room Management & Deduplication', () => {
    it('should set rooms and deduplicate by ID', () => {
      const roomsWithDuplicates = [
        mockRooms[0],
        { ...mockRooms[0], memberCount: 10 }, // تکراری با تغییر
        mockRooms[1],
      ];

      useRoomsStore.getState().setRooms(roomsWithDuplicates);

      const state = useRoomsStore.getState();
      expect(state.rooms).toHaveLength(2);
      // آخرین نسخه نگه داشته می‌شود
      expect(state.rooms.find(r => r.id === 'room-1')?.memberCount).toBe(10);
    });

    it('should not trigger re-render if rooms are identical (optimization)', () => {
      useRoomsStore.getState().setRooms(mockRooms);
      const initialRooms = useRoomsStore.getState().rooms;

      // تلاش برای تنظیم همان اتاق‌ها
      useRoomsStore.getState().setRooms(mockRooms);

      const state = useRoomsStore.getState();
      expect(state.rooms).toBe(initialRooms); // همان رفرنس (shallow equality)
    });

    it('should add a new room to the beginning of the list', () => {
      useRoomsStore.getState().setRooms([mockRooms[1]]);

      const newRoom: Room = {
        ...mockRooms[0],
        id: 'room-3',
      };

      useRoomsStore.getState().addRoom(newRoom);

      const state = useRoomsStore.getState();
      expect(state.rooms).toHaveLength(2);
      expect(state.rooms[0].id).toBe('room-3'); // جدیدترین اول
    });

    it('should merge existing room when adding (real-time sync scenario)', () => {
      useRoomsStore.getState().setRooms([mockRooms[0]]);

      // به‌روزرسانی از real-time subscription
      const updatedRoom: Room = {
        ...mockRooms[0],
        memberCount: 6,
        lastActivityAt: new Date('2024-01-01T13:00:00Z').toISOString(),
      };

      useRoomsStore.getState().addRoom(updatedRoom);

      const state = useRoomsStore.getState();
      expect(state.rooms).toHaveLength(1);
      expect(state.rooms[0].memberCount).toBe(6);
      expect(state.rooms[0].lastActivityAt).toEqual(updatedRoom.lastActivityAt);
    });

    it('should update an existing room', () => {
      useRoomsStore.getState().setRooms(mockRooms);

      useRoomsStore.getState().updateRoom('room-1', {
        name: 'General Chat',
        memberCount: 6,
      });

      const state = useRoomsStore.getState();
      expect(state.rooms[0].name).toBe('General Chat');
      expect(state.rooms[0].memberCount).toBe(6);
      expect(state.rooms[1].name).toBe('Development'); // بدون تغییر
    });

    it('should remove a room and clear activeRoomId if it was active', () => {
      useRoomsStore.getState().setRooms(mockRooms);
      useRoomsStore.getState().setActiveRoom('room-1');

      useRoomsStore.getState().removeRoom('room-1');

      const state = useRoomsStore.getState();
      expect(state.rooms).toHaveLength(1);
      expect(state.rooms[0].id).toBe('room-2');
      expect(state.activeRoomId).toBeNull(); // پاک شد چون فعال بود
    });

    it('should NOT clear activeRoomId if a different room is removed', () => {
      useRoomsStore.getState().setRooms(mockRooms);
      useRoomsStore.getState().setActiveRoom('room-1');

      useRoomsStore.getState().removeRoom('room-2');

      const state = useRoomsStore.getState();
      expect(state.rooms).toHaveLength(1);
      expect(state.activeRoomId).toBe('room-1'); // بدون تغییر
    });
  });

  describe('UI State Management', () => {
    it('should manage active room', () => {
      useRoomsStore.getState().setActiveRoom('room-1');
      expect(useRoomsStore.getState().activeRoomId).toBe('room-1');

      useRoomsStore.getState().setActiveRoom(null);
      expect(useRoomsStore.getState().activeRoomId).toBeNull();
    });

    it('should manage loading and error states', () => {
      useRoomsStore.getState().setLoading(true);
      expect(useRoomsStore.getState().isLoading).toBe(true);

      const mockError = new Error('Failed to fetch rooms');
      useRoomsStore.getState().setError(mockError);

      expect(useRoomsStore.getState().error).toBe(mockError);
      expect(useRoomsStore.getState().isLoading).toBe(false); // setError باید loading را false کند
    });

    it('should manage create modal state', () => {
      useRoomsStore.getState().setCreateModalOpen(true);
      expect(useRoomsStore.getState().isCreateModalOpen).toBe(true);
    });

    it('should manage search query', () => {
      useRoomsStore.getState().setSearchQuery('dev');
      expect(useRoomsStore.getState().searchQuery).toBe('dev');
    });

    it('should manage subscription state', () => {
      useRoomsStore.getState().setSubscribed(true);
      expect(useRoomsStore.getState().isSubscribed).toBe(true);
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      useRoomsStore.getState().setRooms(mockRooms);
    });

    it('selectAllRooms should return all rooms', () => {
      expect(roomsSelectors.selectAllRooms(useRoomsStore.getState())).toHaveLength(2);
    });

    it('selectActiveRoom should return the active room details', () => {
      useRoomsStore.getState().setActiveRoom('room-1');
      const activeRoom = roomsSelectors.selectActiveRoom(useRoomsStore.getState());
      expect(activeRoom?.id).toBe('room-1');
      expect(activeRoom?.name).toBe('General');
    });

    it('selectActiveRoom should return null if no active room', () => {
      useRoomsStore.getState().setActiveRoom(null);
      expect(roomsSelectors.selectActiveRoom(useRoomsStore.getState())).toBeNull();
    });

    it('selectFilteredRooms should return all rooms when search is empty', () => {
      useRoomsStore.getState().setSearchQuery('');
      expect(roomsSelectors.selectFilteredRooms(useRoomsStore.getState())).toHaveLength(2);
    });

    it('selectFilteredRooms should filter rooms by name (case-insensitive)', () => {
      useRoomsStore.getState().setSearchQuery('DEV');
      const filtered = roomsSelectors.selectFilteredRooms(useRoomsStore.getState());
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('room-2');
    });

    it('selectFilteredRooms should filter rooms by description', () => {
      useRoomsStore.getState().setSearchQuery('discussion');
      const filtered = roomsSelectors.selectFilteredRooms(useRoomsStore.getState());
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('room-1');
    });

    it('selectRoomById factory should return correct room', () => {
      const selectRoom = roomsSelectors.selectRoomById(useRoomsStore.getState());
      expect(selectRoom('room-2')?.name).toBe('Development');
      expect(selectRoom('non-existent')).toBeNull();
    });
  });
});
