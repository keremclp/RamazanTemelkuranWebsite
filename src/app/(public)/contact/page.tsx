import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import ContactForm from "@/components/public/ContactForm";
import { getSiteSettings } from "@/lib/site-settings";
import type { SocialLinks } from "@/lib/types/database";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Ramazan Temelkuran ile iletişime geçin.",
};

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const socialPlatforms: {
  key: keyof SocialLinks;
  label: string;
  icon: typeof InstagramIcon;
}[] = [
  { key: "instagram", label: "Instagram", icon: InstagramIcon },
  { key: "youtube", label: "YouTube", icon: YouTubeIcon },
];

function isDisplayableUrl(value: string | undefined) {
  return Boolean(value && value !== "#");
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const contactEmail = settings.contact_email?.trim() ?? "";
  const contactLocation = settings.contact_location?.trim() ?? "";
  const socialEntries = socialPlatforms.flatMap((platform) => {
    const href = settings.social_links?.[platform.key];
    return isDisplayableUrl(href) ? [{ ...platform, href: href as string }] : [];
  });
  const hasContactDetails = Boolean(contactEmail || contactLocation);

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center animate-fade-in-up">
          <h1 className="mb-4 text-4xl font-bold text-primary font-[family-name:var(--font-heading)] md:text-5xl">
            İletişim
          </h1>
          <div className="mx-auto mb-4 h-1 w-16 bg-accent" />
          <p className="mx-auto max-w-2xl text-lg text-muted">
            Sorularınız, önerileriniz veya iş birliği talepleriniz için bizimle iletişime geçin.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 animate-fade-in-up lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-[var(--radius-xl)] bg-surface p-8 shadow-[var(--shadow-card)]">
              <h2 className="mb-6 text-xl font-bold text-primary font-[family-name:var(--font-heading)]">
                Mesaj Gönderin
              </h2>
              <ContactForm />
            </div>
          </div>

          <div className="space-y-6">
            {hasContactDetails && (
              <div className="rounded-[var(--radius-xl)] bg-surface p-8 shadow-[var(--shadow-card)]">
                <h3 className="mb-6 text-lg font-bold text-primary font-[family-name:var(--font-heading)]">
                  İletişim Bilgileri
                </h3>

                <div className="space-y-5">
                  {contactEmail && (
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                        <Mail className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">E-posta</p>
                        <a
                          href={`mailto:${contactEmail}`}
                          className="text-sm text-muted transition-colors hover:text-accent"
                        >
                          {contactEmail}
                        </a>
                      </div>
                    </div>
                  )}

                  {contactLocation && (
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                        <MapPin className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">Konum</p>
                        <p className="text-sm text-muted">{contactLocation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {socialEntries.length > 0 && (
              <div className="rounded-[var(--radius-xl)] bg-surface p-8 shadow-[var(--shadow-card)]">
                <h3 className="mb-6 text-lg font-bold text-primary font-[family-name:var(--font-heading)]">
                  Sosyal Medya
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {socialEntries.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2.5 rounded-[var(--radius-md)] border border-border px-4 py-3 transition-all duration-[var(--transition-base)] hover:border-accent hover:bg-accent/5"
                    >
                      <Icon className="h-4 w-4 text-muted transition-colors group-hover:text-accent" />
                      <span className="text-xs font-medium text-primary transition-colors group-hover:text-accent">
                        {label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
