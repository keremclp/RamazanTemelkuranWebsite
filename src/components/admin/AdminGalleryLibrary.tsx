"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  Edit3,
  ImageIcon,
  Play,
  Trash2,
  Video,
} from "lucide-react";
import type { Event } from "@/lib/types/database";
import type { AdminGalleryMedia } from "@/app/(admin)/admin/gallery/page";
import { deleteGalleryMediaAction } from "@/app/(admin)/admin/events/actions";
import { formatDateShort, getYouTubeThumbnail } from "@/lib/utils/helpers";

interface AdminGalleryLibraryProps {
  media: AdminGalleryMedia[];
  events: Pick<Event, "id" | "title" | "event_date" | "homepage_media_id">[];
}

type TypeFilter = "all" | "photo" | "video";

const selectClassName =
  "rounded-xl border border-border bg-surface px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function AdminGalleryLibrary({
  media,
  events,
}: AdminGalleryLibraryProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [eventFilter, setEventFilter] = useState("all");

  const filteredMedia = useMemo(
    () =>
      media.filter((item) => {
        const typeMatches = typeFilter === "all" || item.type === typeFilter;
        const eventMatches =
          eventFilter === "all" || item.event_id === eventFilter;
        return typeMatches && eventMatches;
      }),
    [eventFilter, media, typeFilter]
  );

  return (
    <section className="space-y-5 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary">Medya Kütüphanesi</h2>
          <p className="mt-1 text-sm text-muted">
            {filteredMedia.length} medya gösteriliyor.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
            className={selectClassName}
            aria-label="Medya türüne göre filtrele"
          >
            <option value="all">Tüm medya</option>
            <option value="photo">Fotoğraflar</option>
            <option value="video">Videolar</option>
          </select>

          <select
            value={eventFilter}
            onChange={(event) => setEventFilter(event.target.value)}
            className={selectClassName}
            aria-label="Etkinliğe göre filtrele"
          >
            <option value="all">Tüm etkinlikler</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-14 text-center">
          <ImageIcon className="mx-auto mb-3 text-muted/40" size={38} />
          <h3 className="font-semibold text-primary">Medya bulunamadı</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Filtreleri değiştirin veya bir etkinlik düzenleyerek galeri medyası ekleyin.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMedia.map((item) => (
            <GalleryMediaCard key={item.id} media={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function GalleryMediaCard({ media }: { media: AdminGalleryMedia }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const thumbnailUrl =
    media.type === "video" ? getYouTubeThumbnail(media.url) : media.url;
  const isHomepageMedia = media.event?.homepage_media_id === media.id;

  function handleDelete() {
    const confirmed = window.confirm(
      "Bu medya kaydını silmek istediğinizden emin misiniz?"
    );
    if (!confirmed) return;

    setError("");
    startTransition(async () => {
      const result = await deleteGalleryMediaAction(media.id);
      if (result.message) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-secondary/30 ${
        isHomepageMedia ? "border-accent/50 ring-2 ring-accent/10" : "border-border/70"
      }`}
    >
      <div className="relative aspect-video bg-primary/5">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={media.caption || media.event?.title || ""}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted/40">
            {media.type === "photo" ? <ImageIcon size={30} /> : <Video size={30} />}
          </div>
        )}

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary/80 px-2.5 py-1 text-xs font-medium text-white">
          {media.type === "photo" ? <ImageIcon size={13} /> : <Play size={13} />}
          {media.type === "photo" ? "Fotoğraf" : "Video"}
        </span>

        {isHomepageMedia && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-white">
            <CheckCircle2 size={13} />
            Ana sayfa
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold text-primary">
            {media.caption || "Açıklama yok"}
          </h3>
          <p className="mt-1 text-xs text-muted">
            Sıra: {media.display_order}
          </p>
        </div>

        {media.event ? (
          <div className="rounded-xl bg-surface/80 p-3 text-xs text-muted">
            <p className="font-medium text-primary">{media.event.title}</p>
            <p className="mt-1 inline-flex items-center gap-1">
              <Calendar size={12} />
              {formatDateShort(media.event.event_date)}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-danger/5 p-3 text-xs text-danger">
            Bu medya bir etkinliğe bağlı değil.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <a
            href={media.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-xs font-medium text-accent no-underline hover:text-accent-dark"
          >
            Bağlantıyı aç
          </a>

          <div className="flex items-center gap-1">
            {media.event && (
              <Link
                href={`/admin/events/${media.event.id}`}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted no-underline transition hover:bg-accent/10 hover:text-accent"
              >
                <Edit3 size={14} />
                Etkinliği düzenle
              </Link>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-danger/20 border-t-danger" />
              ) : (
                <Trash2 size={14} />
              )}
              Sil
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
