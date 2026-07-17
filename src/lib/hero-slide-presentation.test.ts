import { describe, expect, it } from "vitest";
import {
  canShowBookPresentation,
  isHeroSlidePresentationType,
} from "./hero-slide-presentation";

describe("hero slide presentation", () => {
  it("accepts only supported presentation types", () => {
    expect(isHeroSlidePresentationType("image")).toBe(true);
    expect(isHeroSlidePresentationType("book")).toBe(true);
    expect(isHeroSlidePresentationType("event")).toBe(false);
  });

  it("hides book showcases when the selected book is unavailable", () => {
    expect(canShowBookPresentation("book", null)).toBe(false);
    expect(
      canShowBookPresentation("book", {
        id: "book-id",
        title: "Book",
        slug: "book",
        description: "Description",
        cover_image_url: null,
        is_published: false,
      })
    ).toBe(false);
    expect(canShowBookPresentation("image", null)).toBe(true);
  });
});
