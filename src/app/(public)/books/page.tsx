import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/types/database";
import BookSlider from "@/components/public/BookSlider";
import JsonLd from "@/components/public/JsonLd";
import PageIntro from "@/components/public/PageIntro";
import { getSiteSettings } from "@/lib/site-settings";
import { createPageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";
import { truncate } from "@/lib/utils/helpers";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return createPageMetadata({
    title: "Kitaplar",
    description: `${settings.site_title} tarafından kaleme alınan kitapları inceleyin.`,
    path: "/books",
  });
}

export default async function BooksPage() {
  const supabase = await createClient();

  const [{ data: books }, settings] = await Promise.all([
    supabase
      .from("books")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true }),
    getSiteSettings(),
  ]);

  const allBooks: Book[] = books || [];
  const carouselBooks = allBooks.map((book) => ({
    ...book,
    description: truncate(book.description, 360),
  }));

  return (
    <section className="py-6 sm:py-10 lg:py-12">
      {allBooks.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${settings.site_title} kitapları`,
            numberOfItems: allBooks.length,
            itemListOrder: "https://schema.org/ItemListOrderAscending",
            itemListElement: allBooks.map((book, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Book",
                name: book.title,
                url: absoluteUrl(`/books/${book.slug}`),
                description: book.description || undefined,
                image: book.cover_image_url || undefined,
                isbn: book.isbn || undefined,
                author: {
                  "@type": "Person",
                  name: settings.site_title,
                  url: absoluteUrl("/about"),
                },
              },
            })),
          }}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageIntro
          title="Kitaplar"
          description={`${settings.site_title}'ın kaleme aldığı tüm eserleri keşfedin.`}
        />

        <BookSlider books={carouselBooks} />
      </div>
    </section>
  );
}
