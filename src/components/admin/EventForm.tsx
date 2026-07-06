"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, Save } from "lucide-react";
import type { Event, EventWithMedia } from "@/lib/types/database";
import type { EventFormState } from "@/app/(admin)/admin/events/actions";

interface EventFormProps {
  action: (
    previousState: EventFormState,
    formData: FormData
  ) => Promise<EventFormState>;
  event?: Event | EventWithMedia;
}

const initialState: EventFormState = { message: "" };

const inputClassName =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function EventForm({ action, event }: EventFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger"
        >
          <AlertCircle size={18} className="shrink-0" />
          {state.message}
        </div>
      )}

      <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="mb-5 text-lg font-bold text-primary">Etkinlik Bilgileri</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Etkinlik başlığı" htmlFor="title" required>
            <input
              id="title"
              name="title"
              defaultValue={event?.title ?? ""}
              className={inputClassName}
              required
              disabled={pending}
            />
          </Field>

          <Field label="Etkinlik tarihi" htmlFor="event_date" required>
            <input
              id="event_date"
              name="event_date"
              type="date"
              defaultValue={event?.event_date ?? ""}
              className={inputClassName}
              required
              disabled={pending}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Konum" htmlFor="location">
              <input
                id="location"
                name="location"
                defaultValue={event?.location ?? ""}
                className={inputClassName}
                placeholder="İstanbul, TÜYAP Kitap Fuarı..."
                disabled={pending}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Açıklama" htmlFor="description">
              <textarea
                id="description"
                name="description"
                defaultValue={event?.description ?? ""}
                className={`${inputClassName} min-h-32 resize-y`}
                disabled={pending}
              />
            </Field>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/events"
          className="rounded-xl border border-border px-5 py-3 text-center text-sm font-medium text-muted no-underline transition hover:border-primary/20 hover:text-primary"
        >
          Vazgeç
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Save size={18} />
          )}
          {pending ? "Kaydediliyor..." : event ? "Değişiklikleri Kaydet" : "Etkinliği Kaydet"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-primary">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}
