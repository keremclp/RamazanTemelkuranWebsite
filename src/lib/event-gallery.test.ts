import { describe, expect, it } from "vitest";
import type { Media } from "@/lib/types/database";
import {
  getEventCoverImageUrl,
  getEventCoverMedia,
} from "@/lib/event-gallery";

function media(overrides: Partial<Media> & Pick<Media, "id" | "type">): Media {
  return {
    event_id: "event-1",
    url:
      overrides.type === "video"
        ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        : `https://example.com/${overrides.id}.jpg`,
    thumbnail_url: null,
    caption: null,
    display_order: 0,
    created_at: "2026-07-18T00:00:00.000Z",
    ...overrides,
  };
}

describe("getEventCoverMedia", () => {
  it("uses the explicitly selected photo before display order", () => {
    const first = media({ id: "first", type: "photo", display_order: 0 });
    const selected = media({ id: "selected", type: "photo", display_order: 8 });

    expect(
      getEventCoverMedia({
        homepage_media_id: selected.id,
        media: [selected, first],
      })
    ).toBe(selected);
  });

  it("ignores an invalid selected video and falls back to the first photo", () => {
    const video = media({ id: "video", type: "video", display_order: 0 });
    const photo = media({ id: "photo", type: "photo", display_order: 4 });

    expect(
      getEventCoverMedia({
        homepage_media_id: video.id,
        media: [photo, video],
      })
    ).toBe(photo);
  });

  it("uses the first photo by display order when no selected cover exists", () => {
    const later = media({ id: "later", type: "photo", display_order: 9 });
    const earlier = media({ id: "earlier", type: "photo", display_order: 2 });

    expect(
      getEventCoverMedia({ homepage_media_id: null, media: [later, earlier] })
    ).toBe(earlier);
  });

  it("uses the first valid video thumbnail when an event has no photos", () => {
    const invalid = media({
      id: "invalid",
      type: "video",
      url: "https://example.com/not-youtube",
      display_order: 0,
    });
    const valid = media({ id: "valid", type: "video", display_order: 1 });

    expect(
      getEventCoverMedia({ homepage_media_id: null, media: [valid, invalid] })
    ).toBe(valid);
    expect(getEventCoverImageUrl(valid)).toContain("img.youtube.com");
  });

  it("returns null when no usable cover source exists", () => {
    const invalid = media({
      id: "invalid",
      type: "video",
      url: "https://example.com/not-youtube",
    });

    expect(
      getEventCoverMedia({ homepage_media_id: null, media: [invalid] })
    ).toBeNull();
    expect(getEventCoverImageUrl(null)).toBeNull();
  });
});
