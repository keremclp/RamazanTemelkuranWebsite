import type { ResolvedHeroSlide } from "@/lib/types/database";
import ResilientImage from "@/components/public/ResilientImage";
import {
  DecorativeHeroBackground,
  HeroSlideCopy,
} from "@/components/public/hero-slides/HeroSlideShared";

export default function UploadedImageSlideVisual({
  slide,
  priority,
}: {
  slide: ResolvedHeroSlide;
  priority: boolean;
}) {
  return (
    <div className="relative flex min-h-[85vh] w-full items-center overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        {slide.image_url ? (
          <ResilientImage
            src={slide.image_url}
            alt=""
            fallback={<DecorativeHeroBackground />}
            fill
            className="object-cover"
            loading={priority ? "eager" : "lazy"}
            sizes="100vw"
          />
        ) : (
          <DecorativeHeroBackground />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/65 to-primary/35" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-14 py-24 sm:px-20 lg:px-24">
        <HeroSlideCopy slide={slide} />
      </div>
    </div>
  );
}
