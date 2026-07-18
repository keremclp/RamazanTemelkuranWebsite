"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ExternalLink,
  ImageIcon,
  Images,
  Save,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import ResilientImage from "@/components/public/ResilientImage";
import {
  HERO_SLIDE_CTA_DEFAULT_TEXT,
  HERO_SLIDE_CTA_LABELS,
  HERO_SLIDE_CTA_TYPES,
  normalizeHeroSlideCtaType,
} from "@/lib/hero-slide-cta";
import {
  MAX_HERO_SLIDE_SELECTIONS,
  normalizeHeroSlideVisualSource,
} from "@/lib/hero-slide-visual-source";
import type {
  HeroSlide,
  HeroSlideBookOption,
  HeroSlideCtaType,
  HeroSlideEventOption,
  HeroSlideVisualSource,
} from "@/lib/types/database";
import type { HeroSlideFormState } from "@/app/(admin)/admin/slider/actions";

interface HeroSlideFormProps {
  action: (
    previousState: HeroSlideFormState,
    formData: FormData
  ) => Promise<HeroSlideFormState>;
  deleteImageAction?: (imageUrl: string) => Promise<HeroSlideFormState>;
  slide?: HeroSlide;
  hasShopierUrl: boolean;
  books: HeroSlideBookOption[];
  events: HeroSlideEventOption[];
  booksLoadFailed?: boolean;
  eventsLoadFailed?: boolean;
  initialBookIds?: string[];
  initialEventIds?: string[];
}

interface SelectableItem {
  id: string;
  title: string;
  imageUrl: string | null;
  meta: string;
  missingImageText: string;
  selectable: boolean;
  warningText?: string;
}

const initialState: HeroSlideFormState = { message: "" };

const inputClassName =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

const visualSourceOptions: Array<{
  value: HeroSlideVisualSource;
  label: string;
  description: string;
  icon: typeof ImageIcon;
}> = [
  {
    value: "uploaded_image",
    label: "Yüklenen tanıtım görseli",
    description: "Shopier, röportaj, kampanya ve genel duyurular için.",
    icon: ImageIcon,
  },
  {
    value: "selected_books",
    label: "Seçilen kitaplar",
    description: "Yayındaki kitap kapaklarından düzenli bir koleksiyon oluşturur.",
    icon: BookOpen,
  },
  {
    value: "selected_events",
    label: "Seçilen etkinlikler",
    description: "Etkinlik kapaklarından düzenli bir fotoğraf kompozisyonu oluşturur.",
    icon: Images,
  },
];

export default function HeroSlideForm({
  action,
  deleteImageAction,
  slide,
  hasShopierUrl,
  books,
  events,
  booksLoadFailed = false,
  eventsLoadFailed = false,
  initialBookIds = [],
  initialEventIds = [],
}: HeroSlideFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [imageUrl, setImageUrl] = useState(slide?.image_url ?? "");
  const [visualSource, setVisualSource] = useState<HeroSlideVisualSource>(
    normalizeHeroSlideVisualSource(slide?.visual_source)
  );
  const [selectedBookIds, setSelectedBookIds] = useState(initialBookIds);
  const [selectedEventIds, setSelectedEventIds] = useState(initialEventIds);
  const initialCtaType = normalizeHeroSlideCtaType(
    slide?.cta_type,
    slide?.cta_link ?? null
  );
  const [ctaType, setCtaType] = useState<HeroSlideCtaType>(initialCtaType);
  const effectiveCtaType: HeroSlideCtaType =
    visualSource === "selected_books"
      ? ctaType === "shopier"
        ? "shopier"
        : "books"
      : visualSource === "selected_events"
        ? "gallery"
        : ctaType;
  const [ctaText, setCtaText] = useState(
    slide?.cta_text ?? HERO_SLIDE_CTA_DEFAULT_TEXT[effectiveCtaType]
  );

  const bookItems: SelectableItem[] = books.map((book) => ({
    id: book.id,
    title: book.title,
    imageUrl: book.cover_image_url,
    meta: book.is_published ? "Yayında" : "Taslak",
    missingImageText: "Kapak yok",
    selectable: book.is_published,
    warningText: book.is_published
      ? undefined
      : "Taslak kitap seçilemez; mevcut seçimden çıkarın.",
  }));
  const eventItems: SelectableItem[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    imageUrl: event.cover_image_url,
    meta: [
      new Date(event.event_date).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      event.location,
    ]
      .filter(Boolean)
      .join(" · "),
    missingImageText: "Kapak görseli yok",
    selectable: true,
  }));

  function handleCtaTypeChange(nextType: HeroSlideCtaType) {
    const previousDefault = HERO_SLIDE_CTA_DEFAULT_TEXT[effectiveCtaType];
    setCtaType(nextType);

    if (!ctaText.trim() || ctaText === previousDefault) {
      setCtaText(HERO_SLIDE_CTA_DEFAULT_TEXT[nextType]);
    }
  }

  function handleVisualSourceChange(nextSource: HeroSlideVisualSource) {
    const previousDefault = HERO_SLIDE_CTA_DEFAULT_TEXT[effectiveCtaType];
    const nextCtaType =
      nextSource === "selected_books"
        ? ctaType === "shopier"
          ? "shopier"
          : "books"
        : nextSource === "selected_events"
          ? "gallery"
          : ctaType;

    setVisualSource(nextSource);
    if (!ctaText.trim() || ctaText === previousDefault) {
      setCtaText(HERO_SLIDE_CTA_DEFAULT_TEXT[nextCtaType]);
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

      <section className="rounded-2xl border border-accent/15 bg-accent/5 p-4 text-sm leading-relaxed text-primary/75">
        Ana sayfa slaytı bir tanıtım görseli kullanabilir veya seçtiğiniz kitap
        ve etkinliklerden dinamik bir kompozisyon oluşturabilir. Kitap ve
        etkinlik içerikleri kendi yönetim bölümlerinden güncellenmeye devam eder.
      </section>

      <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-primary">Görsel kaynağı</h2>
          <p className="mt-1 text-sm text-muted">
            Bu slaytta ziyaretçilerin göreceği görsel yapıyı seçin.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {visualSourceOptions.map((option) => {
            const Icon = option.icon;
            const selected = visualSource === option.value;
            return (
              <label
                key={option.value}
                className={`relative flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                  selected
                    ? "border-accent bg-accent/8 shadow-sm"
                    : "border-border bg-secondary/20 hover:border-accent/40"
                }`}
              >
                <input
                  type="radio"
                  name="visual_source"
                  value={option.value}
                  checked={selected}
                  onChange={() => handleVisualSourceChange(option.value)}
                  className="sr-only"
                  disabled={pending}
                />
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    selected
                      ? "bg-accent text-white"
                      : "bg-accent/10 text-accent-dark"
                  }`}
                >
                  <Icon size={19} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                    {option.label}
                    {selected && <Check size={15} className="text-accent" />}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {visualSource === "selected_books" && (
        <SelectionManager
          title="Kitap seçimi"
          description="En fazla altı yayınlanmış kitap seçin. Bu sıra masaüstü yerleşimini ve mobil önceliği belirler."
          items={bookItems}
          selectedIds={selectedBookIds}
          onChange={setSelectedBookIds}
          inputName="book_ids"
          emptyText="Henüz yayınlanmış kitap bulunmuyor. Önce Kitaplar bölümünden bir kitap yayınlayın."
          loadErrorText={
            booksLoadFailed
              ? "Kitaplar yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin."
              : undefined
          }
          itemKind="book"
          pending={pending}
        />
      )}

      {visualSource === "selected_events" && (
        <SelectionManager
          title="Etkinlik seçimi"
          description="En fazla altı etkinlik seçin. Kapak görseli olmayan kayıtlar seçilebilir ancak uyarı gösterilir."
          items={eventItems}
          selectedIds={selectedEventIds}
          onChange={setSelectedEventIds}
          inputName="event_ids"
          emptyText="Henüz etkinlik bulunmuyor. Önce Etkinlikler bölümünden bir kayıt oluşturun."
          loadErrorText={
            eventsLoadFailed
              ? "Etkinlikler yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin."
              : undefined
          }
          itemKind="event"
          pending={pending}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="mb-5 text-lg font-bold text-primary">
            Tanıtım bilgileri
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Başlık" htmlFor="title">
                <input
                  id="title"
                  name="title"
                  defaultValue={slide?.title ?? ""}
                  className={inputClassName}
                  placeholder="Kitaplarımız, etkinlikler veya duyuru başlığı"
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
                  placeholder="Kısa açıklama metni"
                  disabled={pending}
                />
              </Field>
            </div>

            <div className="sm:col-span-2 rounded-xl border border-border bg-secondary/20 p-4">
              <h3 className="text-sm font-semibold text-primary">
                Buton ayarları
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Kitap koleksiyonları Kitaplar sayfasına veya Shopier mağazasına
                yönlendirilebilir. Etkinlik hedefi otomatik olarak Galeri olur.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {visualSource === "uploaded_image" ? (
                  <Field label="Buton hedefi" htmlFor="cta_type">
                    <select
                      id="cta_type"
                      name="cta_type"
                      value={ctaType}
                      onChange={(event) =>
                        handleCtaTypeChange(
                          event.target.value as HeroSlideCtaType
                        )
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
                ) : visualSource === "selected_books" ? (
                  <Field label="Buton hedefi" htmlFor="cta_type">
                    <select
                      id="cta_type"
                      name="cta_type"
                      value={effectiveCtaType}
                      onChange={(event) =>
                        handleCtaTypeChange(
                          event.target.value as HeroSlideCtaType
                        )
                      }
                      className={inputClassName}
                      disabled={pending}
                    >
                      <option value="books">
                        {HERO_SLIDE_CTA_LABELS.books}
                      </option>
                      <option value="shopier">
                        {HERO_SLIDE_CTA_LABELS.shopier}
                      </option>
                    </select>
                  </Field>
                ) : (
                  <Field label="Buton hedefi" htmlFor="cta_type_display">
                    <input
                      id="cta_type_display"
                      value={HERO_SLIDE_CTA_LABELS[effectiveCtaType]}
                      readOnly
                      tabIndex={-1}
                      className={`${inputClassName} cursor-not-allowed bg-border/20 text-muted`}
                    />
                    <input
                      type="hidden"
                      name="cta_type"
                      value={effectiveCtaType}
                    />
                  </Field>
                )}

                {effectiveCtaType !== "none" && (
                  <Field label="Buton metni" htmlFor="cta_text">
                    <input
                      id="cta_text"
                      name="cta_text"
                      value={ctaText}
                      onChange={(event) => setCtaText(event.target.value)}
                      className={inputClassName}
                      placeholder={
                        HERO_SLIDE_CTA_DEFAULT_TEXT[effectiveCtaType]
                      }
                      disabled={pending}
                    />
                  </Field>
                )}

                {visualSource === "uploaded_image" &&
                  effectiveCtaType === "external" && (
                    <div className="sm:col-span-2">
                      <Field
                        label="Web sitesi adresi"
                        htmlFor="cta_external_url"
                      >
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

                {effectiveCtaType === "shopier" &&
                  !hasShopierUrl && (
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
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
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

        <aside>
          <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-primary">
              <ImageIcon size={19} className="text-accent" />
              {visualSource === "uploaded_image"
                ? "Tanıtım görseli"
                : "Yedek tanıtım görseli"}
            </h2>
            <p className="mb-4 text-xs leading-relaxed text-muted">
              {visualSource === "uploaded_image"
                ? "Bu görsel slaydın tam ekran arka planı olarak kullanılır."
                : "İsteğe bağlıdır. Seçilen içeriklerin görselleri kullanılamazsa yedek olarak gösterilir; mevcut görsel siz kaldırana kadar korunur."}
            </p>
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
              Yatay, yüksek kaliteli ve sıkıştırılmış bir görsel kullanın.
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

function SelectionManager({
  title,
  description,
  items,
  selectedIds,
  onChange,
  inputName,
  emptyText,
  loadErrorText,
  itemKind,
  pending,
}: {
  title: string;
  description: string;
  items: SelectableItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  inputName: "book_ids" | "event_ids";
  emptyText: string;
  loadErrorText?: string;
  itemKind: "book" | "event";
  pending: boolean;
}) {
  const selectedItems = selectedIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is SelectableItem => Boolean(item));

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }

    if (selectedIds.length < MAX_HERO_SLIDE_SELECTIONS) {
      onChange([...selectedIds, id]);
    }
  }

  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selectedIds.length) return;
    const nextIds = [...selectedIds];
    [nextIds[index], nextIds[nextIndex]] = [
      nextIds[nextIndex],
      nextIds[index],
    ];
    onChange(nextIds);
  }

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={inputName} value={id} />
      ))}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-dark">
          {selectedIds.length} / {MAX_HERO_SLIDE_SELECTIONS} seçildi
        </span>
      </div>

      {loadErrorText ? (
        <div
          role="alert"
          className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger/5 px-5 py-10 text-center text-sm text-danger"
        >
          <AlertCircle size={18} className="shrink-0" />
          {loadErrorText}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-secondary/20 px-5 py-10 text-center text-sm text-muted">
          {emptyText}
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const selected = selectedIds.includes(item.id);
            const disabled =
              pending ||
              (!selected &&
                (!item.selectable ||
                  selectedIds.length >= MAX_HERO_SLIDE_SELECTIONS));
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                disabled={disabled}
                aria-pressed={selected}
                className={`group flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected
                    ? "border-accent bg-accent/8"
                    : "border-border bg-secondary/15 hover:border-accent/40"
                }`}
              >
                <ItemThumbnail item={item} itemKind={itemKind} />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-semibold leading-snug text-primary">
                    {item.title}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted">
                    {item.meta}
                  </span>
                  {!item.imageUrl && (
                    <span className="mt-1 block text-xs text-danger">
                      {item.missingImageText}
                    </span>
                  )}
                  {item.warningText && (
                    <span className="mt-1 block text-xs text-danger">
                      {item.warningText}
                    </span>
                  )}
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    selected
                      ? "border-accent bg-accent text-white"
                      : "border-border text-transparent"
                  }`}
                >
                  <Check size={14} />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="mt-6 border-t border-border/70 pt-5">
          <h3 className="text-sm font-semibold text-primary">
            Gösterim sırası
          </h3>
          <div className="mt-3 grid gap-2">
            {selectedItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-2.5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent-dark">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-primary">
                  {item.title}
                </span>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={pending || index === 0}
                  className="rounded-lg p-2 text-muted transition hover:bg-accent/10 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`${item.title} seçimini yukarı taşı`}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={pending || index === selectedItems.length - 1}
                  className="rounded-lg p-2 text-muted transition hover:bg-accent/10 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`${item.title} seçimini aşağı taşı`}
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ItemThumbnail({
  item,
  itemKind,
}: {
  item: SelectableItem;
  itemKind: "book" | "event";
}) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-primary/8 ${
        itemKind === "book"
          ? "h-16 w-11 rounded-md"
          : "h-14 w-20 rounded-lg"
      }`}
    >
      {item.imageUrl ? (
        <ResilientImage
          src={item.imageUrl}
          alt=""
          fallback={
            itemKind === "book" ? (
              <BookOpen size={20} className="text-accent/45" />
            ) : (
              <Images size={20} className="text-accent/45" />
            )
          }
          fill
          className="object-cover"
          sizes={itemKind === "book" ? "44px" : "80px"}
        />
      ) : itemKind === "book" ? (
        <BookOpen size={20} className="text-accent/45" />
      ) : (
        <Images size={20} className="text-accent/45" />
      )}
    </span>
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
