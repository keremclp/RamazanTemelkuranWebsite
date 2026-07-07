import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { getSiteSettings } from "@/lib/site-settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar
        siteTitle={settings.site_title}
        shopierUrl={settings.shopier_main_url}
      />
      <main className="flex-1 pt-20">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
