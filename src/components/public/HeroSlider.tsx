"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
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
  const opensNewTab =
    activeSlide.cta_type === "shopier" ||
    activeSlide.cta_type === "external";

  return (
    <section
      className="relative flex min-h-[85vh] touch-pan-y items-center overflow-hidden bg-primary"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Öne çıkan içerikler"
    >
      <div
        key={activeSlide.id}
        className={`absolute inset-0 ${
          prefersReducedMotion ? "" : "animate-fade-in"
        }`}
        aria-hidden="true"
      >
        {activeSlide.image_url ? (
          <ResilientImage
            src={activeSlide.image_url}
            alt=""
            fallback={<div className="absolute inset-0 bg-primary" />}
            fill
            className="object-cover"
            priority={current === 0}
            loading="eager"
            sizes="100vw"
          />
        ) : (
          <DecorativeBackground />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/65 to-primary/35" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-14 py-24 sm:px-20 lg:px-24">
        <div
          key={activeSlide.id}
          className={prefersReducedMotion ? "" : "animate-fade-in-up"}
          aria-roledescription="slide"
          aria-label={`${current + 1} / ${total}`}
        >
          <div className="max-w-2xl space-y-6">
            {activeSlide.title && (
              <h1 className="max-w-full break-words text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {activeSlide.title}
              </h1>
            )}
            {activeSlide.subtitle && (
              <p className="max-w-full break-words text-lg leading-relaxed text-white/75 sm:text-xl">
                {activeSlide.subtitle}
              </p>
            )}
            {activeSlide.cta_text && activeSlide.cta_href && (
              <div className="pt-1">
                <Link
                  href={activeSlide.cta_href}
                  target={opensNewTab ? "_blank" : undefined}
                  rel={opensNewTab ? "noopener noreferrer" : undefined}
                  className="group inline-flex max-w-full items-center gap-2 break-words rounded-lg bg-accent px-6 py-3 font-medium text-white no-underline transition hover:bg-accent-dark"
                >
                  {activeSlide.cta_text}
                  <ChevronRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
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
