import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl, shouldAllowSearchIndexing } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  if (!shouldAllowSearchIndexing()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
