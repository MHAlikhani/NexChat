/**
 * Authentication Domain Types
 *
 * تمام تایپ‌های مربوط به فیچر احراز هویت در این فایل تعریف می‌شوند.
 * این تایپ‌ها از Firebase SDK جدا شده‌اند تا لایه Domain از Infrastructure مستقل باشد.
 *
 * @module features/auth/types
 */

/**
 * User Entity - Domain Model
 *
 * این type نمایانگر کاربر در domain logic ما است،
 * نه مستقیماً از Firebase User type استفاده می‌کنیم.
 */
export interface User {
  /** شناسه یکتای کاربر (Firebase UID) */
  uid: string;

  /** نام کامل کاربر */
  displayName: string;

  /** ایمیل کاربر */
  email: string;

  /** آدرس تصویر پروفایل */
  photoURL: string | null;

  /** تاریخ ایجاد حساب (ISO 8601) */
  createdAt: string;

  /** تاریخ آخرین ورود (ISO 8601) */
  lastLoginAt: string;

  /** آیا کاربر ایمیل خود را تأیید کرده است؟ */
  emailVerified: boolean;
}

/**
 * User Profile - Extended Profile Data
 *
 * اطلاعات تکمیلی کاربر که در Firestore ذخیره می‌شود.
 * از User جدا است تا بتوانیم بدون بارگذاری کامل پروفایل، اطلاعات پایه را داشته باشیم.
 */
export interface UserProfile {
  /** بیوگرافی کوتاه */
  bio?: string;

  /** وضعیت آنلاین/آفلاین */
  status: 'online' | 'offline' | 'away';

  /** تنظیمات کاربر */
  settings: UserSettings;

  /** تاریخ آخرین فعالیت */
  lastSeenAt: string;
}

/**
 * User Settings
 */
export interface UserSettings {
  /** تم رابط کاربری */
  theme: 'light' | 'dark' | 'system';

  /** زبان */
  language: 'fa' | 'en';

  /** دریافت اعلان‌ها */
  notifications: boolean;

  /** نمایش وضعیت آنلاین */
  showOnlineStatus: boolean;
}

/**
 * Authentication State
 */
export interface AuthState {
  /** کاربر فعلی (null اگر لاگین نیست) */
  user: User | null;

  /** آیا در حال بارگذاری است؟ */
  isLoading: boolean;

  /** آیا احراز هویت شده؟ */
  isAuthenticated: boolean;

  /** خطای احراز هویت */
  error: AuthError | null;
}

/**
 * Authentication Error
 *
 * ساختار استاندارد خطا برای تمام خطاهای auth
 */
export interface AuthError {
  /** کد خطا (مثلاً: 'auth/user-not-found') */
  code: string;

  /** پیام خطا به زبان کاربر */
  message: string;

  /** جزئیات اضافی برای debugging */
  details?: unknown;
}

/**
 * Sign-In Provider Types
 */
export type AuthProvider = 'google' | 'github' | 'email';