import { describe, expect, it } from "vitest";
import { wrapCarouselIndex } from "./carousel";

describe("wrapCarouselIndex", () => {
  it("wraps forward and backward within the available slides", () => {
    expect(wrapCarouselIndex(3, 3)).toBe(0);
    expect(wrapCarouselIndex(-1, 3)).toBe(2);
    expect(wrapCarouselIndex(4, 3)).toBe(1);
  });

  it("returns zero for an empty carousel", () => {
    expect(wrapCarouselIndex(4, 0)).toBe(0);
  });
});
