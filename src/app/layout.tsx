import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { getSiteSettings } from "@/lib/site-settings";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: {
      default: `${settings.site_title} | Yazar`,
      template: `%s | ${settings.site_title}`,
    },
    description: settings.meta_description,
    keywords: [settings.site_title, "yazar", "kitap", "edebiyat"],
    authors: [{ name: settings.site_title }],
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: settings.site_title,
      description: settings.meta_description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

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
