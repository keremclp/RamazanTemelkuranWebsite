"use client";

import { useActionState, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { AboutContent, Milestone, SocialLinks } from "@/lib/types/database";
import type { AboutFormState } from "@/app/(admin)/admin/about/actions";

interface AboutFormProps {
  action: (
    previousState: AboutFormState,
    formData: FormData
  ) => Promise<AboutFormState>;
  about?: AboutContent;
}

const initialState: AboutFormState = { message: "" };

const inputClassName =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

const milestonesPerPage = 3;

const socialFields: { key: keyof SocialLinks; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
];

const emptyMilestone: Milestone = {
  year: "",
  title: "",
  description: "",
};

export default function AboutForm({ action, about }: AboutFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [portraitImageUrl, setPortraitImageUrl] = useState(
    about?.portrait_image_url ?? ""
  );
  const [milestones, setMilestones] = useState<Milestone[]>(
    about?.milestones && about.milestones.length > 0
      ? about.milestones
      : [{ ...emptyMilestone }]
  );
  const [milestonePage, setMilestonePage] = useState(0);

  const totalMilestonePages = Math.max(
    1,
    Math.ceil(milestones.length / milestonesPerPage)
  );
  const currentMilestonePage = Math.min(
    milestonePage,
    totalMilestonePages - 1
  );
  const milestonePageStart = currentMilestonePage * milestonesPerPage;
  const visibleMilestones = milestones
    .map((milestone, index) => ({ milestone, index }))
    .slice(milestonePageStart, milestonePageStart + milestonesPerPage);
  const firstVisibleMilestone = milestonePageStart + 1;
  const lastVisibleMilestone = Math.min(
    milestones.length,
    milestonePageStart + milestonesPerPage
  );

  function updateMilestone(
    index: number,
    key: keyof Milestone,
    value: string
  ) {
    setMilestones((current) =>
      current.map((milestone, i) =>
        i === index ? { ...milestone, [key]: value } : milestone
      )
    );
  }

  function addMilestone() {
    const nextLength = milestones.length + 1;
    setMilestones((current) => [...current, { ...emptyMilestone }]);
    setMilestonePage(Math.ceil(nextLength / milestonesPerPage) - 1);
  }

  function removeMilestone(index: number) {
    if (visibleMilestones.length === 1 && currentMilestonePage > 0) {
      setMilestonePage(currentMilestonePage - 1);
    }

    setMilestones((current) =>
      current.length === 1
        ? [{ ...emptyMilestone }]
        : current.filter((_, i) => i !== index)
    );
  }

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
            <h2 className="mb-5 text-lg font-bold text-primary">Biyografi</h2>
            <Field label="Biyografi metni" htmlFor="biography">
              <textarea
                id="biography"
                name="biography"
                defaultValue={about?.biography ?? ""}
                className={`${inputClassName} min-h-72 resize-y leading-relaxed`}
                placeholder="Yazar biyografisi..."
                disabled={pending}
              />
            </Field>
            <p className="mt-2 text-xs text-muted">
              Paragrafları ayırmak için iki satır boşluk bırakabilirsiniz.
            </p>
          </section>

          <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-primary">
                  Kariyer Adımları
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Hakkında sayfasındaki zaman çizelgesi.
                </p>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/30 px-4 py-2.5 text-sm font-medium text-accent transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={16} />
                Adım Ekle
              </button>
            </div>

            <input
              type="hidden"
              name="milestones"
              value={JSON.stringify(milestones)}
            />

            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {milestones.length} adım içinden {firstVisibleMilestone}-
                {lastVisibleMilestone} arası gösteriliyor.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMilestonePage(currentMilestonePage - 1)}
                  disabled={pending || currentMilestonePage === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={14} />
                  Önceki
                </button>
                <span className="min-w-14 text-center text-xs font-medium text-muted">
                  {currentMilestonePage + 1} / {totalMilestonePages}
                </span>
                <button
                  type="button"
                  onClick={() => setMilestonePage(currentMilestonePage + 1)}
                  disabled={
                    pending || currentMilestonePage >= totalMilestonePages - 1
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-primary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sonraki
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {visibleMilestones.map(({ milestone, index }) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border/70 bg-secondary/30 p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-primary">
                      Adım {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      disabled={pending}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Sil
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Yıl" htmlFor={`milestone_year_${index}`}>
                      <input
                        id={`milestone_year_${index}`}
                        value={milestone.year}
                        onChange={(event) =>
                          updateMilestone(index, "year", event.target.value)
                        }
                        className={inputClassName}
                        placeholder="2024"
                        disabled={pending}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Başlık" htmlFor={`milestone_title_${index}`}>
                        <input
                          id={`milestone_title_${index}`}
                          value={milestone.title}
                          onChange={(event) =>
                            updateMilestone(index, "title", event.target.value)
                          }
                          className={inputClassName}
                          placeholder="Yeni kitap yayımlandı"
                          disabled={pending}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-3">
                      <Field
                        label="Açıklama"
                        htmlFor={`milestone_description_${index}`}
                      >
                        <textarea
                          id={`milestone_description_${index}`}
                          value={milestone.description}
                          onChange={(event) =>
                            updateMilestone(
                              index,
                              "description",
                              event.target.value
                            )
                          }
                          className={`${inputClassName} min-h-24 resize-y`}
                          placeholder="Kısa açıklama"
                          disabled={pending}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
            <h2 className="mb-5 text-lg font-bold text-primary">
              Sosyal Medya
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {socialFields.map((field) => (
                <Field key={field.key} label={field.label} htmlFor={field.key}>
                  <input
                    id={field.key}
                    name={field.key}
                    defaultValue={about?.social_links?.[field.key] ?? ""}
                    className={inputClassName}
                    placeholder="https://..."
                    disabled={pending}
                  />
                </Field>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <section className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-lg font-bold text-primary">
              Portre Görseli
            </h2>
            <ImageUploader
              currentImageUrl={portraitImageUrl}
              onImageUploaded={setPortraitImageUrl}
              onImageRemoved={() => setPortraitImageUrl("")}
              folder="about"
              aspectRatio="aspect-[3/4]"
            />
            <input
              type="hidden"
              name="portrait_image_url"
              value={portraitImageUrl}
            />
          </section>
        </aside>
      </div>

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
          {pending ? "Kaydediliyor..." : "Hakkında Sayfasını Kaydet"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-primary">
        {label}
      </label>
      {children}
    </div>
  );
}
