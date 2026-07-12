"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ResolvedHeroSlide } from "@/lib/types/database";

interface HeroSliderProps {
  slides: ResolvedHeroSlide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, isPaused, total]);

  if (total === 0) return null;

  return (
    <section
      className="relative min-h-[85vh] flex items-center overflow-hidden bg-primary"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: index === current ? 1 : 0, zIndex: index === current ? 1 : 0 }}
          aria-hidden={index !== current}
        >
          {/* Background Image or Gradient Fallback */}
          {slide.image_url ? (
            <Image
              src={slide.image_url}
              alt={slide.title || ""}
              fill
              className="object-cover"
              priority={index === 0}
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

          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-primary/60" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="transition-all duration-700 ease-in-out"
            style={{
              opacity: index === current ? 1 : 0,
              transform: index === current ? "translateY(0)" : "translateY(20px)",
              position: index === current ? "relative" : "absolute",
              pointerEvents: index === current ? "auto" : "none",
            }}
            aria-hidden={index !== current}
          >
            <div className="max-w-2xl space-y-6">
              {slide.title && (
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  {slide.title}
                </h1>
              )}
              {slide.subtitle && (
                <p className="text-lg sm:text-xl text-white/70 leading-relaxed">
                  {slide.subtitle}
                </p>
              )}
              {slide.cta_text && slide.cta_href && (
                <div>
                  <Link
                    href={slide.cta_href}
                    target={
                      slide.cta_type === "shopier" ||
                      slide.cta_type === "external"
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      slide.cta_type === "shopier" ||
                      slide.cta_type === "external"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-dark transition-all duration-200 no-underline group"
                  >
                    {slide.cta_text}
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
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
            />
          ))}
        </div>
      )}
    </section>
  );
}
