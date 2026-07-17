import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import HeroSlideForm from "@/components/admin/HeroSlideForm";
import { getSiteSettings } from "@/lib/site-settings";
import { createHeroSlideAction } from "../actions";

export const metadata: Metadata = {
  title: "Yeni Slayt",
};

export default async function NewHeroSlidePage() {
  const settings = await getSiteSettings();

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
          Yeni Slayt
        </h1>
        <p className="mt-1 text-muted">
          Ana sayfada gösterilecek yeni hero slaytını ekleyin.
        </p>
      </div>

      <HeroSlideForm
        action={createHeroSlideAction}
        hasShopierUrl={Boolean(settings.shopier_main_url)}
      />
    </div>
  );
}
