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
import { messagesService } from '@/features/chat/services/messages.service';
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

  const { updateRoom, removeRoom } = useRoomsStore();

  /**
   * Join a room
   *
   * Uses optimistic updates with proper revert on failure.
   * Captures the room state BEFORE the optimistic update using getState()
   * to avoid stale closure issues when reverting.
   */
  const joinRoom = useCallback(
    async (roomId: string): Promise<void> => {
      if (!user) {
        toast.error(t('rooms.pleaseLogin'));
        return;
      }

      setIsJoining(true);
      const toastId = toast.loading(t('rooms.joining'));

      // Capture the room state BEFORE optimistic update from the store directly.
      // This avoids stale closure issues that occur when `rooms` from the
      // component scope has changed by the time the catch block runs.
      const roomBeforeUpdate = useRoomsStore.getState().rooms.find((r) => r.id === roomId) ?? null;

      try {
        // Optimistic update
        if (roomBeforeUpdate) {
          updateRoom(roomId, {
            members: [...roomBeforeUpdate.members, user.uid],
            memberCount: roomBeforeUpdate.memberCount + 1,
          });
        }

        await roomsService.join(roomId, user.uid);

        toast.success(t('rooms.joinSuccess'), { id: toastId });
      } catch (error) {
        const message = error instanceof Error ? error.message : t('rooms.joinFailed');

        toast.error(message, { id: toastId });

        // Revert optimistic update using the pre-update snapshot (NOT stale!)
        if (roomBeforeUpdate) {
          updateRoom(roomId, {
            members: roomBeforeUpdate.members,
            memberCount: roomBeforeUpdate.memberCount,
          });
        }
      } finally {
        setIsJoining(false);
      }
    },
    [user, updateRoom, t]
  );

  /**
   * Leave a room
   *
   * Uses optimistic updates with proper revert on failure.
   * Captures the room state BEFORE the optimistic update using getState()
   * to avoid stale closure issues when reverting.
   */
  const leaveRoom = useCallback(
    async (roomId: string): Promise<void> => {
      if (!user) return;

      setIsLeaving(true);
      const toastId = toast.loading(t('rooms.leaving'));

      // Capture room state before optimistic update to avoid stale closure
      const roomBeforeUpdate = useRoomsStore.getState().rooms.find((r) => r.id === roomId) ?? null;

      try {
        // Optimistic update: remove user from members
        if (roomBeforeUpdate) {
          updateRoom(roomId, {
            members: roomBeforeUpdate.members.filter((id) => id !== user.uid),
            memberCount: Math.max(0, roomBeforeUpdate.memberCount - 1),
          });
        }

        await roomsService.leave(roomId, user.uid);

        toast.success(t('rooms.leaveSuccess'), { id: toastId });
      } catch (error) {
        const message = error instanceof Error ? error.message : t('rooms.leaveFailed');

        toast.error(message, { id: toastId });

        // Revert optimistic update using the pre-update snapshot
        if (roomBeforeUpdate) {
          updateRoom(roomId, {
            members: roomBeforeUpdate.members,
            memberCount: roomBeforeUpdate.memberCount,
          });
        }
      } finally {
        setIsLeaving(false);
      }
    },
    [user, updateRoom, t]
  );

  /**
   * Delete a room permanently from Firestore.
   *
   * This performs a HARD delete:
   * 1. Deletes all messages in the room's subcollection
   *    (Firestore does NOT auto-delete subcollections with the parent doc)
   * 2. Permanently removes the room document itself
   * 3. Removes the room from the local store
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
        // Step 1: Delete all messages in the room's subcollection.
        // Firestore subcollections are orphaned when the parent doc is
        // deleted, so we must remove them explicitly.
        await messagesService.deleteAllByRoom(roomId);

        // Step 2: Permanently delete the room document.
        await roomsService.deletePermanently(roomId);

        // Step 3: Remove from local store.
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
