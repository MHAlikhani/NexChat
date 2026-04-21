/**
 * Shared Validation Schemas
 *
 * @module shared/utils/validation
 */

import { z } from 'zod';
import { UI } from '../constants';
import i18n from '@/lib/i18n';

const t = (key: string, options?: Record<string, unknown>): string => i18n.t(key, options);

/**
 * Message validation schema
 */
export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: t('validation.messageEmpty') })
    .max(UI.MAX_MESSAGE_LENGTH, { message: t('validation.messageMax') }),
});

/**
 * Room validation schema
 */
export const roomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: t('validation.roomNameMin') })
    .max(50, { message: t('validation.roomNameMax') }),
  description: z
    .string()
    .trim()
    .max(200, { message: t('validation.descriptionMax') })
    .optional(),
});

/**
 * User profile validation schema
 */
export const userProfileSchema = z.object({
  name: z
    .string()
    .min(2, { message: t('validation.nameMin') })
    .max(50),
  status: z.enum(['online', 'offline', 'away']).optional(),
});

export type MessageInput = z.infer<typeof messageSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
