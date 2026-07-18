import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Mail,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type {
  AboutContent,
  Book,
  Event,
  HeroSlide,
  HeroSlideBookVisual,
  HeroSlideEventVisual,
  Media,
  ResolvedHeroSlide,
  SiteSettings,
} from "@/lib/types/database";
import { getSiteSettings } from "@/lib/site-settings";
import { truncate } from "@/lib/utils/helpers";
import HeroSlider from "@/components/public/HeroSlider";
import { resolveHeroSlideCtaHref } from "@/lib/hero-slide-cta";
import { createPageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";
import JsonLd from "@/components/public/JsonLd";
import ResilientImage from "@/components/public/ResilientImage";
import {
  EVENT_MEDIA_RELATION_SELECT,
  getEventCoverImageUrl,
  getEventCoverMedia,
} from "@/lib/event-gallery";
import { normalizeHeroSlideVisualSource } from "@/lib/hero-slide-visual-source";

interface SelectedBookRow {
  hero_slide_id: string;
  display_order: number;
  book:
    | (Pick<Book, "id" | "title" | "cover_image_url" | "is_published">)
    | Array<Pick<Book, "id" | "title" | "cover_image_url" | "is_published">>
    | null;
}

interface SelectedEventRecord
  extends Pick<Event, "id" | "title" | "homepage_media_id"> {
  media: Media[];
}

interface SelectedEventRow {
  hero_slide_id: string;
  display_order: number;
  event: SelectedEventRecord | SelectedEventRecord[] | null;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return createPageMetadata({
    title: `${settings.site_title} | Yazar`,
    description: settings.meta_description,
    path: "/",
    absoluteTitle: true,
  });
}

function resolveHeroSlide(
  slide: HeroSlide,
  settings: SiteSettings,
  selectedBooks: HeroSlideBookVisual[],
  selectedEvents: HeroSlideEventVisual[]
): ResolvedHeroSlide {
  return {
    ...slide,
    visual_source: normalizeHeroSlideVisualSource(slide.visual_source),
    cta_href: resolveHeroSlideCtaHref(slide, settings),
    selected_books: selectedBooks,
    selected_events: selectedEvents,
  };
}

function getSingleRelation<T>(relation: T | T[] | null) {
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

function groupSelectedBooks(rows: SelectedBookRow[]) {
  const booksBySlide = new Map<string, HeroSlideBookVisual[]>();

  for (const row of rows) {
    const book = getSingleRelation(row.book);
    if (!book?.is_published) continue;
    const books = booksBySlide.get(row.hero_slide_id) ?? [];
    books.push({
      id: book.id,
      title: book.title,
      cover_image_url: book.cover_image_url,
    });
    booksBySlide.set(row.hero_slide_id, books);
  }

  return booksBySlide;
}

function groupSelectedEvents(rows: SelectedEventRow[]) {
  const eventsBySlide = new Map<string, HeroSlideEventVisual[]>();

  for (const row of rows) {
    const event = getSingleRelation(row.event);
    if (!event) continue;
    const events = eventsBySlide.get(row.hero_slide_id) ?? [];
    events.push({
      id: event.id,
      title: event.title,
      cover_image_url: getEventCoverImageUrl(getEventCoverMedia(event)),
    });
    eventsBySlide.set(row.hero_slide_id, events);
  }

  return eventsBySlide;
}

async function getHomePageData() {
  try {
    const supabase = await createClient();

    const [slidesRes, aboutRes, settings] = await Promise.all([
      supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("display_order"),
      supabase.from("about_content").select("*").single(),
      getSiteSettings(),
    ]);

    const slideRows = (slidesRes.data as HeroSlide[] | null) ?? [];
    const slideIds = slideRows.map((slide) => slide.id);
    let selectedBookRows: SelectedBookRow[] = [];
    let selectedEventRows: SelectedEventRow[] = [];

    if (slideIds.length > 0) {
      const [bookSelectionsResult, eventSelectionsResult] = await Promise.all([
        supabase
          .from("hero_slide_books")
          .select(
            "hero_slide_id, display_order, book:books(id, title, cover_image_url, is_published)"
          )
          .in("hero_slide_id", slideIds)
          .order("display_order", { ascending: true }),
        supabase
          .from("hero_slide_events")
          .select(
            `hero_slide_id, display_order, event:events(id, title, homepage_media_id, ${EVENT_MEDIA_RELATION_SELECT})`
          )
          .in("hero_slide_id", slideIds)
          .order("display_order", { ascending: true }),
      ]);

      selectedBookRows =
        (bookSelectionsResult.data as SelectedBookRow[] | null) ?? [];
      selectedEventRows =
        (eventSelectionsResult.data as SelectedEventRow[] | null) ?? [];
    }

    const booksBySlide = groupSelectedBooks(selectedBookRows);
    const eventsBySlide = groupSelectedEvents(selectedEventRows);

    return {
      heroSlides: slideRows.map((slide) =>
        resolveHeroSlide(
          slide,
          settings,
          booksBySlide.get(slide.id) ?? [],
          eventsBySlide.get(slide.id) ?? []
        )
      ),
      about: (aboutRes.data as AboutContent | null) ?? null,
      settings,
    };
  } catch {
    const settings = await getSiteSettings();
    return {
      heroSlides: [],
      about: null,
      settings,
    };
  }
}

export default async function HomePage() {
  const { heroSlides, about, settings } = await getHomePageData();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: settings.site_title,
          url: absoluteUrl("/"),
          description: settings.meta_description,
          inLanguage: "tr-TR",
          publisher: {
            "@type": "Person",
            name: settings.site_title,
            url: absoluteUrl("/about"),
          },
        }}
      />

      {heroSlides.length > 0 ? (
        <HeroSlider slides={heroSlides} />
      ) : (
        <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-primary">
          <div className="absolute inset-0 opacity-5" aria-hidden="true">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 25%, rgba(197, 165, 90, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(197, 165, 90, 0.2) 0%, transparent 50%)",
              }}
            />
          </div>
          <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-8 animate-fade-in-up">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    {settings.site_title}
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-white/60">
                    {settings.meta_description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/contact"
                    className="group inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white no-underline transition-all duration-200 hover:bg-accent-dark"
                  >
                    <User size={18} />
                    İletişime Geç
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                  <Link
                    href="/books"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 font-medium text-white no-underline transition-all duration-200 hover:bg-white/10"
                  >
                    <BookOpen size={18} />
                    Kitaplar
                  </Link>
                </div>
              </div>
              <div className="hidden items-center justify-center lg:flex">
                <div className="relative h-80 w-80" aria-hidden="true">
                  <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-pulse" />
                  <div className="absolute inset-4 rounded-full border border-accent/10" />
                  <div className="absolute inset-8 flex items-center justify-center rounded-full bg-accent/5">
                    <BookOpen size={64} className="text-accent/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {about && (about.biography || about.portrait_image_url) && (
        <section className="section-padding bg-secondary">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="flex justify-center">
                <div className="relative flex h-72 w-72 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 sm:h-96 sm:w-96">
                  {about.portrait_image_url ? (
                    <ResilientImage
                      src={about.portrait_image_url}
                      alt={settings.site_title}
                      fallback={<User size={64} className="text-accent/20" />}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 288px, 384px"
                    />
                  ) : (
                    <User size={64} className="text-accent/20" />
                  )}
                  <div className="absolute -inset-2 -z-10 rounded-2xl border-2 border-accent/20" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
                    Yazar Hakkında
                  </p>
                  <h2 className="text-3xl font-bold sm:text-4xl">
                    {settings.site_title}
                  </h2>
                </div>
                <p className="leading-relaxed text-muted">
                  {about.biography ? truncate(about.biography, 200) : ""}
                </p>
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 font-medium text-accent no-underline transition-colors hover:text-accent-dark"
                >
                  Devamını Oku
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <HomeClosingSection settings={settings} />
    </>
  );
}

function HomeClosingSection({ settings }: { settings: SiteSettings }) {
  const socialLinks = [
    { label: "Instagram", url: settings.social_links.instagram },
    { label: "YouTube", url: settings.social_links.youtube },
  ].filter((entry): entry is { label: string; url: string } =>
    Boolean(entry.url && entry.url !== "#")
  );

  return (
    <section className="border-t border-border/60 bg-surface py-14 sm:py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Bağlantıda Kalın
          </p>
          <h2 className="text-2xl font-bold text-primary sm:text-3xl">
            Yeni çalışmalar ve etkinlikler için takipte kalın
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {socialLinks.map((entry) => (
            <a
              key={entry.label}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-5 py-2.5 text-sm font-medium text-primary no-underline transition hover:border-accent/40 hover:text-accent-dark"
            >
              {entry.label}
              <ArrowUpRight size={15} />
            </a>
          ))}
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white no-underline transition hover:bg-accent-dark"
          >
            <Mail size={15} />
            İletişime Geç
          </Link>
        </div>
      </div>
    </section>
  );
}
