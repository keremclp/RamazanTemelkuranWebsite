"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import {
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Images,
  MapPin,
  Pause,
  Play,
} from "lucide-react";
import type { EventWithMedia } from "@/lib/types/database";
import { wrapCarouselIndex } from "@/lib/carousel";
import {
  getEventCoverImageUrl,
  getEventCoverMedia,
} from "@/lib/event-gallery";
import { formatDate, truncate } from "@/lib/utils/helpers";
import EventMediaDialog from "./EventMediaDialog";
import ResilientImage from "./ResilientImage";

interface EventGallerySliderProps {
  events: EventWithMedia[];
}

const autoplayDelay = 6000;
const transitionFallbackDelay = 850;
const swipeThreshold = 50;

export default function EventGallerySlider({
  events,
}: EventGallerySliderProps) {
  const total = events.length;
  const [current, setCurrent] = useState(0);
  const [trackPosition, setTrackPosition] = useState(total > 1 ? 1 : 0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventWithMedia | null>(
    null
  );
  const touchStartX = useRef<number | null>(null);

  const trackEvents = useMemo(() => {
    if (total <= 1) return events;
    return [events[total - 1], ...events, events[0]];
  }, [events, total]);

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

  const jumpWithoutMotion = useCallback(
    (index: number) => {
      const normalized = wrapCarouselIndex(index, total);
      setTransitionEnabled(false);
      setCurrent(normalized);
      setTrackPosition(total > 1 ? normalized + 1 : 0);
      requestAnimationFrame(() => setTransitionEnabled(true));
    },
    [total]
  );

  const move = useCallback(
    (step: -1 | 1) => {
      if (total <= 1 || isTransitioning || selectedEvent) return;
      const nextIndex = wrapCarouselIndex(current + step, total);

      if (prefersReducedMotion) {
        jumpWithoutMotion(nextIndex);
        return;
      }

      setTransitionEnabled(true);
      setIsTransitioning(true);
      setCurrent(nextIndex);
      setTrackPosition((position) => position + step);
    },
    [
      current,
      isTransitioning,
      jumpWithoutMotion,
      prefersReducedMotion,
      selectedEvent,
      total,
    ]
  );

  const next = useCallback(() => move(1), [move]);
  const previous = useCallback(() => move(-1), [move]);

  const goTo = useCallback(
    (index: number) => {
      if (total <= 1 || isTransitioning || selectedEvent) return;
      const normalized = wrapCarouselIndex(index, total);
      if (normalized === current) return;

      if (prefersReducedMotion) {
        jumpWithoutMotion(normalized);
        return;
      }

      setTransitionEnabled(true);
      setIsTransitioning(true);
      setCurrent(normalized);
      setTrackPosition(normalized + 1);
    },
    [
      current,
      isTransitioning,
      jumpWithoutMotion,
      prefersReducedMotion,
      selectedEvent,
      total,
    ]
  );

  const finishTransition = useCallback(() => {
    if (trackPosition === 0 || trackPosition === total + 1) {
      const normalizedPosition = trackPosition === 0 ? total : 1;
      setTransitionEnabled(false);
      setTrackPosition(normalizedPosition);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
          setIsTransitioning(false);
        });
      });
      return;
    }
    setIsTransitioning(false);
  }, [total, trackPosition]);

  useEffect(() => {
    if (!isTransitioning) return;
    const fallback = window.setTimeout(
      finishTransition,
      transitionFallbackDelay
    );
    return () => window.clearTimeout(fallback);
  }, [finishTransition, isTransitioning]);

  const autoplayRunning =
    total > 1 &&
    !autoplayPaused &&
    !prefersReducedMotion &&
    pageVisible &&
    !isTransitioning &&
    !selectedEvent;

  useEffect(() => {
    if (!autoplayRunning) return;
    const timer = window.setTimeout(next, autoplayDelay);
    return () => window.clearTimeout(timer);
  }, [autoplayRunning, next]);

  function handleTransitionEnd(transitionEvent: TransitionEvent<HTMLDivElement>) {
    if (transitionEvent.target !== transitionEvent.currentTarget) return;
    finishTransition();
  }

  function handleTouchStart(touchEvent: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = touchEvent.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(touchEvent: React.TouchEvent<HTMLDivElement>) {
    const startX = touchStartX.current;
    const endX = touchEvent.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (startX === null || endX === undefined) return;

    const distance = endX - startX;
    if (Math.abs(distance) < swipeThreshold) return;
    if (distance < 0) next();
    else previous();
  }

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface py-16 text-center shadow-[var(--shadow-card)]">
        <Images className="mx-auto mb-4 h-12 w-12 text-muted/40" />
        <p className="text-lg text-muted">Henüz galeri etkinliği bulunmamaktadır.</p>
      </div>
    );
  }

  const activeEvent = events[current] ?? events[0];

  return (
    <>
      <section
        className="relative overflow-hidden rounded-3xl bg-primary shadow-[var(--shadow-card-hover)]"
        aria-roledescription="carousel"
        aria-label="Etkinlik galerileri"
      >
        <div
          className="overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`flex ${
              transitionEnabled
                ? "transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
                : ""
            }`}
            style={{ transform: `translateX(-${trackPosition * 100}%)` }}
            onTransitionEnd={handleTransitionEnd}
          >
            {trackEvents.map((event, index) => {
              const position =
                total > 1 ? wrapCarouselIndex(index - 1, total) : 0;
              return (
                <EventSlide
                  key={`${event.id}-${index}`}
                  event={event}
                  isActive={index === trackPosition}
                  position={position}
                  total={total}
                  priority={index === 1 || total === 1}
                  onOpen={() => setSelectedEvent(event)}
                />
              );
            })}
          </div>
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              disabled={isTransitioning || Boolean(selectedEvent)}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 disabled:cursor-wait disabled:opacity-50 sm:left-5 sm:h-12 sm:w-12"
              aria-label="Önceki etkinlik"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={isTransitioning || Boolean(selectedEvent)}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 disabled:cursor-wait disabled:opacity-50 sm:right-5 sm:h-12 sm:w-12"
              aria-label="Sonraki etkinlik"
            >
              <ChevronRight size={22} />
            </button>

            <div
              className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm sm:bottom-7"
              aria-label="Etkinlik seçimi"
            >
              {events.map((event, index) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => goTo(index)}
                  disabled={isTransitioning || Boolean(selectedEvent)}
                  className={`h-2.5 cursor-pointer rounded-full transition-all duration-300 disabled:cursor-wait ${
                    index === current
                      ? "w-8 bg-accent"
                      : "w-2.5 bg-white/45 hover:bg-white/75"
                  }`}
                  aria-label={`Etkinlik ${index + 1}: ${event.title}`}
                  aria-current={index === current ? "true" : undefined}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAutoplayPaused((paused) => !paused)}
              disabled={prefersReducedMotion}
              className="absolute bottom-5 right-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 disabled:cursor-not-allowed disabled:opacity-50 sm:bottom-7 sm:right-6"
              aria-label={
                prefersReducedMotion
                  ? "Cihaz hareket tercihi nedeniyle otomatik oynatma kapalı"
                  : autoplayPaused
                    ? "Etkinlik slaytlarını oynat"
                    : "Etkinlik slaytlarını duraklat"
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
          {current + 1}. etkinlik: {activeEvent.title}
        </p>
      </section>

      {selectedEvent && (
        <EventMediaDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
}

function EventSlide({
  event,
  isActive,
  position,
  total,
  priority,
  onOpen,
}: {
  event: EventWithMedia;
  isActive: boolean;
  position: number;
  total: number;
  priority: boolean;
  onOpen: () => void;
}) {
  const coverMedia = getEventCoverMedia(event);
  const coverUrl = getEventCoverImageUrl(coverMedia);

  return (
    <article
      className="relative min-h-[620px] w-full shrink-0 overflow-hidden"
      aria-roledescription="slide"
      aria-label={`${position + 1} / ${total}`}
      aria-hidden={!isActive}
    >
      {coverUrl ? (
        <ResilientImage
          src={coverUrl}
          alt={`${event.title} etkinlik kapak görseli`}
          fallback={<EventCoverFallback />}
          fill
          className="object-cover"
          loading={priority ? "eager" : "lazy"}
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
      ) : (
        <EventCoverFallback />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      <div className="relative flex min-h-[620px] items-center px-14 pb-24 pt-16 sm:px-20 lg:px-24">
        <div className="max-w-2xl space-y-5 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">
            Etkinliklerimiz
          </p>
          <h2 className="break-words text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {event.title}
          </h2>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75 sm:text-base">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={17} className="text-accent" />
              {formatDate(event.event_date)}
            </span>
            {event.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin size={17} className="text-accent" />
                {event.location}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Camera size={17} className="text-accent" />
              {event.media.length} medya
            </span>
          </div>
          {event.description && (
            <p className="max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              {truncate(event.description, 280)}
            </p>
          )}
          <button
            type="button"
            onClick={onOpen}
            disabled={event.media.length === 0}
            tabIndex={isActive ? 0 : -1}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Images size={18} />
            {event.media.length > 0
              ? "Etkinlik Galerisini Aç"
              : "Henüz Medya Yok"}
          </button>
        </div>
      </div>
    </article>
  );
}

function EventCoverFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_30%,rgba(197,165,90,0.25),transparent_35%),linear-gradient(135deg,#152238,#243550)]">
      <Images size={96} className="text-white/10" />
    </div>
  );
}
