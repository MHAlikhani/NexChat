/**
 * useRoomActions Hook
 *
 * Hook برای عملیات روی اتاق‌ها (join, leave, delete)
 *
 * @module features/rooms/hooks/useRoomActions
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useRoomsStore } from '../stores/roomsStore';
import { roomsService } from '../services/rooms.service';
import { useAuth } from '@/features/auth';

/**
 * useRoomActions Return Type
 */
export interface UseRoomActionsReturn {
  isJoining: boolean;
  isLeaving: boolean;
  isDeleting: boolean;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
}

/**
 * useRoomActions Hook
 */
export const useRoomActions = (): UseRoomActionsReturn => {
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { updateRoom, removeRoom, rooms } = useRoomsStore();

  /**
   * Join a room
   */
  const joinRoom = useCallback(
    async (roomId: string): Promise<void> => {
      if (!user) {
        toast.error('لطفاً ابتدا وارد شوید');
        return;
      }

      setIsJoining(true);
      const toastId = toast.loading('در حال عضویت...');

      try {
        // Optimistic update
        const room = rooms.find((r) => r.id === roomId);
        if (room) {
          updateRoom(roomId, {
            members: [...room.members, user.uid],
            memberCount: room.memberCount + 1,
          });
        }

        await roomsService.join(roomId, user.uid);

        toast.success('عضویت موفقیت‌آمیز بود', { id: toastId });
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'عضویت ناموفق بود';

        toast.error(message, { id: toastId });

        // Revert optimistic update on error
        const room = rooms.find((r) => r.id === roomId);
        if (room) {
          updateRoom(roomId, {
            members: room.members.filter((id) => id !== user.uid),
            memberCount: room.memberCount - 1,
          });
        }
      } finally {
        setIsJoining(false);
      }
    },
    [user, rooms, updateRoom]
  );

  /**
   * Leave a room
   */
  const leaveRoom = useCallback(
    async (roomId: string): Promise<void> => {
      if (!user) return;

      setIsLeaving(true);
      const toastId = toast.loading('در حال خروج...');

      try {
        await roomsService.leave(roomId, user.uid);
        toast.success('با موفقیت از اتاق خارج شدید', { id: toastId });
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'خروج ناموفق بود';

        toast.error(message, { id: toastId });
      } finally {
        setIsLeaving(false);
      }
    },
    [user]
  );

  /**
   * Delete a room
   */
  const deleteRoom = useCallback(
    async (roomId: string): Promise<void> => {
      if (!user) return;

      // Confirm deletion
      const confirmed = window.confirm(
        'آیا از حذف این اتاق اطمینان دارید؟ این عمل قابل بازگشت نیست.'
      );

      if (!confirmed) return;

      setIsDeleting(true);
      const toastId = toast.loading('در حال حذف اتاق...');

      try {
        await roomsService.delete(roomId);

        // Remove from store
        removeRoom(roomId);

        toast.success('اتاق با موفقیت حذف شد', { id: toastId });
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'حذف ناموفق بود';

        toast.error(message, { id: toastId });
      } finally {
        setIsDeleting(false);
      }
    },
    [user, removeRoom]
  );

  return {
    isJoining,
    isLeaving,
    isDeleting,
    joinRoom,
    leaveRoom,
    deleteRoom,
  };
};