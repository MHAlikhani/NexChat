/**
 * Media Service (Base64 Strategy)
 *
 * @module features/chat/services/media
 */

import Compressor from 'compressorjs';

const MAX_MEDIA_SIZE_BYTES = 700 * 1024;
const INITIAL_COMPRESSION_QUALITY = 0.6;
const MIN_COMPRESSION_QUALITY = 0.2;
const IMAGE_MAX_DIMENSION = 1280;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const mediaService = {
  uploadImage: async (
    file: File
  ): Promise<{ url: string; size: number }> => {
    validateImage(file);

    let compressedBlob: Blob = await compressImage(
      file,
      INITIAL_COMPRESSION_QUALITY
    );
    let quality = INITIAL_COMPRESSION_QUALITY;

    while (
      compressedBlob.size > MAX_MEDIA_SIZE_BYTES &&
      quality > MIN_COMPRESSION_QUALITY
    ) {
      quality -= 0.1;
      compressedBlob = await compressImage(compressedBlob, quality);
    }

    if (compressedBlob.size > MAX_MEDIA_SIZE_BYTES) {
      throw new Error(
        'تصویر پس از فشرده‌سازی همچنان بیش از حد بزرگ است. لطفاً تصویر کوچک‌تری انتخاب کنید.'
      );
    }

    const dataUrl = await blobToDataUrl(compressedBlob);

    return { url: dataUrl, size: compressedBlob.size };
  },

  uploadAudio: async (
    blob: Blob
  ): Promise<{ url: string; size: number }> => {
    if (blob.size > MAX_MEDIA_SIZE_BYTES) {
      throw new Error(
        'پیام صوتی بیش از حد طولانی است. حداکثر مدت ضبط ۶۰ ثانیه است.'
      );
    }

    const dataUrl = await blobToDataUrl(blob);

    return { url: dataUrl, size: blob.size };
  },

  getMaxMediaSize: (): number => MAX_MEDIA_SIZE_BYTES,
};

function validateImage(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('فقط فرمت‌های JPEG، PNG و WebP مجاز هستند');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('حجم تصویر نمی‌تواند بیشتر از ۱۰ مگابایت باشد');
  }
}

function compressImage(fileOrBlob: File | Blob, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
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
