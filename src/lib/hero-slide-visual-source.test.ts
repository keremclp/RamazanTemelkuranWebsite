import { describe, expect, it } from "vitest";
import {
  getHeroSlideCtaTypeForVisualSource,
  MAX_HERO_SLIDE_SELECTIONS,
  validateHeroSlideSelectionAvailability,
  validateHeroSlideSelections,
} from "@/lib/hero-slide-visual-source";

const ids = Array.from(
  { length: MAX_HERO_SLIDE_SELECTIONS + 1 },
  (_, index) => `00000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`
);

describe("hero slide visual-source selections", () => {
  it("accepts uploaded-image mode without dynamic selections", () => {
    expect(
      validateHeroSlideSelections({
        visualSource: "uploaded_image",
        bookIds: [ids[0]],
        eventIds: [ids[1]],
      })
    ).toEqual({
      success: true,
      visualSource: "uploaded_image",
      bookIds: [],
      eventIds: [],
    });
  });

  it("preserves the administrator's selected-book order", () => {
    expect(
      validateHeroSlideSelections({
        visualSource: "selected_books",
        bookIds: [ids[2], ids[0], ids[1]],
        eventIds: [],
      })
    ).toMatchObject({
      success: true,
      bookIds: [ids[2], ids[0], ids[1]],
      eventIds: [],
    });
  });

  it("rejects missing, excessive, duplicate, and malformed selections", () => {
    expect(
      validateHeroSlideSelections({
        visualSource: "selected_books",
        bookIds: [],
        eventIds: [],
      }).success
    ).toBe(false);

    expect(
      validateHeroSlideSelections({
        visualSource: "selected_events",
        bookIds: [],
        eventIds: ids,
      }).success
    ).toBe(false);

    expect(
      validateHeroSlideSelections({
        visualSource: "selected_books",
        bookIds: [ids[0], ids[0]],
        eventIds: [],
      }).success
    ).toBe(false);

    expect(
      validateHeroSlideSelections({
        visualSource: "selected_events",
        bookIds: [],
        eventIds: ["not-a-uuid"],
      }).success
    ).toBe(false);
  });

  it("rejects an unknown visual source", () => {
    expect(
      validateHeroSlideSelections({
        visualSource: "automatic_everything",
        bookIds: [],
        eventIds: [],
      }).success
    ).toBe(false);
  });

  it("allows Books or Shopier for book collections and enforces Gallery for events", () => {
    expect(getHeroSlideCtaTypeForVisualSource("selected_books", "contact")).toBe(
      "books"
    );
    expect(
      getHeroSlideCtaTypeForVisualSource("selected_books", "shopier")
    ).toBe("shopier");
    expect(
      getHeroSlideCtaTypeForVisualSource("selected_events", "external")
    ).toBe("gallery");
    expect(getHeroSlideCtaTypeForVisualSource("uploaded_image", "shopier")).toBe(
      "shopier"
    );
  });

  it("rejects draft books and deleted events", () => {
    const bookSelection = validateHeroSlideSelections({
      visualSource: "selected_books",
      bookIds: [ids[0], ids[1]],
      eventIds: [],
    });
    expect(bookSelection.success).toBe(true);
    if (bookSelection.success) {
      expect(
        validateHeroSlideSelectionAvailability(bookSelection, [ids[0]], [])
      ).toBe("Yalnızca yayındaki kitapları seçebilirsiniz.");
    }

    const eventSelection = validateHeroSlideSelections({
      visualSource: "selected_events",
      bookIds: [],
      eventIds: [ids[0], ids[1]],
    });
    expect(eventSelection.success).toBe(true);
    if (eventSelection.success) {
      expect(
        validateHeroSlideSelectionAvailability(eventSelection, [], [ids[0]])
      ).toBe("Seçilen etkinliklerden biri artık mevcut değil.");
    }
  });
});
