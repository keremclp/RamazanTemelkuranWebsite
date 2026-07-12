import { describe, expect, it } from "vitest";
import { resolveHeroSlideCtaHref } from "./hero-slide-cta";

const base = {
  cta_link: null,
  cta_external_url: null,
  cta_book: null,
};

describe("resolveHeroSlideCtaHref", () => {
  it("resolves configured targets", () => {
    expect(resolveHeroSlideCtaHref({ ...base, cta_type: "gallery" }, { shopier_main_url: "" })).toBe("/gallery");
    expect(resolveHeroSlideCtaHref({ ...base, cta_type: "book", cta_book: { slug: "my-book" } }, { shopier_main_url: "" })).toBe("/books/my-book");
    expect(resolveHeroSlideCtaHref({ ...base, cta_type: "shopier" }, { shopier_main_url: "https://shopier.com/store" })).toBe("https://shopier.com/store");
    expect(resolveHeroSlideCtaHref({ ...base, cta_type: "external", cta_external_url: "https://example.com" }, { shopier_main_url: "" })).toBe("https://example.com");
  });

  it("returns null for unavailable targets", () => {
    expect(resolveHeroSlideCtaHref({ ...base, cta_type: "book" }, { shopier_main_url: "" })).toBeNull();
    expect(resolveHeroSlideCtaHref({ ...base, cta_type: "none" }, { shopier_main_url: "" })).toBeNull();
  });
});
