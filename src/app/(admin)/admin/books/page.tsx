import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Edit3, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/types/database";
import DeleteBookButton from "@/components/admin/DeleteBookButton";

export const metadata: Metadata = {
  title: "Kitaplar",
};

const statusMessages: Record<string, string> = {
  created: "Kitap başarıyla eklendi.",
  updated: "Kitap başarıyla güncellendi.",
};

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  const books = (data as Book[] | null) ?? [];
  const statusMessage = status ? statusMessages[status] : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">
            Kitaplar
          </h1>
          <p className="mt-1 text-muted">
            Yayındaki kitapları ekleyin, düzenleyin ve sıralayın.
          </p>
        </div>
        <Link
          href="/admin/books/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white no-underline transition hover:bg-accent-dark"
        >
          <Plus size={18} />
          Yeni Kitap
        </Link>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {statusMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          Kitaplar yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.
        </div>
      )}

      {!error && books.length === 0 ? (
        <div className="rounded-2xl bg-surface px-6 py-16 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <BookOpen size={26} />
          </div>
          <h2 className="text-xl font-bold text-primary">Henüz kitap yok</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            İlk kitabınızı ekleyerek kitap kataloğunu oluşturmaya başlayın.
          </p>
          <Link
            href="/admin/books/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white no-underline hover:bg-accent-dark"
          >
            <Plus size={17} />
            İlk Kitabı Ekle
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {books.map((book) => (
            <article
              key={book.id}
              className="flex flex-col gap-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center"
            >
              <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-primary/5">
                {book.cover_image_url ? (
                  <Image
                    src={book.cover_image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted/40">
                    <BookOpen size={28} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold text-primary">
                    {book.title}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      book.is_published
                        ? "bg-success/10 text-success"
                        : "bg-secondary text-muted"
                    }`}
                  >
                    {book.is_published ? "Yayında" : "Taslak"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {book.publisher || "Yayınevi belirtilmedi"}
                  {book.publication_year ? ` · ${book.publication_year}` : ""}
                  {book.page_count ? ` · ${book.page_count} sayfa` : ""}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-primary/70">
                  {book.description}
                </p>
                <p className="mt-2 text-xs text-muted">
                  Sıra: {book.display_order} · /books/{book.slug}
                </p>
              </div>

              <div className="flex shrink-0 items-center justify-end gap-1 border-t border-border/60 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                <Link
                  href={`/admin/books/${book.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted no-underline transition hover:bg-accent/10 hover:text-accent-dark"
                >
                  <Edit3 size={15} />
                  Düzenle
                </Link>
                <DeleteBookButton id={book.id} title={book.title} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
