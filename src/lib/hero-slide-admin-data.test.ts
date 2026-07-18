import { describe, expect, it } from "vitest";
import { EVENT_MEDIA_RELATION_SELECT } from "@/lib/event-gallery";
import { HERO_SLIDE_ADMIN_EVENTS_SELECT } from "@/lib/hero-slide-admin-data";

describe("hero slide admin event query", () => {
  it("uses the event-media foreign key explicitly", () => {
    expect(EVENT_MEDIA_RELATION_SELECT).toContain(
      "media:media!media_event_id_fkey"
    );
    expect(HERO_SLIDE_ADMIN_EVENTS_SELECT).toContain(
      EVENT_MEDIA_RELATION_SELECT
    );
  });
});
