import { describe, expect, it } from "vitest";
import { extractYouTubeId, slugify } from "./helpers";

describe("slugify", () => {
  it("normalizes Turkish characters and punctuation", () => {
    expect(slugify("Şırnak'ta Çığ Öyküsü")).toBe("sirnak-ta-cig-oykusu");
  });
});

describe("extractYouTubeId", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  ])("extracts supported URL %s", (url) => {
    expect(extractYouTubeId(url)).toBe("dQw4w9WgXcQ");
  });

  it("rejects unrelated URLs", () => {
    expect(extractYouTubeId("https://example.com/video")).toBeNull();
  });
});
