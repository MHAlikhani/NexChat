/**
 * Room Validation Schemas (Zod)
 *
 * اعتبارسنجی داده‌های ورودی برای ایجاد و ویرایش اتاق
 *
 * @module features/rooms/utils/validators
 */

import { z } from 'zod';
import i18n from '@/lib/i18n';

/**
 * Helper to get translated error messages at validation time.
 * Uses i18n instance directly since validators are used outside React context.
 */
const t = (key: string, options?: Record<string, unknown>): string => i18n.t(key, options);

/**
 * Create Room Schema
 */
export const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, { message: t('validation.roomNameMin') })
    .max(50, { message: t('validation.roomNameMax') })
    .trim()
    .regex(/^[a-zA-Z0-9\u0600-\u06FF\s-_]+$/, { message: t('validation.roomNameInvalid') }),

  description: z
    .string()
    .max(200, { message: t('validation.descriptionMax') })
    .optional()
    .or(z.literal('')),

  type: z.enum(['public', 'private', 'direct'], {
    errorMap: () => ({ message: t('validation.roomTypeInvalid') }),
  }),

  initialMembers: z
    .array(z.string())
    .max(50, { message: t('validation.membersMax') })
    .optional(),
});

/**
 * Update Room Schema
 */
export const updateRoomSchema = createRoomSchema.partial();

/**
 * Search Schema
 */
export const searchSchema = z.object({
  query: z
    .string()
    .max(100, { message: t('validation.searchMax') })
    .trim(),
});

/**
 * Type inference from schemas
 */
export type CreateRoomFormData = z.infer<typeof createRoomSchema>;
export type UpdateRoomFormData = z.infer<typeof updateRoomSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
