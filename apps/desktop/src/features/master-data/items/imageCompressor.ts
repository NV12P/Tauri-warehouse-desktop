export interface CompressedImage {
  file: File;
  /** Data URL/blob URL yang dipakai langsung sebagai pratinjau di UI. */
  previewUrl: string;
  wasCompressed: boolean;
}

const MAX_DIMENSIONS = [1280, 960, 720];
const QUALITY_STEPS = [0.82, 0.7, 0.58];
const TARGET_BYTES = 350 * 1024;
const EXPORT_MAX_BYTES = 2 * 1024 * 1024;

/**
 * Mengecilkan foto material sebelum dikirim ke API Laravel.
 *
 * Output selalu JPG agar kompatibel dengan validasi `mimes:jpg,jpeg,png`
 * yang umum dipakai Laravel. Tidak menambah dependency: memakai canvas native.
 * `previewUrl` memakai data URL agar pratinjau tetap tampil di WebView Tauri.
 */
export async function compressItemPhoto(file: File): Promise<CompressedImage> {
  if (typeof createImageBitmap !== 'function') {
    return {
      file,
      previewUrl: await blobToPreviewUrl(file),
      wasCompressed: false,
    };
  }

  const bitmap = await createImageBitmap(file);
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      return {
        file,
        previewUrl: await blobToPreviewUrl(file),
        wasCompressed: false,
      };
    }

    let bestBlob: Blob | null = null;

    for (const maxDimension of MAX_DIMENSIONS) {
      const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
      const width = Math.max(1, Math.round(sourceWidth * scale));
      const height = Math.max(1, Math.round(sourceHeight * scale));

      canvas.width = width;
      canvas.height = height;

      // JPG tidak punya alpha, jadi latar transparan diisi putih.
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.drawImage(bitmap, 0, 0, width, height);

      for (const quality of QUALITY_STEPS) {
        const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
        if (!blob) continue;
        if (!bestBlob || blob.size < bestBlob.size) {
          bestBlob = blob;
        }
        if (blob.size <= TARGET_BYTES) {
          break;
        }
      }

      if (bestBlob && bestBlob.size <= TARGET_BYTES) {
        break;
      }
    }

    if (!bestBlob) {
      return {
        file,
        previewUrl: await blobToPreviewUrl(file),
        wasCompressed: false,
      };
    }
    if (bestBlob.size > EXPORT_MAX_BYTES) {
      throw new Error('Gambar terlalu besar setelah dikompres.');
    }
    if (bestBlob.size >= file.size) {
      return {
        file,
        previewUrl: await blobToPreviewUrl(file),
        wasCompressed: false,
      };
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto-barang';
    const compressedFile = new File([bestBlob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    return {
      file: compressedFile,
      previewUrl: await blobToPreviewUrl(bestBlob),
      wasCompressed: true,
    };
  } finally {
    bitmap.close();
  }
}

async function blobToPreviewUrl(blob: Blob): Promise<string> {
  try {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        resolve(result || URL.createObjectURL(blob));
      };
      reader.onerror = () => reject(reader.error ?? new Error('Gagal membaca gambar.'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return URL.createObjectURL(blob);
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
