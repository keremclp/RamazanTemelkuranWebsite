import { createClient } from "@/lib/supabase/server";
import { cleanupStaleTemporaryUploads } from "@/lib/supabase/storage";

let lastTemporaryUploadCleanup = 0;

export async function getAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null };
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error) {
    console.error("Admin authorization check error:", error);
  }

  if (isAdmin === true && Date.now() - lastTemporaryUploadCleanup > 60_000) {
    lastTemporaryUploadCleanup = Date.now();
    await cleanupStaleTemporaryUploads(supabase);
  }

  return {
    supabase,
    user: isAdmin === true ? user : null,
  };
}
