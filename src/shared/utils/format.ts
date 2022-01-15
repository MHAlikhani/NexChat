import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { faIR } from 'date-fns/locale';

/**
 * فرمت کردن تاریخ برای نمایش در چت
 */
export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: faIR });
  }
  
  if (isYesterday(date)) {
    return `دیروز ${format(date, 'HH:mm', { locale: faIR })}`;
  }
  
  return format(date, 'yyyy/MM/dd HH:mm', { locale: faIR });
};

/**
 * فرمت کردن تاریخ برای نمایش "زمان نسبی" (مثلاً "۲ دقیقه پیش")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: faIR });
};

/**
 * فرمت کردن حجم فایل به صورت خوانا
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * فرمت کردن مدت زمان صدا (ثانیه به MM:SS)
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};