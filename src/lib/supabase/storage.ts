import type { SupabaseClient } from "@supabase/supabase-js";

const publicObjectPrefix = "/storage/v1/object/public/";
const removalBatchSize = 100;

type StorageClient = Pick<SupabaseClient, "storage">;

export function getStorageObjectPath(
  url: string | null | undefined,
  bucket = "media"
) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl || parsedUrl.origin !== new URL(supabaseUrl).origin) {
      return null;
    }

    const bucketPrefix = `${publicObjectPrefix}${bucket}/`;
    if (!parsedUrl.pathname.startsWith(bucketPrefix)) return null;

    const segments = parsedUrl.pathname
      .slice(bucketPrefix.length)
      .split("/")
      .map((segment) => decodeURIComponent(segment));

    if (
      segments.length === 0 ||
      segments.some(
        (segment) =>
          !segment ||
          segment === "." ||
          segment === ".." ||
          segment.includes("/")
      )
    ) {
      return null;
    }

    return segments.join("/");
  } catch {
    return null;
  }
}

export async function removeStorageFilesByUrls(
  supabase: StorageClient,
  urls: readonly (string | null | undefined)[],
  bucket = "media"
) {
  const objectPaths = Array.from(
    new Set(
      urls
        .map((url) => getStorageObjectPath(url, bucket))
        .filter((path): path is string => Boolean(path))
    )
  );

  let succeeded = true;

  for (let index = 0; index < objectPaths.length; index += removalBatchSize) {
    const batch = objectPaths.slice(index, index + removalBatchSize);
    const { error } = await supabase.storage.from(bucket).remove(batch);

    if (error) {
      succeeded = false;
      console.error("Supabase Storage cleanup error:", error);
    }
  }

  return succeeded;
}
