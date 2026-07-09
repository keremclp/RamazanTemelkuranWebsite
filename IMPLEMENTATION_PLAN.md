# Ramazan Temelkuran — Author Promotional Website

A stylish, warm & elegant promotional website for a book author, built with Next.js 15, Supabase, and Tailwind CSS v4. Includes a full admin panel for the author to manage all content.

---

## Decisions Summary

| Decision | Choice |
|---|---|
| Language | Turkish only |
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Database & Auth | Supabase (Auth + Database + Storage) |
| Photo Storage | Supabase Storage |
| Video Handling | YouTube/Vimeo embeds (paste URL in admin) |
| Admin Panel | Protected `/admin/*` routes within the same app |
| Admin Auth | Supabase Auth (single admin, email/password) |
| Book Detail View | Separate pages (`/books/[slug]`) |
| Book Reviews | Not implemented for now (future feature) |
| Contact Form | Stored in Supabase `contact_messages` table + email notification |
| Color Mood | Warm & Elegant (charcoal + cream/ivory + muted gold) |
| SEO | Full optimization (SSR/SSG, structured data, sitemap, Open Graph) |
| Deployment | Vercel |
| Content | Placeholder/demo content for now |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| Videos | YouTube/Vimeo embed URLs |
| Fonts | Google Fonts (Playfair Display + Inter) |
| Icons | Lucide React |
| Deployment | Vercel |
| Language | TypeScript |

---

## Design System

### Color Palette
| Token | Color | Usage |
|---|---|---|
| `primary` | Deep Charcoal `#2C2C2C` | Text, nav, dark backgrounds |
| `secondary` | Warm Cream `#FAF6F0` | Page backgrounds, cards |
| `accent` | Muted Gold `#C5A55A` | CTAs, highlights, borders, links |
| `accent-dark` | Dark Gold `#A68A3E` | Hover states |
| `surface` | Ivory `#FFFDF7` | Card backgrounds, sections |
| `muted` | Warm Gray `#8A8578` | Secondary text, captions |
| `border` | Light Tan `#E8E0D4` | Borders, dividers |

### Typography
| Element | Font | Weight |
|---|---|---|
| Headings | Playfair Display (serif) | 600–700 |
| Body | Inter (sans-serif) | 400–500 |
| Accent/Quotes | Playfair Display italic | 400i |

---

## Site Architecture

### Public Routes
```
app/
├── (public)/
│   ├── layout.tsx          # Public layout (nav + footer)
│   ├── page.tsx            # Home page
│   ├── books/
│   │   ├── page.tsx        # Books catalog
│   │   └── [slug]/
│   │       └── page.tsx    # Individual book detail
│   ├── gallery/
│   │   └── page.tsx        # Photo & video gallery
│   ├── about/
│   │   └── page.tsx        # About the author
│   └── contact/
│       └── page.tsx        # Contact form
```

### Admin Routes
```
app/
├── (admin)/
│   ├── admin/
│   │   ├── layout.tsx      # Admin layout (sidebar + header)
│   │   ├── page.tsx        # Dashboard overview
│   │   ├── login/
│   │   │   └── page.tsx    # Admin login page
│   │   ├── books/
│   │   │   ├── page.tsx    # List/manage books
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── gallery/
│   │   │   └── page.tsx
│   │   ├── slider/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── messages/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
```

---

## Database Schema

### books
- id (uuid, PK)
- title (text)
- slug (text, unique)
- description (text)
- cover_image_url (text)
- shopier_url (text)
- publisher (text)
- publication_year (int)
- page_count (int)
- isbn (text)
- display_order (int)
- created_at (timestamp)
- updated_at (timestamp)

### events
- id (uuid, PK)
- title (text)
- description (text)
- event_date (date)
- location (text)
- created_at (timestamp)

### media
- id (uuid, PK)
- event_id (uuid, FK → events)
- type (text: 'photo' | 'video')
- url (text)
- thumbnail_url (text)
- caption (text)
- display_order (int)
- created_at (timestamp)

### hero_slides
- id (uuid, PK)
- image_url (text)
- title (text)
- subtitle (text)
- cta_text (text)
- cta_link (text)
- display_order (int)
- is_active (boolean)
- created_at (timestamp)

### about_content
- id (uuid, PK)
- biography (text)
- portrait_image_url (text)
- milestones (jsonb)
- social_links (jsonb)
- updated_at (timestamp)

### contact_messages
- id (uuid, PK)
- name (text)
- email (text)
- subject (text)
- message (text)
- is_read (boolean)
- created_at (timestamp)

### site_settings
- id (uuid, PK)
- site_title (text)
- shopier_main_url (text)
- meta_description (text)
- social_links (jsonb)
- updated_at (timestamp)

---

## Implementation Phases

### Phase 1 — Foundation
1. Initialize Next.js 15 project
2. Set up Supabase (schema, storage, auth)
3. Configure Supabase client
4. Set up middleware for admin routes
5. Build design system
6. Build Navbar + Footer

### Phase 2 — Public Pages
7. Home page
8. Books page
9. Book detail page
10. Gallery page
11. About page
12. Contact page

### Phase 3 — Admin Panel
13. Admin login
14. Admin layout
15. Dashboard
16. Books CRUD
17. Events CRUD
18. Gallery management
19. Hero slider management
20. About page editor
21. Messages viewer
22. Site settings

### Phase 4 — Polish & Deploy
23. SEO optimization
24. Animations
25. Responsive polish
26. Performance optimization
27. Deploy to Vercel
