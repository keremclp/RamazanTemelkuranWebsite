"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pause,
  Play,
} from "lucide-react";
import type { Book } from "@/lib/types/database";
import { wrapCarouselIndex } from "@/lib/carousel";
import ResilientImage from "./ResilientImage";

interface BookSliderProps {
  books: Book[];
}

const autoplayDelay = 3000;
const transitionFallbackDelay = 850;
const swipeThreshold = 50;

export default function BookSlider({ books }: BookSliderProps) {
  const total = books.length;
  const [current, setCurrent] = useState(0);
  const [trackPosition, setTrackPosition] = useState(total > 1 ? 1 : 0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const trackBooks = useMemo(() => {
    if (total <= 1) return books;
    return [books[total - 1], ...books, books[0]];
  }, [books, total]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () =>
      setPageVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  const jumpWithoutMotion = useCallback(
    (index: number) => {
      const normalized = wrapCarouselIndex(index, total);
      setTransitionEnabled(false);
      setCurrent(normalized);
      setTrackPosition(total > 1 ? normalized + 1 : 0);
      requestAnimationFrame(() => setTransitionEnabled(true));
    },
    [total]
  );

  const move = useCallback(
    (step: -1 | 1) => {
      if (total <= 1 || isTransitioning) return;

      const nextIndex = wrapCarouselIndex(current + step, total);
      if (prefersReducedMotion) {
        jumpWithoutMotion(nextIndex);
        return;
      }

      setTransitionEnabled(true);
      setIsTransitioning(true);
      setCurrent(nextIndex);
      setTrackPosition((position) => position + step);
    },
    [current, isTransitioning, jumpWithoutMotion, prefersReducedMotion, total]
  );

  const next = useCallback(() => move(1), [move]);
  const previous = useCallback(() => move(-1), [move]);

  const goTo = useCallback(
    (index: number) => {
      if (total <= 1 || isTransitioning) return;
      const normalized = wrapCarouselIndex(index, total);
      if (normalized === current) return;

      if (prefersReducedMotion) {
        jumpWithoutMotion(normalized);
        return;
      }

      setTransitionEnabled(true);
      setIsTransitioning(true);
      setCurrent(normalized);
      setTrackPosition(normalized + 1);
    },
    [current, isTransitioning, jumpWithoutMotion, prefersReducedMotion, total]
  );

  const finishTransition = useCallback(() => {
    if (trackPosition === 0 || trackPosition === total + 1) {
      const normalizedPosition = trackPosition === 0 ? total : 1;
      setTransitionEnabled(false);
      setTrackPosition(normalizedPosition);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
          setIsTransitioning(false);
        });
      });
      return;
    }

    setIsTransitioning(false);
  }, [total, trackPosition]);

  useEffect(() => {
    if (!isTransitioning) return;
    const fallback = window.setTimeout(
      finishTransition,
      transitionFallbackDelay
    );
    return () => window.clearTimeout(fallback);
  }, [finishTransition, isTransitioning]);

  const autoplayRunning =
    total > 1 &&
    !autoplayPaused &&
    !prefersReducedMotion &&
    pageVisible &&
    !isTransitioning;

  useEffect(() => {
    if (!autoplayRunning) return;
    const timer = window.setTimeout(next, autoplayDelay);
    return () => window.clearTimeout(timer);
  }, [autoplayRunning, next]);

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    finishTransition();
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;

    if (startX === null || endX === undefined) return;
    const distance = endX - startX;
    if (Math.abs(distance) < swipeThreshold) return;
    if (distance < 0) next();
    else previous();
  }

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface py-16 text-center shadow-[var(--shadow-card)]">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted/40" />
        <p className="text-lg text-muted">Henüz yayımlanmış kitap bulunmamaktadır.</p>
      </div>
    );
  }

  const activeBook = books[current] ?? books[0];

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-primary shadow-[var(--shadow-card-hover)]"
      aria-roledescription="carousel"
      aria-label="Yayımlanmış kitaplar"
    >
      <div
        className="overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`flex ${
            transitionEnabled
              ? "transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
              : ""
          }`}
          style={{ transform: `translateX(-${trackPosition * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {trackBooks.map((book, index) => {
            const position =
              total > 1 ? wrapCarouselIndex(index - 1, total) : 0;
            return (
              <BookSlide
                key={`${book.id}-${index}`}
                book={book}
                isActive={index === trackPosition}
                position={position}
                total={total}
                priority={index === 1 || total === 1}
              />
            );
          })}
        </div>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={previous}
            disabled={isTransitioning}
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 disabled:cursor-wait disabled:opacity-50 sm:left-5 sm:h-12 sm:w-12"
            aria-label="Önceki kitap"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={isTransitioning}
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 disabled:cursor-wait disabled:opacity-50 sm:right-5 sm:h-12 sm:w-12"
            aria-label="Sonraki kitap"
          >
            <ChevronRight size={22} />
          </button>

          <div
            className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm sm:bottom-7"
            aria-label="Kitap seçimi"
          >
            {books.map((book, index) => (
              <button
                key={book.id}
                type="button"
                onClick={() => goTo(index)}
                disabled={isTransitioning}
                className={`h-2.5 cursor-pointer rounded-full transition-all duration-300 disabled:cursor-wait ${
                  index === current
                    ? "w-8 bg-accent"
                    : "w-2.5 bg-white/45 hover:bg-white/75"
                }`}
                aria-label={`Kitap ${index + 1}: ${book.title}`}
                aria-current={index === current ? "true" : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setAutoplayPaused((paused) => !paused)}
            disabled={prefersReducedMotion}
            className="absolute bottom-5 right-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 disabled:cursor-not-allowed disabled:opacity-50 sm:bottom-7 sm:right-6"
            aria-label={
              prefersReducedMotion
                ? "Cihaz hareket tercihi nedeniyle otomatik oynatma kapalı"
                : autoplayPaused
                  ? "Kitap slaytlarını oynat"
                  : "Kitap slaytlarını duraklat"
            }
          >
            {autoplayPaused || prefersReducedMotion ? (
              <Play size={16} fill="currentColor" />
            ) : (
              <Pause size={16} fill="currentColor" />
            )}
          </button>
        </>
      )}

      <p
        className="sr-only"
        aria-live={autoplayRunning ? "off" : "polite"}
        aria-atomic="true"
      >
        {current + 1}. kitap: {activeBook.title}
      </p>
    </section>
  );
}

function BookSlide({
  book,
  isActive,
  position,
  total,
  priority,
}: {
  book: Book;
  isActive: boolean;
  position: number;
  total: number;
  priority: boolean;
}) {
  return (
    <article
      className="relative min-h-[600px] w-full shrink-0 overflow-hidden sm:min-h-[560px] lg:h-[clamp(450px,calc(100dvh-17rem),500px)] lg:min-h-0"
      aria-roledescription="slide"
      aria-label={`${position + 1} / ${total}`}
      aria-hidden={!isActive}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(197,165,90,0.22),transparent_38%),radial-gradient(circle_at_90%_85%,rgba(197,165,90,0.12),transparent_40%)]" />
      <div className="relative mx-auto grid min-h-[600px] w-full max-w-6xl items-center gap-5 px-12 pb-16 pt-6 sm:min-h-[560px] sm:px-16 sm:pb-20 sm:pt-8 md:grid-cols-[minmax(150px,190px)_minmax(0,1fr)] md:gap-10 md:px-20 lg:h-[clamp(450px,calc(100dvh-17rem),500px)] lg:min-h-0 lg:grid-cols-[minmax(170px,210px)_minmax(0,1fr)] lg:gap-12 lg:px-24">
        <div className="flex justify-center">
          <div className="relative aspect-[2/3] w-32 overflow-hidden rounded-lg bg-white/5 shadow-2xl shadow-black/40 ring-1 ring-white/15 sm:w-40 md:w-44 lg:w-48">
            {book.cover_image_url ? (
              <ResilientImage
                src={book.cover_image_url}
                alt={`${book.title} kitap kapağı`}
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/25 to-white/5">
                    <BookOpen size={64} className="text-accent/55" />
                  </div>
                }
                fill
                className="object-cover"
                loading={priority ? "eager" : "lazy"}
                sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, (max-width: 1024px) 176px, 192px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/25 to-white/5">
                <BookOpen size={64} className="text-accent/55" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent sm:text-sm">
            Yazarın eserleri
          </p>
          <h2 className="break-words text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
            {book.title}
          </h2>
          {book.description && (
            <p className="mx-auto hidden max-w-2xl overflow-hidden text-sm leading-relaxed text-white/70 sm:[-webkit-box-orient:vertical] sm:[-webkit-line-clamp:4] sm:[display:-webkit-box] sm:text-base md:mx-0 lg:text-lg">
              {book.description}
            </p>
          )}
          <div className="flex flex-col justify-center gap-3 pt-1 sm:flex-row md:justify-start">
            <Link
              href={`/books/${book.slug}`}
              tabIndex={isActive ? 0 : -1}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white no-underline transition hover:bg-accent-dark"
            >
              Kitabı İncele
              <ChevronRight size={16} />
            </Link>
            {book.shopier_url && (
              <a
                href={book.shopier_url}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isActive ? 0 : -1}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 font-medium text-white no-underline transition hover:border-accent/50 hover:bg-white/10"
              >
                Shopier&apos;den Al
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
