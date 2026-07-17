"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Home,
  ImageIcon,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { Media } from "@/lib/types/database";
import type { MediaFormState } from "@/app/(admin)/admin/events/actions";
import {
  deleteMediaAction,
  setEventCoverMediaAction,
} from "@/app/(admin)/admin/events/actions";
import { getYouTubeThumbnail } from "@/lib/utils/helpers";

interface EventMediaManagerProps {
  eventId: string;
  coverMediaId: string | null;
  media: Media[];
  action: (
    previousState: MediaFormState,
    formData: FormData
  ) => Promise<MediaFormState>;
}

const initialState: MediaFormState = { message: "" };

const inputClassName =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function EventMediaManager({
  eventId,
  coverMediaId,
  media,
  action,
}: EventMediaManagerProps) {
  return (
    <section className="space-y-5 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-primary">Galeri Medyası</h2>
        <p className="mt-1 text-sm text-muted">
          Bu etkinliğe fotoğraf veya YouTube videosu ekleyin. Galeri slaytında kullanılacak kapak fotoğrafını ayrıca seçebilirsiniz.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <MediaCreateForm type="photo" action={action} />
        <MediaCreateForm type="video" action={action} />
      </div>

      <div className="border-t border-border/70 pt-5">
        <h3 className="mb-4 text-sm font-semibold text-primary">
          Mevcut medya ({media.length})
        </h3>
        {media.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-10 text-center">
            <Camera className="mx-auto mb-3 text-muted/40" size={34} />
            <p className="text-sm text-muted">
              Bu etkinlik için henüz medya eklenmedi.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {media.map((item) => (
              <MediaCard
                key={item.id}
                eventId={eventId}
                coverMediaId={coverMediaId}
                media={item}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MediaCreateForm({
  type,
  action,
}: {
  type: "photo" | "video";
  action: (
    previousState: MediaFormState,
    formData: FormData
  ) => Promise<MediaFormState>;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="rounded-2xl border border-border/70 p-4">
      <input type="hidden" name="type" value={type} />

      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          {type === "photo" ? <ImageIcon size={18} /> : <Play size={18} />}
        </div>
        <div>
          <h3 className="font-semibold text-primary">
            {type === "photo" ? "Fotoğraf Ekle" : "YouTube Videosu Ekle"}
          </h3>
          <p className="text-xs text-muted">
            {type === "photo"
              ? "Görsel yükleyip açıklama ekleyin."
              : "YouTube bağlantısını girin."}
          </p>
        </div>
      </div>

      {state.message && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-xs text-danger"
        >
          <AlertCircle size={16} className="shrink-0" />
          {state.message}
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-success/20 bg-success/10 p-3 text-xs text-success"
        >
          {state.success}
        </div>
      )}

      <div className="space-y-4">
        {type === "photo" ? (
          <>
            <ImageUploader
              currentImageUrl={photoUrl}
              committedImageUrl={state.committedImageUrl}
              onImageUploaded={setPhotoUrl}
              onImageRemoved={() => setPhotoUrl("")}
              folder="events"
              aspectRatio="aspect-video"
            />
            <input type="hidden" name="url" value={photoUrl} />
            <label className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-3 text-sm text-primary">
              <input
                type="checkbox"
                name="use_as_event_cover"
                className="mt-1 h-4 w-4 rounded border-border accent-[var(--color-accent)]"
                disabled={pending}
              />
              <span>
                <span className="font-medium">Bu fotoğrafı etkinlik kapağı yap</span>
                <span className="mt-0.5 block text-xs text-muted">
                  Galeri slaytında bu etkinliği temsil eden görsel olarak seçilir.
                </span>
              </span>
            </label>
          </>
        ) : (
          <Field label="YouTube bağlantısı" htmlFor="video_url" required>
            <input
              id="video_url"
              name="url"
              type="url"
              className={inputClassName}
              placeholder="https://www.youtube.com/watch?v=..."
              required
              disabled={pending}
            />
          </Field>
        )}

        <Field label="Açıklama" htmlFor={`${type}_caption`}>
          <input
            id={`${type}_caption`}
            name="caption"
            className={inputClassName}
            placeholder="Kısa açıklama"
            disabled={pending}
          />
        </Field>

        <Field label="Görüntülenme sırası" htmlFor={`${type}_display_order`}>
          <input
            id={`${type}_display_order`}
            name="display_order"
            type="number"
            min="0"
            defaultValue={0}
            className={inputClassName}
            disabled={pending}
          />
        </Field>

        <button
          type="submit"
          disabled={pending || (type === "photo" && !photoUrl)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Plus size={17} />
          )}
          {pending ? "Ekleniyor..." : "Medyayı Ekle"}
        </button>
      </div>
    </form>
  );
}

function MediaCard({
  eventId,
  coverMediaId,
  media,
}: {
  eventId: string;
  coverMediaId: string | null;
  media: Media;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [coverPending, startCoverTransition] = useTransition();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const thumbnailUrl =
    media.type === "video" ? getYouTubeThumbnail(media.url) : media.url;
  const isEventCover = coverMediaId === media.id;

  function handleDelete() {
    const confirmed = window.confirm(
      "Bu medya kaydını silmek istediğinizden emin misiniz?"
    );
    if (!confirmed) return;

    setError("");
    startTransition(async () => {
      const result = await deleteMediaAction(eventId, media.id);
      if (result.message) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  function handleCoverSelection() {
    setError("");
    setStatus("");
    startCoverTransition(async () => {
      const result = await setEventCoverMediaAction(
        eventId,
        isEventCover ? null : media.id
      );
      if (result.message) {
        setError(result.message);
        return;
      }
      setStatus(result.success ?? "");
      router.refresh();
    });
  }

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-secondary/30 ${
        isEventCover ? "border-accent/50 ring-2 ring-accent/10" : "border-border/70"
      }`}
    >
      <div className="relative aspect-video bg-primary/5">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={media.caption || ""}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted/40">
            {media.type === "photo" ? <ImageIcon size={30} /> : <Play size={30} />}
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-primary/80 px-2.5 py-1 text-xs font-medium text-white">
          {media.type === "photo" ? "Fotoğraf" : "Video"}
        </span>
        {isEventCover && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-white">
            <CheckCircle2 size={13} />
            Etkinlik kapağı
          </span>
        )}
      </div>

      <div className="space-y-3 p-3">
        <div>
          <p className="line-clamp-2 text-sm font-medium text-primary">
            {media.caption || "Açıklama yok"}
          </p>
          <p className="mt-1 text-xs text-muted">Sıra: {media.display_order}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <a
            href={media.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-xs text-accent no-underline hover:text-accent-dark"
          >
            Bağlantıyı aç
          </a>
          {media.type === "photo" && (
            <button
              type="button"
              onClick={handleCoverSelection}
              disabled={coverPending}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {coverPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
              ) : (
                <Home size={14} />
              )}
              {isEventCover ? "Kapak seçimini kaldır" : "Etkinlik kapağı yap"}
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-danger/20 border-t-danger" />
            ) : (
              <Trash2 size={14} />
            )}
            Sil
          </button>
        </div>

        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
        {status && (
          <p role="status" className="text-xs text-success">
            {status}
          </p>
        )}
      </div>
    </article>
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
