import type { Metadata } from "next";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { AboutContent } from "@/lib/types/database";
import { getSiteSettings } from "@/lib/site-settings";
import { createPageMetadata, metaDescription } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";
import JsonLd from "@/components/public/JsonLd";
import PageIntro from "@/components/public/PageIntro";
import ResilientImage from "@/components/public/ResilientImage";
import { parseBiographyBlocks } from "@/lib/biography";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return createPageMetadata({
    title: "Hakkında",
    description: `${settings.site_title} hakkında biyografi ve kariyer bilgileri.`,
    path: "/about",
    type: "profile",
  });
}

/* ---- Social media inline SVG icons ---- */
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

const socialPlatforms = ["instagram", "youtube"] as const;

const socialIconMap: Record<
  (typeof socialPlatforms)[number],
  React.FC<{ className?: string }>
> = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
};

const socialLabels: Record<(typeof socialPlatforms)[number], string> = {
  instagram: "Instagram",
  youtube: "YouTube",
};

export default async function AboutPage() {
  const supabase = await createClient();

  const [{ data }, settings] = await Promise.all([
    supabase.from("about_content").select("*").single(),
    getSiteSettings(),
  ]);

  const about = data as AboutContent | null;
  const biography = metaDescription(
    about?.biography ?? "",
    settings.meta_description
  );
  const sameAs = socialPlatforms.flatMap((platform) => {
    const url = about?.social_links?.[platform];
    return url ? [url] : [];
  });
  const socialEntries = socialPlatforms.flatMap((platform) => {
    const url = about?.social_links?.[platform];
    return url ? [{ platform, url }] : [];
  });

  return (
    <section className="py-6 sm:py-10 lg:py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absoluteUrl("/about"),
          name: `${settings.site_title} Hakkında`,
          mainEntity: {
            "@type": "Person",
            name: settings.site_title,
            url: absoluteUrl("/about"),
            description: biography,
            image: about?.portrait_image_url || undefined,
            sameAs: sameAs.length ? sameAs : undefined,
          },
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageIntro title="Hakkında" />

        {/* Hero Section */}
        <div className="mb-16 grid grid-cols-1 gap-8 animate-fade-in-up lg:grid-cols-5 lg:gap-10">
          {/* Portrait */}
          {/* Make it center for portrait vertically */}
          <div className="lg:col-span-2 lg:flex lg:items-center">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-card-hover)]">
              {about?.portrait_image_url ? (
                <ResilientImage
                  src={about.portrait_image_url}
                  alt={settings.site_title}
                  fallback={<div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-primary/20 flex items-center justify-center"><User className="w-24 h-24 text-accent/50" /></div>}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-primary/20 flex items-center justify-center">
                  <User className="w-24 h-24 text-accent/50" />
                </div>
              )}
            </div>
          </div>

          {/* Biography */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-heading)] text-primary mb-6">
              {settings.site_title}
            </h2>

            {about?.biography ? (
              <div className="space-y-4 text-primary/80 leading-relaxed">
                {parseBiographyBlocks(about.biography).map((block, index) =>
                  block.type === "list" ? (
                    <ul
                      key={`list-${index}`}
                      className="list-disc space-y-2 pl-6 marker:text-accent"
                    >
                      {block.items.map((item, itemIndex) => (
                        <li key={`${item}-${itemIndex}`}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={`paragraph-${index}`}>{block.text}</p>
                  )
                )}
              </div>
            ) : (
              <p className="text-muted italic">
                Biyografi bilgisi henüz eklenmemiştir.
              </p>
            )}
          </div>
        </div>

        {/* Milestones Timeline */}
        {about?.milestones && about.milestones.length > 0 && (
          <div className="mb-24">
            <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-heading)] text-primary mb-12 text-center">
              Kariyer Yolculuğu
            </h2>

            <div className="relative max-w-3xl mx-auto">
              {/* Vertical Line */}
              <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-border"></div>

              <div className="space-y-12">
                {about.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="relative pl-12 md:pl-20 animate-slide-in-left"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* Dot */}
                    <div className="absolute left-2.5 md:left-6.5 top-1 w-3 h-3 rounded-full bg-accent border-2 border-surface shadow-sm"></div>

                    {/* Year Badge */}
                    <span className="inline-block bg-accent/10 text-accent-ink text-sm font-bold px-3 py-1 rounded-full mb-2">
                      {milestone.year}
                    </span>

                    <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-primary mb-1">
                      {milestone.title}
                    </h3>

                    <p className="text-muted text-sm leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Social Media Links */}
        {socialEntries.length > 0 && (
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-heading)] text-primary mb-8">
              Sosyal Medya
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {socialEntries.map(({ platform, url }) => {
                const IconComponent = socialIconMap[platform];

                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-6 py-3 bg-surface border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-accent hover:-translate-y-0.5 transition-all duration-300"
                    title={socialLabels[platform]}
                  >
                    <IconComponent className="w-5 h-5 text-muted group-hover:text-accent-ink transition-colors" />
                    <span className="text-sm font-medium text-primary group-hover:text-accent-ink transition-colors">
                      {socialLabels[platform]}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
