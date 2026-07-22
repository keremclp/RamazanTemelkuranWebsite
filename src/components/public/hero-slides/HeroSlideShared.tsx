import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ResolvedHeroSlide } from "@/lib/types/database";

export function HeroSlideCopy({
  slide,
  compact = false,
  tone = "dark",
}: {
  slide: ResolvedHeroSlide;
  compact?: boolean;
  tone?: "dark" | "light";
}) {
  const opensNewTab =
    slide.cta_type === "shopier" || slide.cta_type === "external";
  const titleClassName = tone === "light" ? "text-hero-ink" : "text-white";
  const subtitleClassName =
    tone === "light" ? "text-hero-muted" : "text-white/75";

  return (
    <div className={compact ? "max-w-xl space-y-4" : "max-w-2xl space-y-6"}>
      {slide.title && (
        <h1
          className={`max-w-full break-words font-bold leading-tight ${titleClassName} ${
            compact
              ? "text-3xl sm:text-4xl lg:text-5xl"
              : "text-4xl sm:text-5xl lg:text-6xl"
          }`}
        >
          {slide.title}
        </h1>
      )}
      {slide.subtitle && (
        <p
          className={`max-w-full break-words leading-relaxed ${subtitleClassName} ${
            compact
              ? "line-clamp-3 text-base sm:text-lg"
              : "text-lg sm:text-xl"
          }`}
        >
          {slide.subtitle}
        </p>
      )}
      {slide.cta_text && slide.cta_href && (
        <div className="pt-1">
          <Link
            href={slide.cta_href}
            target={opensNewTab ? "_blank" : undefined}
            rel={opensNewTab ? "noopener noreferrer" : undefined}
            className="group inline-flex max-w-full items-center gap-2 break-words rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white no-underline shadow-[0_10px_24px_rgba(166,138,62,0.22)] transition hover:bg-accent-dark sm:px-6 sm:py-3 sm:text-base"
          >
            {slide.cta_text}
            <ChevronRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      )}
    </div>
  );
}

export function DecorativeHeroBackground({
  variant = "dark",
}: {
  variant?: "dark" | "books" | "events" | "shopier";
}) {
  const backgroundImage =
    variant === "books"
      ? "radial-gradient(circle at 78% 22%, rgba(197, 165, 90, 0.24) 0%, transparent 34%), radial-gradient(circle at 18% 82%, rgba(166, 138, 62, 0.12) 0%, transparent 38%), linear-gradient(135deg, #fbf7ef 0%, #f0e6d8 100%)"
      : variant === "events"
        ? "radial-gradient(circle at 76% 24%, rgba(122, 145, 112, 0.22) 0%, transparent 34%), radial-gradient(circle at 18% 82%, rgba(197, 165, 90, 0.12) 0%, transparent 38%), linear-gradient(135deg, #f7f3eb 0%, #e9eee2 100%)"
        : variant === "shopier"
          ? "radial-gradient(circle at 80% 20%, rgba(197, 165, 90, 0.28) 0%, transparent 34%), radial-gradient(circle at 20% 82%, rgba(120, 83, 48, 0.12) 0%, transparent 38%), linear-gradient(135deg, #fbf3e2 0%, #efe0c4 100%)"
          : "radial-gradient(circle at 82% 22%, rgba(197, 165, 90, 0.2) 0%, transparent 34%), radial-gradient(circle at 18% 82%, rgba(197, 165, 90, 0.14) 0%, transparent 38%), linear-gradient(135deg, #171b28 0%, #262d3f 100%)";

  return (
    <div
      className="absolute inset-0"
      style={{ backgroundImage }}
      aria-hidden="true"
    />
  );
}
