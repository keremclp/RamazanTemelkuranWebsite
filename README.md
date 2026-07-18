# Ramazan Temelkuran Official Website

Public author website and protected content-management panel for Ramazan Temelkuran. The application uses Next.js 16, Supabase, and Vercel.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and enter the Supabase values.
3. Apply the SQL files in `supabase/migrations` in filename order.
4. Start the project with `npm run dev`.

Required environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
SITE_URL=https://ramazantemelkuran.com
```

`SUPABASE_SECRET_KEY` is server-only and must never be prefixed with `NEXT_PUBLIC_`, committed, logged, or shared with the client. It is used only by the protected contact-form submission path.

## Content behavior

- New books default to Draft.
- Publishing a book adds it to the Books carousel, its stable detail page, recommendations, structured data, and the dynamic sitemap.
- Unpublishing removes the book from every public surface and the sitemap.
- A book slug is generated once during creation. Editing its title does not change its public URL.
- Deleting a published book returns a public 404 after cache revalidation.
- Metadata, canonicals, book structured data, and sitemap entries are generated from current Supabase content.

## Public slider architecture

- Admin → Slider supports uploaded promotional banners, curated book-cover compositions for Books or Shopier, and curated event-cover compositions.
- Curated homepage slides contain up to six manually selected items; their order controls the desktop layout and mobile priority.
- Book and event content remains managed in its original admin section, so later cover or event-cover edits automatically update the homepage composition.
- Admin → Books automatically supplies the Books-page carousel; draft books are excluded.
- Admin → Events/Gallery automatically supplies the Gallery event carousel, one event per slide.
- An event's explicit cover is stored in the existing `homepage_media_id` column but is presented to administrators as `Etkinlik kapak görseli`.
- If an explicit event cover is missing, the Gallery uses the first ordered photo, then the first valid video thumbnail, then a neutral placeholder.
- Carousel autoplay, arrows, dots, swipe, pause, page-visibility handling, and reduced-motion behavior are implemented in the public components.

## Verification

Run before every production deployment:

```bash
npm test
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

The important public endpoints are:

```text
/robots.txt
/sitemap.xml
/opengraph-image
/icon.svg
```

Vercel Preview deployments intentionally use `noindex`. A Vercel Production deployment, including the permanent `vercel.app` production URL, is indexable and must not be treated as a private preview.

## Production deployment

1. Back up the Supabase database and record which migrations are already applied.
2. Apply missing migrations in filename order through `20260717_add_hero_slide_presentation_type.sql`. The two `20260715` migrations are required by the current book and contact behavior.
3. Deploy and verify the application version that no longer reads the retired `presentation_type` and `cta_book_id` columns.
4. Apply `20260718_remove_hero_slide_book_presentation.sql`, `20260719_add_curated_hero_slide_sources.sql`, `20260720_allow_shopier_book_showcases.sql`, and `20260721_add_secondary_contact_email.sql` in order. These add curated selections, transactional persistence, the Shopier-targeted book showcase, and support for a second public contact email.
5. Configure all four environment variables in Vercel Production. Configure only the public Supabase variables in Preview when Preview deployments need database access.
6. Deploy the curated-slider application code and complete public/admin smoke tests using the Vercel URL.
7. Convert the existing `Kitaplarımız`, `Etkinliklerimiz`, and Shopier slides to their curated sources/destinations, verify desktop/mobile, and remove old fallback banners only after approval.
8. Connect `ramazantemelkuran.com` and redirect `www` to the apex domain.
9. Confirm HTTPS, canonicals, robots, sitemap, images, carousels, contact submission, and admin CRUD.
10. Only after content approval, verify Google Search Console and submit the sitemap.

Do not edit or re-run older migration files. Apply forward migrations once and in filename order; never deploy code that depends on a migration before that migration is present remotely.

See [PHASE_4_IMPLEMENTATION_PLAN.md](./PHASE_4_IMPLEMENTATION_PLAN.md) for launch gates, content-owner requirements, DNS steps, SEO validation, and post-launch monitoring.
