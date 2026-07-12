"use client";

import { useActionState } from "react";
import { AlertCircle, Save } from "lucide-react";
import type { SiteSettings, SocialLinks } from "@/lib/types/database";
import type { SiteSettingsFormState } from "@/app/(admin)/admin/settings/actions";

interface SettingsFormProps {
  action: (
    previousState: SiteSettingsFormState,
    formData: FormData
  ) => Promise<SiteSettingsFormState>;
  settings: SiteSettings;
}

const initialState: SiteSettingsFormState = { message: "" };

const inputClassName =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

const socialFields: { key: keyof SocialLinks; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
];

export default function SettingsForm({
  action,
  settings,
}: SettingsFormProps) {
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

      {state.success && (
        <div
          role="status"
          className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {state.success}
        </div>
      )}

      <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="mb-5 text-lg font-bold text-primary">Genel Bilgiler</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Site başlığı" htmlFor="site_title" required>
            <input
              id="site_title"
              name="site_title"
              defaultValue={settings.site_title}
              className={inputClassName}
              required
              disabled={pending}
            />
          </Field>

          <Field label="Ana Shopier bağlantısı" htmlFor="shopier_main_url">
            <input
              id="shopier_main_url"
              name="shopier_main_url"
              type="url"
              defaultValue={settings.shopier_main_url}
              className={inputClassName}
              placeholder="https://www.shopier.com/..."
              disabled={pending}
            />
          </Field>

          <Field label="İletişim e-postası" htmlFor="contact_email">
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={settings.contact_email}
              className={inputClassName}
              placeholder="info@example.com"
              disabled={pending}
            />
          </Field>

          <Field label="İletişim konumu" htmlFor="contact_location">
            <input
              id="contact_location"
              name="contact_location"
              defaultValue={settings.contact_location}
              className={inputClassName}
              placeholder="Şehir, Ülke"
              disabled={pending}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Meta açıklaması" htmlFor="meta_description" required>
              <textarea
                id="meta_description"
                name="meta_description"
                defaultValue={settings.meta_description}
                className={`${inputClassName} min-h-28 resize-y`}
                required
                disabled={pending}
              />
            </Field>
            <p className="mt-2 text-xs text-muted">
              Arama motorları ve footer açıklaması için kullanılır.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="mb-5 text-lg font-bold text-primary">Sosyal Medya</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {socialFields.map((field) => (
            <Field key={field.key} label={field.label} htmlFor={field.key}>
              <input
                id={field.key}
                name={field.key}
                defaultValue={settings.social_links?.[field.key] ?? ""}
                className={inputClassName}
                placeholder="https://..."
                disabled={pending}
              />
            </Field>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
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
          {pending ? "Kaydediliyor..." : "Ayarları Kaydet"}
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
