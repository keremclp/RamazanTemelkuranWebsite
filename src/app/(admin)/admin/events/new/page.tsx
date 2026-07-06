import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EventForm from "@/components/admin/EventForm";
import { createEventAction } from "../actions";

export const metadata: Metadata = {
  title: "Yeni Etkinlik",
};

export default function NewEventPage() {
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
          Yeni Etkinlik
        </h1>
        <p className="mt-1 text-muted">
          Etkinlik bilgilerini ekleyin. Fotoğraf ve videoları kaydettikten sonra düzenleme ekranından ekleyebilirsiniz.
        </p>
      </div>

      <EventForm action={createEventAction} />
    </div>
  );
}
