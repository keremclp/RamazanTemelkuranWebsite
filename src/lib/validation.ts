export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateImageUpload(file: Pick<File, "type" | "size">) {
  if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return "Lütfen JPG, PNG veya WebP biçiminde bir görsel seçin.";
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return "Dosya boyutu 5MB'dan küçük olmalıdır.";
  }
  return null;
}
