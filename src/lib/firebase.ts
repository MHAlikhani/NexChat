/**
 * Firebase Configuration & Initialization
 *
 * @module lib/firebase
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase Configuration
 *
 * ⚠️ توجه: Firebase Storage استفاده نمی‌شود (نیاز به پلن پولی دارد)
 * رسانه‌ها به صورت Base64 مستقیم در Firestore ذخیره می‌شوند
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
 * Validation در زمان توسعه
 */
const validateConfig = () => {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
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
 * Firebase Services
 *
 * ❌ Storage حذف شد - رسانه‌ها به صورت Base64 در Firestore ذخیره می‌شوند
 */
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;