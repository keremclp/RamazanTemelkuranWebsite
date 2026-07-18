import type { EventWithMedia, Media } from "@/lib/types/database";
import { getYouTubeThumbnail } from "@/lib/utils/helpers";

export const EVENT_MEDIA_RELATION_SELECT =
  "media:media!media_event_id_fkey(id, event_id, type, url, thumbnail_url, caption, display_order, created_at)";

type EventCoverSource = Pick<EventWithMedia, "homepage_media_id" | "media">;

function byDisplayOrder(left: Media, right: Media) {
  return left.display_order - right.display_order;
}

export function getEventCoverMedia(event: EventCoverSource): Media | null {
  const orderedMedia = [...event.media].sort(byDisplayOrder);
  const selectedPhoto = orderedMedia.find(
    (media) =>
      media.id === event.homepage_media_id && media.type === "photo" && media.url
  );

  if (selectedPhoto) return selectedPhoto;

  const firstPhoto = orderedMedia.find(
    (media) => media.type === "photo" && media.url
  );
  if (firstPhoto) return firstPhoto;

  return (
    orderedMedia.find(
      (media) =>
        media.type === "video" &&
        Boolean(media.thumbnail_url || getYouTubeThumbnail(media.url))
    ) ?? null
  );
}

export function getEventCoverImageUrl(media: Media | null): string | null {
  if (!media) return null;
  if (media.type === "photo") return media.url || null;
  return media.thumbnail_url || getYouTubeThumbnail(media.url);
}
