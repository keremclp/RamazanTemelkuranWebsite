# Phase 4 — Remaining Production Launch Plan

**Project:** Ramazan Temelkuran official author website  
**Canonical domain:** `https://ramazantemelkuran.com`  
**Domain registrar and current DNS provider:** GoDaddy  
**Hosting:** Vercel  
**Backend:** Supabase  
**Primary audience:** Türkiye  
**Primary language:** Turkish  
**Plan status:** Ready to begin the remaining launch work  
**Prepared:** 23 July 2026

---

## 1. Purpose and Current Position

This document contains only the work that remains after the main Phase 4 implementation and the customer-requested redesigns. It supplements the historical [Phase 4 implementation plan](./PHASE_4_IMPLEMENTATION_PLAN.md).

### Confirmed complete

- [x] Client approved the public content and requested visual changes.
- [x] `ramazantemelkuran.com` was purchased from GoDaddy.
- [x] The canonical address remains `https://ramazantemelkuran.com`.
- [x] `www.ramazantemelkuran.com` will redirect to the apex domain.
- [x] Dynamic metadata, canonical URLs, Open Graph data, sitemap, robots route, and JSON-LD exist in source.
- [x] Stable book URLs and Draft/Published behavior exist.
- [x] Homepage, Books, Gallery, Events, and Shopier slider work is implemented.
- [x] Durable Supabase-backed contact rate limiting exists.
- [x] Required migrations through `20260723_remove_legacy_media_storage_policies.sql` exist in the repository.
- [x] The repository was clean and synchronized with `origin/main` when this plan was prepared.

### Current domain state

At the time this plan was prepared, GoDaddy DNS still pointed to its existing/parking configuration:

- Apex A record: GoDaddy `WebsiteBuilder Site` parking target (previously observed resolving to `76.223.105.230` and `13.248.243.5`)
- `www` CNAME: `ramazantemelkuran.com`
- Authoritative nameservers: `ns75.domaincontrol.com` and `ns76.domaincontrol.com`
- GoDaddy service CNAME: `_domainconnect` → `_domainconnect.gd.domaincontrol.com`
- Existing TXT record: `_dmarc` with GoDaddy's `p=quarantine` policy and aggregate-report address

The owner exported the zone file and saved a DNS screenshot on 23 July 2026. There is no domain email service, but the existing `_dmarc` TXT record must still be preserved unless a later, separately approved email configuration replaces it.

These values must **not** be copied into Vercel. Add the domain to Vercel first and use the exact DNS records Vercel displays for this project. Preserve all unrelated DNS records.

### Remaining result

Phase 4 is complete only when:

1. the final code is deployed safely with indexing disabled;
2. Supabase and Vercel production settings are verified;
3. the GoDaddy domain points to Vercel and HTTPS works;
4. the deployed site passes functional, SEO, accessibility, and performance checks;
5. indexing is explicitly enabled;
6. Search Console accepts the sitemap;
7. post-launch monitoring and ownership records are established.

---

## 2. Launch Safety Gates

### Gate 1 — Safe production review

The latest code is deployed to Vercel, but search indexing remains disabled.

Required:

- [x] Pre-deployment source hardening is complete.
- [ ] `SEARCH_INDEXING_ENABLED=false` is configured in Vercel Production.
- [ ] Required Vercel environment variables are verified.
- [ ] Latest Supabase migrations and policies are verified.
- [ ] Public/admin smoke tests pass on the `vercel.app` deployment.

### Gate 2 — Domain connected, still not indexed

The GoDaddy domain points to Vercel, but indexing remains disabled while the real domain is tested.

Required:

- [ ] Apex and `www` are added to the Vercel project.
- [ ] GoDaddy has the exact Vercel-provided DNS records.
- [ ] `www` redirects permanently to the apex domain.
- [ ] HTTPS is valid on both hostnames.
- [ ] Supabase production URL settings are correct.
- [ ] Full live-domain verification passes.

### Gate 3 — Public Google launch

Required:

- [ ] Client-approved content is present with no test/demo records.
- [ ] Legal/privacy decision is implemented.
- [ ] SEO, structured-data, accessibility, and performance checks pass.
- [ ] `SEARCH_INDEXING_ENABLED=true` is configured and redeployed.
- [ ] Production pages emit `index, follow` and the final robots file references the sitemap.
- [ ] Search Console Domain property is verified.

Do not enable indexing before Gate 3.

---

## 3. Step 1 — Record Ownership and Protect Accounts

### Work

- [x] Confirm GoDaddy domain auto-renewal is enabled. Confirmed enabled by the owner on 23 July 2026.
- [x] Enable two-step verification on GoDaddy.
- [x] Enable multi-factor authentication on Supabase. Confirmed on 23 July 2026.
- [ ] Enable two-step verification on Vercel, GitHub, and the Google account where available.
- [ ] Decide the long-term owner for each service.
- [ ] Select the Google account that will own Search Console.
- [x] Export the current GoDaddy DNS zone and save a screenshot before changing records.
- [x] Confirm whether any domain email service has been added since the earlier decision. Decision: **no domain email service is configured**.

### What you need to provide or do

1. Sign in to your own GoDaddy, Vercel, Supabase, GitHub, and Google accounts.
2. Do not send passwords, OTP codes, secret API keys, or recovery codes.
3. Tell the implementation owner whether email is configured on the domain.
4. If email exists, identify its MX, SPF, DKIM, and DMARC records so they can be preserved.
5. Confirm who is responsible for renewing the GoDaddy domain every year.

Current owner confirmation: only `ramazantemelkuran.com` has been purchased; no email product or domain email DNS configuration has been added.

### Acceptance

- [x] The purchaser/owner retains the GoDaddy account, and automatic renewal is enabled.
- [x] Existing DNS records have a recoverable zone-file export and screenshot dated 23 July 2026.
- [x] Records that must be preserved are identified: NS/SOA, `_domainconnect`, and `_dmarc`; only conflicting apex/`www` website records may be replaced later.

---

## 4. Step 2 — Implement the Final Source-Hardening Batch

These code changes should be completed together before the next deployment.

### 4.1 Add explicit indexing control

- [x] Add `SEARCH_INDEXING_ENABLED` to `.env.example` and production documentation.
- [x] Change `shouldAllowSearchIndexing()` so indexing is allowed only when the variable is exactly `true` in Production.
- [x] Default to indexing disabled when the variable is absent, invalid, or false.
- [x] Add tests for local, Preview, Production-disabled, and Production-enabled behavior.

Recommended values:

```text
# Review and domain testing
SEARCH_INDEXING_ENABLED=false

# Only after Gate 3
SEARCH_INDEXING_ENABLED=true
```

### 4.2 Correct non-indexable robots behavior

- [x] Keep the HTML robots metadata as `noindex, nofollow` while indexing is disabled.
- [x] Do not block those public pages from crawling in `robots.txt`; Google must be able to crawl a page to see its `noindex` directive.
- [x] Omit the production sitemap/host declaration while indexing is disabled.
- [x] In the enabled state, allow public pages, disallow `/admin/` and `/api/`, and reference the canonical sitemap.
- [x] Add tests for both robots states.

### 4.3 Restrict the authentication proxy

- [x] Change the proxy matcher so Supabase session/admin checks run only for `/admin` and `/admin/**`.
- [x] Confirm `/admin/login` still works.
- [x] Confirm protected admin routes still redirect signed-out users.
- [x] Confirm public pages no longer perform the admin authentication lookup.

This removes avoidable work from ordinary public requests.

### 4.4 Add basic security headers

Add and test headers compatible with Vercel, Supabase, Next Image, and YouTube:

- [x] `X-Content-Type-Options: nosniff`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] A restrictive `Permissions-Policy` for unused camera, microphone, and location access
- [x] Framing protection using an appropriate header/policy
- [ ] Verify Vercel's HTTPS/HSTS behavior after the domain is connected

A full Content Security Policy is optional for launch and should not be introduced without testing every required Supabase, image, font, and YouTube origin.

### 4.5 Documentation cleanup

- [x] Correct README links now that plans are stored under `plans/`.
- [x] Replace Natro references with GoDaddy in active launch documentation.
- [x] Add the `20260721_add_secondary_contact_email.sql` migration to every migration checklist.
- [x] Update the historical Phase 4 status: domain purchased and client approval completed.
- [x] Record the remote migration verification result after Step 3.
- [x] Link this remaining-work plan from the main Phase 4 plan and README.

### What you need to provide or decide

- [x] Canonical address: `https://ramazantemelkuran.com`.
- [x] Registrar: GoDaddy.
- [x] Client content approval.
- [x] Confirm that indexing must stay disabled until the real-domain checks pass. Decision: **yes**.
- [x] Confirm whether a strict CSP should be deferred until after launch. Decision: **defer it** and use the basic headers above.

### Verification

```powershell
npm.cmd test
npm.cmd run lint
npx.cmd tsc --noEmit --incremental false
npm.cmd run build
git diff --check
```

Acceptance:

- [x] All checks pass.
- [x] Repository contains no secret values.
- [x] Only intended files changed.

---

## 5. Step 3 — Verify Supabase Production Readiness

### 5.1 Back up before launch

- [x] Confirm the available Supabase backup mechanism. The project is on the Free plan, which does not include managed scheduled backups; use a manual Supabase CLI logical dump.
- [x] Create and securely store a manual logical database backup before applying or repairing migrations. Verified `roles.sql`, `schema.sql`, and `data.sql` with SHA-256 hashes.
- [x] Record the database backup date: **23 July 2026, 13:18 (+03:00)**.
- [x] Export all uploaded images from the Supabase Storage `media` bucket separately; database dumps include metadata but not Storage object binaries. Confirmed by the owner on 23 July 2026.
- [x] Record the required migration list through `20260723`; remote verification is effect-based because the database does not expose a `supabase_migrations` history schema.

### 5.2 Verify migrations

Confirm these are applied in filename order, including the latest migration:

```text
20260707_add_event_homepage_media.sql
20260710_add_media_storage_policies.sql
20260710_remove_book_categories.sql
20260711_add_hero_slide_cta_targets.sql
20260712_add_contact_settings.sql
20260712_restrict_admin_access.sql
20260712_track_temporary_uploads.sql
20260715_add_book_publication_status.sql
20260715_add_durable_contact_rate_limit.sql
20260717_add_hero_slide_presentation_type.sql
20260718_remove_hero_slide_book_presentation.sql
20260719_add_curated_hero_slide_sources.sql
20260720_allow_shopier_book_showcases.sql
20260721_add_secondary_contact_email.sql
20260723_remove_legacy_media_storage_policies.sql
```

Do not rerun or edit older applied migrations. If a migration is missing, apply only the missing forward migration in order.

Remote verification result on 23 July 2026: the Free-plan database did not expose a `supabase_migrations` history schema in the logical dump. The production schema nevertheless contains the expected effects through `20260721`: stable publication state, durable contact limits, admin/temporary-upload controls, curated book/event slide sources, Shopier-compatible selected-book RPC behavior, removal of retired slider columns, and the secondary contact email. Do not rerun migrations merely because the history schema is absent.

### 5.3 Verify security and policies

- [x] Confirm RLS is enabled on protected public-schema tables in the logical schema backup.
- [x] Confirm only intended public reads are allowed in the dumped public-schema policies.
- [x] Confirm book, event, gallery, slider, About, and Settings mutations require `is_admin()` in the dumped policies/RPC.
- [x] Confirm Storage upload/update/delete policies require an administrator.
- [x] Verify the replacement `Admins can upload media files` policy requires both the `media` bucket and `is_admin()`.
- [x] Remove the confirmed-permissive legacy policy `Allow uploads to media bucket 1ps738_0`: its `WITH CHECK` was only `bucket_id = 'media'`, so any authenticated user could insert.
- [x] Remove the redundant legacy policy `Allow uploads to media bucket 1ps738_1` (`SELECT authenticated`). The active set is now public read plus administrator-only insert/update/delete.
- [x] Confirm the service secret is isolated to the server-only contact submission client and is not used in browser code.
- [x] Confirm only intended administrators exist in `admin_users`. The table contains one row and its `user_id` exactly matches the sole existing Supabase Auth user.
- [x] Confirm unwanted public sign-up is disabled or otherwise controlled. New-user sign-up, manual linking, and anonymous sign-ins are disabled; the existing email/password administrator can still sign in.
- [x] Confirm the durable `contact_rate_limits` table and `submit_contact_message` function exist in the production schema backup.

### 5.4 Configure Supabase Auth URLs

In Supabase Dashboard → Authentication → URL Configuration:

- [x] Set **Site URL** to `https://ramazantemelkuran.com`.
- [x] Add `https://ramazantemelkuran.com/**` to the redirect allowlist.
- [x] Do not add a localhost redirect because the current password-login flow has no redirect callback.
- [x] Do not add a dynamic Vercel Preview wildcard; retain only the fixed `https://ramazan-temelkuran.vercel.app/**` review origin.
- [x] Keep the redirect allowlist limited to the two exact origins above; path wildcards do not broaden the allowed hosts.

### What you need to provide or do

1. Keep access to the Supabase Dashboard.
2. Confirm the approved administrator email address(es).
3. Confirm whether Vercel Preview deployments need admin login.
4. Never paste `SUPABASE_SECRET_KEY` into chat or documentation.

### Acceptance

- [x] Manual logical database backup exists with a verification manifest, and all current `media` bucket images were downloaded separately.
- [x] Required schema effects through `20260721` are verified. A migration-history schema was not present, so verification is effect-based rather than history-table-based.
- [x] Apply and verify `20260723_remove_legacy_media_storage_policies.sql`; the Storage Policies page now shows only public read and administrator-only insert/update/delete.
- [x] Auth URL configuration points to the production domain while retaining the fixed Vercel review origin.
- [x] Admin/RLS/Storage checks pass. The current non-routable administrator email will be replaced later as a separate account-recovery improvement.

---

## 6. Step 4 — Configure Vercel Production Environment Variables

In Vercel → Project → Settings → Environment Variables, configure:

| Variable | Production value/scope | Sensitive |
|---|---|---:|
| `NEXT_PUBLIC_SUPABASE_URL` | Existing Supabase project URL | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Existing public/anon key | No |
| `SUPABASE_SECRET_KEY` | Existing `sb_secret_...` server key | Yes |
| `SITE_URL` | `https://ramazantemelkuran.com` | No |
| `SEARCH_INDEXING_ENABLED` | `false` until Gate 3 | No |

Rules:

- [x] Never prefix the secret with `NEXT_PUBLIC_`.
- [x] Do not expose the secret to Preview unless a specific Preview test requires server-side contact submission.
- [x] Keep Preview indexing disabled.
- [ ] Redeploy after changing variables; Vercel variables do not alter an already-running deployment.

### What you need to provide or do

1. Sign in to the Vercel project.
2. Add or verify the five values above.
3. Mark `SUPABASE_SECRET_KEY` as Sensitive.
4. Do not send the actual secret value.
5. Confirm when the variables have been saved so a new deployment can be created.

### Acceptance

- [x] All five Production variables exist, and `SITE_URL` was explicitly overwritten with `https://ramazantemelkuran.com`.
- [x] Secret is server-only, Production-only, and Sensitive.
- [x] Indexing is explicitly `false`.

---

## 7. Step 5 — Deploy a Safe Production Review

### Work

- [ ] Confirm `main` is clean and synchronized with GitHub.
- [ ] Create the new Vercel Production deployment.
- [ ] Confirm the deployed commit SHA matches the intended commit.
- [ ] Review Vercel build and runtime logs.
- [ ] Verify the public `vercel.app` URL emits `noindex`.
- [ ] Verify public content is still accessible to the client.

### Public smoke test

- [ ] Homepage and all hero slide types work.
- [ ] Books carousel and every book detail page work.
- [ ] Gallery carousel, event dialog, photos, and YouTube links work.
- [ ] About and Contact content is correct.
- [ ] Navbar, footer, social, Shopier, and external links work.
- [ ] Missing optional content is hidden cleanly.
- [ ] A nonexistent book URL returns a real 404.

### Admin smoke test

- [ ] Login works without the dashboard sidebar.
- [ ] Signed-out visitors cannot open protected admin pages.
- [ ] Non-allowlisted users are denied.
- [ ] Create and delete a test draft book.
- [ ] Edit a book title and confirm its slug does not change.
- [ ] Create/edit/delete a test event or media item.
- [ ] Edit and restore a slider record.
- [ ] Confirm Settings and About updates revalidate public pages.

### Contact smoke test

- [ ] Submit one clearly identified test contact message.
- [ ] Confirm it appears in Admin → Messages.
- [ ] Delete the test message.
- [ ] Confirm invalid and honeypot submissions are rejected.
- [ ] Do not intentionally exhaust the production rate limit unless a controlled test is planned.

### What you need to provide or do

- [ ] Be available to sign into the admin account for the protected tests.
- [ ] Confirm which records are test records before anything is deleted.
- [ ] Give final confirmation that the deployed content matches the approved version.

### Acceptance

- [ ] No recurring Vercel or Supabase errors.
- [ ] Public and admin smoke tests pass.
- [ ] Review deployment remains `noindex`.

---

## 8. Step 6 — Add the Domain to Vercel

Keep indexing disabled during this entire step.

### In Vercel

1. Open Vercel → Project → Settings → Domains.
2. Add `ramazantemelkuran.com`.
3. Add `www.ramazantemelkuran.com`.
4. Set `ramazantemelkuran.com` as the primary/canonical project domain.
5. Configure `www.ramazantemelkuran.com` to redirect permanently to `ramazantemelkuran.com`.
6. Copy the **exact** DNS records Vercel requests for both names.

Do not rely on example A or CNAME values from documentation; Vercel may provide project-specific values.

### What you need to provide

- [ ] A screenshot or exact transcription of Vercel's required DNS record **types, names, and targets**. Do not include secrets; DNS targets are public.
- [ ] Confirmation that apex is primary and `www` redirects to apex.

### Acceptance

- [ ] Both domains appear in the Vercel project.
- [ ] Vercel displays the required DNS instructions.
- [ ] Redirect direction is explicitly configured.

---

## 9. Step 7 — Replace GoDaddy Parking DNS with Vercel Records

### In GoDaddy

1. Sign in to GoDaddy Domain Portfolio.
2. Open `ramazantemelkuran.com` → DNS.
3. Compare the current zone with the saved screenshot/export from Step 1.
4. Remove or replace only conflicting website records:
   - current apex parking A records;
   - current `www` CNAME if Vercel requires a different target.
5. Add the exact apex and `www` records shown by Vercel.
6. Keep all unrelated MX, TXT, CAA, verification, and email records.
7. Use the default/one-hour TTL unless Vercel gives different instructions.
8. Save the records and complete GoDaddy identity verification if prompted.

### Do not do

- Do not use GoDaddy domain forwarding.
- Do not apply a DNS template; it can overwrite the entire zone.
- Do not change nameservers unless a deliberate migration to Vercel DNS is separately approved.
- Do not delete MX/TXT records merely because they are unfamiliar.
- Do not add both old parking A records and the new Vercel apex record.

### What you need to provide or do

- [ ] Keep GoDaddy access and 2FA available.
- [ ] Enter the public DNS records from Vercel.
- [ ] Share a screenshot of the final DNS records if verification help is needed; redact any unrelated sensitive account details.

### Verification

- [ ] GoDaddy shows only the intended website A/CNAME records.
- [ ] Vercel marks both domains as valid.
- [ ] DNS resolves globally after propagation.
- [ ] HTTPS certificates are issued.
- [ ] `http://ramazantemelkuran.com` redirects to HTTPS.
- [ ] `https://www.ramazantemelkuran.com` redirects once to `https://ramazantemelkuran.com`.
- [ ] No redirect loop or Vercel 404 exists.

DNS commonly updates quickly but can take longer to propagate. Do not repeatedly change records while propagation is in progress.

---

## 10. Step 8 — Validate the Real Domain Before Indexing

Indexing must still be disabled.

### SEO checks

- [ ] Every public route returns `200` except intentional `404` pages.
- [ ] Every canonical URL uses `https://ramazantemelkuran.com`.
- [ ] Homepage title and description match the approved content.
- [ ] Public pages emit `noindex` during this validation stage.
- [ ] Admin and login pages remain `noindex` independently.
- [ ] `/sitemap.xml` contains only public pages and published books.
- [ ] Draft/deleted books do not appear in the sitemap.
- [ ] `/robots.txt` matches the disabled-indexing design.
- [ ] `/icon.svg`, favicon, and `/opengraph-image` load publicly.
- [ ] Social previews use the final domain rather than `vercel.app` or localhost.

### Structured-data checks

- [ ] Homepage `WebSite` data is valid.
- [ ] About `ProfilePage`/`Person` data matches visible approved content.
- [ ] Books listing `ItemList` is valid.
- [ ] Each published book has valid `Book` and breadcrumb data.
- [ ] `sameAs` contains only verified official profiles.
- [ ] No invented ratings, prices, reviews, awards, or identifiers exist.

Use Schema Markup Validator for general Schema.org validation and Google's Rich Results Test only where Google supports the relevant type.

### Responsive/accessibility matrix

Test at minimum:

- [ ] 320×568
- [ ] 375×667
- [ ] 390×844
- [ ] 768×1024
- [ ] 1024×768
- [ ] 1280×800
- [ ] 1440×900
- [ ] A real Android or iOS device if available

Verify:

- [ ] Navigation and admin sidebar/menu
- [ ] All carousels, arrows, dots, autoplay, pause, and swipe
- [ ] Reduced-motion behavior
- [ ] Keyboard focus, Escape, dialog focus trapping, and restoration
- [ ] 200% zoom
- [ ] Long Turkish/Kurdish titles
- [ ] Missing-image fallbacks
- [ ] Forms, errors, pending states, and touch targets

### Performance checks

- [ ] Run Lighthouse/PageSpeed mobile and desktop against the real domain.
- [ ] Record LCP, CLS, INP/TBT proxy, image weight, and JavaScript transfer.
- [ ] Inspect whether the first hero media is the LCP element.
- [ ] Confirm hidden carousel media is not eagerly loaded unnecessarily.
- [ ] Confirm no major layout shift in navbar, hero, Books, or Gallery.
- [ ] Review Supabase request latency and Vercel logs.
- [ ] Implement follow-up optimizations only when measurements identify a real issue.

### Security checks

- [ ] Verify the intended security headers in the deployed response.
- [ ] Verify the secret key never appears in client JavaScript or network responses.
- [ ] Verify `/admin` authorization and RLS again on the custom domain.
- [ ] Verify public media and YouTube content still work with the headers.

### What you need to provide or do

- [ ] Use at least one real phone for the final visual check if possible.
- [ ] Confirm the final favicon and Open Graph image are approved.
- [ ] Confirm the approved privacy/KVKK decision is implemented.
- [ ] Confirm the client accepts the real-domain version.

### Acceptance

- [ ] No blocking functional, accessibility, SEO, performance, or security issue remains.
- [ ] Client accepts the real-domain deployment.
- [ ] Gate 2 is complete.

---

## 11. Step 9 — Enable Production Indexing

Only perform this after Step 8 passes.

### Work

1. Change Vercel Production:

```text
SEARCH_INDEXING_ENABLED=true
```

2. Redeploy the same approved commit.
3. Verify on `https://ramazantemelkuran.com`:
   - public pages emit `index, follow`;
   - admin/login pages remain `noindex`;
   - `/robots.txt` allows public pages, disallows admin/API, and references the sitemap;
   - `/sitemap.xml` uses only the canonical domain;
   - canonical tags still use the apex domain.

### What you need to provide or do

- [ ] Give explicit approval to enable indexing.
- [ ] Change the Vercel variable or be present while it is changed.

### Acceptance

- [ ] Final deployment is indexable only after approval.
- [ ] Crawl and indexing signals are consistent.

---

## 12. Step 10 — Configure Google Search Console

### Create the property

1. Sign in to Google Search Console with the long-term owner account.
2. Add a **Domain property** using:

```text
ramazantemelkuran.com
```

Do not include `https://` in a Domain property.

3. Select DNS verification and copy the TXT value Google provides.
4. In GoDaddy → Domain → DNS, add:
   - Type: `TXT`
   - Name/Host: `@` unless Google instructs otherwise
   - Value: the exact Google verification string
5. Save and return to Search Console to verify.
6. Keep the TXT record after verification.

### What you need to provide or do

- [ ] Select the Google account that should own the property long term.
- [ ] Add the public TXT record in GoDaddy.
- [ ] Grant access to the client/maintainer if needed; do not share the Google password.

### Submit the sitemap

Submit:

```text
https://ramazantemelkuran.com/sitemap.xml
```

Then inspect/request indexing for:

- [ ] Homepage
- [ ] About page
- [ ] Books listing
- [ ] Each initial published book page
- [ ] Gallery page if desired

Do not repeatedly request indexing. Submission does not guarantee immediate ranking or sitelinks.

### Acceptance

- [ ] Domain property verified.
- [ ] Sitemap accepted without blocking errors.
- [ ] Priority pages inspected/requested once.

---

## 13. Step 11 — Connect External Identity Signals

After the domain is live:

- [ ] Add `https://ramazantemelkuran.com` to the official Instagram profile.
- [ ] Add it to the official YouTube channel links/about section.
- [ ] Add it to Facebook if used.
- [ ] Add it to the Shopier profile/store where possible.
- [ ] Ask controlled publisher/bookstore/author profiles to link to the official site where reasonable.
- [ ] Keep `Ramazan Temelkuran` and `Yazar Ramazan Temelkuran` wording consistent.
- [ ] Do not buy links or use automated backlink schemes.

### What you need to provide or do

- [ ] Access each controlled external profile.
- [ ] Add the official URL yourself or ask the profile owner to add it.
- [ ] Provide the final URLs so `sameAs` can be rechecked.

---

## 14. Step 12 — Post-Launch Monitoring

### First 24 hours

- [ ] Check Vercel runtime/build logs.
- [ ] Check Supabase database/Auth/Storage errors.
- [ ] Test public pages, admin login, and contact submission again.
- [ ] Verify apex/`www` redirects and HTTPS from another network/device.
- [ ] Confirm Search Console still verifies ownership.

### Weekly for the first month

- [ ] Search Console indexing/pages report
- [ ] Sitemap status
- [ ] Search queries, especially `Ramazan Temelkuran`
- [ ] Google-selected canonical URLs
- [ ] 404/crawl errors
- [ ] Core Web Vitals when field data becomes available
- [ ] Security/manual-action reports
- [ ] Vercel and Supabase recurring errors

Useful manual checks:

```text
Ramazan Temelkuran
Yazar Ramazan Temelkuran
site:ramazantemelkuran.com
```

Google may take days or weeks to crawl and update results. The technical launch cannot guarantee first position, exact sitelinks, or an immediate Knowledge Panel.

---

## 15. Step 13 — Handoff and Rollback Record

Create a final launch record containing:

- [ ] Launch date and time
- [ ] Deployed Git commit SHA
- [ ] Vercel project owner
- [ ] Supabase project owner
- [ ] GoDaddy domain owner and renewal date
- [ ] Search Console owner
- [ ] Applied migration list through `20260723`
- [ ] Database backup date
- [ ] Canonical URL and redirect rule
- [ ] Sitemap submission date
- [ ] Final smoke/Lighthouse/validation results
- [ ] Known non-blocking issues
- [ ] Vercel rollback procedure
- [ ] DNS rollback record from the pre-launch GoDaddy screenshot

Do not place passwords, API keys, secret values, or recovery codes in the handoff document.

---

## 16. Recommended Execution Batches

### Batch A — Code and configuration preparation

Complete Steps 1–4 together:

- ownership record;
- indexing switch and robots correction;
- proxy optimization;
- basic security headers;
- documentation updates;
- Supabase verification/backup;
- Vercel variables with indexing disabled.

### Batch B — Safe review deployment

Complete Step 5:

- deploy latest code;
- verify `noindex`;
- complete public/admin/contact smoke tests.

### Batch C — GoDaddy domain connection

Complete Steps 6–7:

- add apex and `www` to Vercel;
- copy exact Vercel records into GoDaddy;
- verify DNS, HTTPS, and the redirect.

### Batch D — Real-domain quality gate

Complete Step 8:

- SEO/structured data;
- accessibility/device matrix;
- performance;
- security;
- final client acceptance.

### Batch E — Search launch

Complete Steps 9–13:

- enable indexing;
- Search Console and sitemap;
- external official links;
- monitoring and handoff.

Do not perform all batches in one uncontrolled operation. Each batch has a clear acceptance gate and a safe stopping point.

---

## 17. Inputs Still Needed From the Project Owner

The following are the only remaining owner inputs/actions:

- [x] Confirm the domain has no email service, or identify email DNS records to preserve. Confirmed: **no email service**.
- [x] Confirm GoDaddy auto-renewal and account 2FA. Both are enabled.
- [ ] Select the long-term Search Console Google account.
- [ ] Confirm the approved privacy/KVKK decision for the contact form.
- [ ] Confirm approved favicon and Open Graph image.
- [ ] Replace the currently approved sole administrator's non-routable login email with an accessible long-term address (deferred by owner).
- [x] Confirm whether Preview deployments need admin login. Decision: no dynamic Preview wildcard; use the fixed Vercel production review origin.
- [ ] Enter/verify Vercel Production environment variables without sharing secrets.
- [ ] Be available for GoDaddy DNS changes and verification.
- [ ] Provide explicit approval before `SEARCH_INDEXING_ENABLED=true`.
- [ ] Add the official website link to controlled external profiles after launch.

Everything else can be implemented and verified from the repository and the authorized service dashboards.

---

## 18. Authoritative Setup References

- [Vercel — Set up a custom domain](https://vercel.com/docs/domains/set-up-custom-domain)
- [Vercel — Deploying and redirecting domains](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)
- [GoDaddy — Manage DNS records](https://www.godaddy.com/help/manage-dns-records-680)
- [GoDaddy — Add or edit an A record](https://www.godaddy.com/help/add-or-edit-an-a-record-42546)
- [Supabase — Redirect URLs and Site URL](https://supabase.com/docs/guides/auth/redirect-urls)
- [Google — Add a Domain property to Search Console](https://support.google.com/webmasters/answer/34592)
- [Google — Verify ownership using DNS](https://support.google.com/webmasters/answer/9008080)
- [Google — Block indexing with `noindex`](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google — Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
