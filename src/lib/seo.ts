import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";

export function plainText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function metaDescription(value: string, fallback: string) {
  const normalized = plainText(value || fallback);
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 157).trimEnd()}…`;
}

export function createPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article" | "book" | "profile";
  absoluteTitle?: boolean;
}): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = image ? absoluteUrl(image) : absoluteUrl("/opengraph-image");

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
