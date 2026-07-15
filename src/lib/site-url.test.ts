import { afterEach, describe, expect, it } from "vitest";
import { absoluteUrl, getSiteUrl, shouldAllowSearchIndexing } from "./site-url";

const originalSiteUrl = process.env.SITE_URL;
const originalVercelEnv = process.env.VERCEL_ENV;

afterEach(() => {
  process.env.SITE_URL = originalSiteUrl;
  process.env.VERCEL_ENV = originalVercelEnv;
});

describe("site URL", () => {
  it("defaults to the final canonical domain", () => {
    delete process.env.SITE_URL;
    expect(getSiteUrl()).toBe("https://ramazantemelkuran.com");
    expect(absoluteUrl("/books/example")).toBe(
      "https://ramazantemelkuran.com/books/example"
    );
  });

  it("normalizes a configured deployment URL", () => {
    process.env.SITE_URL = "https://www.ramazantemelkuran.com/ignored/path/";
    expect(getSiteUrl()).toBe("https://www.ramazantemelkuran.com");
  });
});

describe("search indexing guard", () => {
  it("blocks Vercel preview deployments and allows production", () => {
    process.env.VERCEL_ENV = "preview";
    expect(shouldAllowSearchIndexing()).toBe(false);
    process.env.VERCEL_ENV = "production";
    expect(shouldAllowSearchIndexing()).toBe(true);
  });
});
