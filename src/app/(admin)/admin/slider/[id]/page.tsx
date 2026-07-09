import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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
  const { data } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("id", id)
    .single();

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
      />
    </div>
  );
}
