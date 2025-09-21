/**
 * i18n Configuration
 *
 * Multi-language support: English, Persian, German
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
    fallbackLng: 'en',
    lng: 'en',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // React handles XSS by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

/**
 * Update document direction based on language
 */
export const updateDocumentDirection = (lang: string) => {
  const dir = supportedLanguages[lang as SupportedLanguage]?.dir ?? 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
};

// Set initial direction
updateDocumentDirection(i18n.language);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

export default i18n;
