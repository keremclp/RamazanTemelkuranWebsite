import { afterEach, describe, expect, it } from "vitest";
import { absoluteUrl, getSiteUrl, shouldAllowSearchIndexing } from "./site-url";

const originalSiteUrl = process.env.SITE_URL;
const originalVercelEnv = process.env.VERCEL_ENV;
const originalSearchIndexingEnabled = process.env.SEARCH_INDEXING_ENABLED;

afterEach(() => {
  process.env.SITE_URL = originalSiteUrl;
  process.env.VERCEL_ENV = originalVercelEnv;
  process.env.SEARCH_INDEXING_ENABLED = originalSearchIndexingEnabled;
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
  it("blocks local and Vercel preview deployments", () => {
    delete process.env.VERCEL_ENV;
    process.env.SEARCH_INDEXING_ENABLED = "true";
    expect(shouldAllowSearchIndexing()).toBe(false);

    process.env.VERCEL_ENV = "preview";
    process.env.SEARCH_INDEXING_ENABLED = "true";
    expect(shouldAllowSearchIndexing()).toBe(false);
  });

  it("blocks production unless indexing is explicitly enabled", () => {
    process.env.VERCEL_ENV = "production";
    delete process.env.SEARCH_INDEXING_ENABLED;
    expect(shouldAllowSearchIndexing()).toBe(false);

    process.env.SEARCH_INDEXING_ENABLED = "false";
    expect(shouldAllowSearchIndexing()).toBe(false);

    process.env.SEARCH_INDEXING_ENABLED = "TRUE";
    expect(shouldAllowSearchIndexing()).toBe(false);
  });

  it("allows indexing only when production is explicitly enabled", () => {
    process.env.VERCEL_ENV = "production";
    process.env.SEARCH_INDEXING_ENABLED = "true";
    expect(shouldAllowSearchIndexing()).toBe(true);
  });
});
