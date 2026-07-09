"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Edit3,
  ImageIcon,
  Play,
  Plus,
  Save,
  Trash2,
  Video,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { Event } from "@/lib/types/database";
import type { AdminGalleryMedia } from "@/app/(admin)/admin/gallery/page";
import type { MediaFormState } from "@/app/(admin)/admin/events/actions";
import {
  createGalleryMediaAction,
  deleteGalleryMediaAction,
  updateGalleryMediaAction,
} from "@/app/(admin)/admin/events/actions";
import { formatDateShort, getYouTubeThumbnail } from "@/lib/utils/helpers";

interface AdminGalleryLibraryProps {
  media: AdminGalleryMedia[];
  events: Pick<Event, "id" | "title" | "event_date" | "homepage_media_id">[];
  initialEventId?: string;
}

type TypeFilter = "all" | "photo" | "video";

const initialState: MediaFormState = { message: "" };

const inputClassName =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

const selectClassName =
  "rounded-xl border border-border bg-surface px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function AdminGalleryLibrary({
  media,
  events,
  initialEventId,
}: AdminGalleryLibraryProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [eventFilter, setEventFilter] = useState(initialEventId ?? "all");

  const filteredMedia = useMemo(
    () =>
      media.filter((item) => {
        const typeMatches = typeFilter === "all" || item.type === typeFilter;
        const eventMatches =
          eventFilter === "all" || item.event_id === eventFilter;
        return typeMatches && eventMatches;
      }),
    [eventFilter, media, typeFilter]
  );

  return (
    <div className="space-y-6">
      <MediaCreatePanel events={events} />

      <section className="space-y-5 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary">Medya Kütüphanesi</h2>
            <p className="mt-1 text-sm text-muted">
              {filteredMedia.length} medya gösteriliyor.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
              className={selectClassName}
              aria-label="Medya türüne göre filtrele"
            >
              <option value="all">Tüm medya</option>
              <option value="photo">Fotoğraflar</option>
              <option value="video">Videolar</option>
            </select>

            <select
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value)}
              className={selectClassName}
              aria-label="Etkinliğe göre filtrele"
            >
              <option value="all">Tüm etkinlikler</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredMedia.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-14 text-center">
            <ImageIcon className="mx-auto mb-3 text-muted/40" size={38} />
            <h3 className="font-semibold text-primary">Medya bulunamadı</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Filtreleri değiştirin veya yukarıdaki formdan yeni medya ekleyin.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredMedia.map((item) => (
              <GalleryMediaCard key={item.id} media={item} events={events} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MediaCreatePanel({
  events,
}: {
  events: Pick<Event, "id" | "title" | "event_date" | "homepage_media_id">[];
}) {
  return (
    <section className="space-y-5 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-primary">Medya Ekle</h2>
        <p className="mt-1 text-sm text-muted">
          Medyayı yüklerken hangi etkinliğe ait olduğunu seçin.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-primary">
          Medya eklemek için önce bir etkinlik oluşturmalısınız.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <MediaCreateForm type="photo" events={events} />
          <MediaCreateForm type="video" events={events} />
        </div>
      )}
    </section>
  );
}

function MediaCreateForm({
  type,
  events,
}: {
  type: "photo" | "video";
  events: Pick<Event, "id" | "title" | "event_date" | "homepage_media_id">[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createGalleryMediaAction,
    initialState
  );
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  return (
    <form action={formAction} className="rounded-2xl border border-border/70 p-4">
      <input type="hidden" name="type" value={type} />

      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          {type === "photo" ? <ImageIcon size={18} /> : <Video size={18} />}
        </div>
        <div>
          <h3 className="font-semibold text-primary">
            {type === "photo" ? "Fotoğraf Yükle" : "YouTube Videosu Ekle"}
          </h3>
          <p className="text-xs text-muted">
            {type === "photo"
              ? "Dosyayı yükleyin ve etkinliğini seçin."
              : "YouTube bağlantısını ve etkinliğini girin."}
          </p>
        </div>
      </div>

      <FormMessage state={state} />

      <div className="space-y-4">
        <Field label="Etkinlik" htmlFor={`${type}_event_id`} required>
          <select
            id={`${type}_event_id`}
            name="event_id"
            className={inputClassName}
            required
            disabled={pending}
          >
            <option value="">Etkinlik seçin</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} · {formatDateShort(event.event_date)}
              </option>
            ))}
          </select>
        </Field>

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

        {type === "photo" && (
          <HomepageCheckbox disabled={pending}>
            Bu fotoğrafı seçilen etkinliğin ana sayfa görseli yap
          </HomepageCheckbox>
        )}

        <button
          type="submit"
          disabled={pending || (type === "photo" && !photoUrl)}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
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

function GalleryMediaCard({
  media,
  events,
}: {
  media: AdminGalleryMedia;
  events: Pick<Event, "id" | "title" | "event_date" | "homepage_media_id">[];
}) {
  const router = useRouter();
  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState("");
  const [photoUrl, setPhotoUrl] = useState(
    media.type === "photo" ? media.url : ""
  );
  const thumbnailUrl =
    media.type === "video" ? getYouTubeThumbnail(media.url) : photoUrl;
  const isHomepageMedia = media.event?.homepage_media_id === media.id;

  async function handlePersistedPhotoRemoved() {
    const confirmed = window.confirm(
      "Bu fotoğraf medya kaydını ve Supabase dosyasını kalıcı olarak siler. Devam edilsin mi?"
    );

    if (!confirmed) return { message: "", cancelled: true };

    const result = await deleteGalleryMediaAction(media.id);
    if (result.message) {
      setDeleteError(result.message);
      return result;
    }

    router.refresh();
    return result;
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Bu medya kaydını silmek istediğinizden emin misiniz?"
    );
    if (!confirmed) return;

    setDeleteError("");
    startDeleteTransition(async () => {
      const result = await deleteGalleryMediaAction(media.id);
      if (result.message) {
        setDeleteError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-secondary/30 ${
        isHomepageMedia ? "border-accent/50 ring-2 ring-accent/10" : "border-border/70"
      }`}
    >
      <div className="relative aspect-video bg-primary/5">
        {media.type === "photo" ? (
          <ImageUploader
            currentImageUrl={photoUrl}
            committedImageUrl={media.url}
            onImageUploaded={setPhotoUrl}
            onImageRemoved={() => setPhotoUrl("")}
            onPersistedImageRemoved={handlePersistedPhotoRemoved}
            folder="events"
            frameClassName="relative aspect-video overflow-hidden bg-primary/5"
            imageSizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
            previewAlt={media.caption || media.event?.title || "Fotoğraf"}
            showReplaceButton
            replaceLabel="Yeni fotoğraf"
          />
        ) : thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={media.caption || media.event?.title || ""}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted/40">
            <Video size={30} />
          </div>
        )}

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary/80 px-2.5 py-1 text-xs font-medium text-white">
          {media.type === "photo" ? <ImageIcon size={13} /> : <Play size={13} />}
          {media.type === "photo" ? "Fotoğraf" : "Video"}
        </span>

        {isHomepageMedia && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-white">
            <CheckCircle2 size={13} />
            Ana sayfa
          </span>
        )}
      </div>

      <div className="space-y-4 p-4">
        {media.event ? (
          <div className="rounded-xl bg-surface/80 p-3 text-xs text-muted">
            <p className="font-medium text-primary">{media.event.title}</p>
            <p className="mt-1 inline-flex items-center gap-1">
              <Calendar size={12} />
              {formatDateShort(media.event.event_date)}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-danger/5 p-3 text-xs text-danger">
            Bu medya bir etkinliğe bağlı değil.
          </div>
        )}

        <MediaEditForm
          media={media}
          events={events}
          photoUrl={photoUrl}
          setPhotoUrl={setPhotoUrl}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
          <a
            href={media.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-xs font-medium text-accent no-underline hover:text-accent-dark"
          >
            Bağlantıyı aç
          </a>

          <div className="flex items-center gap-1">
            {media.event && (
              <Link
                href={`/admin/events/${media.event.id}`}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted no-underline transition hover:bg-accent/10 hover:text-accent"
              >
                <Edit3 size={14} />
                Etkinlik
              </Link>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deletePending}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {deletePending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-danger/20 border-t-danger" />
              ) : (
                <Trash2 size={14} />
              )}
              Sil
            </button>
          </div>
        </div>

        {deleteError && (
          <p role="alert" className="text-xs text-danger">
            {deleteError}
          </p>
        )}
      </div>
    </article>
  );
}

function MediaEditForm({
  media,
  events,
  photoUrl,
  setPhotoUrl,
}: {
  media: AdminGalleryMedia;
  events: Pick<Event, "id" | "title" | "event_date" | "homepage_media_id">[];
  photoUrl: string;
  setPhotoUrl: React.Dispatch<React.SetStateAction<string>>;
}) {
  const router = useRouter();
  const action = updateGalleryMediaAction.bind(null, media.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  useEffect(() => {
    if (state.committedImageUrl !== undefined) {
      setPhotoUrl(state.committedImageUrl ?? "");
    }
  }, [setPhotoUrl, state.committedImageUrl]);

  return (
    <form action={formAction} className="space-y-3">
      <FormMessage state={state} />

      <div className="grid gap-3 sm:grid-cols-2">
        {media.type === "photo" ? (
          <input type="hidden" name="url" value={photoUrl} />
        ) : (
          <div className="sm:col-span-2">
            <Field
              label="YouTube bağlantısı"
              htmlFor={`url_${media.id}`}
              required
            >
              <input
                id={`url_${media.id}`}
                name="url"
                type="url"
                defaultValue={media.url}
                className={inputClassName}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                disabled={pending}
              />
            </Field>
          </div>
        )}

        <Field label="Etkinlik" htmlFor={`event_${media.id}`} required>
          <select
            id={`event_${media.id}`}
            name="event_id"
            defaultValue={media.event_id ?? ""}
            className={inputClassName}
            required
            disabled={pending}
          >
            <option value="">Etkinlik seçin</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Sıra" htmlFor={`display_order_${media.id}`}>
          <input
            id={`display_order_${media.id}`}
            name="display_order"
            type="number"
            min="0"
            defaultValue={media.display_order}
            className={inputClassName}
            disabled={pending}
          />
        </Field>
      </div>

      <Field label="Açıklama" htmlFor={`caption_${media.id}`}>
        <input
          id={`caption_${media.id}`}
          name="caption"
          defaultValue={media.caption ?? ""}
          className={inputClassName}
          disabled={pending}
        />
      </Field>

      {media.type === "photo" && (
        <HomepageCheckbox
          defaultChecked={media.event?.homepage_media_id === media.id}
          disabled={pending}
        >
          Bu fotoğrafı bağlı olduğu etkinliğin ana sayfa görseli yap
        </HomepageCheckbox>
      )}

      <button
        type="submit"
        disabled={pending || (media.type === "photo" && !photoUrl)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        {pending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Save size={16} />
        )}
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}

function FormMessage({ state }: { state: MediaFormState }) {
  if (state.message) {
    return (
      <div
        role="alert"
        className="mb-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-xs text-danger"
      >
        <AlertCircle size={16} className="shrink-0" />
        {state.message}
      </div>
    );
  }

  if (state.success) {
    return (
      <div
        role="status"
        className="mb-4 rounded-xl border border-success/20 bg-success/10 p-3 text-xs text-success"
      >
        {state.success}
      </div>
    );
  }

  return null;
}

function HomepageCheckbox({
  children,
  defaultChecked,
  disabled,
}: {
  children: React.ReactNode;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-3 text-sm text-primary">
      <input
        type="checkbox"
        name="use_on_homepage"
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-border accent-[var(--color-accent)]"
        disabled={disabled}
      />
      <span>
        <span className="font-medium">{children}</span>
        <span className="mt-0.5 block text-xs text-muted">
          Her etkinlikte yalnızca bir fotoğraf ana sayfada gösterilir.
        </span>
      </span>
    </label>
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
