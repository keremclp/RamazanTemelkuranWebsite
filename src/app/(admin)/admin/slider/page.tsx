import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Edit3, ImageIcon, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { HeroSlide } from "@/lib/types/database";
import {
  HERO_SLIDE_CTA_LABELS,
  inferLegacyCtaType,
} from "@/lib/hero-slide-cta";
import DeleteHeroSlideButton from "@/components/admin/DeleteHeroSlideButton";

export const metadata: Metadata = {
  title: "Slider",
};

const statusMessages: Record<string, string> = {
  created: "Slayt başarıyla eklendi.",
  updated: "Slayt başarıyla güncellendi.",
};

type AdminHeroSlide = HeroSlide & {
  cta_book?: { title: string } | null;
};

function getCtaTargetLabel(slide: AdminHeroSlide) {
  const type = slide.cta_type ?? inferLegacyCtaType(slide.cta_link);

  if (type === "book" && slide.cta_book?.title) {
    return `Kitap: ${slide.cta_book.title}`;
  }

  return HERO_SLIDE_CTA_LABELS[type];
}

export default async function AdminSliderPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*, cta_book:books!hero_slides_cta_book_id_fkey(title)")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  const slides = (data as AdminHeroSlide[] | null) ?? [];
  const statusMessage = status ? statusMessages[status] : undefined;

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
          {slides.map((slide) => (
            <article
              key={slide.id}
              className="grid overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)] lg:grid-cols-[320px_minmax(0,1fr)]"
            >
              <div className="relative aspect-video bg-primary/10 lg:aspect-auto">
                {slide.image_url ? (
                  <Image
                    src={slide.image_url}
                    alt={slide.title || ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                ) : (
                  <div className="flex h-full min-h-48 items-center justify-center text-accent/30">
                    <ImageIcon size={34} />
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
                      {slide.title || "Başlıksız slayt"}
                    </h2>
                    <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-dark">
                      Sıra: {slide.display_order}
                    </span>
                  </div>
                  {slide.subtitle && (
                    <p className="mt-2 line-clamp-2 text-sm text-primary/70">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.cta_text &&
                    (slide.cta_type ?? inferLegacyCtaType(slide.cta_link)) !==
                      "none" && (
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
                  <DeleteHeroSlideButton id={slide.id} title={slide.title} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
