import type { Metadata } from "next";
import { Calendar, ImageIcon, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Event, Media } from "@/lib/types/database";
import AdminGalleryLibrary from "@/components/admin/AdminGalleryLibrary";

export const metadata: Metadata = {
  title: "Galeri",
};

export type AdminGalleryMedia = Media & {
  event: Pick<Event, "id" | "title" | "event_date" | "homepage_media_id"> | null;
};

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event: initialEventId } = await searchParams;
  const supabase = await createClient();
  const [mediaRes, eventsRes] = await Promise.all([
    supabase
      .from("media")
      .select(`
        *,
        event:events!media_event_id_fkey (
          id,
          title,
          event_date,
          homepage_media_id
        )
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("events")
      .select("id, title, event_date, homepage_media_id")
      .order("event_date", { ascending: false }),
  ]);

  const media = (mediaRes.data as AdminGalleryMedia[] | null) ?? [];
  const events =
    (eventsRes.data as Pick<
      Event,
      "id" | "title" | "event_date" | "homepage_media_id"
    >[] | null) ?? [];
  const photoCount = media.filter((item) => item.type === "photo").length;
  const videoCount = media.filter((item) => item.type === "video").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">
            Galeri
          </h1>
          <p className="mt-1 text-muted">
            Fotoğraf ve videoları yükleyin, etkinliklere bağlayın ve ana sayfa görselini seçin.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<ImageIcon size={20} />} label="Fotoğraf" value={photoCount} />
        <StatCard icon={<Video size={20} />} label="Video" value={videoCount} />
        <StatCard icon={<Calendar size={20} />} label="Etkinlik" value={events.length} />
      </div>

      {mediaRes.error || eventsRes.error ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          Galeri medyası yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.
        </div>
      ) : (
        <AdminGalleryLibrary
          media={media}
          events={events}
          initialEventId={initialEventId}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-1 text-3xl font-bold text-primary">{value}</p>
        </div>
        <div className="rounded-xl bg-accent/10 p-3 text-accent">{icon}</div>
      </div>
    </div>
  );
}
