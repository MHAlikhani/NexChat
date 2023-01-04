/**
 * Rooms Store (Zustand)
 *
 * مدیریت state سراسری اتاق‌ها با قابلیت‌های:
 * - Deduplication در سه لایه (setRooms, addRoom, selector)
 * - Real-time sync
 * - Search و filter
 * - Optimistic updates
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
  /** لیست اتاق‌ها (همیشه unique) */
  rooms: Room[];

  /** شناسه اتاق فعال */
  activeRoomId: string | null;

  /** وضعیت بارگذاری */
  isLoading: boolean;

  /** خطای بارگذاری */
  error: Error | null;

  /** وضعیت مودال ایجاد اتاق */
  isCreateModalOpen: boolean;

  /** متن جستجو */
  searchQuery: string;

  /** آیا subscription فعال است؟ */
  isSubscribed: boolean;
}

/**
 * Rooms Store Actions
 */
interface RoomsActions {
  /** تنظیم لیست اتاق‌ها (با deduplication) */
  setRooms: (rooms: Room[]) => void;

  /** تنظیم اتاق فعال */
  setActiveRoom: (roomId: string | null) => void;

  /** تنظیم وضعیت بارگذاری */
  setLoading: (isLoading: boolean) => void;

  /** تنظیم خطا */
  setError: (error: Error | null) => void;

  /** باز/بسته کردن مودال ایجاد */
  setCreateModalOpen: (isOpen: boolean) => void;

  /** تنظیم متن جستجو */
  setSearchQuery: (query: string) => void;

  /** تنظیم وضعیت subscription */
  setSubscribed: (isSubscribed: boolean) => void;

  /** اضافه کردن اتاق (با بررسی تکراری) */
  addRoom: (room: Room) => void;

  /** به‌روزرسانی اتاق */
  updateRoom: (roomId: string, updates: Partial<Room>) => void;

  /** حذف اتاق */
  removeRoom: (roomId: string) => void;

  /** بازنشانی کامل state */
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
 * Helper: Deduplicate rooms by ID
 *
 * از Map برای حذف سریع تکراری‌ها استفاده می‌کند.
 * اگر دو اتاق با ID یکسان باشند، آخرین نسخه نگه داشته می‌شود.
 *
 * @param rooms - آرایه اتاق‌ها
 * @returns آرایه اتاق‌های یکتا
 */
function deduplicateRooms(rooms: Room[]): Room[] {
  const map = new Map<string, Room>();
  rooms.forEach((room) => {
    map.set(room.id, room);
  });
  return Array.from(map.values());
}

/**
 * Helper: بررسی تغییر واقعی state
 *
 * جلوگیری از re-render غیرضروری با مقایسه shallow
 */
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

/**
 * Rooms Store Hook
 */
export const useRoomsStore = create<RoomsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      /**
       * تنظیم لیست اتاق‌ها (با deduplication و optimization)
       */
      setRooms: (rooms) =>
        set((state) => {
          const uniqueRooms = deduplicateRooms(rooms);

          // فقط در صورت تغییر واقعی، state را به‌روز کن
          if (!haveRoomsChanged(state.rooms, uniqueRooms)) {
            return state;
          }

          return { rooms: uniqueRooms };
        }),

      /**
       * تنظیم اتاق فعال
       */
      setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

      /**
       * تنظیم وضعیت بارگذاری
       */
      setLoading: (isLoading) => set({ isLoading }),

      /**
       * تنظیم خطا
       */
      setError: (error) => set({ error }),

      /**
       * باز/بسته کردن مودال ایجاد
       */
      setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),

      /**
       * تنظیم متن جستجو
       */
      setSearchQuery: (query) => set({ searchQuery: query }),

      /**
       * تنظیم وضعیت subscription
       */
      setSubscribed: (isSubscribed) => set({ isSubscribed }),

      /**
       * اضافه کردن اتاق (با بررسی تکراری و merge)
       *
       * این تابع برای Optimistic Updates استفاده می‌شود.
       * اگر اتاق قبلاً وجود داشته باشد، آن را merge می‌کند.
       */
      addRoom: (room) =>
        set((state) => {
          const existingIndex = state.rooms.findIndex(
            (r) => r.id === room.id
          );

          // اگر قبلاً وجود دارد، merge کن (احتمالاً از real-time subscription)
          if (existingIndex !== -1) {
            const updatedRooms = [...state.rooms];
            updatedRooms[existingIndex] = {
              ...updatedRooms[existingIndex],
              ...room,
            };
            return { rooms: updatedRooms };
          }

          // در غیر این صورت، به ابتدای لیست اضافه کن (جدیدترین در بالا)
          return { rooms: [room, ...state.rooms] };
        }),

      /**
       * به‌روزرسانی اتاق
       */
      updateRoom: (roomId, updates) =>
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId ? { ...room, ...updates } : room
          ),
        })),

      /**
       * حذف اتاق
       */
      removeRoom: (roomId) =>
        set((state) => ({
          rooms: state.rooms.filter((room) => room.id !== roomId),
          activeRoomId:
            state.activeRoomId === roomId ? null : state.activeRoomId,
        })),

      /**
       * بازنشانی کامل state
       */
      reset: () => set(initialState),
    }),
    { name: 'RoomsStore' }
  )
);

/**
 * Selectors
 *
 * برای دسترسی بهینه به بخش‌های خاص state.
 * استفاده از selector باعث می‌شود کامپوننت فقط وقتی re-render شود
 * که مقدار مورد نظرش تغییر کند.
 */
export const roomsSelectors = {
  /**
   * انتخاب همه اتاق‌ها (بدون فیلتر)
   */
  selectAllRooms: (state: RoomsStore): Room[] => state.rooms,

  /**
   * انتخاب اتاق فعال
   */
  selectActiveRoomId: (state: RoomsStore): string | null =>
    state.activeRoomId,

  /**
   * انتخاب اتاق فعال با جزئیات کامل
   */
  selectActiveRoom: (state: RoomsStore): Room | null => {
    if (!state.activeRoomId) return null;
    return state.rooms.find((room) => room.id === state.activeRoomId) || null;
  },

  /**
   * انتخاب وضعیت بارگذاری
   */
  selectIsLoading: (state: RoomsStore): boolean => state.isLoading,

  /**
   * انتخاب خطا
   */
  selectError: (state: RoomsStore): Error | null => state.error,

  /**
   * انتخاب وضعیت مودال ایجاد
   */
  selectIsCreateModalOpen: (state: RoomsStore): boolean =>
    state.isCreateModalOpen,

  /**
   * انتخاب متن جستجو
   */
  selectSearchQuery: (state: RoomsStore): string => state.searchQuery,

  /**
   * انتخاب وضعیت subscription
   */
  selectIsSubscribed: (state: RoomsStore): boolean => state.isSubscribed,

  /**
   * انتخاب اتاق‌های فیلتر شده (با جستجو و deduplication)
   *
   * این selector اصلی است که برای نمایش لیست استفاده می‌شود.
   */
  selectFilteredRooms: (state: RoomsStore): Room[] => {
    const { rooms, searchQuery } = state;

    // Deduplication اضافی برای اطمینان
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

  /**
   * Factory: انتخاب اتاق بر اساس ID
   */
  selectRoomById:
    (state: RoomsStore) =>
    (roomId: string): Room | null =>
      state.rooms.find((room) => room.id === roomId) || null,
};