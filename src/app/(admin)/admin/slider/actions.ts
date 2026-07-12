"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import { removeStorageFilesByUrls } from "@/lib/supabase/storage";
import {
  HERO_SLIDE_CTA_DEFAULT_TEXT,
  isHeroSlideCtaType,
} from "@/lib/hero-slide-cta";
import type { HeroSlideCtaType } from "@/lib/types/database";

export interface HeroSlideFormState {
  message: string;
  committedImageUrl?: string | null;
}

interface HeroSlidePayload {
  image_url: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  cta_type: HeroSlideCtaType;
  cta_book_id: string | null;
  cta_external_url: string | null;
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

function isValidExternalUrl(value: string) {
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

function parseHeroSlideForm(formData: FormData): ParsedHeroSlideForm {
  const imageUrl = getString(formData, "image_url");
  const title = getString(formData, "title");
  const subtitle = getString(formData, "subtitle");
  const rawCtaType = getString(formData, "cta_type");
  const ctaBookId = getString(formData, "cta_book_id");
  const ctaExternalUrl = getString(formData, "cta_external_url");
  const displayOrder = getOptionalNumber(formData, "display_order") ?? 0;

  if (!isHeroSlideCtaType(rawCtaType)) {
    return { error: "Geçerli bir buton hedefi seçin." };
  }

  const ctaType = rawCtaType;
  const customCtaText = getString(formData, "cta_text");
  const ctaText =
    ctaType === "none"
      ? null
      : customCtaText || HERO_SLIDE_CTA_DEFAULT_TEXT[ctaType];

  if (Number.isNaN(displayOrder) || displayOrder < 0) {
    return { error: "Görüntülenme sırası sıfır veya daha büyük olmalıdır." };
  }

  if (ctaType === "book" && !ctaBookId) {
    return { error: "Butonun açacağı kitabı seçin." };
  }

  if (ctaType === "external" && !isValidExternalUrl(ctaExternalUrl)) {
    return { error: "Geçerli bir harici web sitesi adresi girin." };
  }

  return {
    data: {
      image_url: imageUrl,
      title: title || null,
      subtitle: subtitle || null,
      cta_text: ctaText,
      cta_link: null,
      cta_type: ctaType,
      cta_book_id: ctaType === "book" ? ctaBookId : null,
      cta_external_url: ctaType === "external" ? ctaExternalUrl : null,
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

  if (parsed.data.cta_type === "book") {
    const { data: book } = await supabase
      .from("books")
      .select("id")
      .eq("id", parsed.data.cta_book_id)
      .maybeSingle();

    if (!book) return initialError("Seçilen kitap bulunamadı.");
  }

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

  if (parsed.data.cta_type === "book") {
    const { data: book } = await supabase
      .from("books")
      .select("id")
      .eq("id", parsed.data.cta_book_id)
      .maybeSingle();

    if (!book) return initialError("Seçilen kitap bulunamadı.");
  }

  const { data: existingSlide, error: fetchError } = await supabase
    .from("hero_slides")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError || !existingSlide) {
    return initialError("Slayt bulunamadı.");
  }

  const { error } = await supabase
    .from("hero_slides")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    console.error("Hero slide update error:", error);
    return initialError("Slayt güncellenemedi. Lütfen tekrar deneyin.");
  }

  if (existingSlide.image_url !== parsed.data.image_url) {
    await removeStorageFilesByUrls(supabase, [existingSlide.image_url]);
  }

  revalidateSliderPages();
  revalidatePath(`/admin/slider/${id}`);
  redirect("/admin/slider?status=updated");
}

export async function deleteHeroSlideImageAction(
  id: string,
  imageUrl: string
): Promise<HeroSlideFormState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const { data: slide, error: fetchError } = await supabase
    .from("hero_slides")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError || !slide) {
    return initialError("Slayt bulunamadı.");
  }

  if (!slide.image_url) {
    return { message: "", committedImageUrl: null };
  }

  if (slide.image_url !== imageUrl) {
    return initialError("Slider görseli zaten değişmiş. Lütfen sayfayı yenileyin.");
  }

  const storageCleanupSucceeded = await removeStorageFilesByUrls(supabase, [
    imageUrl,
  ]);

  if (!storageCleanupSucceeded) {
    return initialError(
      "Slider görseli Supabase Storage'dan silinemedi. Storage silme politikasını kontrol edip tekrar deneyin."
    );
  }

  const { error: updateError } = await supabase
    .from("hero_slides")
    .update({ image_url: "" })
    .eq("id", id)
    .eq("image_url", imageUrl);

  if (updateError) {
    console.error("Hero slide image remove error:", updateError);
    return initialError("Slider görseli kaldırılamadı. Lütfen tekrar deneyin.");
  }

  revalidateSliderPages();
  revalidatePath(`/admin/slider/${id}`);
  return { message: "", committedImageUrl: null };
}

export async function deleteHeroSlideAction(
  id: string
): Promise<HeroSlideFormState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialError("Bu işlem için yeniden giriş yapmalısınız.");

  const { data: slide, error: fetchError } = await supabase
    .from("hero_slides")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError || !slide) {
    return initialError("Slayt bulunamadı.");
  }

  const { error } = await supabase.from("hero_slides").delete().eq("id", id);

  if (error) {
    console.error("Hero slide delete error:", error);
    return initialError("Slayt silinemedi. Lütfen tekrar deneyin.");
  }

  await removeStorageFilesByUrls(supabase, [slide.image_url]);

  revalidateSliderPages();
  return { message: "" };
}
