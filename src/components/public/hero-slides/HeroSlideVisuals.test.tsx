import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BookCollectionSlideVisual from "@/components/public/hero-slides/BookCollectionSlideVisual";
import EventCollectionSlideVisual from "@/components/public/hero-slides/EventCollectionSlideVisual";
import ShopierBookSlideVisual from "@/components/public/hero-slides/ShopierBookSlideVisual";
import UploadedImageSlideVisual from "@/components/public/hero-slides/UploadedImageSlideVisual";
import type { ResolvedHeroSlide } from "@/lib/types/database";

const baseSlide: ResolvedHeroSlide = {
  id: "00000000-0000-0000-0000-000000000001",
  image_url: "/icon.svg",
  title: "Öne çıkan içerik",
  subtitle: "Kısa tanıtım metni",
  cta_text: "Keşfet",
  cta_link: null,
  cta_type: "books",
  cta_external_url: null,
  cta_href: "/books",
  visual_source: "uploaded_image",
  display_order: 0,
  is_active: true,
  created_at: "2026-07-19T00:00:00.000Z",
  selected_books: [],
  selected_events: [],
};

describe("homepage hero slide visuals", () => {
  it("keeps the existing uploaded-image presentation", () => {
    const html = renderToStaticMarkup(
      <UploadedImageSlideVisual slide={baseSlide} priority />
    );

    expect(html).toContain("Öne çıkan içerik");
    expect(html).toContain('href="/books"');
    expect(html).toContain("/icon.svg");
  });

  it("renders up to six ordered book covers and marks later covers desktop-only", () => {
    const slide: ResolvedHeroSlide = {
      ...baseSlide,
      visual_source: "selected_books",
      selected_books: Array.from({ length: 6 }, (_, index) => ({
        id: `book-${index + 1}`,
        title: `Kitap ${index + 1}`,
        cover_image_url: "/icon.svg",
      })),
    };
    const html = renderToStaticMarkup(
      <BookCollectionSlideVisual slide={slide} priority />
    );

    expect(html).toContain("Kitap 1 kitap kapağı");
    expect(html).toContain("Kitap 6 kitap kapağı");
    expect(html).toContain("hidden lg:block");
    expect(html).toContain("max-w-[1600px]");
    expect(html).toContain("lg:w-[clamp(8.5rem,11vw,12.5rem)]");
  });

  it("skips missing event covers and falls back safely when none remain", () => {
    const mixedSlide: ResolvedHeroSlide = {
      ...baseSlide,
      cta_type: "gallery",
      cta_href: "/gallery",
      visual_source: "selected_events",
      selected_events: [
        { id: "event-1", title: "Kapaksız", cover_image_url: null },
        { id: "event-2", title: "Fotoğraflı", cover_image_url: "/icon.svg" },
      ],
    };
    const mixedHtml = renderToStaticMarkup(
      <EventCollectionSlideVisual slide={mixedSlide} priority />
    );
    expect(mixedHtml).not.toContain("Kapaksız etkinlik görseli");
    expect(mixedHtml).toContain("Fotoğraflı etkinlik görseli");
    expect(mixedHtml).toContain("max-w-[1760px]");
    expect(mixedHtml).toContain("lg:aspect-square");
    expect(mixedHtml).toContain("lg:w-[clamp(12rem,17vw,20rem)]");

    const fallbackHtml = renderToStaticMarkup(
      <EventCollectionSlideVisual
        slide={{
          ...mixedSlide,
          selected_events: [
            { id: "event-1", title: "Kapaksız", cover_image_url: null },
          ],
        }}
        priority
      />
    );
    expect(fallbackHtml).toContain("Öne çıkan içerik");
    expect(fallbackHtml).toContain("/icon.svg");
  });

  it("renders a purchase-focused Shopier showcase from real book covers", () => {
    const slide: ResolvedHeroSlide = {
      ...baseSlide,
      cta_type: "shopier",
      cta_href: "https://www.shopier.com/example",
      visual_source: "selected_books",
      selected_books: Array.from({ length: 4 }, (_, index) => ({
        id: `shopier-book-${index + 1}`,
        title: `Shopier Kitabı ${index + 1}`,
        cover_image_url: "/icon.svg",
      })),
    };

    const html = renderToStaticMarkup(
      <ShopierBookSlideVisual slide={slide} priority />
    );

    expect(html).toContain("Shopier kitap mağazası");
    expect(html).toContain("Shopier Kitap Mağazası");
    expect(html).toContain("Güvenli Sipariş");
    expect(html).toContain("Shopier mağazasına git");
    expect(html).toContain("Shopier Kitabı 4 kitap kapağı");
  });
});
