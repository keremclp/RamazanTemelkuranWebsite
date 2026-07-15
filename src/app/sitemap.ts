import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: books } = await supabase
    .from("books")
    .select("slug, updated_at, cover_image_url")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/books"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/gallery"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
  ];

  const bookPages: MetadataRoute.Sitemap = (books ?? []).map((book) => ({
    url: absoluteUrl(`/books/${book.slug}`),
    lastModified: book.updated_at,
    changeFrequency: "monthly",
    priority: 0.8,
    images: book.cover_image_url ? [book.cover_image_url] : undefined,
  }));

  return [...staticPages, ...bookPages];
}
