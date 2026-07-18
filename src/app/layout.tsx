import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { getSiteSettings } from "@/lib/site-settings";
import { absoluteUrl, getSiteUrl, shouldAllowSearchIndexing } from "@/lib/site-url";
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
  const allowIndexing = shouldAllowSearchIndexing();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${settings.site_title} | Yazar`,
      template: `%s | ${settings.site_title}`,
    },
    description: settings.meta_description,
    keywords: [settings.site_title, "yazar", "kitap", "edebiyat"],
    authors: [{ name: settings.site_title }],
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      shortcut: "/icon.svg",
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: settings.site_title,
      description: settings.meta_description,
      url: absoluteUrl("/"),
      images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.site_title,
      description: settings.meta_description,
      images: [absoluteUrl("/opengraph-image")],
    },
    alternates: { canonical: absoluteUrl("/") },
    robots: {
      index: allowIndexing,
      follow: allowIndexing,
      googleBot: {
        index: allowIndexing,
        follow: allowIndexing,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
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
      <body 
        className="min-h-screen flex flex-col antialiased"
      >
        {children}
      </body>
    </html>
  );
}
