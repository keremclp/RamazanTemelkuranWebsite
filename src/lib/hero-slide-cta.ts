import type {
  HeroSlideCtaType,
  SiteSettings,
} from "@/lib/types/database";

export const HERO_SLIDE_CTA_TYPES: HeroSlideCtaType[] = [
  "none",
  "books",
  "book",
  "gallery",
  "about",
  "contact",
  "shopier",
  "external",
];

export const HERO_SLIDE_CTA_LABELS: Record<HeroSlideCtaType, string> = {
  none: "Buton gösterme",
  books: "Kitaplar sayfası",
  book: "Belirli bir kitap",
  gallery: "Galeri",
  about: "Hakkında",
  contact: "İletişim",
  shopier: "Shopier mağazası",
  external: "Harici web sitesi",
};

export const HERO_SLIDE_CTA_DEFAULT_TEXT: Record<HeroSlideCtaType, string> = {
  none: "",
  books: "Kitapları Keşfet",
  book: "Kitabı İncele",
  gallery: "Galeriyi Gör",
  about: "Daha Fazla Bilgi",
  contact: "İletişime Geç",
  shopier: "Shopier'den Satın Al",
  external: "Bağlantıyı Aç",
};

export function isHeroSlideCtaType(value: string): value is HeroSlideCtaType {
  return HERO_SLIDE_CTA_TYPES.includes(value as HeroSlideCtaType);
}

export function inferLegacyCtaType(link: string | null): HeroSlideCtaType {
  if (!link) return "none";
  if (link === "/books") return "books";
  if (link.startsWith("/books/")) return "book";
  if (link === "/gallery") return "gallery";
  if (link === "/about") return "about";
  if (link === "/contact") return "contact";
  return link.startsWith("http://") || link.startsWith("https://")
    ? "external"
    : "none";
}

export function resolveHeroSlideCtaHref(
  slide: {
    cta_type: HeroSlideCtaType;
    cta_link: string | null;
    cta_external_url: string | null;
    cta_book?: { slug: string; is_published?: boolean } | null;
  },
  settings: Pick<SiteSettings, "shopier_main_url">
) {
  switch (slide.cta_type) {
    case "books":
      return "/books";
    case "book":
      return slide.cta_book?.slug && slide.cta_book.is_published !== false
        ? `/books/${slide.cta_book.slug}`
        : null;
    case "gallery":
      return "/gallery";
    case "about":
      return "/about";
    case "contact":
      return "/contact";
    case "shopier":
      return settings.shopier_main_url || null;
    case "external":
      return slide.cta_external_url;
    case "none":
      return null;
    default:
      return slide.cta_link;
  }
}
