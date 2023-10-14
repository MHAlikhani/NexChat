import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import faTranslation from '@/locales/fa/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fa: {
        translation: faTranslation,
      },
    },
    fallbackLng: 'fa',
    lng: 'fa', // پیش‌فرض فارسی
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // React به صورت پیش‌فرض از XSS جلوگیری می‌کند
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;