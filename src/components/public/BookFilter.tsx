"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import type { Book } from "@/lib/types/database";
import { cn } from "@/lib/utils/helpers";

interface BookFilterProps {
  books: Book[];
}

export default function BookFilter({ books }: BookFilterProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book, index) => (
          <article
            key={book.id}
            className={cn(
              "group flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-surface",
              "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
              "animate-fade-in-up transition-all duration-300 hover:-translate-y-1"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-accent/20 to-primary/10">
              {book.cover_image_url ? (
                <Image
                  src={book.cover_image_url}
                  alt={book.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/30 to-primary/20">
                  <BookOpen className="h-16 w-16 text-accent/60" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="mb-2 text-xl font-bold text-primary transition-colors group-hover:text-accent font-[family-name:var(--font-heading)]">
                {book.title}
              </h3>

              {book.description && (
                <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
                  {book.description}
                </p>
              )}

              <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/books/${book.slug}`}
                  className="inline-flex w-full items-center justify-center rounded-[var(--radius-md)] border border-accent px-4 py-2.5 text-sm font-medium text-accent transition-all duration-[var(--transition-base)] hover:bg-accent hover:text-white sm:flex-1"
                >
                  Detaylar
                </Link>
                {book.shopier_url && (
                  <a
                    href={book.shopier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-medium text-white transition-all duration-[var(--transition-base)] hover:bg-accent-dark sm:flex-1"
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

      {books.length === 0 && (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted/40" />
          <p className="text-lg text-muted">Henüz kitap bulunmamaktadır.</p>
        </div>
      )}
    </>
  );
}
