import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/site-settings";
import { getHeroSlideAdminOptions } from "@/lib/hero-slide-admin-data";
import type { HeroSlide } from "@/lib/types/database";
import HeroSlideForm from "@/components/admin/HeroSlideForm";
import { deleteHeroSlideImageAction, updateHeroSlideAction } from "../actions";

export const metadata: Metadata = {
  title: "Slaytı Düzenle",
};

export default async function EditHeroSlidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [
    { data },
    settings,
    options,
    { data: bookSelections },
    { data: eventSelections },
  ] = await Promise.all([
    supabase.from("hero_slides").select("*").eq("id", id).single(),
    getSiteSettings(),
    getHeroSlideAdminOptions(supabase),
    supabase
      .from("hero_slide_books")
      .select("book_id, display_order")
      .eq("hero_slide_id", id)
      .order("display_order", { ascending: true }),
    supabase
      .from("hero_slide_events")
      .select("event_id, display_order")
      .eq("hero_slide_id", id)
      .order("display_order", { ascending: true }),
  ]);

  if (!data) notFound();

  const slide = data as HeroSlide;
  const updateAction = updateHeroSlideAction.bind(null, slide.id);
  const deleteImageAction = deleteHeroSlideImageAction.bind(null, slide.id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/slider"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted no-underline transition hover:text-accent"
        >
          <ArrowLeft size={16} />
          Slider’a dön
        </Link>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">
          Slaytı Düzenle
        </h1>
        <p className="mt-1 text-muted">
          Görsel, metin, buton ve görünürlük ayarlarını düzenleyin.
        </p>
      </div>

      <HeroSlideForm
        action={updateAction}
        deleteImageAction={deleteImageAction}
        slide={slide}
        hasShopierUrl={Boolean(settings.shopier_main_url)}
        books={options.books}
        events={options.events}
        booksLoadFailed={Boolean(options.booksError)}
        eventsLoadFailed={Boolean(options.eventsError)}
        initialBookIds={(bookSelections ?? []).map(
          (selection) => selection.book_id
        )}
        initialEventIds={(eventSelections ?? []).map(
          (selection) => selection.event_id
        )}
      />
    </div>
  );
}
