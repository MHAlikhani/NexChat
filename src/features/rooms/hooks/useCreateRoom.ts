/**
 * useCreateRoom Hook
 *
 * @module features/rooms/hooks/useCreateRoom
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useRoomsStore } from '../stores/roomsStore';
import { roomsService } from '../services/rooms.service';
import { createRoomSchema, type CreateRoomFormData } from '../utils/validators';
import { useAuth } from '@/features/auth';
import type { Room } from '../types';

export interface UseCreateRoomReturn {
  isCreating: boolean;
  createRoom: (data: CreateRoomFormData) => Promise<Room | null>;
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
}

export const useCreateRoom = (): UseCreateRoomReturn => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const { addRoom, setCreateModalOpen, isCreateModalOpen } = useRoomsStore();

  const createRoom = useCallback(
    async (data: CreateRoomFormData): Promise<Room | null> => {
      if (!user) {
        toast.error(t('rooms.pleaseLogin'));
        return null;
      }

      const validationResult = createRoomSchema.safeParse(data);

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        return null;
      }

      setIsCreating(true);
      const toastId = toast.loading(t('rooms.creating'));

      try {
        const newRoom = await roomsService.create(validationResult.data, user.uid);

        addRoom(newRoom);

        toast.success(t('rooms.created', { name: newRoom.name }), {
          id: toastId,
        });

        setCreateModalOpen(false);

        return newRoom;
      } catch (error) {
        const message = error instanceof Error ? error.message : t('rooms.creationFailed');

        toast.error(message, { id: toastId });

        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [user, addRoom, setCreateModalOpen, t]
  );

  const openModal = useCallback(() => {
    setCreateModalOpen(true);
  }, [setCreateModalOpen]);

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
