/**
 * Sri Angalamman Blue Metals - Intelligent Client-Side Image Optimizer
 * 
 * Automatically compresses and resizes high-resolution camera images (e.g., 5MB - 25MB phone photos)
 * directly in the browser before network transmission.
 * 
 * Features:
 * - Resizes massive megapixel dimensions to 2048px max width/height preserving exact aspect ratio.
 * - Encodes with high visual fidelity (JPEG 0.88 quality) ensuring stones, sand, and fleet look ultra-crisp.
 * - Reduces 8MB-15MB files to ~400KB-800KB for instant uploads without network timeouts.
 * - Leaves SVGs and already compact files (< 400KB) untouched.
 * - Safe fallback: if Canvas or FileReader is unavailable, returns the original file.
 */

export async function optimizeImageForUpload(file, maxDimension = 2048, quality = 0.88) {
  if (!file) return file;

  // Don't modify SVGs or already small files (< 400KB)
  if (file.type === 'image/svg+xml' || file.size < 400 * 1024) {
    return file;
  }

  // Only process image MIME types
  if (file.type && !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    // If FileReader or Image is not supported, safely resolve with original file
    if (typeof FileReader === 'undefined' || typeof Image === 'undefined') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onerror = () => resolve(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        try {
          let { width, height } = img;

          // If image dimensions and file size are already small, no need to touch
          if (width <= maxDimension && height <= maxDimension && file.size < 1.5 * 1024 * 1024) {
            resolve(file);
            return;
          }

          // Calculate scaled dimensions while preserving aspect ratio
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          // High quality bicubic smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG blob
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const baseName = (file.name || 'upload').replace(/\.[^/.]+$/, '');
                const optimizedFile = new File([blob], `${baseName}.jpg`, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(optimizedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        } catch (err) {
          console.warn('Image optimization skipped:', err);
          resolve(file);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
