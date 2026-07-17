import { describe, expect, it } from "vitest";
import {
  normalizeHeroSlideCtaType,
  resolveHeroSlideCtaHref,
} from "./hero-slide-cta";

const base = {
  cta_link: null,
  cta_external_url: null,
};

describe("resolveHeroSlideCtaHref", () => {
  it("resolves configured targets", () => {
    expect(resolveHeroSlideCtaHref({ ...base, cta_type: "gallery" }, { shopier_main_url: "" })).toBe("/gallery");
    expect(resolveHeroSlideCtaHref({ ...base, cta_type: "books" }, { shopier_main_url: "" })).toBe("/books");
    expect(resolveHeroSlideCtaHref({ ...base, cta_type: "shopier" }, { shopier_main_url: "https://shopier.com/store" })).toBe("https://shopier.com/store");
    expect(resolveHeroSlideCtaHref({ ...base, cta_type: "external", cta_external_url: "https://example.com" }, { shopier_main_url: "" })).toBe("https://example.com");
  });

  it("returns null for unavailable targets", () => {
    expect(resolveHeroSlideCtaHref({ ...base, cta_type: "none" }, { shopier_main_url: "" })).toBeNull();
  });

  it("routes legacy book targets to the books listing", () => {
    expect(resolveHeroSlideCtaHref({ ...base, cta_type: "book" }, { shopier_main_url: "" })).toBe("/books");
    expect(normalizeHeroSlideCtaType("book", null)).toBe("books");
    expect(normalizeHeroSlideCtaType(undefined, "/books/legacy-book")).toBe("books");
  });
});
