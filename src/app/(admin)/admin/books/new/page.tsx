import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BookForm from "@/components/admin/BookForm";
import { createBookAction } from "../actions";

export const metadata: Metadata = {
  title: "Yeni Kitap",
};

export default function NewBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/books"
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted no-underline transition hover:text-accent"
        >
          <ArrowLeft size={16} />
          Kitaplara dön
        </Link>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">
          Yeni Kitap
        </h1>
        <p className="mt-1 text-muted">
          Kitap bilgilerini ve kapak görselini ekleyin.
        </p>
      </div>
      <BookForm action={createBookAction} />
    </div>
  );
}
