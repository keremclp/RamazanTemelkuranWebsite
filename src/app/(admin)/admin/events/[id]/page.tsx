import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageIcon, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { EventWithMedia } from "@/lib/types/database";
import EventForm from "@/components/admin/EventForm";
import { updateEventAction } from "../actions";

export const metadata: Metadata = {
  title: "Etkinliği Düzenle",
};

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(`
      *,
      media:media!media_event_id_fkey (*)
    `)
    .eq("id", id)
    .single();

  if (!data) notFound();

  const event = data as EventWithMedia;
  const media = [...(event.media ?? [])].sort(
    (a, b) => a.display_order - b.display_order
  );
  const updateAction = updateEventAction.bind(null, event.id);
  const photoCount = media.filter((item) => item.type === "photo").length;
  const videoCount = media.filter((item) => item.type === "video").length;
  const coverMedia = media.find((item) => item.id === event.homepage_media_id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/events"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted no-underline transition hover:text-accent"
        >
          <ArrowLeft size={16} />
          Etkinliklere dön
        </Link>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">
          Etkinliği Düzenle
        </h1>
        <p className="mt-1 text-muted">
          Etkinlik bilgilerini ve galeri medyasını yönetin.
        </p>
      </div>

      <EventForm action={updateAction} event={event} />
      <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary">Galeri Medyası</h2>
            <p className="mt-1 text-sm text-muted">
              Medya yükleme, etkinliğe bağlama ve etkinlik kapak görseli seçimi Galeri bölümünden yönetilir.
            </p>
          </div>
          <Link
            href={`/admin/gallery?event=${event.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white no-underline transition hover:bg-accent-dark"
          >
            <ImageIcon size={18} />
            Galeride Yönet
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-secondary/50 p-4">
            <div className="flex items-center gap-2 text-muted">
              <ImageIcon size={17} />
              <span className="text-sm font-medium">Fotoğraf</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">{photoCount}</p>
          </div>
          <div className="rounded-xl bg-secondary/50 p-4">
            <div className="flex items-center gap-2 text-muted">
              <Video size={17} />
              <span className="text-sm font-medium">Video</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">{videoCount}</p>
          </div>
          <div className="rounded-xl bg-secondary/50 p-4">
            <div className="flex items-center gap-2 text-muted">
              <ImageIcon size={17} />
              <span className="text-sm font-medium">Etkinlik kapak görseli</span>
            </div>
            <p className="mt-2 line-clamp-1 text-sm font-medium text-primary">
              {coverMedia?.caption || (coverMedia ? "Seçildi" : "Otomatik seçilecek")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
