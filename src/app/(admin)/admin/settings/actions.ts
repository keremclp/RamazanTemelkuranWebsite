"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SocialLinks } from "@/lib/types/database";

export interface SiteSettingsFormState {
  message: string;
  success?: string;
}

interface SiteSettingsPayload {
  site_title: string;
  shopier_main_url: string;
  meta_description: string;
  social_links: SocialLinks;
}

type ParsedSiteSettingsForm =
  | { data: SiteSettingsPayload; error?: never }
  | { data?: never; error: string };

const initialError = (message: string): SiteSettingsFormState => ({ message });

const socialKeys = [
  "instagram",
  "youtube",
] as const;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidUrl(value: string) {
  if (!value) return true;
  if (value === "#" || value.startsWith("/") || value.startsWith("mailto:")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

function parseSiteSettingsForm(formData: FormData): ParsedSiteSettingsForm {
  const siteTitle = getString(formData, "site_title");
  const metaDescription = getString(formData, "meta_description");
  const shopierMainUrl = getString(formData, "shopier_main_url");

  if (!siteTitle) return { error: "Site başlığı gereklidir." };
  if (!metaDescription) return { error: "Meta açıklaması gereklidir." };

  if (shopierMainUrl && !isValidUrl(shopierMainUrl)) {
    return { error: "Shopier bağlantısı geçerli bir URL olmalıdır." };
  }

  const socialLinks: SocialLinks = {};
  for (const key of socialKeys) {
    const value = getString(formData, key);
    if (!isValidUrl(value)) {
      return { error: `${key} bağlantısı geçerli bir URL olmalıdır.` };
    }
    if (value) socialLinks[key] = value;
  }

  return {
    data: {
      site_title: siteTitle,
      shopier_main_url: shopierMainUrl,
      meta_description: metaDescription,
      social_links: socialLinks,
    },
  };
}

function revalidateSettingsPages() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function updateSiteSettingsAction(
  id: string | null,
  _previousState: SiteSettingsFormState,
  formData: FormData
): Promise<SiteSettingsFormState> {
  const parsed = parseSiteSettingsForm(formData);
  if (parsed.error !== undefined) return initialError(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const query = id
    ? supabase.from("site_settings").update(parsed.data).eq("id", id)
    : supabase.from("site_settings").insert(parsed.data);

  const { error } = await query;

  if (error) {
    console.error("Site settings update error:", error);
    return initialError("Site ayarları kaydedilemedi. Lütfen tekrar deneyin.");
  }

  revalidateSettingsPages();
  return { message: "", success: "Site ayarları güncellendi." };
}
