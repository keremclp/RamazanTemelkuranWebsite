export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Yönetim paneli yükleniyor" role="status">
      <div className="h-10 w-56 rounded-lg bg-border/70" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-32 rounded-2xl bg-surface shadow-[var(--shadow-card)]" />
        ))}
      </div>
      <span className="sr-only">Panel verileri yükleniyor…</span>
    </div>
  );
}
