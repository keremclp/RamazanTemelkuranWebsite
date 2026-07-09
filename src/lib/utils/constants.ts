/* ============================================
   Site Constants & Navigation
   ============================================ */

export const SITE_NAME = "Ramazan Temelkuran";
export const SITE_DESCRIPTION =
  "Yazar Ramazan Temelkuran'ın resmi web sitesi. Kitaplar, etkinlikler ve daha fazlası.";

export const NAV_LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/books", label: "Kitaplar" },
  { href: "/gallery", label: "Galeri" },
  { href: "/about", label: "Hakkında" },
  { href: "/contact", label: "İletişim" },
] as const;

export const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Panel", icon: "LayoutDashboard" },
  { href: "/admin/books", label: "Kitaplar", icon: "BookOpen" },
  { href: "/admin/events", label: "Etkinlikler", icon: "Calendar" },
  { href: "/admin/gallery", label: "Galeri", icon: "Image" },
  { href: "/admin/slider", label: "Slider", icon: "SlidersHorizontal" },
  { href: "/admin/about", label: "Hakkında", icon: "User" },
  { href: "/admin/messages", label: "Mesajlar", icon: "Mail" },
  { href: "/admin/settings", label: "Ayarlar", icon: "Settings" },
] as const;

export const PLACEHOLDER_IMAGE = "/images/placeholder.jpg";
