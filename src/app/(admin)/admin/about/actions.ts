"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/supabase/admin";
import { removeStorageFilesByUrls } from "@/lib/supabase/storage";
import type { Milestone, SocialLinks } from "@/lib/types/database";

export interface AboutFormState {
  message: string;
  success?: string;
  committedImageUrl?: string | null;
}

interface AboutPayload {
  biography: string;
  portrait_image_url: string | null;
  milestones: Milestone[];
  social_links: SocialLinks;
}

type ParsedAboutForm =
  | { data: AboutPayload; error?: never }
  | { data?: never; error: string };

const initialError = (message: string): AboutFormState => ({ message });

const socialKeys = [
  "instagram",
  "youtube",
] as const;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidSocialUrl(value: string) {
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
  return getAdminClient();
}

function parseMilestones(value: string): (Milestone | "invalid")[] | null {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return null;

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const milestone = item as Partial<Record<keyof Milestone, unknown>>;
        const year =
          typeof milestone.year === "string" ? milestone.year.trim() : "";
        const title =
          typeof milestone.title === "string" ? milestone.title.trim() : "";
        const description =
          typeof milestone.description === "string"
            ? milestone.description.trim()
            : "";

        if (!year && !title && !description) return null;
        if (!year || !title || !description) return "invalid";

        return { year, title, description };
      })
      .filter((item): item is Milestone | "invalid" => item !== null);
  } catch {
    return null;
  }
}

function parseAboutForm(formData: FormData): ParsedAboutForm {
  const milestones = parseMilestones(getString(formData, "milestones"));
  if (!milestones) return { error: "Kariyer adımları okunamadı." };
  if (milestones.includes("invalid")) {
    return {
      error:
        "Kariyer adımlarında yıl, başlık ve açıklama alanları birlikte doldurulmalıdır.",
    };
  }

  const socialLinks: SocialLinks = {};
  for (const key of socialKeys) {
    const value = getString(formData, key);
    if (!isValidSocialUrl(value)) {
      return { error: `${key} bağlantısı geçerli bir URL olmalıdır.` };
    }
    if (value) socialLinks[key] = value;
  }

  return {
    data: {
      biography: getString(formData, "biography"),
      portrait_image_url: getString(formData, "portrait_image_url") || null,
      milestones: milestones.filter(
        (milestone): milestone is Milestone => milestone !== "invalid"
      ),
      social_links: socialLinks,
    },
  };
}

function revalidateAboutPages() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

export async function updateAboutContentAction(
  id: string | null,
  _previousState: AboutFormState,
  formData: FormData
): Promise<AboutFormState> {
  const parsed = parseAboutForm(formData);
  if (parsed.error !== undefined) return initialError(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  let previousPortraitUrl: string | null = null;

  if (id) {
    const { data: existingContent, error: fetchError } = await supabase
      .from("about_content")
      .select("portrait_image_url")
      .eq("id", id)
      .single();

    if (fetchError || !existingContent) {
      return initialError("Hakkında içeriği bulunamadı.");
    }

    previousPortraitUrl = existingContent.portrait_image_url;
  }

  const query = id
    ? supabase.from("about_content").update(parsed.data).eq("id", id)
    : supabase.from("about_content").insert(parsed.data);

  const { error } = await query;

  if (error) {
    console.error("About content update error:", error);
    return initialError("Hakkında içeriği kaydedilemedi. Lütfen tekrar deneyin.");
  }

  if (previousPortraitUrl !== parsed.data.portrait_image_url) {
    await removeStorageFilesByUrls(supabase, [previousPortraitUrl]);
  }

  revalidateAboutPages();
  return {
    message: "",
    success: "Hakkında sayfası güncellendi.",
    committedImageUrl: parsed.data.portrait_image_url,
  };
}

export async function deleteAboutPortraitAction(
  id: string | null,
  imageUrl: string
): Promise<AboutFormState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const query = supabase
    .from("about_content")
    .select("id, portrait_image_url")
    .eq("portrait_image_url", imageUrl)
    .limit(1);

  const { data: content, error: fetchError } = id
    ? await query.eq("id", id).single()
    : await query.maybeSingle();

  if (fetchError || !content) {
    console.error("About portrait lookup error:", fetchError);
    return initialError("Portre görseli kontrol edilemedi. Lütfen tekrar deneyin.");
  }

  if (!content.portrait_image_url) {
    return { message: "", committedImageUrl: null };
  }

  const storageCleanupSucceeded = await removeStorageFilesByUrls(supabase, [
    imageUrl,
  ]);

  if (!storageCleanupSucceeded) {
    return initialError(
      "Portre görseli Supabase Storage'dan silinemedi. Storage silme politikasını kontrol edip tekrar deneyin."
    );
  }

  const { error: updateError } = await supabase
    .from("about_content")
    .update({ portrait_image_url: null })
    .eq("id", content.id)
    .eq("portrait_image_url", imageUrl);

  if (updateError) {
    console.error("About portrait remove error:", updateError);
    return initialError("Portre görseli kaldırılamadı. Lütfen tekrar deneyin.");
  }

  revalidateAboutPages();
  return {
    message: "",
    success: "Portre görseli kaldırıldı.",
    committedImageUrl: null,
  };
}
