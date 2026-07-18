/* ============================================
   Database Types — Supabase Schema
   ============================================ */

export interface Book {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  shopier_url: string;
  publisher: string | null;
  publication_year: number | null;
  page_count: number | null;
  isbn: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  homepage_media_id: string | null;
  created_at: string;
}

export interface Media {
  id: string;
  event_id: string | null;
  type: "photo" | "video";
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  display_order: number;
  created_at: string;
}

export type HeroSlideCtaType =
  | "none"
  | "books"
  | "gallery"
  | "about"
  | "contact"
  | "shopier"
  | "external";

export type HeroSlideVisualSource =
  | "uploaded_image"
  | "selected_books"
  | "selected_events";

export interface HeroSlide {
  id: string;
  image_url: string | null;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  /** @deprecated Kept temporarily while existing rows are migrated. */
  cta_link: string | null;
  cta_type: HeroSlideCtaType;
  cta_external_url: string | null;
  visual_source: HeroSlideVisualSource;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface HeroSlideBookSelection {
  hero_slide_id: string;
  book_id: string;
  display_order: number;
}

export interface HeroSlideEventSelection {
  hero_slide_id: string;
  event_id: string;
  display_order: number;
}

export type HeroSlideBookOption = Pick<
  Book,
  "id" | "title" | "cover_image_url" | "is_published" | "display_order"
>;

export interface HeroSlideEventOption
  extends Pick<Event, "id" | "title" | "event_date" | "location"> {
  cover_image_url: string | null;
}

export type HeroSlideBookVisual = Pick<
  Book,
  "id" | "title" | "cover_image_url"
>;

export interface HeroSlideEventVisual
  extends Pick<Event, "id" | "title"> {
  cover_image_url: string | null;
}

export interface ResolvedHeroSlide extends HeroSlide {
  cta_href: string | null;
  selected_books: HeroSlideBookVisual[];
  selected_events: HeroSlideEventVisual[];
}

export interface AboutContent {
  id: string;
  biography: string;
  portrait_image_url: string | null;
  milestones: Milestone[];
  social_links: SocialLinks;
  updated_at: string;
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
}

export interface SocialLinks {
  instagram?: string;
  youtube?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  site_title: string;
  shopier_main_url: string;
  meta_description: string;
  contact_email: string;
  contact_location: string;
  social_links: SocialLinks;
  updated_at: string;
}

/* ============================================
   Event with Media (joined query)
   ============================================ */

export interface EventWithMedia extends Event {
  media: Media[];
}
