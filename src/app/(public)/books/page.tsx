import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/types/database";
import BookFilter from "@/components/public/BookFilter";

export const metadata: Metadata = {
  title: "Kitaplar",
  description: "Ramazan Temelkuran'ın tüm kitapları.",
};

export default async function BooksPage() {
  const supabase = await createClient();

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("display_order", { ascending: true });

  const allBooks: Book[] = books || [];

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center animate-fade-in-up">
          <h1 className="mb-4 text-4xl font-bold text-primary md:text-5xl font-[family-name:var(--font-heading)]">
            Kitaplar
          </h1>
          <div className="mx-auto mb-4 h-1 w-16 bg-accent" />
          <p className="mx-auto max-w-2xl text-lg text-muted">
            Ramazan Temelkuran&apos;ın kaleme aldığı tüm eserleri keşfedin.
          </p>
        </div>

        <BookFilter books={allBooks} />
      </div>
    </section>
  );
}
