"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  commitTemporaryUpload,
  discardTemporaryUpload,
  removeStorageFilesByUrls,
} from "@/lib/supabase/storage";
import {
  HERO_SLIDE_CTA_DEFAULT_TEXT,
  isHeroSlideCtaType,
} from "@/lib/hero-slide-cta";
import {
  getHeroSlideCtaTypeForVisualSource,
  normalizeHeroSlideVisualSource,
  validateHeroSlideSelectionAvailability,
  validateHeroSlideSelections,
} from "@/lib/hero-slide-visual-source";
import type {
  HeroSlideCtaType,
  HeroSlideVisualSource,
} from "@/lib/types/database";

export interface HeroSlideFormState {
  message: string;
  committedImageUrl?: string | null;
}

interface HeroSlidePayload {
  image_url: string | null;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_type: HeroSlideCtaType;
  cta_external_url: string | null;
  visual_source: HeroSlideVisualSource;
  book_ids: string[];
  event_ids: string[];
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

function getStrings(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string");
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
  const ctaExternalUrl = getString(formData, "cta_external_url");
  const displayOrder = getOptionalNumber(formData, "display_order") ?? 0;

  const selection = validateHeroSlideSelections({
    visualSource: getString(formData, "visual_source"),
    bookIds: getStrings(formData, "book_ids"),
    eventIds: getStrings(formData, "event_ids"),
  });
  if (!selection.success) return { error: selection.error };

  const ctaType = getHeroSlideCtaTypeForVisualSource(
    selection.visualSource,
    isHeroSlideCtaType(rawCtaType) ? rawCtaType : "none"
  );

  if (
    selection.visualSource === "uploaded_image" &&
    !isHeroSlideCtaType(rawCtaType)
  ) {
    return { error: "Geçerli bir buton hedefi seçin." };
  }

  if (
    selection.visualSource === "selected_books" &&
    rawCtaType !== "books" &&
    rawCtaType !== "shopier"
  ) {
    return {
      error: "Kitap koleksiyonu için Kitaplar veya Shopier hedefini seçin.",
    };
  }

  const customCtaText = getString(formData, "cta_text");
  const ctaText =
    ctaType === "none"
      ? null
      : customCtaText || HERO_SLIDE_CTA_DEFAULT_TEXT[ctaType];

  if (Number.isNaN(displayOrder) || displayOrder < 0) {
    return {
      error: "Görüntülenme sırası sıfır veya daha büyük olmalıdır.",
    };
  }

  if (selection.visualSource === "uploaded_image" && !imageUrl) {
    return { error: "Tanıtım slaytı için bir görsel yükleyin." };
  }

  if (ctaType === "external" && !isValidExternalUrl(ctaExternalUrl)) {
    return { error: "Geçerli bir harici web sitesi adresi girin." };
  }

  return {
    data: {
      image_url: imageUrl || null,
      title: title || null,
      subtitle: subtitle || null,
      cta_text: ctaText,
      cta_type: ctaType,
      cta_external_url: ctaType === "external" ? ctaExternalUrl : null,
      visual_source: selection.visualSource,
      book_ids: selection.bookIds,
      event_ids: selection.eventIds,
      display_order: displayOrder,
      is_active: getString(formData, "is_active") === "on",
    },
  };
}

async function validateSelectedRecords(
  supabase: SupabaseClient,
  payload: HeroSlidePayload
) {
  const [booksResult, eventsResult] = await Promise.all([
    payload.book_ids.length
      ? supabase
          .from("books")
          .select("id")
          .in("id", payload.book_ids)
          .eq("is_published", true)
      : Promise.resolve({ data: [], error: null }),
    payload.event_ids.length
      ? supabase.from("events").select("id").in("id", payload.event_ids)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (booksResult.error || eventsResult.error) {
    return "Seçilen içerikler doğrulanamadı. Lütfen tekrar deneyin.";
  }

  return validateHeroSlideSelectionAvailability(
    {
      success: true,
      visualSource: payload.visual_source,
      bookIds: payload.book_ids,
      eventIds: payload.event_ids,
    },
    (booksResult.data ?? []).map((book) => book.id),
    (eventsResult.data ?? []).map((event) => event.id)
  );
}

async function saveHeroSlide(
  supabase: SupabaseClient,
  slideId: string | null,
  payload: HeroSlidePayload
) {
  return supabase.rpc("save_hero_slide_with_selections", {
    p_slide_id: slideId,
    p_image_url: payload.image_url,
    p_title: payload.title,
    p_subtitle: payload.subtitle,
    p_cta_text: payload.cta_text,
    p_cta_type: payload.cta_type,
    p_cta_external_url: payload.cta_external_url,
    p_display_order: payload.display_order,
    p_is_active: payload.is_active,
    p_visual_source: payload.visual_source,
    p_book_ids: payload.book_ids,
    p_event_ids: payload.event_ids,
  });
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

  const selectionError = await validateSelectedRecords(supabase, parsed.data);
  if (selectionError) return initialError(selectionError);

  const { error } = await saveHeroSlide(supabase, null, parsed.data);

  if (error) {
    await discardTemporaryUpload(supabase, parsed.data.image_url);
    console.error("Hero slide create error:", error);
    return initialError("Slayt kaydedilemedi. Lütfen tekrar deneyin.");
  }

  await commitTemporaryUpload(supabase, parsed.data.image_url);
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

  const { data: existingSlide, error: fetchError } = await supabase
    .from("hero_slides")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError || !existingSlide) {
    return initialError("Slayt bulunamadı.");
  }

  const selectionError = await validateSelectedRecords(supabase, parsed.data);
  if (selectionError) return initialError(selectionError);

  const { error } = await saveHeroSlide(supabase, id, parsed.data);

  if (error) {
    if (existingSlide.image_url !== parsed.data.image_url) {
      await discardTemporaryUpload(supabase, parsed.data.image_url);
    }
    console.error("Hero slide update error:", error);
    return initialError("Slayt güncellenemedi. Lütfen tekrar deneyin.");
  }

  await commitTemporaryUpload(supabase, parsed.data.image_url);
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
    .select("image_url, visual_source")
    .eq("id", id)
    .single();

  if (fetchError || !slide) return initialError("Slayt bulunamadı.");
  if (!slide.image_url) return { message: "", committedImageUrl: null };

  if (normalizeHeroSlideVisualSource(slide.visual_source) === "uploaded_image") {
    return initialError(
      "Yüklenen görsel modunda boş görsel bırakılamaz. Yeni görseli doğrudan yükleyin veya önce dinamik bir kaynak seçip kaydedin."
    );
  }

  if (slide.image_url !== imageUrl) {
    return initialError(
      "Slider görseli zaten değişmiş. Lütfen sayfayı yenileyin."
    );
  }

  const { error: updateError } = await supabase
    .from("hero_slides")
    .update({ image_url: null })
    .eq("id", id)
    .eq("image_url", imageUrl);

  if (updateError) {
    console.error("Hero slide image remove error:", updateError);
    return initialError("Slider görseli kaldırılamadı. Lütfen tekrar deneyin.");
  }

  const storageCleanupSucceeded = await removeStorageFilesByUrls(supabase, [
    imageUrl,
  ]);

  revalidateSliderPages();
  revalidatePath(`/admin/slider/${id}`);
  return {
    message: storageCleanupSucceeded
      ? ""
      : "Görsel siteden kaldırıldı, ancak Storage temizliği tamamlanamadı.",
    committedImageUrl: null,
  };
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

  if (fetchError || !slide) return initialError("Slayt bulunamadı.");

  const { error } = await supabase.from("hero_slides").delete().eq("id", id);

  if (error) {
    console.error("Hero slide delete error:", error);
    return initialError("Slayt silinemedi. Lütfen tekrar deneyin.");
  }

  await removeStorageFilesByUrls(supabase, [slide.image_url]);

  revalidateSliderPages();
  return { message: "" };
}
