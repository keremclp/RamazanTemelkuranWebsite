import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ImageIcon, Plus, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Event, Media } from "@/lib/types/database";
import AdminGalleryLibrary from "@/components/admin/AdminGalleryLibrary";

export const metadata: Metadata = {
  title: "Galeri",
};

export type AdminGalleryMedia = Media & {
  event: Pick<Event, "id" | "title" | "event_date" | "homepage_media_id"> | null;
};

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
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
    .order("created_at", { ascending: false });

  const media = (data as AdminGalleryMedia[] | null) ?? [];
  const photoCount = media.filter((item) => item.type === "photo").length;
  const videoCount = media.filter((item) => item.type === "video").length;
  const events = Array.from(
    new Map(
      media
        .filter((item) => item.event)
        .map((item) => [item.event!.id, item.event!])
    ).values()
  ).sort((a, b) => a.title.localeCompare(b.title, "tr"));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">
            Galeri
          </h1>
          <p className="mt-1 text-muted">
            Tüm etkinlik fotoğraflarını ve videolarını tek yerden görüntüleyin.
          </p>
        </div>
        <Link
          href="/admin/events"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white no-underline transition hover:bg-accent-dark"
        >
          <Plus size={18} />
          Etkinliğe Medya Ekle
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<ImageIcon size={20} />} label="Fotoğraf" value={photoCount} />
        <StatCard icon={<Video size={20} />} label="Video" value={videoCount} />
        <StatCard icon={<Calendar size={20} />} label="Etkinlik" value={events.length} />
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          Galeri medyası yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.
        </div>
      ) : (
        <AdminGalleryLibrary media={media} events={events} />
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
