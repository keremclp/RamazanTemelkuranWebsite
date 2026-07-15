"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ResolvedHeroSlide } from "@/lib/types/database";
import ResilientImage from "./ResilientImage";

interface HeroSliderProps {
  slides: ResolvedHeroSlide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (isPaused || prefersReducedMotion || total <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, isPaused, prefersReducedMotion, total]);

  if (total === 0) return null;
  const activeSlide = slides[current] ?? slides[0];

  return (
    <section
      className="relative min-h-[85vh] flex items-center overflow-hidden bg-primary"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
      aria-roledescription="carousel"
      aria-label="Öne çıkan içerikler"
    >
      <div key={activeSlide.id} className="absolute inset-0 animate-fade-in">
        {activeSlide.image_url ? (
          <ResilientImage
            src={activeSlide.image_url}
            alt=""
            fallback={<div className="absolute inset-0 bg-primary" />}
            fill
            className="object-cover"
            priority={current === 0}
            sizes="100vw"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(197, 165, 90, 0.3) 0%, transparent 50%),
                                radial-gradient(circle at 75% 75%, rgba(197, 165, 90, 0.2) 0%, transparent 50%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-primary/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div key={activeSlide.id} className="animate-fade-in-up">
            <div className="max-w-2xl space-y-6">
              {activeSlide.title && (
                <h1 className="max-w-full break-words text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                  {activeSlide.title}
                </h1>
              )}
              {activeSlide.subtitle && (
                <p className="max-w-full break-words text-lg leading-relaxed text-white/70 sm:text-xl">
                  {activeSlide.subtitle}
                </p>
              )}
              {activeSlide.cta_text && activeSlide.cta_href && (
                <div>
                  <Link
                    href={activeSlide.cta_href}
                    target={
                      activeSlide.cta_type === "shopier" ||
                      activeSlide.cta_type === "external"
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      activeSlide.cta_type === "shopier" ||
                      activeSlide.cta_type === "external"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="inline-flex max-w-full items-center gap-2 break-words rounded-lg bg-accent px-6 py-3 font-medium text-white no-underline transition-all duration-200 hover:bg-accent-dark group"
                  >
                    {activeSlide.cta_text}
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200 cursor-pointer"
            aria-label="Önceki slayt"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200 cursor-pointer"
            aria-label="Sonraki slayt"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {total > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === current
                  ? "bg-accent w-8"
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Slayt ${index + 1}`}
              aria-current={index === current ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
