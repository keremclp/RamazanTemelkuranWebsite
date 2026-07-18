import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EVENT_MEDIA_RELATION_SELECT,
  getEventCoverImageUrl,
  getEventCoverMedia,
} from "@/lib/event-gallery";
import type {
  EventWithMedia,
  HeroSlideBookOption,
  HeroSlideEventOption,
} from "@/lib/types/database";

export const HERO_SLIDE_ADMIN_EVENTS_SELECT =
  `id, title, event_date, location, homepage_media_id, ${EVENT_MEDIA_RELATION_SELECT}`;

export async function getHeroSlideAdminOptions(supabase: SupabaseClient) {
  const [booksResult, eventsResult] = await Promise.all([
    supabase
      .from("books")
      .select("id, title, cover_image_url, is_published, display_order")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("events")
      .select(HERO_SLIDE_ADMIN_EVENTS_SELECT)
      .order("event_date", { ascending: false }),
  ]);

  const books =
    (booksResult.data as HeroSlideBookOption[] | null) ?? [];
  const eventRows = (eventsResult.data as EventWithMedia[] | null) ?? [];
  const events: HeroSlideEventOption[] = eventRows.map((event) => ({
    id: event.id,
    title: event.title,
    event_date: event.event_date,
    location: event.location,
    cover_image_url: getEventCoverImageUrl(getEventCoverMedia(event)),
  }));

  return {
    books,
    events,
    booksError: booksResult.error,
    eventsError: eventsResult.error,
  };
}
