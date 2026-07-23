import { describe, expect, it } from "vitest";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "./proxy";

describe("admin proxy matcher", () => {
  it.each(["/admin", "/admin/login", "/admin/books/example"])(
    "runs for %s",
    (url) => {
      expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(
        true
      );
    }
  );

  it.each(["/", "/books", "/gallery", "/api/contact"])(
    "does not run for %s",
    (url) => {
      expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(
        false
      );
    }
  );
});
