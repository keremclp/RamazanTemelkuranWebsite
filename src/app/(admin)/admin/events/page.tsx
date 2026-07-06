import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Edit3, ImageIcon, MapPin, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/helpers";
import type { EventWithMedia } from "@/lib/types/database";
import DeleteEventButton from "@/components/admin/DeleteEventButton";

export const metadata: Metadata = {
  title: "Etkinlikler",
};

const statusMessages: Record<string, string> = {
  created: "Etkinlik başarıyla eklendi.",
  updated: "Etkinlik başarıyla güncellendi.",
};

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      media:media!media_event_id_fkey (*)
    `)
    .order("event_date", { ascending: false });

  const events = ((data as EventWithMedia[] | null) ?? []).map((event) => ({
    ...event,
    media: [...(event.media ?? [])].sort(
      (a, b) => a.display_order - b.display_order
    ),
  }));
  const statusMessage = status ? statusMessages[status] : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">
            Etkinlikler
          </h1>
          <p className="mt-1 text-muted">
            İmza günleri, söyleşiler ve galeri içeriklerini yönetin.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white no-underline transition hover:bg-accent-dark"
        >
          <Plus size={18} />
          Yeni Etkinlik
        </Link>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {statusMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          Etkinlikler yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.
        </div>
      )}

      {!error && events.length === 0 ? (
        <div className="rounded-2xl bg-surface px-6 py-16 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Calendar size={26} />
          </div>
          <h2 className="text-xl font-bold text-primary">Henüz etkinlik yok</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            İlk etkinliği ekleyerek galeri sayfasını beslemeye başlayın.
          </p>
          <Link
            href="/admin/events/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white no-underline hover:bg-accent-dark"
          >
            <Plus size={17} />
            İlk Etkinliği Ekle
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
            const photoCount = event.media.filter((item) => item.type === "photo").length;
            const videoCount = event.media.filter((item) => item.type === "video").length;

            return (
              <article
                key={event.id}
                className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] lg:flex-row lg:items-center"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Calendar size={24} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-primary">
                    {event.title}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={15} />
                      {formatDate(event.event_date)}
                    </span>
                    {event.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={15} />
                        {event.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <ImageIcon size={15} />
                      {photoCount} fotoğraf · {videoCount} video
                    </span>
                  </div>
                  {event.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-primary/70">
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-end gap-1 border-t border-border/60 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted no-underline transition hover:bg-accent/10 hover:text-accent-dark"
                  >
                    <Edit3 size={15} />
                    Düzenle
                  </Link>
                  <DeleteEventButton id={event.id} title={event.title} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
