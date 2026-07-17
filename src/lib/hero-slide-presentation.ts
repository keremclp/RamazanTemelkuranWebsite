import type {
  HeroSlideBook,
  HeroSlidePresentationType,
} from "@/lib/types/database";

export const HERO_SLIDE_PRESENTATION_TYPES: HeroSlidePresentationType[] = [
  "image",
  "book",
];

export const HERO_SLIDE_PRESENTATION_LABELS: Record<
  HeroSlidePresentationType,
  string
> = {
  image: "Tanıtım görseli",
  book: "Kitap tanıtımı",
};

export function isHeroSlidePresentationType(
  value: string
): value is HeroSlidePresentationType {
  return HERO_SLIDE_PRESENTATION_TYPES.includes(
    value as HeroSlidePresentationType
  );
}

export function canShowBookPresentation(
  presentationType: HeroSlidePresentationType | undefined,
  book: HeroSlideBook | null | undefined
) {
  return presentationType !== "book" || Boolean(book?.is_published);
}
