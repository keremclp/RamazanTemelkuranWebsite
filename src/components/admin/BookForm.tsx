"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, Save } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { BOOK_CATEGORIES } from "@/lib/utils/constants";
import { slugify } from "@/lib/utils/helpers";
import type { Book } from "@/lib/types/database";
import type { BookFormState } from "@/app/(admin)/admin/books/actions";

interface BookFormProps {
  action: (
    previousState: BookFormState,
    formData: FormData
  ) => Promise<BookFormState>;
  book?: Book;
}

const initialState: BookFormState = { message: "" };

const inputClassName =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function BookForm({ action, book }: BookFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [title, setTitle] = useState(book?.title ?? "");
  const [slug, setSlug] = useState(book?.slug ?? "");
  const [slugWasEdited, setSlugWasEdited] = useState(Boolean(book));
  const [coverImageUrl, setCoverImageUrl] = useState(
    book?.cover_image_url ?? ""
  );

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugWasEdited) setSlug(slugify(value));
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger"
        >
          <AlertCircle size={18} className="shrink-0" />
          {state.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
            <h2 className="mb-5 text-lg font-bold text-primary">Kitap Bilgileri</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Kitap adı" htmlFor="title" required>
                <input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  className={inputClassName}
                  required
                  disabled={pending}
                />
              </Field>

              <Field label="URL kısa adı" htmlFor="slug" required>
                <input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugWasEdited(true);
                    setSlug(slugify(event.target.value));
                  }}
                  className={inputClassName}
                  placeholder="kitap-adi"
                  required
                  disabled={pending}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Açıklama" htmlFor="description" required>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={book?.description ?? ""}
                    className={`${inputClassName} min-h-40 resize-y`}
                    required
                    disabled={pending}
                  />
                </Field>
              </div>

              <Field label="Kategori" htmlFor="category">
                <select
                  id="category"
                  name="category"
                  defaultValue={book?.category ?? ""}
                  className={inputClassName}
                  disabled={pending}
                >
                  <option value="">Kategori seçin</option>
                  {BOOK_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Yayınevi" htmlFor="publisher">
                <input
                  id="publisher"
                  name="publisher"
                  defaultValue={book?.publisher ?? ""}
                  className={inputClassName}
                  disabled={pending}
                />
              </Field>

              <Field label="Yayın yılı" htmlFor="publication_year">
                <input
                  id="publication_year"
                  name="publication_year"
                  type="number"
                  min="1000"
                  max={new Date().getFullYear() + 1}
                  defaultValue={book?.publication_year ?? ""}
                  className={inputClassName}
                  disabled={pending}
                />
              </Field>

              <Field label="Sayfa sayısı" htmlFor="page_count">
                <input
                  id="page_count"
                  name="page_count"
                  type="number"
                  min="1"
                  defaultValue={book?.page_count ?? ""}
                  className={inputClassName}
                  disabled={pending}
                />
              </Field>

              <Field label="ISBN" htmlFor="isbn">
                <input
                  id="isbn"
                  name="isbn"
                  defaultValue={book?.isbn ?? ""}
                  className={inputClassName}
                  disabled={pending}
                />
              </Field>

              <Field label="Görüntülenme sırası" htmlFor="display_order">
                <input
                  id="display_order"
                  name="display_order"
                  type="number"
                  min="0"
                  defaultValue={book?.display_order ?? 0}
                  className={inputClassName}
                  disabled={pending}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Shopier bağlantısı" htmlFor="shopier_url">
                  <input
                    id="shopier_url"
                    name="shopier_url"
                    type="url"
                    defaultValue={book?.shopier_url ?? ""}
                    className={inputClassName}
                    placeholder="https://www.shopier.com/..."
                    disabled={pending}
                  />
                </Field>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-lg font-bold text-primary">Kapak Görseli</h2>
            <ImageUploader
              currentImageUrl={coverImageUrl}
              onImageUploaded={setCoverImageUrl}
              onImageRemoved={() => setCoverImageUrl("")}
              folder="books"
            />
            <input
              type="hidden"
              name="cover_image_url"
              value={coverImageUrl}
            />
          </section>
        </aside>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/books"
          className="rounded-xl border border-border px-5 py-3 text-center text-sm font-medium text-muted no-underline transition hover:border-primary/20 hover:text-primary"
        >
          Vazgeç
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Save size={18} />
          )}
          {pending ? "Kaydediliyor..." : book ? "Değişiklikleri Kaydet" : "Kitabı Kaydet"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-primary">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}
