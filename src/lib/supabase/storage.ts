import type { SupabaseClient } from "@supabase/supabase-js";

const publicObjectPrefix = "/storage/v1/object/public/";
const removalBatchSize = 100;

type StorageClient = Pick<SupabaseClient, "storage">;
type TemporaryUploadClient = Pick<SupabaseClient, "from" | "storage">;

const temporaryUploadMaxAgeHours = 24;

export function getStorageObjectPath(
  url: string | null | undefined,
  bucket = "media"
) {
  if (!url) return null;

  if (/(?:^|\/)(?:\.{1,2}|%2e(?:%2e)?)(?:\/|%2f|$)/i.test(url)) {
    return null;
  }

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

export async function commitTemporaryUpload(
  supabase: TemporaryUploadClient,
  url: string | null | undefined
) {
  if (!url) return;

  const { error } = await supabase
    .from("temporary_uploads")
    .delete()
    .eq("url", url);

  if (error) console.error("Temporary upload commit error:", error);
}

export async function discardTemporaryUpload(
  supabase: TemporaryUploadClient,
  url: string | null | undefined,
  bucket = "media"
) {
  if (!url) return true;

  const { data } = await supabase
    .from("temporary_uploads")
    .select("url")
    .eq("url", url)
    .maybeSingle();

  if (!data) return true;

  const removed = await removeStorageFilesByUrls(supabase, [url], bucket);
  if (!removed) return false;

  const { error } = await supabase
    .from("temporary_uploads")
    .delete()
    .eq("url", url);

  if (error) {
    console.error("Temporary upload discard error:", error);
    return false;
  }

  return true;
}

export async function cleanupStaleTemporaryUploads(
  supabase: TemporaryUploadClient
) {
  const cutoff = new Date(
    Date.now() - temporaryUploadMaxAgeHours * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("temporary_uploads")
    .select("id, bucket, url")
    .lt("created_at", cutoff)
    .limit(100);

  if (error) {
    console.error("Stale upload lookup error:", error);
    return;
  }

  for (const upload of data ?? []) {
    const removed = await removeStorageFilesByUrls(
      supabase,
      [upload.url],
      upload.bucket
    );

    if (removed) {
      await supabase.from("temporary_uploads").delete().eq("id", upload.id);
    }
  }
}
