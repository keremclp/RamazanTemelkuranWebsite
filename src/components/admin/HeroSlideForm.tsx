"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, ExternalLink, Save } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  HERO_SLIDE_CTA_DEFAULT_TEXT,
  HERO_SLIDE_CTA_LABELS,
  HERO_SLIDE_CTA_TYPES,
  inferLegacyCtaType,
} from "@/lib/hero-slide-cta";
import type {
  HeroSlide,
  HeroSlideCtaType,
} from "@/lib/types/database";
import type { HeroSlideFormState } from "@/app/(admin)/admin/slider/actions";

interface BookOption {
  id: string;
  title: string;
}

interface HeroSlideFormProps {
  action: (
    previousState: HeroSlideFormState,
    formData: FormData
  ) => Promise<HeroSlideFormState>;
  deleteImageAction?: (imageUrl: string) => Promise<HeroSlideFormState>;
  slide?: HeroSlide;
  books: BookOption[];
  hasShopierUrl: boolean;
}

const initialState: HeroSlideFormState = { message: "" };

const inputClassName =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function HeroSlideForm({
  action,
  deleteImageAction,
  slide,
  books,
  hasShopierUrl,
}: HeroSlideFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [imageUrl, setImageUrl] = useState(slide?.image_url ?? "");
  const initialCtaType =
    slide?.cta_type ?? inferLegacyCtaType(slide?.cta_link ?? null);
  const [ctaType, setCtaType] = useState<HeroSlideCtaType>(initialCtaType);
  const [ctaText, setCtaText] = useState(
    slide?.cta_text ?? HERO_SLIDE_CTA_DEFAULT_TEXT[initialCtaType]
  );

  function handleCtaTypeChange(nextType: HeroSlideCtaType) {
    const previousDefault = HERO_SLIDE_CTA_DEFAULT_TEXT[ctaType];
    setCtaType(nextType);

    if (!ctaText.trim() || ctaText === previousDefault) {
      setCtaText(HERO_SLIDE_CTA_DEFAULT_TEXT[nextType]);
    }
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="mb-5 text-lg font-bold text-primary">Slayt Bilgileri</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Başlık" htmlFor="title">
                <input
                  id="title"
                  name="title"
                  defaultValue={slide?.title ?? ""}
                  className={inputClassName}
                  placeholder="Yeni Kitap: Sessiz Fırtına"
                  disabled={pending}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Alt başlık" htmlFor="subtitle">
                <textarea
                  id="subtitle"
                  name="subtitle"
                  defaultValue={slide?.subtitle ?? ""}
                  className={`${inputClassName} min-h-32 resize-y`}
                  placeholder="Slayt açıklama metni"
                  disabled={pending}
                />
              </Field>
            </div>

            <div className="sm:col-span-2 rounded-xl border border-border bg-secondary/20 p-4">
              <h3 className="text-sm font-semibold text-primary">Buton ayarları</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Teknik bağlantı yazmanız gerekmez. Butonun açacağı yeri seçin;
                bağlantıyı site otomatik oluştursun.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Buton hedefi" htmlFor="cta_type">
                  <select
                    id="cta_type"
                    name="cta_type"
                    value={ctaType}
                    onChange={(event) =>
                      handleCtaTypeChange(event.target.value as HeroSlideCtaType)
                    }
                    className={inputClassName}
                    disabled={pending}
                  >
                    {HERO_SLIDE_CTA_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {HERO_SLIDE_CTA_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </Field>

                {ctaType !== "none" && (
                  <Field label="Buton metni" htmlFor="cta_text">
                    <input
                      id="cta_text"
                      name="cta_text"
                      value={ctaText}
                      onChange={(event) => setCtaText(event.target.value)}
                      className={inputClassName}
                      placeholder={HERO_SLIDE_CTA_DEFAULT_TEXT[ctaType]}
                      disabled={pending}
                    />
                  </Field>
                )}

                {ctaType === "book" && (
                  <div className="sm:col-span-2">
                    <Field label="Açılacak kitap" htmlFor="cta_book_id">
                      <select
                        id="cta_book_id"
                        name="cta_book_id"
                        defaultValue={slide?.cta_book_id ?? ""}
                        className={inputClassName}
                        required
                        disabled={pending || books.length === 0}
                      >
                        <option value="">Kitap seçin</option>
                        {books.map((book) => (
                          <option key={book.id} value={book.id}>
                            {book.title}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {books.length === 0 && (
                      <p className="mt-2 text-xs text-danger">
                        Bu hedefi kullanmak için önce en az bir kitap ekleyin.
                      </p>
                    )}
                  </div>
                )}

                {ctaType === "external" && (
                  <div className="sm:col-span-2">
                    <Field label="Web sitesi adresi" htmlFor="cta_external_url">
                      <div className="relative">
                        <ExternalLink
                          size={16}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                        />
                        <input
                          id="cta_external_url"
                          name="cta_external_url"
                          type="url"
                          defaultValue={
                            slide?.cta_external_url ??
                            (initialCtaType === "external"
                              ? slide?.cta_link ?? ""
                              : "")
                          }
                          className={`${inputClassName} pl-11`}
                          placeholder="https://ornek.com"
                          required
                          disabled={pending}
                        />
                      </div>
                    </Field>
                  </div>
                )}

                {ctaType === "shopier" && !hasShopierUrl && (
                  <div
                    role="status"
                    className="sm:col-span-2 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger"
                  >
                    Shopier adresi henüz Ayarlar bölümünde tanımlanmamış.
                    Buton, adres eklenene kadar ana sayfada gösterilmez.
                  </div>
                )}
              </div>
            </div>

            <Field label="Görüntülenme sırası" htmlFor="display_order">
              <input
                id="display_order"
                name="display_order"
                type="number"
                min="0"
                defaultValue={slide?.display_order ?? 0}
                className={inputClassName}
                disabled={pending}
              />
            </Field>

            <div className="flex items-end">
              <label className="flex w-full items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-3 text-sm text-primary">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={slide?.is_active ?? true}
                  className="mt-1 h-4 w-4 rounded border-border accent-[var(--color-accent)]"
                  disabled={pending}
                />
                <span>
                  <span className="font-medium">Aktif olarak göster</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    Pasif slaytlar ana sayfada görünmez.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-lg font-bold text-primary">Slider Görseli</h2>
            <ImageUploader
              currentImageUrl={imageUrl}
              committedImageUrl={state.committedImageUrl}
              onImageUploaded={setImageUrl}
              onImageRemoved={() => setImageUrl("")}
              onPersistedImageRemoved={deleteImageAction}
              folder="slider"
              aspectRatio="aspect-video"
            />
            <input type="hidden" name="image_url" value={imageUrl} />
            <p className="mt-3 text-xs text-muted">
              Görsel eklenmezse slider koyu arka plan efektiyle gösterilir.
            </p>
          </section>
        </aside>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/slider"
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
          {pending
            ? "Kaydediliyor..."
            : slide
              ? "Değişiklikleri Kaydet"
              : "Slaytı Kaydet"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-primary">
        {label}
      </label>
      {children}
    </div>
  );
}
