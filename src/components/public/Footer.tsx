import Link from "next/link";
import { BookOpen, Mail, ArrowUpRight } from "lucide-react";
import { NAV_LINKS } from "@/lib/utils/constants";
import type { SiteSettings } from "@/lib/types/database";

/* Social media SVG icons (Lucide dropped brand icons) */
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const socialPlatforms = ["instagram", "youtube"] as const;

const socialIconMap: Record<(typeof socialPlatforms)[number], React.ReactNode> = {
  instagram: <InstagramIcon />,
  youtube: <YoutubeIcon />,
};

const socialLabels: Record<(typeof socialPlatforms)[number], string> = {
  instagram: "Instagram",
  youtube: "YouTube",
};

export default function Footer({ settings }: { settings: SiteSettings }) {
  const currentYear = new Date().getFullYear();
  const socialEntries = socialPlatforms.flatMap((platform) => {
    const url = settings.social_links[platform];
    return url && url !== "#" ? [{ platform, url }] : [];
  });
  const contactEmails = Array.from(
    new Set(
      [settings.contact_email, settings.contact_email_secondary]
        .map((email) => email?.trim())
        .filter((email): email is string => Boolean(email))
    )
  );

  return (
    <footer className="bg-primary text-white/80">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-white">
              {settings.site_title}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              {settings.meta_description}
            </p>
            {socialEntries.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                {socialEntries.map(({ platform, url }) => (
                  <SocialLink
                    key={platform}
                    href={url}
                    icon={socialIconMap[platform]}
                    label={socialLabels[platform]}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
              Hızlı Bağlantılar
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-accent transition-colors duration-200 no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shopier & Contact */}
          <div className="space-y-6">
            {settings.shopier_main_url && (
              <div className="space-y-4">
                <h4 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                  Kitap Siparişi
                </h4>
                <p className="text-sm text-white/60">
                  Kitaplarıma Shopier üzerinden ulaşabilirsiniz.
                </p>
                <Link
                  href={settings.shopier_main_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark transition-colors no-underline"
                >
                  <BookOpen size={16} />
                  Shopier&apos;e Git
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            )}

            {contactEmails.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                İletişim
              </h4>
              <div className="space-y-2">
                {contactEmails.map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 break-all text-sm text-white/60 hover:text-accent transition-colors no-underline"
                  >
                    <Mail size={14} className="shrink-0" />
                    {email}
                  </a>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; {currentYear} {settings.site_title} | Tüm hakları saklıdır | Tasarım: <a href="https://keremcancelepkolu.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-accent transition-colors no-underline">keremcancelepkolu.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white/60 hover:bg-accent hover:text-white transition-all duration-200 no-underline"
    >
      {icon}
    </a>
  );
}
