import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ExternalLink, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/types/database";

interface BookDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BookDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select("title, description")
    .eq("slug", slug)
    .single();

  if (!book) {
    return { title: "Kitap Bulunamadı" };
  }

  return {
    title: book.title,
    description: book.description?.slice(0, 160) || `${book.title} — Ramazan Temelkuran`,
  };
}

export default async function BookDetailPage({
  params,
}: BookDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!book) {
    notFound();
  }

  const typedBook = book as Book;

  // Fetch related books (same category, excluding current, max 3)
  let relatedBooks: Book[] = [];
  if (typedBook.category) {
    const { data } = await supabase
      .from("books")
      .select("*")
      .eq("category", typedBook.category)
      .neq("id", typedBook.id)
      .order("display_order", { ascending: true })
      .limit(3);

    relatedBooks = (data as Book[]) || [];
  }

  return (
    <section className="section-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Tüm Kitaplar</span>
        </Link>

        {/* Book Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in-up">
          {/* Cover Image */}
          <div className="relative aspect-[3/4] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-card-hover)]">
            {typedBook.cover_image_url ? (
              <Image
                src={typedBook.cover_image_url}
                alt={typedBook.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-primary/20 flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-accent/50" />
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex flex-col justify-center">
            {/* Category Badge */}
            {typedBook.category && (
              <span className="inline-block bg-accent/10 text-accent text-sm font-semibold px-4 py-1.5 rounded-full mb-4 w-fit">
                {typedBook.category}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] text-primary mb-6">
              {typedBook.title}
            </h1>

            {/* Description */}
            {typedBook.description && (
              <div className="text-primary/80 leading-relaxed mb-8 space-y-4">
                {typedBook.description.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {/* Book Details Table */}
            <div className="border-t border-border pt-6 mb-8 space-y-3">
              {typedBook.publisher && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted font-medium">Yayınevi</span>
                  <span className="text-primary">{typedBook.publisher}</span>
                </div>
              )}
              {typedBook.publication_year && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted font-medium">Yayın Yılı</span>
                  <span className="text-primary">{typedBook.publication_year}</span>
                </div>
              )}
              {typedBook.page_count && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted font-medium">Sayfa Sayısı</span>
                  <span className="text-primary">{typedBook.page_count}</span>
                </div>
              )}
              {typedBook.isbn && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted font-medium">ISBN</span>
                  <span className="text-primary font-mono text-xs">{typedBook.isbn}</span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            {typedBook.shopier_url && (
              <a
                href={typedBook.shopier_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-[var(--radius-md)] bg-accent text-white text-lg font-semibold hover:bg-accent-dark transition-all duration-[var(--transition-base)] shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                <BookOpen className="w-5 h-5" />
                Shopier&apos;den Satın Al
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-primary mb-8 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-accent"></span>
              Benzer Kitaplar
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBooks.map((related) => (
                <Link
                  key={related.id}
                  href={`/books/${related.slug}`}
                  className="group bg-surface rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-accent/20 to-primary/10">
                    {related.cover_image_url ? (
                      <Image
                        src={related.cover_image_url}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-accent/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold font-[family-name:var(--font-heading)] text-primary group-hover:text-accent transition-colors">
                      {related.title}
                    </h3>
                    {related.category && (
                      <span className="text-xs text-muted mt-1 block">
                        {related.category}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
