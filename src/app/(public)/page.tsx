import Link from "next/link";
import { BookOpen, ArrowRight, Camera, User } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-primary">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(197, 165, 90, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(197, 165, 90, 0.2) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <p className="text-accent font-medium tracking-widest uppercase text-sm">
                  Yazar &bull; Düşünür &bull; Anlatıcı
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Ramazan
                  <br />
                  <span className="text-accent">Temelkuran</span>
                </h1>
                <p className="text-lg text-white/60 max-w-lg leading-relaxed">
                  Kelimelerin gücüne inanan, hikayelerin dünyayı değiştirebileceğini
                  bilen bir yazar. Edebiyatın büyülü dünyasına hoş geldiniz.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-dark transition-all duration-200 no-underline group"
                >
                  <BookOpen size={18} />
                  Kitapları Keşfet
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-200 no-underline"
                >
                  <User size={18} />
                  Hakkında
                </Link>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-80 h-80">
                {/* Decorative circles */}
                <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-pulse" />
                <div className="absolute inset-4 rounded-full border border-accent/10" />
                <div className="absolute inset-8 rounded-full bg-accent/5 flex items-center justify-center">
                  <BookOpen size={64} className="text-accent/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED BOOKS SECTION ===== */}
      <section className="section-padding bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-3">
              Kütüphane
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">Öne Çıkan Kitaplar</h2>
            <p className="mt-4 text-muted max-w-2xl mx-auto">
              En çok okunan ve beğenilen kitaplardan bir seçki.
            </p>
          </div>

          {/* Placeholder Book Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="group bg-surface rounded-xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Book Cover Placeholder */}
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <BookOpen size={48} className="text-accent/30" />
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-xs font-medium text-accent uppercase tracking-wider">
                    Roman
                  </span>
                  <h3 className="text-lg font-bold group-hover:text-accent transition-colors">
                    Kitap Başlığı {i}
                  </h3>
                  <p className="text-sm text-muted line-clamp-2">
                    Bu kitabın kısa açıklaması burada yer alacak. İçerik yönetim
                    panelinden düzenlenebilir.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      href="/books"
                      className="text-sm font-medium text-accent hover:text-accent-dark transition-colors no-underline"
                    >
                      Detaylar →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent-dark transition-colors no-underline group"
            >
              Tüm Kitapları Gör
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== LATEST EVENTS SECTION ===== */}
      <section className="section-padding bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-3">
              Etkinlikler
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">Son Etkinlikler</h2>
            <p className="mt-4 text-muted max-w-2xl mx-auto">
              İmza günleri, söyleşiler ve özel etkinliklerden kareler.
            </p>
          </div>

          {/* Placeholder Event Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-accent/10 cursor-pointer"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={32} className="text-accent/20" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-medium">Etkinlik Adı</p>
                  <p className="text-xs text-white/60">Tarih</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent-dark transition-colors no-underline group"
            >
              Tüm Galeriyi Gör
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== AUTHOR SPOTLIGHT ===== */}
      <section className="section-padding bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Portrait Placeholder */}
            <div className="flex justify-center">
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <User size={64} className="text-accent/20" />
                {/* Decorative border */}
                <div className="absolute -inset-2 rounded-2xl border-2 border-accent/20 -z-10" />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-6">
              <div>
                <p className="text-accent font-medium tracking-widest uppercase text-sm mb-3">
                  Yazar Hakkında
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold">
                  Ramazan Temelkuran
                </h2>
              </div>
              <p className="text-muted leading-relaxed">
                Ramazan Temelkuran, edebiyat dünyasında önemli bir yere sahip olan
                yazar, eserleriyle okuyucularını derinden etkileyen ve düşünmeye
                sevk eden bir kalem. Yılların birikimiyle oluşturduğu eserlerinde
                toplumsal meseleleri bireysel hikayelerle harmanlıyor.
              </p>
              <p className="text-muted leading-relaxed">
                Birçok ödüle layık görülen yazar, ulusal ve uluslararası
                etkinliklerde okuyucularıyla buluşmaya devam ediyor.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent-dark transition-colors no-underline group"
              >
                Devamını Oku
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="relative py-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(197, 165, 90, 0.4) 0%, transparent 60%)`,
            }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Kitapları <span className="text-accent">Keşfedin</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Tüm kitaplarıma Shopier üzerinden kolayca ulaşabilir ve sipariş
            verebilirsiniz.
          </p>
          <Link
            href="https://shopier.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-medium rounded-lg hover:bg-accent-dark transition-all duration-200 no-underline text-lg"
          >
            <BookOpen size={20} />
            Shopier&apos;den Satın Al
          </Link>
        </div>
      </section>
    </>
  );
}
