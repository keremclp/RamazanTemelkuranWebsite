import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/types/database";
import BookFilter from "@/components/public/BookFilter";

export const metadata: Metadata = {
  title: "Kitaplar",
  description: "Ramazan Temelkuran'ın tüm kitapları. Roman, deneme ve daha fazlası.",
};

export default async function BooksPage() {
  const supabase = await createClient();

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("display_order", { ascending: true });

  const allBooks: Book[] = books || [];

  // Extract unique categories from the data
  const categories = Array.from(
    new Set(allBooks.map((b) => b.category).filter(Boolean))
  ) as string[];

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-primary mb-4">
            Kitaplar
          </h1>
          <div className="w-16 h-1 bg-accent mx-auto mb-4"></div>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Ramazan Temelkuran&apos;ın kaleme aldığı tüm eserleri keşfedin.
          </p>
        </div>

        {/* Filter + Grid (client component) */}
        <BookFilter books={allBooks} categories={categories} />
      </div>
    </section>
  );
}
