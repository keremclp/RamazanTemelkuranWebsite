"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import type { Book } from "@/lib/types/database";
import { cn } from "@/lib/utils/helpers";

interface BookFilterProps {
  books: Book[];
  categories: string[];
}

export default function BookFilter({ books, categories }: BookFilterProps) {
  const [activeCategory, setActiveCategory] = useState("Tümü");

  const filteredBooks =
    activeCategory === "Tümü"
      ? books
      : books.filter((book) => book.category === activeCategory);

  return (
    <>
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {["Tümü", ...categories].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all duration-[var(--transition-base)]",
              activeCategory === category
                ? "bg-accent text-white shadow-md"
                : "bg-surface text-muted border border-border hover:border-accent hover:text-accent"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBooks.map((book, index) => (
          <article
            key={book.id}
            className={cn(
              "group bg-surface rounded-[var(--radius-lg)] overflow-hidden",
              "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
              "hover:-translate-y-1 transition-all duration-300",
              "animate-fade-in-up flex flex-col"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Cover Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-accent/20 to-primary/10">
              {book.cover_image_url ? (
                <Image
                  src={book.cover_image_url}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/30 to-primary/20">
                  <BookOpen className="w-16 h-16 text-accent/60" />
                </div>
              )}

              {/* Category Badge */}
              {book.category && (
                <span className="absolute top-4 left-4 bg-accent/90 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                  {book.category}
                </span>
              )}
            </div>

            {/* Card Content */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-primary mb-2 group-hover:text-accent transition-colors">
                {book.title}
              </h3>

              {book.description && (
                <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                  {book.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/books/${book.slug}`}
                  className="inline-flex w-full items-center justify-center px-4 py-2.5 rounded-[var(--radius-md)] border border-accent text-accent text-sm font-medium hover:bg-accent hover:text-white transition-all duration-[var(--transition-base)] sm:flex-1"
                >
                  Detaylar
                </Link>
                {book.shopier_url && (
                  <a
                    href={book.shopier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all duration-[var(--transition-base)] sm:flex-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    Shopier&apos;den Al
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted/40 mx-auto mb-4" />
          <p className="text-muted text-lg">
            Bu kategoride henüz kitap bulunmamaktadır.
          </p>
        </div>
      )}
    </>
  );
}
