/**
 * useRoomActions Hook
 *
 * Hook برای عملیات روی اتاق‌ها (join, leave, delete)
 *
 * @module features/rooms/hooks/useRoomActions
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        toast.error(t('rooms.pleaseLogin'));
        return;
      }

      setIsJoining(true);
      const toastId = toast.loading(t('rooms.joining'));

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

        toast.success(t('rooms.joinSuccess'), { id: toastId });
      } catch (error) {
        const message = error instanceof Error ? error.message : t('rooms.joinFailed');

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
    [user, rooms, updateRoom, t]
  );

  /**
   * Leave a room
   */
  const leaveRoom = useCallback(
    async (roomId: string): Promise<void> => {
      if (!user) return;

      setIsLeaving(true);
      const toastId = toast.loading(t('rooms.leaving'));

      try {
        await roomsService.leave(roomId, user.uid);
        toast.success(t('rooms.leaveSuccess'), { id: toastId });
      } catch (error) {
        const message = error instanceof Error ? error.message : t('rooms.leaveFailed');

        toast.error(message, { id: toastId });
      } finally {
        setIsLeaving(false);
      }
    },
    [user, t]
  );

  /**
   * Delete a room
   */
  const deleteRoom = useCallback(
    async (roomId: string): Promise<void> => {
      if (!user) return;

      // Confirm deletion
      const confirmed = window.confirm(t('rooms.deleteConfirm'));

      if (!confirmed) return;

      setIsDeleting(true);
      const toastId = toast.loading(t('rooms.deleting'));

      try {
        await roomsService.delete(roomId);

        // Remove from store
        removeRoom(roomId);

        toast.success(t('rooms.deleteSuccess'), { id: toastId });
      } catch (error) {
        const message = error instanceof Error ? error.message : t('rooms.deleteFailed');

        toast.error(message, { id: toastId });
      } finally {
        setIsDeleting(false);
      }
    },
    [user, removeRoom, t]
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
