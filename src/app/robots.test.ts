import { afterEach, describe, expect, it } from "vitest";
import robots from "./robots";

const originalVercelEnv = process.env.VERCEL_ENV;
const originalSearchIndexingEnabled = process.env.SEARCH_INDEXING_ENABLED;

afterEach(() => {
  process.env.VERCEL_ENV = originalVercelEnv;
  process.env.SEARCH_INDEXING_ENABLED = originalSearchIndexingEnabled;
});

describe("robots metadata route", () => {
  it("allows crawling public pages without advertising a sitemap while indexing is disabled", () => {
    process.env.VERCEL_ENV = "production";
    process.env.SEARCH_INDEXING_ENABLED = "false";

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    });
  });

  it("advertises the canonical sitemap only when production indexing is enabled", () => {
    process.env.VERCEL_ENV = "production";
    process.env.SEARCH_INDEXING_ENABLED = "true";

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      sitemap: "https://ramazantemelkuran.com/sitemap.xml",
      host: "https://ramazantemelkuran.com",
    });
  });
});
