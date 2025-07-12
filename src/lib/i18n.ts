/**
 * i18n Configuration
 *
 * پشتیبانی از چند زبان: فارسی، انگلیسی، آلمانی
 *
 * @module lib/i18n
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import faTranslation from '@/locales/fa/translation.json';
import enTranslation from '@/locales/en/translation.json';
import deTranslation from '@/locales/de/translation.json';

export const supportedLanguages = {
  fa: { name: 'فارسی', dir: 'rtl' as const },
  en: { name: 'English', dir: 'ltr' as const },
  de: { name: 'Deutsch', dir: 'ltr' as const },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fa: { translation: faTranslation },
      en: { translation: enTranslation },
      de: { translation: deTranslation },
    },
    fallbackLng: 'fa',
    lng: 'fa',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // React به صورت پیش‌فرض از XSS جلوگیری می‌کند
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

/**
 * تغییر جهت صفحه بر اساس زبان
 */
export const updateDocumentDirection = (lang: string) => {
  const dir = supportedLanguages[lang as SupportedLanguage]?.dir ?? 'rtl';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
};

// تنظیم جهت اولیه
updateDocumentDirection(i18n.language);

// گوش دادن به تغییر زبان
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

export default i18n;
