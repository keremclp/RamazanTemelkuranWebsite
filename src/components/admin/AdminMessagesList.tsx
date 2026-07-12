"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MailOpen,
  Reply,
  Search,
  Trash2,
  User,
} from "lucide-react";
import type { ContactMessage } from "@/lib/types/database";
import {
  deleteMessageAction,
  setMessageReadAction,
} from "@/app/(admin)/admin/messages/actions";
import { formatDateShort } from "@/lib/utils/helpers";

interface AdminMessagesListProps {
  messages: ContactMessage[];
}

type Filter = "all" | "unread" | "read";
const messagesPerPage = 10;

const filterLabels: Record<Filter, string> = {
  all: "Tümü",
  unread: "Okunmamış",
  read: "Okunmuş",
};

export default function AdminMessagesList({ messages }: AdminMessagesListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filteredMessages = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("tr");

    return messages.filter((message) => {
      const filterMatches =
        filter === "all" ||
        (filter === "read" && message.is_read) ||
        (filter === "unread" && !message.is_read);

      if (!filterMatches) return false;
      if (!normalizedSearch) return true;

      return [message.name, message.email, message.subject, message.message]
        .join(" ")
        .toLocaleLowerCase("tr")
        .includes(normalizedSearch);
    });
  }, [filter, messages, search]);
  const pageCount = Math.max(1, Math.ceil(filteredMessages.length / messagesPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleMessages = filteredMessages.slice(
    currentPage * messagesPerPage,
    (currentPage + 1) * messagesPerPage
  );

  return (
    <section className="space-y-5 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary">Gelen Mesajlar</h2>
          <p className="mt-1 text-sm text-muted">
            {filteredMessages.length} mesaj gösteriliyor.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              className="w-full rounded-xl border border-border bg-surface py-3 pl-9 pr-4 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-72"
              placeholder="Mesaj ara..."
            />
          </div>

          <div className="flex rounded-xl border border-border bg-secondary/30 p-1">
            {(Object.keys(filterLabels) as Filter[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setFilter(key);
                  setPage(0);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  filter === key
                    ? "bg-accent text-white"
                    : "text-muted hover:text-primary"
                }`}
              >
                {filterLabels[key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-14 text-center">
          <MailOpen className="mx-auto mb-3 text-muted/40" size={38} />
          <h3 className="font-semibold text-primary">Mesaj bulunamadı</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Filtreleri değiştirin veya arama metnini temizleyin.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleMessages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}
        </div>
      )}

      {filteredMessages.length > messagesPerPage && (
        <div className="flex items-center justify-center gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-primary transition hover:border-accent disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Önceki
          </button>
          <span className="min-w-16 text-center text-sm text-muted">
            {currentPage + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === pageCount - 1}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-primary transition hover:border-accent disabled:opacity-40"
          >
            Sonraki <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

function MessageCard({ message }: { message: ContactMessage }) {
  const router = useRouter();
  const [readPending, startReadTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [error, setError] = useState("");

  function handleReadToggle() {
    setError("");
    startReadTransition(async () => {
      const result = await setMessageReadAction(message.id, !message.is_read);
      if (result.message) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      `"${message.subject}" konulu mesajı silmek istediğinizden emin misiniz?`
    );
    if (!confirmed) return;

    setError("");
    startDeleteTransition(async () => {
      const result = await deleteMessageAction(message.id);
      if (result.message) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(
    `Re: ${message.subject}`
  )}`;

  return (
    <article
      className={`rounded-2xl border p-5 ${
        message.is_read
          ? "border-border/70 bg-secondary/30"
          : "border-accent/40 bg-accent/5"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                message.is_read
                  ? "bg-border/60 text-muted"
                  : "bg-accent text-white"
              }`}
            >
              {message.is_read ? <MailOpen size={13} /> : <Mail size={13} />}
              {message.is_read ? "Okunmuş" : "Okunmamış"}
            </span>
            <span className="text-xs text-muted">
              {formatDateShort(message.created_at)}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-bold text-primary">
            {message.subject}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <User size={15} />
              {message.name}
            </span>
            <a
              href={`mailto:${message.email}`}
              className="inline-flex items-center gap-1.5 text-accent no-underline hover:text-accent-dark"
            >
              <Mail size={15} />
              {message.email}
            </a>
          </div>

          <div className="mt-4 whitespace-pre-wrap rounded-xl bg-surface p-4 text-sm leading-relaxed text-primary/80">
            {message.message}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
          <a
            href={replyHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white no-underline transition hover:bg-accent-dark"
          >
            <Reply size={16} />
            Yanıtla
          </a>
          <button
            type="button"
            onClick={handleReadToggle}
            disabled={readPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {readPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
            ) : message.is_read ? (
              <Mail size={16} />
            ) : (
              <MailOpen size={16} />
            )}
            {message.is_read ? "Okunmadı Yap" : "Okundu Yap"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deletePending}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deletePending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-danger/20 border-t-danger" />
            ) : (
              <Trash2 size={16} />
            )}
            Sil
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs text-danger">
          {error}
        </p>
      )}
    </article>
  );
}
