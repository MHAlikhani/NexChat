/**
 * Format Utilities
 *
 * @module shared/utils/format
 */

import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { faIR, enUS, de } from 'date-fns/locale';
import type { Locale } from 'date-fns';

const localeMap: Record<string, Locale> = {
  fa: faIR,
  en: enUS,
  de: de,
};

/**
 * Get the appropriate date-fns locale based on app language
 */
const getLocale = (language?: string): Locale => {
  return localeMap[language || 'en'] || enUS;
};

/**
 * Format message time based on current language
 */
export const formatMessageTime = (dateString: string, language = 'en'): string => {
  const date = new Date(dateString);
  const locale = getLocale(language);

  if (isToday(date)) {
    return format(date, 'HH:mm', { locale });
  }

  if (isYesterday(date)) {
    return format(date, 'PP HH:mm', { locale });
  }

  return format(date, 'yyyy/MM/dd HH:mm', { locale });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string, language = 'en'): string => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: getLocale(language) });
};
