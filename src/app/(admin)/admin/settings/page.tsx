import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types/database";
import SettingsForm from "@/components/admin/SettingsForm";
import { fallbackSiteSettings } from "@/lib/site-settings";
import { updateSiteSettingsAction } from "./actions";

export const metadata: Metadata = {
  title: "Ayarlar",
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const settings = (data as SiteSettings | null) ?? fallbackSiteSettings;
  const action = updateSiteSettingsAction.bind(
    null,
    data ? settings.id : null
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">
          Site Ayarları
        </h1>
        <p className="mt-1 text-muted">
          Site başlığı, SEO açıklaması, Shopier bağlantısı ve sosyal medya bağlantılarını yönetin.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          Site ayarları yüklenemedi. Varsayılan değerler gösteriliyor.
        </div>
      )}

      <SettingsForm action={action} settings={settings} />
    </div>
  );
}
