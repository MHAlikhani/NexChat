/**
 * Room Validation Schemas (Zod)
 *
 * اعتبارسنجی داده‌های ورودی برای ایجاد و ویرایش اتاق
 *
 * @module features/rooms/utils/validators
 */

import { z } from 'zod';

/**
 * Create Room Schema
 */
export const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, 'نام اتاق باید حداقل ۳ کاراکتر باشد')
    .max(50, 'نام اتاق نمی‌تواند بیشتر از ۵۰ کاراکتر باشد')
    .trim()
    .regex(
      /^[a-zA-Z0-9\u0600-\u06FF\s-_]+$/,
      'نام اتاق فقط می‌تواند شامل حروف، اعداد و فاصله باشد'
    ),

  description: z
    .string()
    .max(200, 'توضیحات نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد')
    .optional()
    .or(z.literal('')),

  type: z.enum(['public', 'private', 'direct'], {
    errorMap: () => ({ message: 'نوع اتاق نامعتبر است' }),
  }),

  avatarFile: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'حجم تصویر نمی‌تواند بیشتر از ۵ مگابایت باشد'
    )
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'فقط فرمت‌های JPEG, PNG و WebP مجاز هستند'
    )
    .optional(),

  initialMembers: z
    .array(z.string())
    .max(50, 'حداکثر ۵۰ عضو اولیه می‌توانید اضافه کنید')
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
    .max(100, 'جستجو نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد')
    .trim(),
});

/**
 * Type inference from schemas
 */
export type CreateRoomFormData = z.infer<typeof createRoomSchema>;
export type UpdateRoomFormData = z.infer<typeof updateRoomSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;