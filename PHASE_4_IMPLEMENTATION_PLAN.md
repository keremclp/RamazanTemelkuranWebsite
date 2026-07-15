# Phase 4 — Production, SEO, Search Visibility, and Launch Plan

**Project:** Ramazan Temelkuran official author website  
**Production domain:** `https://ramazantemelkuran.com`  
**Primary audience:** Türkiye  
**Primary language:** Turkish  
**Public identity:** `Yazar Ramazan Temelkuran`  
**Hosting:** Vercel  
**Domain registrar / DNS:** Natro  
**Backend:** Supabase  
**Plan status:** Ready for approval; implementation has not started  
**Last reviewed:** 2026-07-15

---

## 1. Purpose

Phase 4 turns the existing working application into a production website that is:

- safe to publish on `ramazantemelkuran.com`;
- understandable and crawlable by Google;
- capable of generating SEO information dynamically from Supabase content;
- resilient when the client adds, edits, or deletes content in the admin panel;
- polished across mobile, tablet, and desktop;
- accessible and respectful of reduced-motion preferences;
- measured and improved for production performance;
- connected to Google Search Console after launch;
- documented well enough to operate after handoff.

The target Google result is the normal official-site result, ideally with useful sitelinks such as **Hakkında**, **Kitaplar**, **Galeri**, and **İletişim**. Google generates rankings, titles, snippets, favicons, and sitelinks automatically. We can make the site eligible and provide strong signals, but we cannot guarantee the first position, exact sitelinks, a Knowledge Panel, or an immediate result.

---

## 2. Rules for a Non-Random Implementation

The following rules apply throughout Phase 4:

1. Do not invent biography details, awards, dates, ISBN values, publishers, reviews, ratings, social profiles, or contact details.
2. Optional information that is unavailable must be hidden or omitted rather than replaced with fake content.
3. Structured data must match content that visitors can see on the page.
4. SEO metadata must be generated from approved Site Settings, About content, and book records.
5. Admin-managed content must remain dynamic; Phase 4 must not hardcode the three launch books.
6. A normal title edit must not unexpectedly change an established public URL.
7. Draft or incomplete content must not enter the public sitemap.
8. Admin routes and API routes must never enter the public sitemap.
9. Production indexing must not begin until the client approves the public content.
10. Google-facing changes must be validated after deployment, not only in local development.

---

## 3. Locked Decisions

| Decision | Selected approach |
|---|---|
| Canonical origin | `https://ramazantemelkuran.com` |
| `www` behavior | Redirect `https://www.ramazantemelkuran.com` to the canonical apex domain |
| Primary search market | Google Türkiye |
| Site language | Turkish (`tr`) |
| Kurdish content | Preserve exact Kurdish book titles and descriptions; no separate Kurdish site is required for launch |
| Site identity | `Ramazan Temelkuran` / `Yazar Ramazan Temelkuran` |
| Analytics | None for launch |
| Contact notifications | Admin panel only; no email notification integration |
| Public launch | Final public launch after a Vercel production-preview verification pass |
| Structured identity | `WebSite`, `ProfilePage`, and `Person`; do not present the author as a local business |
| Book SEO | Dynamic metadata and `Book` structured data from Supabase |
| Admin SEO | `noindex`; excluded from sitemap and crawler routes |
| Missing optional data | Omit cleanly; never create placeholders |

---

## 4. Current Baseline

### Already implemented

- Next.js 16 App Router and React 19.
- Supabase database, authentication, storage, and RLS.
- Database-backed administrator allowlist.
- Separate `/admin/login` layout without the dashboard sidebar.
- Public pages for home, books, book detail, gallery, about, and contact.
- Admin CRUD for books, events, gallery, slider, About, messages, and settings.
- Automatic book slug creation.
- Dynamic slider CTA destinations.
- Supabase Storage cleanup and temporary-upload tracking.
- Contact form validation, honeypot, and basic in-process rate limiting.
- Baseline metadata and dynamic book-detail metadata.
- Admin/login `noindex` metadata.
- Responsive components and several accessibility improvements.
- Resilient image fallbacks.
- Unit tests for slugs, CTA resolution, YouTube parsing, URL validation, uploads, and Storage paths.

### Still missing or incomplete

- Production site-origin configuration and `metadataBase`.
- Explicit canonical URLs.
- Complete per-route Open Graph and Twitter metadata.
- Production favicon, application icons, and social-sharing image.
- Dynamic `sitemap.xml`.
- Production-aware `robots.txt`.
- JSON-LD structured data.
- Stable book slugs after title edits.
- A draft/published state for books.
- Durable contact rate limiting suitable for Vercel serverless instances.
- Custom public 404 and global error experiences.
- Formal responsive/browser test matrix.
- Reduced-motion treatment for all animations and hero autoplay.
- Production Lighthouse/Core Web Vitals audit.
- Bundle and media-loading review.
- Deliberate route/form loading feedback for slower Supabase operations.
- Explicit font-loading and typography layout-shift audit.
- Natro/Vercel domain configuration.
- Supabase production URL configuration verification.
- Google Search Console ownership, sitemap submission, and indexing checks.
- Project-specific README and operations documentation.

---

## 5. Launch Gates

Phase 4 uses three gates so technical work can progress without publishing incomplete content.

### Gate A — Ready to start implementation

Required:

- [x] Confirm this plan.
- [ ] Purchase `ramazantemelkuran.com` if Natro confirms it is available.
- [ ] Do **not** change DNS records yet.
- [x] Confirm the canonical domain remains `https://ramazantemelkuran.com`.
- [x] Confirm the author identity remains `Yazar Ramazan Temelkuran`.

The biography, social URLs, and final images do not block the first technical implementation steps.

### Gate B — Ready to connect the production domain

Required:

- [ ] Client-approved biography is entered in Admin → About.
- [ ] Client-approved portrait is uploaded.
- [ ] Homepage contains only real slides and real CTA destinations.
- [ ] Every publicly visible launch book has accurate required information.
- [ ] Test/demo books, events, slides, and gallery media are removed.
- [ ] Official Instagram, YouTube, Facebook (if used), and Shopier URLs are confirmed.
- [ ] Official contact email/location are confirmed or intentionally left hidden.
- [ ] Publication permission exists for all displayed images and book covers.
- [ ] Client approves the favicon and social-sharing image.
- [ ] Privacy/KVKK text or an approved decision for the contact form is available.
- [ ] All Supabase migrations are applied and verified.
- [ ] Full public/admin smoke test passes on the Vercel deployment.

### Gate C — Ready to ask Google to index

Required:

- [ ] Apex domain and `www` redirect work over HTTPS.
- [ ] No public page contains demo or unapproved content.
- [ ] Canonical tags point to `https://ramazantemelkuran.com`.
- [ ] `/robots.txt` is correct and references the production sitemap.
- [ ] `/sitemap.xml` contains only current public URLs.
- [ ] Admin, login, API, draft, and deleted content are excluded.
- [ ] Structured data passes validation without errors.
- [ ] Favicon and OG image resolve publicly.
- [ ] Mobile, keyboard, reduced-motion, and performance checks pass.
- [ ] Search Console Domain property is verified through Natro DNS.

Only after Gate C should the sitemap be submitted and indexing requested.

---

## 6. What the Project Owner Must Prepare

### 6.1 Domain and account access

- [ ] Purchase `ramazantemelkuran.com` from Natro.
- [ ] Keep access to the Natro DNS management screen.
- [ ] Keep access to GitHub, Vercel, and Supabase.
- [ ] Select the Google account that will own Search Console.
- [ ] Never send passwords in chat; sign in directly or grant appropriate account access.

### 6.2 Approved author identity

- [ ] Exact public name: `Ramazan Temelkuran`.
- [ ] Exact role: `Yazar Ramazan Temelkuran`.
- [ ] Approved biography based only on facts supplied or approved by the client.
- [ ] Approved portrait with publication permission.
- [ ] Optional approved milestones.
- [ ] Confirmation that existing author and ilahî-performer profiles refer to the same person.

### 6.3 Initial book content

For every launch book, verify what is available:

- [ ] Exact title and spelling.
- [ ] Accurate description.
- [ ] Correct cover and permission to publish it.
- [ ] Publisher.
- [ ] Publication year.
- [ ] Page count.
- [ ] ISBN.
- [ ] Purchase/Shopier link.
- [ ] Display order.

Missing optional facts may remain empty. Incorrect facts must not be guessed.

### 6.4 Official external profiles

Collect the exact URLs for:

- [ ] Instagram.
- [ ] YouTube.
- [ ] Facebook, if used.
- [ ] Shopier.
- [ ] Publisher author pages, if available.
- [ ] Bookstore author pages, if available.
- [ ] Interviews, articles, or controlled profile pages, if available.

After launch, controlled profiles should link back to `https://ramazantemelkuran.com`. This is what the earlier “external profile” question meant: add the official website address to Instagram/YouTube/Facebook/Shopier bios or profile fields wherever the client has control.

### 6.5 Legal/privacy content

- [ ] Obtain client-approved privacy/KVKK wording for the contact form.
- [ ] Decide whether a required acknowledgement/consent checkbox is needed based on approved advice.
- [ ] Do not present generated legal text as professional legal advice.

No analytics is planned, so an analytics-cookie workflow is outside the current scope unless the decision changes.

---

## 7. Pre-Phase-4 Application Updates

These updates should be completed before the main SEO implementation because they determine how changing admin content behaves after Google indexes the site.

### 7.1 Stable book URLs

**Current risk:** editing a book title regenerates its slug. After indexing, this could break Google results, bookmarks, slider links, and external bookstore/article links.

**Required change:**

- Generate the slug only when a book is first created.
- Preserve the existing slug during normal title/description edits.
- Keep the slug field hidden from the client.
- If intentional URL regeneration is added later, it must also create a permanent redirect from the old slug.
- Add tests proving that ordinary edits do not change the slug.

**Launch decision:** intentional URL regeneration is not required in the admin panel for launch. Stable URLs are safer.

### 7.2 Book publication state

Add a simple `is_published` state:

- Existing real books migrate to `true`.
- New books may be saved as draft or published deliberately.
- Public book lists and details query published books only.
- The sitemap includes published books only.
- Homepage/related-book queries include published books only.
- A slider CTA to an unpublished/deleted book must disappear safely instead of creating a broken link.
- Admin lists show a clear `Taslak` or `Yayında` badge.
- Deleting a book remains available for mistakes/test records, with a clear permanent-deletion warning.

Recommended form behavior:

- `Taslak olarak kaydet`
- `Yayınla`
- Editing a published book keeps it published unless the administrator changes the state.

### 7.3 Deletion behavior

- Deleting an incorrect/test book permanently removes the database row and its Storage cover.
- The removed URL returns a proper 404 and is removed from the sitemap.
- Google may temporarily retain the old result until it recrawls the 404; this is normal.
- A real but out-of-print book should normally remain published with its purchase button hidden, rather than being deleted.
- If content is replaced by another page, add a permanent redirect instead of leaving a 404.

### 7.4 Durable contact abuse protection

**Current risk:** the contact rate-limit map is stored in application memory. Vercel can run multiple serverless instances, so this is not a durable global limit.

**Required change:**

- Keep server-side validation and the honeypot.
- Replace or supplement the in-memory limit with a durable Supabase-backed rate-limit function/table or an approved Vercel protection feature.
- Avoid storing raw IP addresses longer than necessary; use a short-lived hash if a database implementation is selected.
- Add cleanup/retention behavior.
- Preserve clear success and rate-limit messages.

### 7.5 Production environment configuration

Introduce a single trusted site-origin helper:

- Production value: `https://ramazantemelkuran.com`.
- Local value: `http://localhost:3000`.
- Use it for metadata, canonical URLs, sitemap, robots, JSON-LD, and OG images.
- Fail clearly when required Supabase variables are unavailable in production.
- Keep `.env*` files ignored and secrets out of Git.

### 7.6 Error and not-found pages

- Add a branded public 404 page.
- Add a recoverable public error state/global error boundary.
- Add intentional route-level loading UI or skeletons where Supabase reads can delay navigation.
- Keep existing button/form pending states clear and prevent duplicate submissions.
- Ensure missing/deleted books return a real 404 status.
- Ensure admin errors do not expose server details.

---

## 8. Phase 4 Technical Implementation

### 8.1 Metadata and canonical URLs

Implement a consistent metadata system using the Next.js 16 Metadata API.

#### Global metadata

- Set `metadataBase` to the trusted production origin.
- Use the dynamic Site Settings title and description.
- Set the site name to `Ramazan Temelkuran`.
- Set the Turkish locale.
- Provide authors/creator/publisher fields where accurate.
- Add default Open Graph metadata.
- Add default Twitter card metadata without inventing a Twitter account.
- Add a default canonical URL.
- Keep admin and login metadata `noindex, nofollow`.

#### Route metadata

Provide unique title, description, canonical, and social metadata for:

- `/`
- `/books`
- `/books/[slug]`
- `/gallery`
- `/about`
- `/contact`

Book metadata must use current Supabase content and omit absent fields safely. Titles, headings, visible text, and Open Graph titles must be consistent to reduce Google rewriting them unexpectedly.

#### Suggested title pattern

- Home: `Ramazan Temelkuran | Resmî Yazar Web Sitesi`
- Books: `Kitaplar | Ramazan Temelkuran`
- Book: `{Kitap Adı} | Ramazan Temelkuran`
- About: `Ramazan Temelkuran Hakkında | Biyografi`
- Gallery: `Galeri | Ramazan Temelkuran`
- Contact: `İletişim | Ramazan Temelkuran`

Final wording must be reviewed against the approved visible content before launch.

### 8.2 Dynamic sitemap

Create `src/app/sitemap.ts` using the Next.js `MetadataRoute.Sitemap` type.

Include:

- `/`
- `/books`
- every published `/books/[slug]` URL
- `/gallery`
- `/about`
- `/contact`

Exclude:

- `/admin/**`
- `/admin/login`
- `/api/**`
- drafts
- deleted content
- URL variants and filter state

Use real modification timestamps where available. Include book-cover image URLs where useful and valid. Revalidate `/sitemap.xml` after book publication, editing, or deletion so client changes are reflected automatically.

No multilingual `hreflang` entries should be created until real translated pages exist. Kurdish book titles can remain on Turkish pages without pretending there is a separate Kurdish site version.

### 8.3 Production-aware robots configuration

Create `src/app/robots.ts`.

Production behavior:

- Allow public pages.
- Disallow `/admin/` and `/api/` crawling.
- Reference `https://ramazantemelkuran.com/sitemap.xml`.
- Set the production host.

Non-production behavior:

- Prevent indexing on preview/test deployments.
- Keep admin/login `noindex` metadata as defense in depth.

Robots rules alone are not an access-control mechanism; admin authorization and RLS remain mandatory.

### 8.4 Structured data (JSON-LD)

Create shared, tested JSON-LD helpers. Serialize safely by escaping `<` in dynamic text.

#### Homepage

Add `WebSite`:

- `name`: `Ramazan Temelkuran`
- `url`: canonical homepage
- optional accurate `alternateName` only if the client supplies one

Add a `Person` reference only with visible, approved information.

#### About page

Add `ProfilePage` with `Person` as `mainEntity`:

- name
- description from the approved biography
- official portrait, when present
- `sameAs` using verified external profiles only
- canonical URL

Do not add birth date, job titles, awards, or identifiers that the client has not approved.

#### Book detail pages

Add `Book` data from each published record:

- name
- description
- author
- image when available
- ISBN when available
- publisher when available
- publication date/year when accurate
- canonical URL
- purchase URL only when valid

Do not add invented ratings, reviews, prices, availability, editions, or language values.

#### Breadcrumbs

Add `BreadcrumbList` to book details and other routes where visible navigation supports it.

Validation:

- Google Rich Results Test where the type is supported.
- Schema Markup Validator for general Schema.org validity.
- Confirm all structured fields match visible content.

### 8.5 Internal linking and sitelink readiness

Google decides sitelinks automatically. Improve eligibility by:

- keeping the primary navigation simple and consistent;
- using concise page titles and one clear main heading per page;
- linking to Books, About, Gallery, and Contact from the homepage and footer;
- using descriptive internal-link text;
- avoiding duplicate sections and duplicate page titles;
- ensuring important pages are reachable without JavaScript-only interactions;
- maintaining stable URLs.

No implementation should claim that sitelinks are guaranteed.

### 8.6 Brand/search assets

Create and obtain client approval for:

- square master mark based on the existing gold book identity;
- favicon with a stable URL and sizes suitable for browsers and Google Search;
- Apple touch icon;
- optional web-app icon sizes;
- default 1200×630 Open Graph image;
- optional dynamic book Open Graph image using the book cover/title.

Remove unused default Next.js/Vercel starter SVG assets once confirmed unused.

### 8.7 Social sharing

Verify previews for:

- homepage;
- About page;
- books listing;
- each book detail page.

Every preview must have:

- correct canonical URL;
- correct title and description;
- publicly accessible image;
- no admin/test URLs;
- no fake social handle.

---

## 9. Responsive, Accessibility, and Animation Pass

### 9.1 Viewport matrix

Test public and admin flows at minimum at:

- 320×568
- 375×667
- 390×844
- 768×1024
- 1024×768
- 1280×800
- 1440×900

Test Chrome, Firefox, and Safari/WebKit behavior where available, plus a real Android or iOS device if possible.

At every relevant viewport, explicitly test:

- public and admin navigation;
- book, event, slider, About, Settings, gallery, and contact forms;
- gallery filters and media cards;
- lightbox controls and focus behavior;
- hero slider controls, autoplay, and CTA buttons;
- primary, secondary, destructive, loading, and disabled button states.

### 9.2 Content stress cases

Test:

- very long Turkish/Kurdish book titles;
- long author biography paragraphs;
- long slider titles and buttons;
- missing portrait or cover;
- no Shopier link;
- no social profiles;
- one slide, multiple slides, and no slides;
- empty gallery and empty events;
- route and form loading states on a throttled connection;
- database error and retry states;
- broken/missing remote images and thumbnails;
- draft and published books;
- deleted book URLs;
- 200% browser zoom.

### 9.3 Accessibility acceptance

- All functionality works by keyboard.
- Focus indicators are visible.
- Mobile menu and lightbox retain correct focus behavior.
- Forms have labels and accessible errors.
- Color contrast is checked.
- Decorative images use empty alt text; meaningful images use accurate alt text.
- Headings follow a logical hierarchy.
- Touch targets are large enough for mobile use.
- Page language remains `tr`.

### 9.4 Motion rules

- Respect `prefers-reduced-motion` globally.
- Disable non-essential entrance animation for reduced-motion users.
- Stop hero autoplay for reduced-motion users.
- Pause hero autoplay on hover and keyboard focus.
- Do not hide important content until an animation completes.
- Avoid animation-induced layout shift.
- Keep animation subtle; do not add a heavy animation library unless measurements justify it.

---

## 10. Performance Optimization

Measure first, then change.

### 10.1 Baseline measurements

- Run a production build.
- Run Lighthouse in an incognito window against the deployed production-like build.
- Record mobile and desktop scores.
- Record LCP, CLS, INP/TBT proxy, image weight, and JavaScript transfer size.
- Test on a throttled mobile connection.

### 10.2 Likely optimization areas

- Ensure only the first/current hero image receives priority.
- Avoid eagerly downloading every slider image in the first viewport.
- Confirm correct `sizes` values for all responsive images.
- Use appropriate image dimensions and compression before upload.
- Keep JPG/PNG/WebP upload limits; evaluate AVIF only if operationally useful.
- Preserve layout dimensions to prevent CLS.
- Verify `next/font` remains self-hosted, uses the required Turkish/Latin subsets, and does not cause typography-driven layout shift.
- Review Supabase image cache behavior and unique object filenames.
- Tighten the Supabase `remotePatterns` hostname to the actual project hostname if practical.
- Review Client Component boundaries and avoid unnecessary browser JavaScript.
- Review repeated Supabase reads and cache only data that can be invalidated safely.
- Confirm admin Server Actions revalidate every affected public route, sitemap, and metadata result.
- Analyze the bundle only if Lighthouse or build output identifies a meaningful issue.
- Measure first-load behavior on a throttled mobile connection, including hero media, fonts, and Supabase responses.

### 10.3 Performance acceptance targets

Targets are guidelines, not promises across every device/network:

- No major Core Web Vitals failures in production testing.
- No visible layout shift in navbar, hero, book cards, or gallery.
- No unnecessary loading of hidden hero media.
- Homepage remains usable on a throttled mobile connection.
- Images remain legible without sending original oversized files to small screens.
- Navigation and form submissions always provide understandable loading feedback.

---

## 11. Security and Production Hardening

- Verify every admin Server Action calls the database-backed admin check.
- Verify RLS policies on all public/admin tables.
- Verify Storage upload/update/delete policies use `is_admin()`.
- Confirm public Supabase signup is disabled.
- Verify only intended users exist in `admin_users`.
- Confirm temporary upload cleanup works in production.
- Replace the in-memory-only contact rate limit as described earlier.
- Add reasonable security headers compatible with Supabase, YouTube, and Next Image.
- Consider a Content Security Policy after auditing required origins; introduce it carefully so it does not silently break media or admin uploads.
- Confirm no secret keys or service-role key are exposed to the browser or Git.
- Confirm production error responses do not leak stack traces or environment values.
- Export/backup Supabase data before production migrations and domain launch.

---

## 12. Tests and Verification

### 12.1 Automated checks

Keep these mandatory:

```powershell
npm.cmd test
npm.cmd run lint
npx.cmd tsc --noEmit --incremental false
npm.cmd run build
```

Add focused tests for:

- stable slug behavior on book edits;
- published/draft filtering;
- sitemap URL inclusion/exclusion;
- canonical URL generation;
- metadata fallbacks;
- structured-data serialization and sanitization;
- slider CTA behavior for unpublished/deleted books;
- production versus preview robots behavior;
- durable contact rate limiting.

### 12.2 Manual public smoke test

- Home loads with correct content and metadata.
- Navbar/footer links work.
- All books and book details work.
- Draft books are not public.
- Deleted book URL returns 404.
- Gallery images and YouTube videos work.
- About content and social links are accurate.
- Contact form creates a message and rate limits correctly.
- Empty/missing optional content is intentional.
- External links open safely.

### 12.3 Manual admin smoke test

- Login appears without sidebar.
- Non-admin account is denied.
- Create draft book.
- Publish book.
- Edit title and confirm URL remains stable.
- Replace/delete cover and verify Supabase Storage.
- Delete test book and confirm public 404/sitemap removal.
- Add/edit/delete event and gallery media.
- Replace slider image and CTA.
- Edit About and Settings.
- Read/delete a contact message.

### 12.4 SEO validation

- Inspect rendered `<head>` on every public route.
- Check canonical URLs.
- Open `/robots.txt`.
- Open `/sitemap.xml`.
- Validate JSON-LD.
- Verify favicon and Open Graph image URLs.
- Confirm no `noindex` on production public pages.
- Confirm `noindex` on admin/login pages.
- Confirm preview deployments are not indexable.

---

## 13. Vercel and Natro Deployment

### 13.1 Before DNS changes

- [ ] Push a clean, verified `main` branch to GitHub.
- [ ] Import/link the repository in Vercel.
- [ ] Configure Production and Preview environment variables.
- [ ] Apply/verify Supabase migrations in the correct order.
- [ ] Deploy and test using the Vercel URL.
- [ ] Complete Gate B content approval.

Expected production environment variables include:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SECRET_KEY
SITE_URL=https://ramazantemelkuran.com
```

`SUPABASE_SECRET_KEY` is required only on the server for the protected contact submission path. It must never use a `NEXT_PUBLIC_` prefix or be exposed to browser code, logs, or Git. `SITE_URL` is the single trusted canonical-origin source.

### 13.2 Domain connection

1. Add `ramazantemelkuran.com` to the Vercel project.
2. Add `www.ramazantemelkuran.com` to the same project.
3. Read the exact DNS records shown by Vercel for this project.
4. Add those records in Natro; do not copy stale/example DNS values from documentation.
5. Set `ramazantemelkuran.com` as canonical.
6. Configure a permanent redirect from `www` to the apex domain.
7. Wait for DNS verification and SSL provisioning.
8. Verify both HTTP and HTTPS variants reach the canonical HTTPS URL.

Because the domain will initially have no email service, there are no MX records to preserve. If email is added later, its DNS records must be documented before changing nameservers or DNS providers.

### 13.3 Supabase production configuration

- Set the Supabase Authentication Site URL to the canonical production origin.
- Add required production redirect URLs.
- Retain localhost redirect URLs only where needed for development.
- Verify RLS, Storage policies, admin allowlist, and bucket constraints against production.
- Confirm all public media URLs use the intended Supabase project.

### 13.4 Deployment acceptance

- Production domain serves the latest intended `main` deployment.
- HTTPS certificate is valid.
- `www` redirects once to the apex canonical origin.
- No redirect loops.
- Public pages work signed out.
- Admin login and CRUD work signed in.
- Contact submissions work.
- Vercel logs show no recurring server errors.
- Rollback to the previous deployment is understood and available.

---

## 14. Google Search Console and Indexing

### 14.1 Ownership

1. Add a Search Console **Domain property** for `ramazantemelkuran.com`.
2. Add the Google-provided DNS TXT verification record in Natro.
3. Keep the verification record after verification.
4. Grant access to the long-term owner/client Google account if different.

### 14.2 Submission

After Gate C:

1. Submit `https://ramazantemelkuran.com/sitemap.xml`.
2. Inspect and request indexing for:
   - homepage;
   - About;
   - Books listing;
   - each initial published book.
3. Do not repeatedly request indexing; it does not make Google process the site faster.
4. Confirm Google-selected canonical URLs after the first crawls.

### 14.3 External identity connections

After the domain works:

- Add the official website link to controlled Instagram, YouTube, Facebook, and Shopier profiles.
- Ask publishers or controlled author profiles to link to the official site where appropriate.
- Keep the author name and description consistent across those profiles.
- Do not purchase spam links or use automated backlink schemes.

### 14.4 Monitoring

Check weekly during the first month:

- indexing status;
- sitemap status;
- crawl errors and 404s;
- search queries, especially `Ramazan Temelkuran`;
- title/snippet changes;
- Core Web Vitals when field data becomes available;
- security/manual-action reports.

Useful manual searches:

```text
Ramazan Temelkuran
Yazar Ramazan Temelkuran
site:ramazantemelkuran.com
```

Indexing and ranking can take days or weeks. A valid Search Console inspection is not a guarantee of ranking or sitelinks.

---

## 15. Behavior After the Client Changes Content

Phase 4 is complete only if admin changes produce the following behavior:

| Admin action | Immediate website behavior | Search behavior after recrawl |
|---|---|---|
| Create draft book | Visible in admin only | Not in sitemap or Google |
| Publish book | Public page becomes available | Added automatically to sitemap; discoverable later |
| Edit title | Visible title/metadata update; URL remains stable | Google updates title/snippet after recrawl |
| Edit description/cover | Public page, metadata, OG, and Book data update | Search result/image may update later |
| Unpublish book | Public page unavailable and removed from sitemap | Existing result may disappear after recrawl |
| Delete book | Row and cover removed; URL returns 404 | Old result can remain temporarily, then be removed |
| Add event/gallery media | Public pages update | Google may discover updated page/media later |
| Edit About | Visible biography and Person/ProfilePage data update | Google processes the updated identity later |
| Change social URLs | Public links and `sameAs` update | Entity associations may update later |
| Change site title | Global branding and metadata update | Major search-display changes happen after recrawl and are not immediate |

Admin content remains the source of truth. The system validates format and required fields, but the client remains responsible for factual accuracy.

---

## 16. Documentation and Handoff

Replace the default README with project-specific documentation covering:

- project purpose and architecture;
- local setup;
- required environment variables by name only;
- validation commands;
- Supabase migration procedure;
- admin allowlist procedure;
- content-management behavior;
- image upload constraints;
- stable slug and publication rules;
- deployment workflow;
- DNS/domain ownership notes;
- Search Console ownership and sitemap URL;
- backup and rollback procedure;
- known non-goals such as guaranteed ranking or Knowledge Panel creation.

Create a final launch record containing:

- deployed commit SHA;
- migration list applied;
- Vercel project owner;
- Supabase project owner;
- Natro domain owner;
- Search Console owner;
- canonical URL;
- date of sitemap submission;
- final verification results.

Do not place passwords, tokens, private keys, or service-role keys in documentation.

---

## 17. Current Implementation Status — 15 July 2026

The technical, client-independent Phase 4 foundation is implemented in the repository:

- stable book slugs and Draft/Published behavior;
- public filtering and slider safeguards for draft books;
- production origin, dynamic metadata, canonical URLs, social metadata, sitemap, robots, JSON-LD, breadcrumbs, icon, and default social image;
- durable server-only contact rate limiting through Supabase;
- loading, error, 404, missing-image, keyboard, focus, responsive, and reduced-motion improvements;
- active-slide-only hero rendering and stricter Supabase image-host configuration;
- project-specific deployment documentation and 18 passing automated tests.

The following steps are intentionally still open:

1. Apply the two `20260715` Supabase migrations and verify them against the real project.
2. Add `SUPABASE_SECRET_KEY` and `SITE_URL` to Vercel Production. The secret key is server-only and must never be exposed to the browser.
3. Complete the owner/client content checklist in Section 6.
4. Obtain approval for the icon and social-sharing image drafts.
5. Run the full device/performance matrix against the deployed Vercel build.
6. Purchase/connect the domain, then complete Search Console submission and post-launch monitoring.

Phase 4 is therefore **implemented in source but not launch-complete**. Client approval, remote migration application, production deployment, DNS, and Google steps remain launch gates.

## 18. Implementation Order

### Stage 0 — Owner preparation

- [x] Approve this plan.
- [ ] Purchase the domain without changing DNS.
- [ ] Start collecting approved biography, portrait, profiles, and book facts.

### Stage 1 — Content lifecycle safeguards

- [x] Make book slugs stable after creation.
- [x] Add book draft/published behavior.
- [x] Update public/admin queries and CTA handling.
- [x] Add migrations and tests.
- [x] Replace in-memory-only contact rate limiting.

### Stage 2 — SEO foundation

- [x] Add trusted production origin.
- [x] Complete metadata and canonical URLs.
- [x] Add sitemap and robots.
- [x] Add JSON-LD helpers and route data.
- [x] Add tests.

### Stage 3 — Brand/search assets

- [x] Create favicon/icon set.
- [x] Create default OG image.
- [x] Add route/book sharing behavior.
- [ ] Obtain client approval.

### Stage 4 — Quality pass

- [x] Local responsive/browser smoke testing at mobile and desktop widths.
- [ ] Full deployed device/browser matrix.
- [x] Keyboard and focus accessibility smoke testing.
- [ ] Full deployed accessibility audit.
- [x] Reduced-motion and animation polish.
- [x] Error/404 polish.
- [ ] Performance measurement and optimization.

### Stage 5 — Production verification

- [ ] Apply all migrations.
- [x] Run tests, lint, TypeScript, and build.
- [ ] Deploy to Vercel.
- [ ] Perform complete public/admin smoke test.
- [ ] Complete client content approval.

### Stage 6 — Domain launch

- [ ] Add apex and `www` domains to Vercel.
- [ ] Add exact Vercel-provided DNS records in Natro.
- [ ] Configure `www` → apex redirect.
- [ ] Verify HTTPS, canonical URLs, Supabase, and logs.

### Stage 7 — Search launch

- [ ] Verify Search Console Domain property through DNS.
- [ ] Submit sitemap.
- [ ] Request indexing for priority URLs.
- [ ] Update controlled external profiles with the official link.
- [ ] Monitor weekly during the first month.

---

## 19. Definition of Done

Phase 4 is complete when:

- [ ] The public website is live at `https://ramazantemelkuran.com`.
- [ ] `www` redirects permanently to the canonical domain.
- [ ] All launch content is real and client-approved.
- [ ] Admin-managed content updates metadata and sitemap behavior automatically.
- [ ] Book title edits do not break URLs.
- [ ] Draft books cannot appear publicly or in the sitemap.
- [ ] Public routes have accurate titles, descriptions, canonicals, and sharing metadata.
- [ ] Valid WebSite, ProfilePage/Person, Book, and breadcrumb JSON-LD is present where appropriate.
- [ ] Robots and sitemap are correct.
- [ ] Admin/API/draft routes are excluded from indexing.
- [ ] Favicon and OG images are approved and public.
- [ ] Responsive, accessibility, reduced-motion, and performance checks pass.
- [ ] Durable contact abuse protection is active.
- [ ] All migrations and admin/Storage policies are verified.
- [ ] Search Console is verified and the sitemap is accepted.
- [ ] Priority URLs have been inspected/requested for indexing.
- [ ] README and launch ownership documentation are complete.
- [ ] The repository is clean and all automated verification commands pass.

---

## 20. Authoritative References

### Next.js 16

- [Metadata and Open Graph images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [JSON-LD](https://nextjs.org/docs/app/guides/json-ld)
- [Sitemap file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Robots file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Production checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Image optimization](https://nextjs.org/docs/app/getting-started/images)

### Google Search

- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Site names](https://developers.google.com/search/docs/appearance/site-names)
- [Title links](https://developers.google.com/search/docs/appearance/title-link)
- [Sitelinks](https://developers.google.com/search/docs/appearance/sitelinks)
- [ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Ask Google to recrawl](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [URL Inspection](https://support.google.com/webmasters/answer/9012289)
- [Favicon in Search](https://developers.google.com/search/docs/appearance/favicon-in-search)

### Vercel

- [Set up a custom domain](https://vercel.com/docs/domains/set-up-custom-domain)
- [Deploying and redirecting domains](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)
