import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * ترکیب کلاس‌های CSS با پشتیبانی از Tailwind Merge
 * این تابع اجازه می‌دهد کلاس‌های شرطی را به راحتی ترکیب کنیم
 * و تضادهای Tailwind را به درستی مدیریت کند.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}