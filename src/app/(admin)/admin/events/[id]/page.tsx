import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { EventWithMedia } from "@/lib/types/database";
import EventForm from "@/components/admin/EventForm";
import EventMediaManager from "@/components/admin/EventMediaManager";
import { createMediaAction, updateEventAction } from "../actions";

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
  const mediaAction = createMediaAction.bind(null, event.id);

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
      <EventMediaManager
        eventId={event.id}
        homepageMediaId={event.homepage_media_id}
        media={media}
        action={mediaAction}
      />
    </div>
  );
}
