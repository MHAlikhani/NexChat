/**
 * useDebounce Hook
 *
 * تأخیر در به‌روزرسانی مقدار برای بهینه‌سازی performance
 *
 * @module shared/hooks/useDebounce
 */

import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 *
 * @param value - مقدار ورودی
 * @param delay - تأخیر به میلی‌ثانیه
 * @returns مقدار debounce شده
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}