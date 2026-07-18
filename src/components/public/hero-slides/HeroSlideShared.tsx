import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ResolvedHeroSlide } from "@/lib/types/database";

export function HeroSlideCopy({
  slide,
  compact = false,
}: {
  slide: ResolvedHeroSlide;
  compact?: boolean;
}) {
  const opensNewTab =
    slide.cta_type === "shopier" || slide.cta_type === "external";

  return (
    <div className={compact ? "max-w-xl space-y-4" : "max-w-2xl space-y-6"}>
      {slide.title && (
        <h1
          className={`max-w-full break-words font-bold leading-tight text-white ${
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
          className={`max-w-full break-words leading-relaxed text-white/75 ${
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
            className="group inline-flex max-w-full items-center gap-2 break-words rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white no-underline transition hover:bg-accent-dark sm:px-6 sm:py-3 sm:text-base"
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

export function DecorativeHeroBackground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(circle at 82% 22%, rgba(197, 165, 90, 0.2) 0%, transparent 34%), radial-gradient(circle at 18% 82%, rgba(197, 165, 90, 0.14) 0%, transparent 38%), linear-gradient(135deg, #171b28 0%, #262d3f 100%)",
      }}
      aria-hidden="true"
    />
  );
}
