import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { EventWithMedia } from "@/lib/types/database";
import EventGallerySlider from "@/components/public/EventGallerySlider";
import PageIntro from "@/components/public/PageIntro";
import { getSiteSettings } from "@/lib/site-settings";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return createPageMetadata({
    title: "Galeri",
    description: `${settings.site_title} etkinliklerinden fotoğraflar ve videolar.`,
    path: "/gallery",
  });
}

export default async function GalleryPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select(`
      *,
      media:media!media_event_id_fkey (*)
    `)
    .order("event_date", { ascending: false });

  const eventsWithMedia: EventWithMedia[] = (events || []).map((event) => ({
    ...event,
    media: [...(event.media || [])].sort(
      (a: { display_order: number }, b: { display_order: number }) =>
        a.display_order - b.display_order
    ),
  }));

  return (
    <section className="py-6 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageIntro
          title="Galeri"
          description="Etkinlik fotoğrafları ve video kayıtları."
        />

        <EventGallerySlider events={eventsWithMedia} />
      </div>
    </section>
  );
}
