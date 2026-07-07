"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Milestone, SocialLinks } from "@/lib/types/database";

export interface AboutFormState {
  message: string;
  success?: string;
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
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

  const query = id
    ? supabase.from("about_content").update(parsed.data).eq("id", id)
    : supabase.from("about_content").insert(parsed.data);

  const { error } = await query;

  if (error) {
    console.error("About content update error:", error);
    return initialError("Hakkında içeriği kaydedilemedi. Lütfen tekrar deneyin.");
  }

  revalidateAboutPages();
  return { message: "", success: "Hakkında sayfası güncellendi." };
}
