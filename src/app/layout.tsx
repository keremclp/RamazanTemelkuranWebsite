import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ramazan Temelkuran | Yazar",
    template: "%s | Ramazan Temelkuran",
  },
  description:
    "Yazar Ramazan Temelkuran'ın resmi web sitesi. Kitaplar, etkinlikler ve daha fazlası.",
  keywords: ["Ramazan Temelkuran", "yazar", "kitap", "edebiyat"],
  authors: [{ name: "Ramazan Temelkuran" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ramazan Temelkuran",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${playfairDisplay.variable} ${inter.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
