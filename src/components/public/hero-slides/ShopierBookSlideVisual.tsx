import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import type { ResolvedHeroSlide } from "@/lib/types/database";
import ResilientImage from "@/components/public/ResilientImage";
import UploadedImageSlideVisual from "@/components/public/hero-slides/UploadedImageSlideVisual";
import {
  DecorativeHeroBackground,
  HeroSlideCopy,
} from "@/components/public/hero-slides/HeroSlideShared";

function BookCover({
  book,
  priority = false,
  featured = false,
}: {
  book: ResolvedHeroSlide["selected_books"][number];
  priority?: boolean;
  featured?: boolean;
}) {
  return (
    <figure
      className={`relative aspect-[2/3] overflow-hidden rounded-xl border bg-surface shadow-xl ${
        featured
          ? "w-[clamp(7rem,26vw,10rem)] border-accent/45 shadow-[0_18px_42px_rgba(44,44,44,0.16)] sm:w-[clamp(9rem,22vw,12rem)] lg:w-[clamp(12rem,13vw,14.5rem)]"
          : "w-full border-primary/10 shadow-[0_10px_24px_rgba(44,44,44,0.12)]"
      }`}
    >
      <ResilientImage
        src={book.cover_image_url!}
        alt={`${book.title} kitap kapağı`}
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-hero-cream-deep">
            <BookOpen size={featured ? 32 : 22} className="text-accent/55" />
          </div>
        }
        fill
        className="object-cover"
        loading={priority ? "eager" : "lazy"}
        sizes={
          featured
            ? "(max-width: 640px) 160px, (max-width: 1024px) 192px, 232px"
            : "(max-width: 640px) 64px, (max-width: 1024px) 88px, 112px"
        }
      />
    </figure>
  );
}

export default function ShopierBookSlideVisual({
  slide,
  priority,
}: {
  slide: ResolvedHeroSlide;
  priority: boolean;
}) {
  const books = slide.selected_books
    .filter((book) => Boolean(book.cover_image_url))
    .slice(0, 6);

  if (books.length === 0) {
    return <UploadedImageSlideVisual slide={slide} priority={priority} />;
  }

  const [featuredBook, ...shelfBooks] = books;
  const orderPanelClassName =
    "group flex min-h-16 items-center gap-2 rounded-2xl bg-accent-ink px-3 py-3 text-left text-white shadow-[0_16px_32px_rgba(134,109,35,0.28)] transition sm:gap-3 sm:px-5 lg:min-h-20 lg:hover:-translate-y-0.5 lg:hover:bg-accent-on";
  const orderPanelContent = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-dark text-white lg:h-12 lg:w-12">
        <ShieldCheck size={23} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-base font-bold lg:text-lg">
          Güvenli Sipariş
        </span>
        <span className="hidden text-xs text-white/65 min-[440px]:block sm:text-sm">
          Shopier mağazasına git
        </span>
      </span>
      {slide.cta_href && (
        <ArrowUpRight
          size={20}
          aria-hidden="true"
          className="shrink-0 text-white/80 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      )}
    </>
  );

  return (
    <div className="relative min-h-[85vh] w-full overflow-hidden bg-hero-shop">
      <DecorativeHeroBackground variant="shopier" />
      <div className="absolute inset-0 bg-gradient-to-r from-hero-shop/95 via-hero-shop/58 to-white/10" />

      <div className="relative z-10 mx-auto grid min-h-[85vh] w-full max-w-[1720px] items-center gap-6 px-5 pb-24 pt-7 sm:px-16 sm:pt-9 lg:grid-cols-[minmax(300px,0.72fr)_minmax(680px,1.28fr)] lg:gap-12 lg:px-20 lg:py-12 xl:grid-cols-[minmax(360px,0.68fr)_minmax(760px,1.32fr)] xl:px-24">
        <div className="order-2 lg:order-1">
          <HeroSlideCopy slide={slide} compact tone="light" />
        </div>

        <section
          className="relative order-1 mx-auto w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-white bg-surface p-4 text-primary shadow-[0_30px_70px_rgba(120,83,48,0.18)] ring-1 ring-primary/10 sm:p-5 lg:order-2 lg:mx-0 lg:max-w-none lg:rounded-[2rem] lg:p-7"
          aria-label="Shopier kitap mağazası"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />

          <header className="relative flex items-center justify-between gap-3 border-b border-primary/10 pb-3 lg:pb-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-dark text-white lg:h-12 lg:w-12">
                <ShoppingBag size={23} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-heading text-lg font-bold sm:text-xl lg:text-2xl">
                  <span className="sm:hidden">Shopier Mağazası</span>
                  <span className="hidden sm:inline">Shopier Kitap Mağazası</span>
                </span>
                <span className="hidden text-sm text-muted sm:block">
                  Ramazan Temelkuran&apos;ın seçili eserleri
                </span>
              </span>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-xs font-semibold text-accent-ink sm:px-3 sm:text-sm">
              <ShieldCheck size={16} aria-hidden="true" />
              Güvenli Sipariş
            </span>
          </header>

          <div className="relative mt-4 grid grid-cols-[minmax(7rem,0.82fr)_minmax(0,1.18fr)] items-center gap-4 sm:grid-cols-[minmax(10rem,0.78fr)_minmax(0,1.22fr)] sm:gap-6 lg:mt-6 lg:grid-cols-[minmax(13rem,0.76fr)_minmax(0,1.24fr)] lg:gap-8">
            <div className="flex justify-center">
              <BookCover book={featuredBook} featured priority={priority} />
            </div>

            <div className="flex min-w-0 flex-col gap-3 lg:gap-5">
              {shelfBooks.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:gap-4">
                  {shelfBooks.map((book, index) => (
                    <div
                      key={book.id}
                      className={`${index >= 2 ? "hidden sm:block" : ""}`}
                    >
                      <BookCover book={book} />
                    </div>
                  ))}
                </div>
              )}

              {slide.cta_href ? (
                <Link
                  href={slide.cta_href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${orderPanelClassName} no-underline`}
                >
                  {orderPanelContent}
                </Link>
              ) : (
                <div className={orderPanelClassName}>{orderPanelContent}</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
