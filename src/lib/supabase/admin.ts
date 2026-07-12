import { createClient } from "@/lib/supabase/server";

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

  return {
    supabase,
    user: isAdmin === true ? user : null,
  };
}
