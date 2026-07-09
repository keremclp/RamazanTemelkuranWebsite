import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
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
    description:
      book.description?.slice(0, 160) ||
      `${book.title} - Ramazan Temelkuran`,
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

  const { data: relatedData } = await supabase
    .from("books")
    .select("*")
    .neq("id", typedBook.id)
    .order("display_order", { ascending: true })
    .limit(3);

  const relatedBooks = (relatedData as Book[] | null) ?? [];

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/books"
          className="group mb-8 inline-flex items-center gap-2 text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Tüm Kitaplar</span>
        </Link>

        <div className="grid grid-cols-1 gap-12 animate-fade-in-up lg:grid-cols-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-card-hover)]">
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
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/30 to-primary/20">
                <BookOpen className="h-24 w-24 text-accent/50" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="mb-6 text-3xl font-bold text-primary md:text-4xl font-[family-name:var(--font-heading)]">
              {typedBook.title}
            </h1>

            {typedBook.description && (
              <div className="mb-8 space-y-4 leading-relaxed text-primary/80">
                {typedBook.description.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            <div className="mb-8 space-y-3 border-t border-border pt-6">
              {typedBook.publisher && (
                <BookInfoRow label="Yayınevi" value={typedBook.publisher} />
              )}
              {typedBook.publication_year && (
                <BookInfoRow
                  label="Yayın Yılı"
                  value={String(typedBook.publication_year)}
                />
              )}
              {typedBook.page_count && (
                <BookInfoRow
                  label="Sayfa Sayısı"
                  value={String(typedBook.page_count)}
                />
              )}
              {typedBook.isbn && (
                <BookInfoRow label="ISBN" value={typedBook.isbn} isMono />
              )}
            </div>

            {typedBook.shopier_url && (
              <a
                href={typedBook.shopier_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-[var(--radius-md)] bg-accent px-8 py-4 text-lg font-semibold text-white shadow-md transition-all duration-[var(--transition-base)] hover:bg-accent-dark hover:shadow-lg sm:w-auto"
              >
                <BookOpen className="h-5 w-5" />
                Shopier&apos;den Satın Al
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {relatedBooks.length > 0 && (
          <div className="mt-24">
            <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold text-primary font-[family-name:var(--font-heading)]">
              <span className="h-0.5 w-8 bg-accent" />
              Diğer Kitaplar
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {relatedBooks.map((related) => (
                <Link
                  key={related.id}
                  href={`/books/${related.slug}`}
                  className="group overflow-hidden rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-accent/20 to-primary/10">
                    {related.cover_image_url ? (
                      <Image
                        src={related.cover_image_url}
                        alt={related.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-accent/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-primary transition-colors group-hover:text-accent font-[family-name:var(--font-heading)]">
                      {related.title}
                    </h3>
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

function BookInfoRow({
  label,
  value,
  isMono,
}: {
  label: string;
  value: string;
  isMono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium text-muted">{label}</span>
      <span className={isMono ? "font-mono text-xs text-primary" : "text-primary"}>
        {value}
      </span>
    </div>
  );
}
