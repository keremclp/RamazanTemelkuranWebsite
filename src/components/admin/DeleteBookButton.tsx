"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteBookAction } from "@/app/(admin)/admin/books/actions";

export default function DeleteBookButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    const confirmed = window.confirm(
      `"${title}" kitabını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    if (!confirmed) return;

    setError("");
    startTransition(async () => {
      const result = await deleteBookAction(id);
      if (result.message) setError(result.message);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`${title} kitabını sil`}
      >
        {pending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-danger/20 border-t-danger" />
        ) : (
          <Trash2 size={15} />
        )}
        {pending ? "Siliniyor" : "Sil"}
      </button>
      {error && (
        <span role="alert" className="max-w-44 text-right text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
