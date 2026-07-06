import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş | Yönetim Paneli",
  description: "Ramazan Temelkuran yönetim paneli giriş sayfası.",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
