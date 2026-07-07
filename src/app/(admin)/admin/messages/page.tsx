import type { Metadata } from "next";
import { Mail, MailOpen, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { ContactMessage } from "@/lib/types/database";
import AdminMessagesList from "@/components/admin/AdminMessagesList";

export const metadata: Metadata = {
  title: "Mesajlar",
};

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const messages = (data as ContactMessage[] | null) ?? [];
  const unreadCount = messages.filter((message) => !message.is_read).length;
  const readCount = messages.length - unreadCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">
          Mesajlar
        </h1>
        <p className="mt-1 text-muted">
          İletişim formundan gelen mesajları okuyun, yanıtlayın ve yönetin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<MessageSquare size={20} />} label="Toplam" value={messages.length} />
        <StatCard icon={<Mail size={20} />} label="Okunmamış" value={unreadCount} />
        <StatCard icon={<MailOpen size={20} />} label="Okunmuş" value={readCount} />
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          Mesajlar yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.
        </div>
      ) : (
        <AdminMessagesList messages={messages} />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-1 text-3xl font-bold text-primary">{value}</p>
        </div>
        <div className="rounded-xl bg-accent/10 p-3 text-accent">{icon}</div>
      </div>
    </div>
  );
}
