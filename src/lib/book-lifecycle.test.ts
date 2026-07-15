import { describe, expect, it } from "vitest";
import { buildStableBookUpdate } from "./book-lifecycle";

describe("buildStableBookUpdate", () => {
  it("preserves the public slug when a book title changes", () => {
    expect(
      buildStableBookUpdate("original-book-url", {
        title: "Completely New Title",
        is_published: true,
      })
    ).toEqual({
      title: "Completely New Title",
      is_published: true,
      slug: "original-book-url",
    });
  });
});
