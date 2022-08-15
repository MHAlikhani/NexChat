/**
 * useCreateRoom Hook
 *
 * Hook برای ایجاد اتاق جدید با Optimistic Updates
 *
 * @module features/rooms/hooks/useCreateRoom
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useRoomsStore } from '../stores/roomsStore';
import { roomsService } from '../services/rooms.service';
import { createRoomSchema, type CreateRoomFormData } from '../utils/validators';
import { useAuth } from '@/features/auth';
import type { Room } from '../types';

/**
 * useCreateRoom Return Type
 */
export interface UseCreateRoomReturn {
  isCreating: boolean;
  createRoom: (data: CreateRoomFormData) => Promise<Room | null>;
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
}

/**
 * useCreateRoom Hook
 */
export const useCreateRoom = (): UseCreateRoomReturn => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const { addRoom, setCreateModalOpen, isCreateModalOpen } = useRoomsStore();

  /**
   * Create a new room
   */
  const createRoom = useCallback(
    async (data: CreateRoomFormData): Promise<Room | null> => {
      if (!user) {
        toast.error('لطفاً ابتدا وارد شوید');
        return null;
      }

      // Validate input
      const validationResult = createRoomSchema.safeParse(data);

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        return null;
      }

      setIsCreating(true);
      const toastId = toast.loading('در حال ایجاد اتاق...');

      try {
        const newRoom = await roomsService.create(
          validationResult.data,
          user.uid
        );

        // Optimistic update: Add room to store immediately
        addRoom(newRoom);

        toast.success(`اتاق "${newRoom.name}" با موفقیت ایجاد شد`, {
          id: toastId,
        });

        setCreateModalOpen(false);

        return newRoom;
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'ایجاد اتاق ناموفق بود';

        toast.error(message, { id: toastId });

        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [user, addRoom, setCreateModalOpen]
  );

  /**
   * Open create modal
   */
  const openModal = useCallback(() => {
    setCreateModalOpen(true);
  }, [setCreateModalOpen]);

  /**
   * Close create modal
   */
  const closeModal = useCallback(() => {
    setCreateModalOpen(false);
  }, [setCreateModalOpen]);

  return {
    isCreating,
    createRoom,
    openModal,
    closeModal,
    isModalOpen: isCreateModalOpen,
  };
};