"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getStorageObjectPath } from "@/lib/supabase/storage";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  committedImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  onPersistedImageRemoved?: (
    url: string
  ) => Promise<{ message: string; cancelled?: boolean }>;
  bucket?: string;
  folder?: string;
  className?: string;
  aspectRatio?: string;
  frameClassName?: string;
  imageSizes?: string;
  previewAlt?: string;
  showReplaceButton?: boolean;
  replaceLabel?: string;
}

export default function ImageUploader({
  currentImageUrl,
  committedImageUrl,
  onImageUploaded,
  onImageRemoved,
  onPersistedImageRemoved,
  bucket = "media",
  folder = "uploads",
  className = "",
  aspectRatio = "aspect-[3/4]",
  frameClassName,
  imageSizes = "(max-width: 640px) 100vw, 400px",
  previewAlt = "Yüklenen görsel",
  showReplaceButton = false,
  replaceLabel = "Değiştir",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const persistedImageUrl = useRef(currentImageUrl ?? null);

  useEffect(() => {
    if (committedImageUrl !== undefined) {
      persistedImageUrl.current = committedImageUrl;
    }
  }, [committedImageUrl]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Lütfen bir görsel dosyası seçin.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Dosya boyutu 5MB'dan küçük olmalıdır.");
        return;
      }

      setError(null);
      setUploading(true);

      try {
        const supabase = createClient();

        // Generate unique filename
        const ext = file.name.split(".").pop();
        const fileName = `${folder}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(fileName);

        setPreview(publicUrl);
        onImageUploaded(publicUrl);
      } catch (err) {
        console.error("Upload error:", err);
        setError("Yükleme sırasında bir hata oluştu.");
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, onImageUploaded]
  );

  async function handleRemove() {
    if (!preview || uploading || removing) return;

    setError(null);

    if (preview === persistedImageUrl.current && onPersistedImageRemoved) {
      setRemoving(true);
      const result = await onPersistedImageRemoved(preview);

      if (result.cancelled) {
        setRemoving(false);
        return;
      }

      if (result.message) {
        setError(result.message);
        setRemoving(false);
        return;
      }

      persistedImageUrl.current = null;
      setPreview(null);
      onImageRemoved?.();
      setRemoving(false);
      return;
    }

    if (preview !== persistedImageUrl.current) {
      const objectPath = getStorageObjectPath(preview, bucket);

      if (objectPath) {
        setRemoving(true);
        const supabase = createClient();
        const { error: removeError } = await supabase.storage
          .from(bucket)
          .remove([objectPath]);

        if (removeError) {
          console.error("Upload cleanup error:", removeError);
          setError("Görsel depolamadan silinemedi. Lütfen tekrar deneyin.");
          setRemoving(false);
          return;
        }
      }
    }

    setPreview(null);
    onImageRemoved?.();
    setRemoving(false);
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={
          frameClassName ??
          `relative ${aspectRatio} rounded-xl border-2 border-dashed border-border bg-secondary/50 overflow-hidden transition-colors hover:border-accent/40`
        }
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt={previewAlt}
              fill
              className="object-cover"
              sizes={imageSizes}
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={removing}
              className="absolute top-2 right-2 p-1.5 bg-primary/80 text-white rounded-lg hover:bg-danger transition-colors"
              aria-label="Görseli kaldır"
            >
              {removing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <X size={16} />
              )}
            </button>
            {showReplaceButton && (
              <label className="absolute bottom-2 left-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary/80 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-accent">
                {uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                {replaceLabel}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading || removing}
                />
              </label>
            )}
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-2 text-muted hover:text-accent transition-colors">
            {uploading ? (
              <Loader2 size={28} className="animate-spin" />
            ) : (
              <>
                <Upload size={28} />
                <span className="text-sm font-medium">
                  Görsel Yükle
                </span>
                <span className="text-xs">PNG, JPG, WebP (maks. 5MB)</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading || removing}
            />
          </label>
        )}

        {uploading && preview && (
          <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-white" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
    </div>
  );
}
