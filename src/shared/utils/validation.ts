import { z } from 'zod';
import { UI } from '../constants';

/**
 * Schema اعتبارسنجی برای ارسال پیام متنی
 */
export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'پیام نمی‌تواند خالی باشد')
    .max(UI.MAX_MESSAGE_LENGTH, `حداکثر طول پیام ${UI.MAX_MESSAGE_LENGTH} کاراکتر است`),
});

/**
 * Schema اعتبارسنجی برای ساخت اتاق جدید
 */
export const roomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'نام اتاق باید حداقل ۳ کاراکتر باشد')
    .max(50, 'نام اتاق نمی‌تواند بیشتر از ۵۰ کاراکتر باشد'),
  description: z.string().trim().max(200, 'توضیحات نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد').optional(),
});

/**
 * Schema اعتبارسنجی برای پروفایل کاربر
 */
export const userProfileSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد').max(50),
  status: z.enum(['online', 'offline', 'away']).optional(),
});

// Type inference از Schemaها
export type MessageInput = z.infer<typeof messageSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;