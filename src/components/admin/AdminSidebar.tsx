"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ImageIcon,
  SlidersHorizontal,
  User,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/books", label: "Kitaplar", icon: BookOpen },
  { href: "/admin/events", label: "Etkinlikler", icon: Calendar },
  { href: "/admin/gallery", label: "Galeri", icon: ImageIcon },
  { href: "/admin/slider", label: "Slider", icon: SlidersHorizontal },
  { href: "/admin/about", label: "Hakkında", icon: User },
  { href: "/admin/messages", label: "Mesajlar", icon: Mail },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className={`flex items-center gap-2.5 no-underline transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <BookOpen size={18} className="text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-[family-name:var(--font-heading)] text-sm font-bold text-primary whitespace-nowrap">
                Yönetim Paneli
              </span>
            )}
          </Link>
          {/* Collapse button — desktop only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-muted hover:text-primary hover:bg-primary/5 transition-all"
            aria-label={isCollapsed ? "Genişlet" : "Daralt"}
          >
            <ChevronLeft
              size={16}
              className={`transition-transform ${isCollapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all no-underline ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-primary hover:bg-primary/5"
              } ${isCollapsed ? "justify-center px-2.5" : ""}`}
              title={isCollapsed ? link.label : undefined}
            >
              <Icon size={19} className="shrink-0" />
              {!isCollapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 space-y-1">
        {/* View Site Link */}
        <Link
          href="/"
          target="_blank"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-primary hover:bg-primary/5 transition-all no-underline ${
            isCollapsed ? "justify-center px-2.5" : ""
          }`}
          title={isCollapsed ? "Siteyi Görüntüle" : undefined}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" x2="21" y1="14" y2="3" />
          </svg>
          {!isCollapsed && <span>Siteyi Görüntüle</span>}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/5 transition-all ${
            isCollapsed ? "justify-center px-2.5" : ""
          }`}
          title={isCollapsed ? "Çıkış Yap" : undefined}
        >
          <LogOut size={19} className="shrink-0" />
          {!isCollapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-surface border-b border-border flex items-center justify-between px-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-primary hover:text-accent transition-colors"
          aria-label="Menüyü aç"
        >
          <Menu size={22} />
        </button>
        <span className="font-[family-name:var(--font-heading)] text-sm font-bold text-primary">
          Yönetim Paneli
        </span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-surface border-r border-border
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
          ${isMobileOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden absolute top-4 right-3 p-1 text-muted hover:text-primary transition-colors"
            aria-label="Menüyü kapat"
          >
            <X size={20} />
          </button>
        )}
        {sidebarContent}
      </aside>
    </>
  );
}
