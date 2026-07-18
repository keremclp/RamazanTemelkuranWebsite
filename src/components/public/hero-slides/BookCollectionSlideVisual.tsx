import { BookOpen } from "lucide-react";
import type { ResolvedHeroSlide } from "@/lib/types/database";
import ResilientImage from "@/components/public/ResilientImage";
import UploadedImageSlideVisual from "@/components/public/hero-slides/UploadedImageSlideVisual";
import {
  DecorativeHeroBackground,
  HeroSlideCopy,
} from "@/components/public/hero-slides/HeroSlideShared";

const desktopCoverTransforms = [
  "lg:-rotate-3 lg:-translate-y-2",
  "lg:rotate-1 lg:translate-y-2",
  "lg:rotate-3 lg:-translate-y-1",
  "lg:-rotate-2 lg:translate-y-1",
  "lg:rotate-1 lg:-translate-y-2",
  "lg:rotate-2 lg:translate-y-2",
];

function getMobileBookPosition(index: number, total: number) {
  if (total === 1) {
    return "z-30 w-32 -translate-x-1/2 -translate-y-1/2 -rotate-1 sm:w-40";
  }

  if (total === 2) {
    return index === 0
      ? "z-20 w-28 -translate-x-[105%] -translate-y-1/2 -rotate-4 sm:w-36"
      : "z-30 w-28 translate-x-[5%] -translate-y-1/2 rotate-3 sm:w-36";
  }

  const positions = [
    "z-30 w-28 -translate-x-1/2 -translate-y-1/2 -rotate-1 sm:w-36",
    "z-20 w-24 -translate-x-[110%] -translate-y-[47%] -rotate-5 sm:w-28",
    "z-20 w-24 translate-x-[10%] -translate-y-[47%] rotate-5 sm:w-28",
  ];

  return positions[index] ?? "hidden";
}

export default function BookCollectionSlideVisual({
  slide,
  priority,
}: {
  slide: ResolvedHeroSlide;
  priority: boolean;
}) {
  const books = slide.selected_books
    .filter((book) => Boolean(book.cover_image_url))
    .slice(0, 6);

  if (books.length === 0) {
    return <UploadedImageSlideVisual slide={slide} priority={priority} />;
  }

  const desktopLayout =
    books.length <= 3
      ? "lg:flex lg:justify-center lg:gap-7"
      : "lg:grid lg:grid-cols-3 lg:gap-x-6 lg:gap-y-4";

  return (
    <div className="relative min-h-[85vh] w-full overflow-hidden bg-primary">
      <DecorativeHeroBackground />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/45 to-primary/20" />

      <div className="relative z-10 mx-auto grid min-h-[85vh] w-full max-w-[1600px] items-center gap-5 px-12 pb-24 pt-8 sm:gap-7 sm:px-16 sm:pt-10 lg:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)] lg:gap-8 lg:px-20 lg:py-16 xl:grid-cols-[minmax(340px,0.68fr)_minmax(680px,1.32fr)] xl:px-24">
        <div className="order-2 lg:order-1">
          <HeroSlideCopy slide={slide} compact />
        </div>

        <div
          className={`relative order-1 mx-auto h-56 w-full max-w-md sm:h-64 lg:order-2 lg:mx-0 lg:h-auto lg:max-w-none lg:items-center lg:justify-items-center ${desktopLayout}`}
          aria-label="Seçilen kitap kapakları"
        >
          {books.map((book, index) => (
            <figure
              key={book.id}
              className={`absolute left-1/2 top-1/2 aspect-[2/3] shrink-0 overflow-hidden rounded-xl border border-white/30 bg-primary-light shadow-2xl transition-transform duration-300 lg:static lg:left-auto lg:top-auto lg:z-auto lg:block lg:w-[clamp(8.5rem,11vw,12.5rem)] lg:translate-x-0 lg:translate-y-0 ${
                index >= 3 ? "hidden lg:block" : ""
              } ${getMobileBookPosition(index, books.length)} ${desktopCoverTransforms[index]}`}
            >
              <ResilientImage
                src={book.cover_image_url!}
                alt={`${book.title} kitap kapağı`}
                fallback={
                  <div className="flex h-full w-full items-center justify-center bg-primary-light">
                    <BookOpen size={28} className="text-accent/55" />
                  </div>
                }
                fill
                className="object-cover"
                loading={priority && index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, (max-width: 1536px) 11vw, 200px"
              />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
