export default function PublicLoading() {
  return (
    <div className="mx-auto min-h-[60vh] max-w-7xl animate-pulse px-4 py-16 sm:px-6 lg:px-8" aria-label="Sayfa yükleniyor" role="status">
      <div className="mx-auto mb-12 h-10 w-48 rounded-lg bg-border/70" />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-card)]">
            <div className="aspect-[4/3] bg-border/60" />
            <div className="space-y-3 p-6">
              <div className="h-5 w-2/3 rounded bg-border/70" />
              <div className="h-4 w-full rounded bg-border/50" />
              <div className="h-4 w-4/5 rounded bg-border/50" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">İçerik yükleniyor…</span>
    </div>
  );
}
