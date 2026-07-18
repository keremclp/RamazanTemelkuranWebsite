import type {
  HeroSlideCtaType,
  HeroSlideVisualSource,
} from "@/lib/types/database";

export const HERO_SLIDE_VISUAL_SOURCES: HeroSlideVisualSource[] = [
  "uploaded_image",
  "selected_books",
  "selected_events",
];

export const MAX_HERO_SLIDE_SELECTIONS = 6;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type HeroSlideSelectionValidation =
  | {
      success: true;
      visualSource: HeroSlideVisualSource;
      bookIds: string[];
      eventIds: string[];
    }
  | { success: false; error: string };

export function isHeroSlideVisualSource(
  value: string
): value is HeroSlideVisualSource {
  return HERO_SLIDE_VISUAL_SOURCES.includes(value as HeroSlideVisualSource);
}

export function normalizeHeroSlideVisualSource(
  value: string | null | undefined
): HeroSlideVisualSource {
  return value && isHeroSlideVisualSource(value) ? value : "uploaded_image";
}

export function getHeroSlideCtaTypeForVisualSource(
  visualSource: HeroSlideVisualSource,
  uploadedImageCtaType: HeroSlideCtaType
): HeroSlideCtaType {
  if (visualSource === "selected_books") {
    return uploadedImageCtaType === "shopier" ? "shopier" : "books";
  }
  if (visualSource === "selected_events") return "gallery";
  return uploadedImageCtaType;
}

function normalizeIds(ids: string[]) {
  return ids.map((id) => id.trim().toLowerCase()).filter(Boolean);
}

function validateIds(ids: string[], contentLabel: string) {
  if (ids.length === 0) {
    return `En az bir ${contentLabel} seçin.`;
  }

  if (ids.length > MAX_HERO_SLIDE_SELECTIONS) {
    return `En fazla ${MAX_HERO_SLIDE_SELECTIONS} ${contentLabel} seçebilirsiniz.`;
  }

  if (ids.some((id) => !UUID_PATTERN.test(id))) {
    return `Seçilen ${contentLabel} kayıtlarından biri geçersiz.`;
  }

  if (new Set(ids).size !== ids.length) {
    return `Aynı ${contentLabel} birden fazla kez seçilemez.`;
  }

  return null;
}

export function validateHeroSlideSelections({
  visualSource,
  bookIds: rawBookIds,
  eventIds: rawEventIds,
}: {
  visualSource: string;
  bookIds: string[];
  eventIds: string[];
}): HeroSlideSelectionValidation {
  if (!isHeroSlideVisualSource(visualSource)) {
    return { success: false, error: "Geçerli bir görsel kaynağı seçin." };
  }

  const bookIds = normalizeIds(rawBookIds);
  const eventIds = normalizeIds(rawEventIds);

  if (visualSource === "uploaded_image") {
    return { success: true, visualSource, bookIds: [], eventIds: [] };
  }

  if (visualSource === "selected_books") {
    const error = validateIds(bookIds, "kitap");
    if (error) return { success: false, error };
    return { success: true, visualSource, bookIds, eventIds: [] };
  }

  const error = validateIds(eventIds, "etkinlik");
  if (error) return { success: false, error };
  return { success: true, visualSource, bookIds: [], eventIds };
}

export function validateHeroSlideSelectionAvailability(
  selection: Extract<HeroSlideSelectionValidation, { success: true }>,
  publishedBookIds: Iterable<string>,
  existingEventIds: Iterable<string>
) {
  if (selection.visualSource === "selected_books") {
    const availableIds = new Set(
      Array.from(publishedBookIds, (id) => id.toLowerCase())
    );
    if (selection.bookIds.some((id) => !availableIds.has(id))) {
      return "Yalnızca yayındaki kitapları seçebilirsiniz.";
    }
  }

  if (selection.visualSource === "selected_events") {
    const availableIds = new Set(
      Array.from(existingEventIds, (id) => id.toLowerCase())
    );
    if (selection.eventIds.some((id) => !availableIds.has(id))) {
      return "Seçilen etkinliklerden biri artık mevcut değil.";
    }
  }

  return null;
}
