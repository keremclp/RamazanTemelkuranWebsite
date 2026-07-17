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
  Pause,
  Play,
} from "lucide-react";
import type { ResolvedHeroSlide } from "@/lib/types/database";
import ResilientImage from "./ResilientImage";

interface HeroSliderProps {
  slides: ResolvedHeroSlide[];
}

const autoplayDelay = 6000;

export default function HeroSlider({ slides }: HeroSliderProps) {
  const total = slides.length;
  const [current, setCurrent] = useState(0);
  const [trackPosition, setTrackPosition] = useState(total > 1 ? 1 : 0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const trackSlides = useMemo(() => {
    if (total <= 1) return slides;
    return [slides[total - 1], ...slides, slides[0]];
  }, [slides, total]);

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
      const normalized = (index + total) % total;
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

      const nextIndex = (current + step + total) % total;
      if (prefersReducedMotion) {
        jumpWithoutMotion(nextIndex);
        return;
      }

      setTransitionEnabled(true);
      setIsTransitioning(true);
      setCurrent(nextIndex);
      setTrackPosition((position) => position + step);
    }, [current, isTransitioning, jumpWithoutMotion, prefersReducedMotion, total]
  );

  const next = useCallback(() => move(1), [move]);
  const prev = useCallback(() => move(-1), [move]);

  const goTo = useCallback(
    (index: number) => {
      if (index === current || isTransitioning || total <= 1) return;

      if (prefersReducedMotion) {
        jumpWithoutMotion(index);
        return;
      }

      if (current === total - 1 && index === 0) {
        next();
        return;
      }
      if (current === 0 && index === total - 1) {
        prev();
        return;
      }

      setTransitionEnabled(true);
      setIsTransitioning(true);
      setCurrent(index);
      setTrackPosition(index + 1);
    }, [
      current,
      isTransitioning,
      jumpWithoutMotion,
      next,
      prefersReducedMotion,
      prev,
      total,
    ]
  );

  const autoplayRunning =
    total > 1 &&
    !autoplayPaused &&
    !prefersReducedMotion &&
    pageVisible &&
    !isTransitioning;

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
    if (!autoplayRunning) return;
    const timer = window.setTimeout(next, autoplayDelay);
    return () => window.clearTimeout(timer);
  }, [autoplayRunning, current, next]);

  useEffect(() => {
    if (!isTransitioning) return;
    const fallback = window.setTimeout(finishTransition, 750);
    return () => window.clearTimeout(fallback);
  }, [finishTransition, isTransitioning]);

  function handleTrackTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "transform"
    ) {
      return;
    }

    finishTransition();
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 50) return;
    if (distance < 0) next();
    else prev();
  }

  if (total === 0) return null;

  const activeSlide = slides[current] ?? slides[0];
  const activeTitle =
    activeSlide.presentation_type === "book"
      ? activeSlide.cta_book?.title
      : activeSlide.title;

  return (
    <section
      className="relative overflow-hidden bg-primary"
      aria-roledescription="carousel"
      aria-label="Öne çıkan içerikler"
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
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {trackSlides.map((slide, index) => (
            <HeroSlideView
              key={`${slide.id}-${index}`}
              slide={slide}
              isActive={index === trackPosition}
              priority={index === 1}
              position={total > 1 ? (index - 1 + total) % total : 0}
              total={total}
            />
          ))}
        </div>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            disabled={isTransitioning}
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 disabled:cursor-wait disabled:opacity-50 sm:left-5 sm:h-12 sm:w-12"
            aria-label="Önceki slayt"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={isTransitioning}
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 disabled:cursor-wait disabled:opacity-50 sm:right-5 sm:h-12 sm:w-12"
            aria-label="Sonraki slayt"
          >
            <ChevronRight size={22} />
          </button>

          <div
            className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-sm sm:bottom-7"
            aria-label="Slayt seçimi"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(index)}
                disabled={isTransitioning}
                className={`h-2.5 cursor-pointer rounded-full transition-all duration-300 disabled:cursor-wait ${
                  index === current
                    ? "w-8 bg-accent"
                    : "w-2.5 bg-white/45 hover:bg-white/75"
                }`}
                aria-label={`Slayt ${index + 1}: ${
                  slide.presentation_type === "book"
                    ? slide.cta_book?.title || "Kitap tanıtımı"
                    : slide.title || "Tanıtım görseli"
                }`}
                aria-current={index === current ? "true" : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setAutoplayPaused((paused) => !paused)}
            disabled={prefersReducedMotion}
            className="absolute bottom-5 right-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 disabled:cursor-not-allowed disabled:opacity-50 sm:bottom-7 sm:right-6"
            aria-label={
              prefersReducedMotion
                ? "Cihaz hareket tercihi nedeniyle otomatik oynatma kapalı"
                : autoplayPaused
                  ? "Otomatik oynatmayı başlat"
                  : "Otomatik oynatmayı duraklat"
            }
            title={
              prefersReducedMotion
                ? "Hareket azaltma tercihi etkin"
                : autoplayPaused
                  ? "Oynat"
                  : "Duraklat"
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
        {current + 1}. slayt: {activeTitle || "Öne çıkan içerik"}
      </p>
    </section>
  );
}

function HeroSlideView({
  slide,
  isActive,
  priority,
  position,
  total,
}: {
  slide: ResolvedHeroSlide;
  isActive: boolean;
  priority: boolean;
  position: number;
  total: number;
}) {
  const isBook = slide.presentation_type === "book" && slide.cta_book;

  return (
    <article
      className="relative min-h-[82vh] w-full shrink-0 overflow-hidden bg-primary"
      aria-roledescription="slide"
      aria-label={`${position + 1} / ${total}`}
      aria-hidden={!isActive}
    >
      {isBook ? (
        <BookShowcaseSlide slide={slide} isActive={isActive} priority={priority} />
      ) : (
        <PromotionalImageSlide
          slide={slide}
          isActive={isActive}
          priority={priority}
        />
      )}
    </article>
  );
}

function PromotionalImageSlide({
  slide,
  isActive,
  priority,
}: {
  slide: ResolvedHeroSlide;
  isActive: boolean;
  priority: boolean;
}) {
  return (
    <>
      {slide.image_url ? (
        <ResilientImage
          src={slide.image_url}
          alt=""
          fallback={<div className="absolute inset-0 bg-primary" />}
          fill
          className="object-cover"
          priority={priority}
          sizes="100vw"
        />
      ) : (
        <DecorativeBackground />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/65 to-primary/25" />

      <div className="relative z-10 mx-auto flex min-h-[82vh] w-full max-w-7xl items-center px-14 py-24 sm:px-20 lg:px-24">
        <div className="max-w-2xl space-y-6">
          {slide.title && (
            <h1 className="max-w-full break-words text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
          )}
          {slide.subtitle && (
            <p className="max-w-full break-words text-lg leading-relaxed text-white/75 sm:text-xl">
              {slide.subtitle}
            </p>
          )}
          <SlideCta slide={slide} isActive={isActive} />
        </div>
      </div>
    </>
  );
}

function BookShowcaseSlide({
  slide,
  isActive,
  priority,
}: {
  slide: ResolvedHeroSlide;
  isActive: boolean;
  priority: boolean;
}) {
  const book = slide.cta_book!;

  return (
    <>
      <DecorativeBackground />
      <div className="absolute -right-28 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full border border-accent/15 sm:h-[34rem] sm:w-[34rem]" />
      <div className="absolute -right-16 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-accent/10 sm:h-[27rem] sm:w-[27rem]" />

      <div className="relative z-10 mx-auto grid min-h-[82vh] w-full max-w-7xl items-center gap-8 px-14 py-24 sm:px-20 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:gap-16 lg:px-24">
        <div className="order-2 space-y-5 text-center lg:order-1 lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">
            Kitap vitrini
          </p>
          <h1 className="break-words text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {book.title}
          </h1>
          {book.description && (
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg lg:mx-0 lg:line-clamp-4">
              {book.description}
            </p>
          )}
          <SlideCta slide={slide} isActive={isActive} />
        </div>

        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative aspect-[2/3] w-40 overflow-hidden rounded-md bg-white/5 shadow-2xl shadow-black/40 ring-1 ring-white/15 sm:w-52 lg:w-72">
            {book.cover_image_url ? (
              <ResilientImage
                src={book.cover_image_url}
                alt={`${book.title} kitap kapağı`}
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-white/5">
                    <BookOpen size={64} className="text-accent/55" />
                  </div>
                }
                fill
                className="object-cover"
                priority={priority}
                sizes="(max-width: 640px) 160px, (max-width: 1024px) 208px, 288px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-white/5">
                <BookOpen size={64} className="text-accent/55" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SlideCta({
  slide,
  isActive,
}: {
  slide: ResolvedHeroSlide;
  isActive: boolean;
}) {
  if (!slide.cta_text || !slide.cta_href) return null;

  const opensNewTab =
    slide.cta_type === "shopier" || slide.cta_type === "external";

  return (
    <div className="pt-1">
      <Link
        href={slide.cta_href}
        target={opensNewTab ? "_blank" : undefined}
        rel={opensNewTab ? "noopener noreferrer" : undefined}
        tabIndex={isActive ? 0 : -1}
        className="group inline-flex max-w-full items-center gap-2 break-words rounded-lg bg-accent px-6 py-3 font-medium text-white no-underline transition hover:bg-accent-dark"
      >
        {slide.cta_text}
        <ChevronRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
        />
      </Link>
    </div>
  );
}

function DecorativeBackground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 15%, rgba(197, 165, 90, 0.26) 0%, transparent 38%), radial-gradient(circle at 85% 80%, rgba(197, 165, 90, 0.18) 0%, transparent 42%), linear-gradient(135deg, #171b28 0%, #262d3f 100%)",
      }}
    />
  );
}
