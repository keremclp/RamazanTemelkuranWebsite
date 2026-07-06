"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEventAction } from "@/app/(admin)/admin/events/actions";

export default function DeleteEventButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    const confirmed = window.confirm(
      `"${title}" etkinliğini silmek istediğinizden emin misiniz? Bağlı medya kayıtları da silinir.`
    );
    if (!confirmed) return;

    setError("");
    startTransition(async () => {
      const result = await deleteEventAction(id);
      if (result.message) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`${title} etkinliğini sil`}
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
