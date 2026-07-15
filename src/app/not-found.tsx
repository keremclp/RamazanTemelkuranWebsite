import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-secondary px-4 py-16 text-center">
      <div className="max-w-lg rounded-3xl bg-surface p-8 shadow-[var(--shadow-card)] sm:p-12">
        <SearchX className="mx-auto mb-5 h-12 w-12 text-accent" aria-hidden="true" />
        <h1 className="text-3xl font-bold text-primary">Sayfa bulunamadı</h1>
        <p className="mt-4 text-muted">Aradığınız içerik kaldırılmış, taslak durumuna alınmış veya adresi değişmiş olabilir.</p>
        <Link href="/" className="mt-7 inline-flex rounded-xl bg-accent px-5 py-3 font-medium text-white hover:bg-accent-dark">
          Ana sayfaya dön
        </Link>
      </div>
    </section>
  );
}
