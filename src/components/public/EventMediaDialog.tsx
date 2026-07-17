"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Camera, MapPin, Play, X } from "lucide-react";
import type { EventWithMedia, Media } from "@/lib/types/database";
import {
  extractYouTubeId,
  formatDate,
  getYouTubeThumbnail,
} from "@/lib/utils/helpers";
import Lightbox from "./Lightbox";
import ResilientImage from "./ResilientImage";

interface EventMediaDialogProps {
  event: EventWithMedia;
  onClose: () => void;
}

export default function EventMediaDialog({
  event,
  onClose,
}: EventMediaDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lightboxOpenRef = useRef(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const photos = useMemo(
    () => event.media.filter((media) => media.type === "photo"),
    [event.media]
  );

  useEffect(() => {
    lightboxOpenRef.current = lightboxIndex !== null;
  }, [lightboxIndex]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (lightboxOpenRef.current) return;

      if (keyboardEvent.key === "Escape") {
        keyboardEvent.preventDefault();
        onClose();
        return;
      }

      if (keyboardEvent.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (keyboardEvent.shiftKey && document.activeElement === first) {
        keyboardEvent.preventDefault();
        last.focus();
      } else if (!keyboardEvent.shiftKey && document.activeElement === last) {
        keyboardEvent.preventDefault();
        first.focus();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  function openPhoto(media: Media) {
    const photoIndex = photos.findIndex((photo) => photo.id === media.id);
    if (photoIndex >= 0) setLightboxIndex(photoIndex);
  }

  return (
    <>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`event-dialog-title-${event.id}`}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6"
        onMouseDown={(mouseEvent) => {
          if (mouseEvent.target === mouseEvent.currentTarget) onClose();
        }}
      >
        <div className="mx-auto my-4 max-w-6xl overflow-hidden rounded-3xl bg-surface shadow-2xl sm:my-8">
          <header className="relative border-b border-border bg-primary px-6 py-7 pr-16 text-white sm:px-8">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Etkinlik galerisini kapat"
            >
              <X size={20} />
            </button>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Etkinlik galerisi
            </p>
            <h2
              id={`event-dialog-title-${event.id}`}
              className="text-2xl font-bold text-white sm:text-3xl"
            >
              {event.title}
            </h2>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} className="text-accent" />
                {formatDate(event.event_date)}
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} className="text-accent" />
                  {event.location}
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Camera size={16} className="text-accent" />
                {event.media.length} medya
              </span>
            </div>
          </header>

          <div className="p-5 sm:p-8">
            {event.description && (
              <p className="mb-7 max-w-4xl whitespace-pre-line leading-relaxed text-muted">
                {event.description}
              </p>
            )}

            {event.media.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-14 text-center">
                <Camera className="mx-auto mb-3 text-muted/40" size={38} />
                <p className="text-muted">
                  Bu etkinlik için henüz medya eklenmemiştir.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {event.media.map((media) => {
                  const videoId =
                    media.type === "video" ? extractYouTubeId(media.url) : null;
                  const thumbnail =
                    media.type === "video"
                      ? media.thumbnail_url || getYouTubeThumbnail(media.url)
                      : media.url;
                  const label = media.caption || event.title;
                  const cardClassName =
                    "group relative block aspect-video overflow-hidden rounded-2xl bg-primary/10 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]";

                  const content = (
                    <>
                      {thumbnail ? (
                        <ResilientImage
                          src={thumbnail}
                          alt={
                            media.type === "photo"
                              ? label
                              : `${label} video küçük resmi`
                          }
                          fallback={
                            <MediaFallback type={media.type} />
                          }
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <MediaFallback type={media.type} />
                      )}
                      {media.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/35">
                          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg">
                            <Play size={24} fill="currentColor" className="ml-1" />
                          </span>
                        </div>
                      )}
                      {media.caption && (
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 text-sm text-white">
                          {media.caption}
                        </span>
                      )}
                    </>
                  );

                  if (media.type === "photo") {
                    return (
                      <button
                        key={media.id}
                        type="button"
                        onClick={() => openPhoto(media)}
                        className={cardClassName}
                        aria-label={`${label} fotoğrafını büyüt`}
                      >
                        {content}
                      </button>
                    );
                  }

                  return videoId ? (
                    <a
                      key={media.id}
                      href={`https://www.youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClassName}
                      aria-label={`${label} videosunu YouTube'da aç`}
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={media.id} className={cardClassName}>
                      {content}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          media={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}

function MediaFallback({ type }: { type: Media["type"] }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/15 text-muted/50">
      {type === "photo" ? <Camera size={38} /> : <Play size={38} />}
    </div>
  );
}
