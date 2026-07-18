# Task Tracker — Ramazan Temelkuran Website

## Phase 1 — Foundation ✅
- [x] Initialize Next.js 16 project with TypeScript and Tailwind CSS v4
- [x] Copy implementation plan to codebase
- [x] Configure Supabase client (browser + server)
- [x] Set up proxy for admin route protection
- [x] Build the design system (globals.css, Tailwind theme)
- [x] Build the global layout: Navbar + Footer
- [x] Create database schema SQL + seed data
- [x] **USER ACTION**: Run `schema.sql` in Supabase SQL Editor
- [x] **USER ACTION**: Create `media` storage bucket (public) in Supabase

## Phase 2 — Public Pages ✅
- [x] Home page (promotional HeroSlider, Author Spotlight, social/contact closing section)
- [x] Books page (published-book carousel supplied by Admin → Books)
- [x] Book detail page (`/books/[slug]` with generateMetadata)
- [x] Gallery page (one event per carousel slide, media dialog, and photo lightbox)
- [x] About page (bio, milestones timeline, social links)
- [x] Contact page (ContactForm + API route `/api/contact`)

## Phase 3 — Admin Panel
- [x] Admin login page with Supabase Auth
- [x] Separate login layout and database-backed admin allowlist
- [x] Admin layout (sidebar navigation, header)
- [x] Dashboard with stats
- [x] Books CRUD
- [x] Events CRUD + media management
- [x] Gallery management
- [x] Hero slider management
- [x] Automatic hero button destinations (page, Shopier, or external site)
- [x] About page editor
- [x] Contact messages viewer
- [x] Site settings
- [x] Supabase Storage cleanup for removed and replaced images
- [x] In-place gallery photo replacement and video URL editing

## Phase 4 — Polish & Deploy
Detailed execution plan: [PHASE_4_IMPLEMENTATION_PLAN.md](PHASE_4_IMPLEMENTATION_PLAN.md)

- [x] Technical SEO foundation: metadata, canonicals, structured data, sitemap, robots
- [x] Animation, micro-interaction, and reduced-motion polish
- [x] Local responsive/accessibility smoke testing and polish
- [ ] Full deployed device/browser/accessibility matrix
- [x] Source-level performance optimization
- [x] Customer-requested homepage, Books, and Gallery carousel architecture
- [ ] Production performance measurement and Core Web Vitals validation
- [x] Prepare and document Phase 4 migrations and production secrets
- [ ] Apply and verify all Phase 4 migrations remotely
- [ ] Deploy to Vercel, connect the domain, and complete Google launch steps
