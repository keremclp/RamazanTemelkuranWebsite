import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { EventWithMedia } from "@/lib/types/database";
import GalleryFilter from "@/components/public/GalleryFilter";
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

  // Sort media within each event by display_order
  const eventsWithMedia: EventWithMedia[] = (events || []).map((event) => ({
    ...event,
    media: (event.media || []).sort(
      (a: { display_order: number }, b: { display_order: number }) =>
        a.display_order - b.display_order
    ),
  }));

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-primary mb-4">
            Galeri
          </h1>
          <div className="w-16 h-1 bg-accent mx-auto mb-4"></div>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Etkinlik fotoğrafları ve video kayıtları.
          </p>
        </div>

        {/* Filter + Media Grid (client component) */}
        <GalleryFilter events={eventsWithMedia} />
      </div>
    </section>
  );
}
