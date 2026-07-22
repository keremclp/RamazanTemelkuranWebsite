import { Images } from "lucide-react";
import type { ResolvedHeroSlide } from "@/lib/types/database";
import ResilientImage from "@/components/public/ResilientImage";
import UploadedImageSlideVisual from "@/components/public/hero-slides/UploadedImageSlideVisual";
import {
  DecorativeHeroBackground,
  HeroSlideCopy,
} from "@/components/public/hero-slides/HeroSlideShared";

const desktopPhotoTransforms = [
  "lg:-rotate-2 lg:-translate-y-2",
  "lg:rotate-1 lg:translate-y-2",
  "lg:rotate-2 lg:-translate-y-1",
  "lg:-rotate-1 lg:translate-y-1",
  "lg:rotate-1 lg:-translate-y-2",
  "lg:rotate-2 lg:translate-y-2",
];

function getMobileEventPosition(index: number, total: number) {
  if (total === 1) {
    return "z-30 w-56 -translate-x-1/2 -translate-y-1/2 -rotate-1 sm:w-72";
  }

  if (total === 2) {
    return index === 0
      ? "z-20 w-44 -translate-x-[95%] -translate-y-1/2 -rotate-4 sm:w-60"
      : "z-30 w-44 -translate-x-[5%] -translate-y-1/2 rotate-3 sm:w-60";
  }

  const positions = [
    "z-30 w-52 -translate-x-1/2 -translate-y-1/2 -rotate-1 sm:w-72",
    "z-20 w-40 -translate-x-[105%] -translate-y-[48%] -rotate-5 sm:w-52",
    "z-20 w-40 translate-x-[5%] -translate-y-[48%] rotate-5 sm:w-52",
  ];

  return positions[index] ?? "hidden";
}

export default function EventCollectionSlideVisual({
  slide,
  priority,
}: {
  slide: ResolvedHeroSlide;
  priority: boolean;
}) {
  const events = slide.selected_events
    .filter((event) => Boolean(event.cover_image_url))
    .slice(0, 6);

  if (events.length === 0) {
    return <UploadedImageSlideVisual slide={slide} priority={priority} />;
  }

  const desktopLayout =
    events.length <= 3
      ? "lg:flex lg:justify-center lg:gap-6"
      : "lg:grid lg:grid-cols-3 lg:gap-x-4 lg:gap-y-3";

  return (
    <div className="relative min-h-[85vh] w-full overflow-hidden bg-hero-sage">
      <DecorativeHeroBackground variant="events" />
      <div className="absolute inset-0 bg-gradient-to-r from-hero-sage/95 via-hero-sage/58 to-white/20" />

      <div className="relative z-10 mx-auto grid min-h-[85vh] w-full max-w-[1760px] items-center gap-5 px-12 pb-24 pt-8 sm:gap-7 sm:px-16 sm:pt-10 lg:grid-cols-[minmax(260px,0.6fr)_minmax(0,1.4fr)] lg:gap-7 lg:px-16 lg:pb-20 lg:pt-6 xl:grid-cols-[minmax(300px,0.55fr)_minmax(0,1.45fr)] xl:px-20">
        <div className="order-2 lg:order-1">
          <HeroSlideCopy slide={slide} compact tone="light" />
        </div>

        <div
          className={`relative order-1 mx-auto h-52 w-full max-w-lg sm:h-64 lg:order-2 lg:mx-0 lg:h-auto lg:max-w-none lg:items-center lg:justify-items-center ${desktopLayout}`}
          aria-label="Seçilen etkinlik görselleri"
        >
          {events.map((event, index) => (
            <figure
              key={event.id}
              className={`absolute left-1/2 top-1/2 aspect-[4/3] shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-surface shadow-[0_22px_56px_rgba(44,44,44,0.18)] ring-1 ring-primary/10 transition-transform duration-300 lg:static lg:left-auto lg:top-auto lg:z-auto lg:block lg:aspect-square lg:w-[clamp(12rem,17vw,20rem)] lg:translate-x-0 lg:translate-y-0 ${
                index >= 3 ? "hidden lg:block" : ""
              } ${getMobileEventPosition(index, events.length)} ${desktopPhotoTransforms[index]}`}
            >
              <ResilientImage
                src={event.cover_image_url!}
                alt={`${event.title} etkinlik görseli`}
                fallback={
                  <div className="flex h-full w-full items-center justify-center bg-hero-sage">
                    <Images size={28} className="text-accent/55" />
                  </div>
                }
                fill
                className="object-contain"
                loading={priority && index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 640px) 224px, (max-width: 1024px) 288px, (max-width: 1536px) 17vw, 320px"
              />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
