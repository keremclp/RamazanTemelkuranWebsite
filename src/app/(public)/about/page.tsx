import type { Metadata } from "next";
import Image from "next/image";
import { User, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { AboutContent } from "@/lib/types/database";

export const metadata: Metadata = {
  title: "Hakkında",
  description: "Yazar Ramazan Temelkuran hakkında bilgiler, biyografi ve kariyer.",
};

/* ---- Social media inline SVG icons ---- */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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

const socialIconMap: Record<string, React.FC<{ className?: string }>> = {
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
};

const socialLabels: Record<string, string> = {
  instagram: "Instagram",
  twitter: "X (Twitter)",
  facebook: "Facebook",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  website: "Web Sitesi",
};

export default async function AboutPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("about_content")
    .select("*")
    .single();

  const about = data as AboutContent | null;

  return (
    <section className="section-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-primary mb-4">
            Hakkında
          </h1>
          <div className="w-16 h-1 bg-accent mx-auto"></div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-24 animate-fade-in-up">
          {/* Portrait */}
          <div className="lg:col-span-2">
            <div className="relative aspect-[3/4] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-card-hover)]">
              {about?.portrait_image_url ? (
                <Image
                  src={about.portrait_image_url}
                  alt="Ramazan Temelkuran"
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
              Ramazan Temelkuran
            </h2>

            {about?.biography ? (
              <div className="space-y-4 text-primary/80 leading-relaxed">
                {about.biography.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
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
                    <span className="inline-block bg-accent/10 text-accent text-sm font-bold px-3 py-1 rounded-full mb-2">
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
        {about?.social_links && Object.keys(about.social_links).length > 0 && (
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-heading)] text-primary mb-8">
              Sosyal Medya
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {Object.entries(about.social_links).map(([platform, url]) => {
                if (!url) return null;
                const IconComponent = socialIconMap[platform];

                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-6 py-3 bg-surface border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-accent hover:-translate-y-0.5 transition-all duration-300"
                    title={socialLabels[platform] || platform}
                  >
                    {IconComponent ? (
                      <IconComponent className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                    ) : (
                      <Mail className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                    )}
                    <span className="text-sm font-medium text-primary group-hover:text-accent transition-colors">
                      {socialLabels[platform] || platform}
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
