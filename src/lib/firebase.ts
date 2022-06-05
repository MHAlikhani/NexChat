/**
 * Firebase Configuration & Initialization
 *
 * این فایل به عنوان یک Singleton عمل می‌کند و تمام سرویس‌های Firebase
 * را در یک نقطه مرکزی پیکربندی می‌کند تا از تکرار initialization جلوگیری شود.
 *
 * @module lib/firebase
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

/**
 * Firebase Configuration Object
 *
 * مقادیر از Environment Variables خوانده می‌شوند.
 * این مقادیر را از Firebase Console → Project Settings → General دریافت کنید.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Validation در زمان Build
 * اگر هر یک از متغیرهای محیطی تنظیم نشده باشند، خطا می‌دهد
 */
const validateConfig = () => {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0 && import.meta.env.DEV) {
    console.warn(
      `⚠️ Firebase config missing keys: ${missingKeys.join(', ')}\n` +
      `Please create .env.local file with these values.`
    );
  }
};

validateConfig();

/**
 * Firebase App Instance (Singleton)
 */
const app: FirebaseApp = initializeApp(firebaseConfig);

/**
 * Firebase Services - Lazy Initialization
 * فقط در زمان نیاز ایجاد می‌شوند
 */
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;