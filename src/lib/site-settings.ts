import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types/database";

export const fallbackSiteSettings: SiteSettings = {
  id: "fallback",
  site_title: "Ramazan Temelkuran",
  shopier_main_url: "",
  meta_description:
    "Yazar Ramazan Temelkuran'ın resmi web sitesi. Kitaplar, etkinlikler ve daha fazlası.",
  contact_email: "yazarvesair@gmail.com",
  contact_email_secondary: "ramazantemelkuran1@hotmail.com",
  contact_location: "",
  social_links: {},
  updated_at: new Date(0).toISOString(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return (data as SiteSettings | null) ?? fallbackSiteSettings;
  } catch {
    return fallbackSiteSettings;
  }
}
