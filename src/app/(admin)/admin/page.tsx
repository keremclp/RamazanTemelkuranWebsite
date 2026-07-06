import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  BookOpen,
  Calendar,
  ImageIcon,
  Mail,
  MailOpen,
  ArrowRight,
  Clock,
} from "lucide-react";
import { formatDateShort } from "@/lib/utils/helpers";
import type { ContactMessage } from "@/lib/types/database";

async function getDashboardData() {
  const supabase = await createClient();

  const [booksRes, eventsRes, mediaRes, messagesRes, unreadRes, recentMsgsRes] =
    await Promise.all([
      supabase.from("books").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("media").select("id", { count: "exact", head: true }),
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false),
      supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return {
    bookCount: booksRes.count ?? 0,
    eventCount: eventsRes.count ?? 0,
    mediaCount: mediaRes.count ?? 0,
    messageCount: messagesRes.count ?? 0,
    unreadCount: unreadRes.count ?? 0,
    recentMessages: (recentMsgsRes.data as ContactMessage[]) ?? [],
  };
}

export default async function AdminDashboardPage() {
  const {
    bookCount,
    eventCount,
    mediaCount,
    messageCount,
    unreadCount,
    recentMessages,
  } = await getDashboardData();

  const stats = [
    {
      label: "Kitaplar",
      value: bookCount,
      icon: BookOpen,
      href: "/admin/books",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Etkinlikler",
      value: eventCount,
      icon: Calendar,
      href: "/admin/events",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Medya",
      value: mediaCount,
      icon: ImageIcon,
      href: "/admin/gallery",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Mesajlar",
      value: messageCount,
      icon: Mail,
      href: "/admin/messages",
      color: "text-purple-600",
      bg: "bg-purple-50",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-primary">
          Hoş Geldiniz 👋
        </h1>
        <p className="text-muted mt-1">
          Sitenizin genel durumuna buradan göz atabilirsiniz.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group relative bg-surface rounded-2xl p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 no-underline"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}
                >
                  <Icon size={22} />
                </div>
              </div>
              {stat.badge && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {stat.badge}
                </span>
              )}
              <div className="flex items-center gap-1 mt-3 text-xs text-muted group-hover:text-accent transition-colors">
                Görüntüle
                <ArrowRight size={12} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions + Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-primary mb-4">
            Hızlı İşlemler
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              href="/admin/books/new"
              icon={<BookOpen size={18} />}
              label="Yeni Kitap"
            />
            <QuickAction
              href="/admin/events/new"
              icon={<Calendar size={18} />}
              label="Yeni Etkinlik"
            />
            <QuickAction
              href="/admin/slider"
              icon={<ImageIcon size={18} />}
              label="Slider Düzenle"
            />
            <QuickAction
              href="/admin/about"
              icon={<Mail size={18} />}
              label="Hakkında Düzenle"
            />
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-primary">
              Son Mesajlar
            </h2>
            <Link
              href="/admin/messages"
              className="text-xs text-accent hover:text-accent-dark font-medium no-underline"
            >
              Tümünü Gör →
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <MailOpen size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Henüz mesaj yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <Link
                  key={msg.id}
                  href="/admin/messages"
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors no-underline group"
                >
                  <div
                    className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      msg.is_read ? "bg-border" : "bg-accent"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-primary truncate">
                        {msg.name}
                      </p>
                      <span className="text-xs text-muted whitespace-nowrap flex items-center gap-1">
                        <Clock size={10} />
                        {formatDateShort(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate mt-0.5">
                      {msg.subject}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all no-underline group"
    >
      <span className="text-muted group-hover:text-accent transition-colors">
        {icon}
      </span>
      <span className="text-sm font-medium text-primary group-hover:text-accent transition-colors">
        {label}
      </span>
    </Link>
  );
}
