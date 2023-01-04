/**
 * Media Service (Base64 Strategy)
 *
 * به جای Firebase Storage (که نیاز به پلن پولی دارد)،
 * فایل‌ها را فشرده کرده و به صورت Data URL (Base64) برمی‌گردانیم
 * تا مستقیم در Firestore ذخیره شوند.
 *
 * ⚠️ محدودیت مهم: هر سند Firestore حداکثر 1 مگابایت است،
 * بنابراین فایل‌ها باید زیر ~700 کیلوبایت باشند (پس از تبدیل Base64 حدود 933KB).
 *
 * @module features/chat/services/media
 */

import Compressor from 'compressorjs';

/**
 * Constants
 */
/** حداکثر حجم فایل خام (قبل از Base64) - 700KB */
const MAX_MEDIA_SIZE_BYTES = 700 * 1024;

/** کیفیت اولیه فشرده‌سازی تصاویر */
const INITIAL_COMPRESSION_QUALITY = 0.6;

/** حداقل کیفیت فشرده‌سازی */
const MIN_COMPRESSION_QUALITY = 0.2;

/** حداکثر ابعاد تصویر */
const IMAGE_MAX_DIMENSION = 1280;

/** فرمت‌های مجاز تصویر */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Media Service API
 */
export const mediaService = {
  /**
   * Process image: compress and convert to Data URL
   *
   * @returns Data URL برای ذخیره در Firestore
   * @throws اگر فایل نامعتبر یا بیش از حد بزرگ باشد
   */
  uploadImage: async (
    file: File
  ): Promise<{ url: string; size: number }> => {
    // Step 1: Validate
    validateImage(file);

    // Step 2: Compress iteratively until size is acceptable
    let compressedBlob: Blob = await compressImage(
      file,
      INITIAL_COMPRESSION_QUALITY
    );
    let quality = INITIAL_COMPRESSION_QUALITY;

    // اگر هنوز بزرگ است، با کیفیت کمتر دوباره فشرده کن
    while (
      compressedBlob.size > MAX_MEDIA_SIZE_BYTES &&
      quality > MIN_COMPRESSION_QUALITY
    ) {
      quality -= 0.1;
      compressedBlob = await compressImage(compressedBlob, quality);
    }

    // Step 3: Final size check
    if (compressedBlob.size > MAX_MEDIA_SIZE_BYTES) {
      throw new Error(
        'تصویر پس از فشرده‌سازی همچنان بیش از حد بزرگ است. لطفاً تصویر کوچک‌تری انتخاب کنید.'
      );
    }

    // Step 4: Convert to Data URL
    const dataUrl = await blobToDataUrl(compressedBlob);

    return { url: dataUrl, size: compressedBlob.size };
  },

  /**
   * Process audio: validate and convert to Data URL
   *
   * @returns Data URL برای ذخیره در Firestore
   * @throws اگر فایل صوتی بیش از حد بزرگ باشد
   */
  uploadAudio: async (
    blob: Blob
  ): Promise<{ url: string; size: number }> => {
    // Validate size
    if (blob.size > MAX_MEDIA_SIZE_BYTES) {
      throw new Error(
        'پیام صوتی بیش از حد طولانی است. حداکثر مدت ضبط ۶۰ ثانیه است.'
      );
    }

    const dataUrl = await blobToDataUrl(blob);

    return { url: dataUrl, size: blob.size };
  },

  /**
   * Get maximum allowed media size (for UI hints)
   */
  getMaxMediaSize: (): number => MAX_MEDIA_SIZE_BYTES,
};

/**
 * Helper: Validate image file
 */
function validateImage(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('فقط فرمت‌های JPEG، PNG و WebP مجاز هستند');
  }

  // فایل‌های خیلی بزرگ (بالای 10MB) حتی برای فشرده‌سازی هم مناسب نیستند
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('حجم تصویر نمی‌تواند بیشتر از ۱۰ مگابایت باشد');
  }
}

/**
 * Helper: Compress image using CompressorJS
 */
function compressImage(fileOrBlob: File | Blob, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // فایل‌های کوچک نیازی به فشرده‌سازی ندارند
    if (fileOrBlob.size < 200 * 1024) {
      resolve(fileOrBlob);
      return;
    }

    new Compressor(fileOrBlob, {
      quality,
      maxWidth: IMAGE_MAX_DIMENSION,
      maxHeight: IMAGE_MAX_DIMENSION,
      mimeType: 'image/jpeg',
      convertSize: Infinity,
      success(result: Blob) {
        resolve(result);
      },
      error(error: Error) {
        reject(new Error(`خطا در فشرده‌سازی تصویر: ${error.message}`));
      },
    });
  });
}

/**
 * Helper: Convert Blob to Data URL (Base64)
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('خطا در تبدیل فایل به Data URL'));
      }
    };

    reader.onerror = () => {
      reject(new Error('خطا در خواندن فایل'));
    };

    reader.readAsDataURL(blob);
  });
}