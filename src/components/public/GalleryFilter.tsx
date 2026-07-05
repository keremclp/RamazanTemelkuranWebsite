"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Play } from "lucide-react";
import type { EventWithMedia, Media } from "@/lib/types/database";
import { cn, getYouTubeThumbnail, extractYouTubeId } from "@/lib/utils/helpers";
import Lightbox from "./Lightbox";

interface GalleryFilterProps {
  events: EventWithMedia[];
}

type FilterType = "Tümü" | "Fotoğraflar" | "Videolar";

export default function GalleryFilter({ events }: GalleryFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Tümü");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxMedia, setLightboxMedia] = useState<Media[]>([]);

  const filters: FilterType[] = ["Tümü", "Fotoğraflar", "Videolar"];

  const filteredEvents = events
    .map((event) => ({
      ...event,
      media: event.media.filter((m) => {
        if (activeFilter === "Fotoğraflar") return m.type === "photo";
        if (activeFilter === "Videolar") return m.type === "video";
        return true;
      }),
    }))
    .filter((event) => event.media.length > 0);

  const openLightbox = (eventMedia: Media[], index: number) => {
    const photos = eventMedia.filter((m) => m.type === "photo");
    const photoIndex = photos.findIndex(
      (p) => p.id === eventMedia[index].id
    );
    if (photoIndex >= 0) {
      setLightboxMedia(photos);
      setLightboxIndex(photoIndex);
      setLightboxOpen(true);
    }
  };

  const handleVideoClick = (url: string) => {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
    }
  };

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all duration-[var(--transition-base)]",
              activeFilter === filter
                ? "bg-accent text-white shadow-md"
                : "bg-surface text-muted border border-border hover:border-accent hover:text-accent"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Events & Media */}
      {filteredEvents.map((event) => (
        <section key={event.id} className="mb-16 last:mb-0">
          <h3 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-primary mb-6 flex items-center gap-3">
            <span className="w-8 h-0.5 bg-accent"></span>
            {event.title}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {event.media.map((media, index) => (
              <div
                key={media.id}
                className={cn(
                  "group relative aspect-square rounded-[var(--radius-lg)] overflow-hidden cursor-pointer",
                  "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
                  "hover:-translate-y-0.5 transition-all duration-300"
                )}
                onClick={() =>
                  media.type === "photo"
                    ? openLightbox(event.media, index)
                    : handleVideoClick(media.url)
                }
              >
                {media.type === "photo" ? (
                  media.url ? (
                    <Image
                      src={media.url}
                      alt={media.caption || "Fotoğraf"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center">
                      <Camera className="w-10 h-10 text-accent/50" />
                    </div>
                  )
                ) : (
                  <>
                    {/* Video thumbnail */}
                    {getYouTubeThumbnail(media.url) ? (
                      <Image
                        src={getYouTubeThumbnail(media.url)!}
                        alt={media.caption || "Video"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
                        <Play className="w-10 h-10 text-white/60" />
                      </div>
                    )}
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-primary ml-1" />
                      </div>
                    </div>
                  </>
                )}

                {/* Caption overlay */}
                {media.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm truncate">{media.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-16">
          <Camera className="w-12 h-12 text-muted/40 mx-auto mb-4" />
          <p className="text-muted text-lg">
            Bu kategoride henüz içerik bulunmamaktadır.
          </p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          media={lightboxMedia}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
