"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface HeroSlideFormState {
  message: string;
}

interface HeroSlidePayload {
  image_url: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  display_order: number;
  is_active: boolean;
}

type ParsedHeroSlideForm =
  | { data: HeroSlidePayload; error?: never }
  | { data?: never; error: string };

const initialError = (message: string): HeroSlideFormState => ({ message });

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalNumber(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) return null;

  const number = Number(value);
  return Number.isInteger(number) ? number : Number.NaN;
}

function isValidLink(value: string) {
  if (value.startsWith("/")) return true;

  try {
    new URL(value);
    return true;
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

function parseHeroSlideForm(formData: FormData): ParsedHeroSlideForm {
  const imageUrl = getString(formData, "image_url");
  const title = getString(formData, "title");
  const subtitle = getString(formData, "subtitle");
  const ctaText = getString(formData, "cta_text");
  const ctaLink = getString(formData, "cta_link");
  const displayOrder = getOptionalNumber(formData, "display_order") ?? 0;

  if (Number.isNaN(displayOrder) || displayOrder < 0) {
    return { error: "Görüntülenme sırası sıfır veya daha büyük olmalıdır." };
  }

  if ((ctaText && !ctaLink) || (!ctaText && ctaLink)) {
    return { error: "Buton metni ve buton bağlantısı birlikte girilmelidir." };
  }

  if (ctaLink && !isValidLink(ctaLink)) {
    return { error: "Buton bağlantısı /sayfa veya geçerli bir URL olmalıdır." };
  }

  return {
    data: {
      image_url: imageUrl,
      title: title || null,
      subtitle: subtitle || null,
      cta_text: ctaText || null,
      cta_link: ctaLink || null,
      display_order: displayOrder,
      is_active: getString(formData, "is_active") === "on",
    },
  };
}

function revalidateSliderPages() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/slider");
}

export async function createHeroSlideAction(
  _previousState: HeroSlideFormState,
  formData: FormData
): Promise<HeroSlideFormState> {
  const parsed = parseHeroSlideForm(formData);
  if (parsed.error !== undefined) return initialError(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const { error } = await supabase.from("hero_slides").insert(parsed.data);

  if (error) {
    console.error("Hero slide create error:", error);
    return initialError("Slayt kaydedilemedi. Lütfen tekrar deneyin.");
  }

  revalidateSliderPages();
  redirect("/admin/slider?status=created");
}

export async function updateHeroSlideAction(
  id: string,
  _previousState: HeroSlideFormState,
  formData: FormData
): Promise<HeroSlideFormState> {
  const parsed = parseHeroSlideForm(formData);
  if (parsed.error !== undefined) return initialError(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const { error } = await supabase
    .from("hero_slides")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    console.error("Hero slide update error:", error);
    return initialError("Slayt güncellenemedi. Lütfen tekrar deneyin.");
  }

  revalidateSliderPages();
  revalidatePath(`/admin/slider/${id}`);
  redirect("/admin/slider?status=updated");
}

export async function deleteHeroSlideAction(
  id: string
): Promise<HeroSlideFormState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const { error } = await supabase.from("hero_slides").delete().eq("id", id);

  if (error) {
    console.error("Hero slide delete error:", error);
    return initialError("Slayt silinemedi. Lütfen tekrar deneyin.");
  }

  revalidateSliderPages();
  return { message: "" };
}
