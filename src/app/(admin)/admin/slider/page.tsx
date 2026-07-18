import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Edit3, ImageIcon, Images, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { HeroSlide } from "@/lib/types/database";
import {
  HERO_SLIDE_CTA_LABELS,
  normalizeHeroSlideCtaType,
} from "@/lib/hero-slide-cta";
import DeleteHeroSlideButton from "@/components/admin/DeleteHeroSlideButton";
import { normalizeHeroSlideVisualSource } from "@/lib/hero-slide-visual-source";

export const metadata: Metadata = {
  title: "Slider",
};

const statusMessages: Record<string, string> = {
  created: "Slayt başarıyla eklendi.",
  updated: "Slayt başarıyla güncellendi.",
};

function getCtaTargetLabel(slide: HeroSlide) {
  const type = normalizeHeroSlideCtaType(slide.cta_type, slide.cta_link);
  return HERO_SLIDE_CTA_LABELS[type];
}

export default async function AdminSliderPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const [
    { data, error },
    { data: bookSelections },
    { data: eventSelections },
  ] = await Promise.all([
    supabase
      .from("hero_slides")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("hero_slide_books").select("hero_slide_id"),
    supabase.from("hero_slide_events").select("hero_slide_id"),
  ]);

  const slides = (data as HeroSlide[] | null) ?? [];
  const statusMessage = status ? statusMessages[status] : undefined;
  const bookSelectionCounts = countSelectionsBySlide(bookSelections ?? []);
  const eventSelectionCounts = countSelectionsBySlide(eventSelections ?? []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">
            Slider
          </h1>
          <p className="mt-1 text-muted">
            Ana sayfa hero slider görsellerini, metinlerini ve sıralamasını yönetin.
          </p>
        </div>
        <Link
          href="/admin/slider/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white no-underline transition hover:bg-accent-dark"
        >
          <Plus size={18} />
          Yeni Slayt
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
          Slaytlar yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.
        </div>
      )}

      {!error && slides.length === 0 ? (
        <div className="rounded-2xl bg-surface px-6 py-16 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <ImageIcon size={26} />
          </div>
          <h2 className="text-xl font-bold text-primary">Henüz slayt yok</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            İlk hero slaytını ekleyerek ana sayfa giriş alanını düzenlemeye başlayın.
          </p>
          <Link
            href="/admin/slider/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white no-underline hover:bg-accent-dark"
          >
            <Plus size={17} />
            İlk Slaytı Ekle
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {slides.map((slide) => {
            const displayTitle = slide.title || "Başlıksız slayt";
            const ctaType = normalizeHeroSlideCtaType(
              slide.cta_type,
              slide.cta_link
            );
            const visualSource = normalizeHeroSlideVisualSource(
              slide.visual_source
            );
            const selectionCount =
              visualSource === "selected_books"
                ? bookSelectionCounts.get(slide.id) ?? 0
                : visualSource === "selected_events"
                  ? eventSelectionCounts.get(slide.id) ?? 0
                  : null;
            const SourceIcon =
              visualSource === "selected_books"
                ? BookOpen
                : visualSource === "selected_events"
                  ? Images
                  : ImageIcon;

            return (
              <article
                key={slide.id}
                className="grid overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)] lg:grid-cols-[320px_minmax(0,1fr)]"
              >
                <div className="relative aspect-video bg-primary/10 lg:aspect-auto">
                  {slide.image_url ? (
                    <Image
                      src={slide.image_url}
                      alt={displayTitle}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                  ) : (
                    <div className="flex h-full min-h-48 items-center justify-center text-accent/30">
                      <SourceIcon size={34} />
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${
                      slide.is_active
                        ? "bg-success text-white"
                        : "bg-primary/70 text-white"
                    }`}
                  >
                    {slide.is_active ? "Aktif" : "Pasif"}
                  </span>
                </div>

              <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-primary">
                      {displayTitle}
                    </h2>
                    <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-dark">
                      Sıra: {slide.display_order}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/6 px-2.5 py-1 text-xs font-medium text-primary/70">
                      <SourceIcon size={13} />
                      {visualSource === "selected_books"
                        ? `${selectionCount} kitap`
                        : visualSource === "selected_events"
                          ? `${selectionCount} etkinlik`
                          : "Yüklenen görsel"}
                    </span>
                  </div>
                  {slide.subtitle && (
                    <p className="mt-2 line-clamp-2 text-sm text-primary/70">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.cta_text && ctaType !== "none" && (
                    <p className="mt-2 text-xs text-muted">
                      Buton: {slide.cta_text} · {getCtaTargetLabel(slide)}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-end gap-1 border-t border-border/60 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                  <Link
                    href={`/admin/slider/${slide.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted no-underline transition hover:bg-accent/10 hover:text-accent-dark"
                  >
                    <Edit3 size={15} />
                    Düzenle
                  </Link>
                  <DeleteHeroSlideButton id={slide.id} title={displayTitle} />
                </div>
              </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function countSelectionsBySlide(
  selections: Array<{ hero_slide_id: string }>
) {
  return selections.reduce((counts, selection) => {
    counts.set(
      selection.hero_slide_id,
      (counts.get(selection.hero_slide_id) ?? 0) + 1
    );
    return counts;
  }, new Map<string, number>());
}
