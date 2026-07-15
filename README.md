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
- Publishing a book makes it available on the public site and includes it in the dynamic sitemap.
- Unpublishing removes the public route, sitemap entry, homepage placement, recommendations, and slider book target.
- A book slug is generated once during creation. Editing its title does not change its public URL.
- Deleting a published book returns a public 404 after cache revalidation.
- Metadata, canonicals, book structured data, and sitemap entries are generated from current Supabase content.

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

Preview deployments intentionally use `noindex`. Only the Vercel Production environment is indexable.

## Production deployment

1. Apply and verify every Supabase migration.
2. Configure all four environment variables in Vercel Production.
3. Configure the public Supabase URL and anon key for Preview as needed; keep previews non-indexable.
4. Deploy and complete public/admin smoke tests using the Vercel URL.
5. Connect `ramazantemelkuran.com` and redirect `www` to the apex domain.
6. Confirm HTTPS, canonicals, robots, sitemap, images, contact submission, and admin CRUD.
7. Only after content approval, verify Google Search Console and submit the sitemap.

See [PHASE_4_IMPLEMENTATION_PLAN.md](./PHASE_4_IMPLEMENTATION_PLAN.md) for launch gates, content-owner requirements, DNS steps, SEO validation, and post-launch monitoring.
