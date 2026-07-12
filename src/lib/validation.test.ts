import { describe, expect, it } from "vitest";
import { isHttpUrl, validateImageUpload } from "./validation";

describe("isHttpUrl", () => {
  it("accepts HTTP and HTTPS only", () => {
    expect(isHttpUrl("https://shopier.com/example")).toBe(true);
    expect(isHttpUrl("http://example.com")).toBe(true);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("mailto:test@example.com")).toBe(false);
  });
});

describe("validateImageUpload", () => {
  it("accepts supported images under 5 MB", () => {
    expect(validateImageUpload({ type: "image/webp", size: 1024 })).toBeNull();
  });

  it("rejects unsupported types and oversized files", () => {
    expect(validateImageUpload({ type: "image/svg+xml", size: 1024 })).toBeTruthy();
    expect(validateImageUpload({ type: "image/jpeg", size: 6 * 1024 * 1024 })).toBeTruthy();
  });
});
