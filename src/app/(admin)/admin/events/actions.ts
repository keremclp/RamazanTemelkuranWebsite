"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/utils/helpers";

export interface EventFormState {
  message: string;
}

export interface MediaFormState {
  message: string;
  success?: string;
}

interface EventPayload {
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
}

interface MediaPayload {
  event_id: string;
  type: "photo" | "video";
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  display_order: number;
}

type ParsedEventForm =
  | { data: EventPayload; error?: never }
  | { data?: never; error: string };

type ParsedMediaForm =
  | { data: MediaPayload; error?: never }
  | { data?: never; error: string };

const initialEventError = (message: string): EventFormState => ({ message });
const initialMediaError = (message: string): MediaFormState => ({ message });

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

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return value.startsWith("/");
  }
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

function parseEventForm(formData: FormData): ParsedEventForm {
  const title = getString(formData, "title");
  const eventDate = getString(formData, "event_date");

  if (!title) return { error: "Etkinlik başlığı gereklidir." };
  if (!eventDate || !isValidDate(eventDate)) {
    return { error: "Geçerli bir etkinlik tarihi seçmelisiniz." };
  }

  return {
    data: {
      title,
      description: getString(formData, "description") || null,
      event_date: eventDate,
      location: getString(formData, "location") || null,
    },
  };
}

function parseMediaForm(eventId: string, formData: FormData): ParsedMediaForm {
  const rawType = getString(formData, "type");
  const type = rawType === "video" ? "video" : rawType === "photo" ? "photo" : null;
  const url = getString(formData, "url");
  const thumbnailUrl = getString(formData, "thumbnail_url");
  const displayOrder = getOptionalNumber(formData, "display_order") ?? 0;

  if (!eventId) return { error: "Etkinlik bulunamadı." };
  if (!type) return { error: "Medya türü geçersiz." };
  if (!url) return { error: "Medya bağlantısı gereklidir." };
  if (!isValidUrl(url)) return { error: "Medya bağlantısı geçerli bir URL olmalıdır." };
  if (thumbnailUrl && !isValidUrl(thumbnailUrl)) {
    return { error: "Kapak görseli bağlantısı geçerli bir URL olmalıdır." };
  }
  if (type === "video" && !extractYouTubeId(url)) {
    return { error: "Video için geçerli bir YouTube bağlantısı girin." };
  }
  if (Number.isNaN(displayOrder) || displayOrder < 0) {
    return { error: "Görüntülenme sırası sıfır veya daha büyük olmalıdır." };
  }

  return {
    data: {
      event_id: eventId,
      type,
      url,
      thumbnail_url: thumbnailUrl || null,
      caption: getString(formData, "caption") || null,
      display_order: displayOrder,
    },
  };
}

function revalidateEventPages(eventId?: string) {
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/admin/gallery");
  if (eventId) revalidatePath(`/admin/events/${eventId}`);
}

export async function createEventAction(
  _previousState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const parsed = parseEventForm(formData);
  if (parsed.error !== undefined) return initialEventError(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialEventError("Bu işlem için yeniden giriş yapmalısınız.");

  const { error } = await supabase.from("events").insert(parsed.data);

  if (error) {
    console.error("Event create error:", error);
    return initialEventError("Etkinlik kaydedilemedi. Lütfen tekrar deneyin.");
  }

  revalidateEventPages();
  redirect("/admin/events?status=created");
}

export async function updateEventAction(
  id: string,
  _previousState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const parsed = parseEventForm(formData);
  if (parsed.error !== undefined) return initialEventError(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialEventError("Bu işlem için yeniden giriş yapmalısınız.");

  const { error } = await supabase
    .from("events")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    console.error("Event update error:", error);
    return initialEventError("Etkinlik güncellenemedi. Lütfen tekrar deneyin.");
  }

  revalidateEventPages(id);
  redirect("/admin/events?status=updated");
}

export async function deleteEventAction(id: string): Promise<EventFormState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialEventError("Bu işlem için yeniden giriş yapmalısınız.");

  const { error: mediaError } = await supabase
    .from("media")
    .delete()
    .eq("event_id", id);

  if (mediaError) {
    console.error("Event media delete error:", mediaError);
    return initialEventError("Etkinliğe bağlı medya silinemedi. Lütfen tekrar deneyin.");
  }

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    console.error("Event delete error:", error);
    return initialEventError("Etkinlik silinemedi. Lütfen tekrar deneyin.");
  }

  revalidateEventPages(id);
  return { message: "" };
}

export async function createMediaAction(
  eventId: string,
  _previousState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  const parsed = parseMediaForm(eventId, formData);
  if (parsed.error !== undefined) return initialMediaError(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialMediaError("Bu işlem için yeniden giriş yapmalısınız.");

  const shouldUseOnHomepage = getString(formData, "use_on_homepage") === "on";
  const { data: media, error } = await supabase
    .from("media")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    console.error("Media create error:", error);
    return initialMediaError("Medya kaydedilemedi. Lütfen tekrar deneyin.");
  }

  if (shouldUseOnHomepage && parsed.data.type === "photo" && media?.id) {
    const { error: eventError } = await supabase
      .from("events")
      .update({ homepage_media_id: media.id })
      .eq("id", eventId);

    if (eventError) {
      console.error("Homepage media set after create error:", eventError);
      return initialMediaError("Medya eklendi, ancak ana sayfa görseli olarak seçilemedi.");
    }
  }

  revalidateEventPages(eventId);
  return {
    message: "",
    success:
      shouldUseOnHomepage && parsed.data.type === "photo"
        ? "Medya eklendi ve ana sayfa görseli olarak seçildi."
        : "Medya başarıyla eklendi.",
  };
}

export async function deleteMediaAction(
  eventId: string,
  mediaId: string
): Promise<MediaFormState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialMediaError("Bu işlem için yeniden giriş yapmalısınız.");

  await supabase
    .from("events")
    .update({ homepage_media_id: null })
    .eq("id", eventId)
    .eq("homepage_media_id", mediaId);

  const { error } = await supabase
    .from("media")
    .delete()
    .eq("id", mediaId)
    .eq("event_id", eventId);

  if (error) {
    console.error("Media delete error:", error);
    return initialMediaError("Medya silinemedi. Lütfen tekrar deneyin.");
  }

  revalidateEventPages(eventId);
  return { message: "" };
}

export async function deleteGalleryMediaAction(
  mediaId: string
): Promise<MediaFormState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialMediaError("Bu işlem için yeniden giriş yapmalısınız.");

  const { data: media, error: fetchError } = await supabase
    .from("media")
    .select("id, event_id")
    .eq("id", mediaId)
    .single();

  if (fetchError || !media) {
    return initialMediaError("Medya kaydı bulunamadı.");
  }

  if (media.event_id) {
    await supabase
      .from("events")
      .update({ homepage_media_id: null })
      .eq("id", media.event_id)
      .eq("homepage_media_id", mediaId);
  }

  const { error } = await supabase.from("media").delete().eq("id", mediaId);

  if (error) {
    console.error("Gallery media delete error:", error);
    return initialMediaError("Medya silinemedi. Lütfen tekrar deneyin.");
  }

  revalidateEventPages(media.event_id ?? undefined);
  return { message: "" };
}

export async function createGalleryMediaAction(
  _previousState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  const eventId = getString(formData, "event_id");
  const parsed = parseMediaForm(eventId, formData);
  if (parsed.error !== undefined) return initialMediaError(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialMediaError("Bu işlem için yeniden giriş yapmalısınız.");

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .single();

  if (!event) return initialMediaError("Seçilen etkinlik bulunamadı.");

  const shouldUseOnHomepage = getString(formData, "use_on_homepage") === "on";
  const { data: media, error } = await supabase
    .from("media")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    console.error("Gallery media create error:", error);
    return initialMediaError("Medya kaydedilemedi. Lütfen tekrar deneyin.");
  }

  if (shouldUseOnHomepage && parsed.data.type === "photo" && media?.id) {
    const { error: eventError } = await supabase
      .from("events")
      .update({ homepage_media_id: media.id })
      .eq("id", eventId);

    if (eventError) {
      console.error("Gallery homepage media set error:", eventError);
      return initialMediaError("Medya eklendi, ancak ana sayfa görseli olarak seçilemedi.");
    }
  }

  revalidateEventPages(eventId);
  return {
    message: "",
    success:
      shouldUseOnHomepage && parsed.data.type === "photo"
        ? "Medya eklendi ve ana sayfa görseli olarak seçildi."
        : "Medya başarıyla eklendi.",
  };
}

export async function updateGalleryMediaAction(
  mediaId: string,
  _previousState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  const eventId = getString(formData, "event_id");
  const caption = getString(formData, "caption") || null;
  const displayOrder = getOptionalNumber(formData, "display_order") ?? 0;
  const shouldUseOnHomepage = getString(formData, "use_on_homepage") === "on";

  if (!eventId) return initialMediaError("Etkinlik seçmelisiniz.");
  if (Number.isNaN(displayOrder) || displayOrder < 0) {
    return initialMediaError("Görüntülenme sırası sıfır veya daha büyük olmalıdır.");
  }

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialMediaError("Bu işlem için yeniden giriş yapmalısınız.");

  const [{ data: existingMedia }, { data: event }] = await Promise.all([
    supabase
      .from("media")
      .select("id, event_id, type")
      .eq("id", mediaId)
      .single(),
    supabase.from("events").select("id").eq("id", eventId).single(),
  ]);

  if (!existingMedia) return initialMediaError("Medya kaydı bulunamadı.");
  if (!event) return initialMediaError("Seçilen etkinlik bulunamadı.");

  const { error } = await supabase
    .from("media")
    .update({
      event_id: eventId,
      caption,
      display_order: displayOrder,
    })
    .eq("id", mediaId);

  if (error) {
    console.error("Gallery media update error:", error);
    return initialMediaError("Medya güncellenemedi. Lütfen tekrar deneyin.");
  }

  if (existingMedia.event_id && existingMedia.event_id !== eventId) {
    await supabase
      .from("events")
      .update({ homepage_media_id: null })
      .eq("id", existingMedia.event_id)
      .eq("homepage_media_id", mediaId);
  }

  if (existingMedia.type === "photo" && shouldUseOnHomepage) {
    const { error: eventError } = await supabase
      .from("events")
      .update({ homepage_media_id: mediaId })
      .eq("id", eventId);

    if (eventError) {
      console.error("Gallery homepage media update error:", eventError);
      return initialMediaError("Medya güncellendi, ancak ana sayfa görseli seçilemedi.");
    }
  } else {
    await supabase
      .from("events")
      .update({ homepage_media_id: null })
      .eq("homepage_media_id", mediaId);
  }

  revalidateEventPages(eventId);
  if (existingMedia.event_id) revalidateEventPages(existingMedia.event_id);
  return { message: "", success: "Medya güncellendi." };
}

export async function setEventHomepageMediaAction(
  eventId: string,
  mediaId: string | null
): Promise<MediaFormState> {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return initialMediaError("Bu işlem için yeniden giriş yapmalısınız.");

  if (mediaId) {
    const { data: media, error: mediaError } = await supabase
      .from("media")
      .select("id, event_id, type")
      .eq("id", mediaId)
      .eq("event_id", eventId)
      .single();

    if (mediaError || !media) {
      return initialMediaError("Seçilen medya bu etkinliğe ait değil.");
    }

    if (media.type !== "photo") {
      return initialMediaError("Ana sayfa görseli olarak yalnızca fotoğraf seçebilirsiniz.");
    }
  }

  const { error } = await supabase
    .from("events")
    .update({ homepage_media_id: mediaId })
    .eq("id", eventId);

  if (error) {
    console.error("Homepage media update error:", error);
    return initialMediaError("Ana sayfa görseli güncellenemedi. Lütfen tekrar deneyin.");
  }

  revalidateEventPages(eventId);
  return {
    message: "",
    success: mediaId
      ? "Ana sayfa görseli güncellendi."
      : "Ana sayfa görseli kaldırıldı.",
  };
}
