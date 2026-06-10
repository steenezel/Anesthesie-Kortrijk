import imageCompression from "browser-image-compression";

const SKIP_MIME_TYPES = new Set(["image/svg+xml", "image/gif"]);
const SKIP_IF_UNDER_BYTES = 350_000;
const COMPRESS_TIMEOUT_MS = 20_000;

export type CompressImageResult = {
  file: File;
  compressed: boolean;
  originalBytes: number;
  finalBytes: number;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCompressionSummary(result: CompressImageResult): string | undefined {
  if (!result.compressed || result.finalBytes >= result.originalBytes) return undefined;
  return `${formatBytes(result.originalBytes)} → ${formatBytes(result.finalBytes)}`;
}

function toWebpFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "") || "afbeelding";
  return `${base}.webp`;
}

async function runCompression(file: File, useWebWorker: boolean): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 1.2,
    maxWidthOrHeight: 1920,
    useWebWorker,
    fileType: "image/webp",
    initialQuality: 0.82,
    preserveExif: false,
  });
}

/**
 * Compresses large raster images before Supabase upload.
 * Skips small files and formats that should stay untouched; falls back to the original on any error.
 */
export async function compressImageForUpload(file: File): Promise<CompressImageResult> {
  const originalBytes = file.size;
  const unchanged: CompressImageResult = {
    file,
    compressed: false,
    originalBytes,
    finalBytes: originalBytes,
  };

  if (!file.type.startsWith("image/") || SKIP_MIME_TYPES.has(file.type)) {
    return unchanged;
  }

  if (originalBytes <= SKIP_IF_UNDER_BYTES) {
    return unchanged;
  }

  try {
    const compressed = await Promise.race([
      runCompression(file, true).catch(() => runCompression(file, false)),
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("compress-timeout")), COMPRESS_TIMEOUT_MS);
      }),
    ]);

    if (compressed.size >= originalBytes * 0.95) {
      return unchanged;
    }

    const output = new File([compressed], toWebpFileName(file.name), {
      type: compressed.type || "image/webp",
      lastModified: Date.now(),
    });

    return {
      file: output,
      compressed: true,
      originalBytes,
      finalBytes: output.size,
    };
  } catch {
    return unchanged;
  }
}
