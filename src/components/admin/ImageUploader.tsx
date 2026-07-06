"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  bucket?: string;
  folder?: string;
  className?: string;
  aspectRatio?: string;
}

export default function ImageUploader({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  bucket = "media",
  folder = "uploads",
  className = "",
  aspectRatio = "aspect-[3/4]",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [error, setError] = useState<string | null>(null);

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

  function handleRemove() {
    setPreview(null);
    onImageRemoved?.();
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`relative ${aspectRatio} rounded-xl border-2 border-dashed border-border bg-secondary/50 overflow-hidden transition-colors hover:border-accent/40`}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Yüklenen görsel"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 400px"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-primary/80 text-white rounded-lg hover:bg-danger transition-colors"
              aria-label="Görseli kaldır"
            >
              <X size={16} />
            </button>
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
              disabled={uploading}
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
