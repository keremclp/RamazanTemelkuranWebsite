"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import type { ResolvedHeroSlide } from "@/lib/types/database";
import UploadedImageSlideVisual from "@/components/public/hero-slides/UploadedImageSlideVisual";
import BookCollectionSlideVisual from "@/components/public/hero-slides/BookCollectionSlideVisual";
import EventCollectionSlideVisual from "@/components/public/hero-slides/EventCollectionSlideVisual";
import ShopierBookSlideVisual from "@/components/public/hero-slides/ShopierBookSlideVisual";

interface HeroSliderProps {
  slides: ResolvedHeroSlide[];
}

const autoplayDelay = 6000;
const swipeThreshold = 50;

export default function HeroSlider({ slides }: HeroSliderProps) {
  const total = slides.length;
  const [current, setCurrent] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (total <= 1) return;
      setCurrent((index + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const previous = useCallback(() => goTo(current - 1), [current, goTo]);

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

  const autoplayRunning =
    total > 1 &&
    !autoplayPaused &&
    !prefersReducedMotion &&
    pageVisible;

  useEffect(() => {
    if (!autoplayRunning) return;
    const timer = window.setTimeout(next, autoplayDelay);
    return () => window.clearTimeout(timer);
  }, [autoplayRunning, next]);

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;

    if (startX === null || endX === undefined) return;
    const distance = endX - startX;
    if (Math.abs(distance) < swipeThreshold) return;
    if (distance < 0) next();
    else previous();
  }

  if (total === 0) return null;

  const activeSlide = slides[current] ?? slides[0];

  return (
    <section
      className="relative min-h-[85vh] touch-pan-y overflow-hidden bg-primary"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Öne çıkan içerikler"
    >
      <div
        key={activeSlide.id}
        className={`relative w-full ${
          prefersReducedMotion ? "" : "animate-fade-in"
        }`}
        aria-roledescription="slide"
        aria-label={`${current + 1} / ${total}`}
      >
        {activeSlide.visual_source === "selected_books" ? (
          activeSlide.cta_type === "shopier" ? (
            <ShopierBookSlideVisual
              slide={activeSlide}
              priority={current === 0}
            />
          ) : (
            <BookCollectionSlideVisual
              slide={activeSlide}
              priority={current === 0}
            />
          )
        ) : activeSlide.visual_source === "selected_events" ? (
          <EventCollectionSlideVisual
            slide={activeSlide}
            priority={current === 0}
          />
        ) : (
          <UploadedImageSlideVisual
            slide={activeSlide}
            priority={current === 0}
          />
        )}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={previous}
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 sm:left-5 sm:h-12 sm:w-12"
            aria-label="Önceki slayt"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 sm:right-5 sm:h-12 sm:w-12"
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
                className={`h-2.5 cursor-pointer rounded-full transition-all duration-300 ${
                  index === current
                    ? "w-8 bg-accent"
                    : "w-2.5 bg-white/45 hover:bg-white/75"
                }`}
                aria-label={`Slayt ${index + 1}: ${slide.title || "Tanıtım"}`}
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
        {current + 1}. slayt: {activeSlide.title || "Öne çıkan içerik"}
      </p>
    </section>
  );
}
