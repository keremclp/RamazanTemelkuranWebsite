import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: {
    default: "Yönetim Paneli | Ramazan Temelkuran",
    template: "%s | Yönetim Paneli",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-secondary">
      <AdminSidebar />
      {/* Main content area — offset by sidebar width */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Mobile top spacing for the header bar */}
        <main className="pt-14 lg:pt-0 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
