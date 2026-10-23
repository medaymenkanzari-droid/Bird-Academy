/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Utilitaire d'optimisation et compression d'image côté client (Chantier 3)
 * 100% hors-ligne, zéro dépendance externe.
 */

export interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 à 1.0
}

export class ImageOptimizer {
  /**
   * Redimensionne et compresse une image (fichier ou blob) en data URL JPEG/WebP.
   * Empêche l'explosion du stockage local tout en préservant une excellente qualité d'affichage.
   */
  static async compressImageFile(
    file: File | Blob,
    options: ProcessImageOptions = {}
  ): Promise<string> {
    const { maxWidth = 1024, maxHeight = 1024, quality = 0.82 } = options;

    return new Promise((resolve, reject) => {
      // Vérification du type MIME
      if (file.type && !file.type.startsWith('image/')) {
        return reject(new Error('INVALID_FILE_TYPE'));
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('FILE_READ_ERROR'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('INVALID_IMAGE_DATA'));
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              if (width / height > maxWidth / maxHeight) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              return reject(new Error('CANVAS_CONTEXT_ERROR'));
            }

            // Dessin propre avec lissage
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Export JPEG compact optimisé pour le stockage local
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
          } catch (err) {
            reject(err);
          }
        };

        if (typeof reader.result === 'string') {
          img.src = reader.result;
        } else {
          reject(new Error('READ_RESULT_INVALID'));
        }
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Capture une frame depuis un élément HTMLVideoElement actif.
   */
  static captureFrameFromVideo(
    video: HTMLVideoElement,
    options: ProcessImageOptions = {}
  ): string {
    const { maxWidth = 1024, maxHeight = 1024, quality = 0.85 } = options;

    let width = video.videoWidth || 640;
    let height = video.videoHeight || 480;

    if (width > maxWidth || height > maxHeight) {
      if (width / height > maxWidth / maxHeight) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('CANVAS_CONTEXT_ERROR');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', quality);
  }
}
