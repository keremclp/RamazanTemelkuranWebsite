import { describe, expect, it } from "vitest";
import { metaDescription, serializeJsonLd } from "./seo";

describe("SEO helpers", () => {
  it("normalizes and caps descriptions at 160 characters", () => {
    const description = metaDescription(`  ${"word ".repeat(50)}  `, "fallback");
    expect(description.length).toBeLessThanOrEqual(160);
    expect(description).not.toContain("  ");
  });

  it("escapes less-than characters in JSON-LD", () => {
    expect(serializeJsonLd({ value: "</script>" })).toContain("\\u003c/script>");
  });
});
