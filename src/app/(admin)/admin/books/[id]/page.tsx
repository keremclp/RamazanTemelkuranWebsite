import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import BookForm from "@/components/admin/BookForm";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/types/database";
import { deleteBookCoverAction, updateBookAction } from "../actions";

export const metadata: Metadata = {
  title: "Kitabı Düzenle",
};

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();

  if (!book) notFound();

  const updateBook = updateBookAction.bind(null, id);
  const deleteBookCover = deleteBookCoverAction.bind(null, id);

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
          Kitabı Düzenle
        </h1>
        <p className="mt-1 text-muted">
          “{book.title}” için içerik ve görsel bilgilerini güncelleyin.
        </p>
      </div>
      <BookForm
        action={updateBook}
        deleteCoverAction={deleteBookCover}
        book={book as Book}
      />
    </div>
  );
}
