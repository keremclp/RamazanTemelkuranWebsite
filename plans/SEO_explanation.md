We implemented SEO as an automatic layer connected to the admin-managed content. The client does not manually write HTML metadata or update Google files.

## Example: publishing a book

Suppose the client publishes:

```text
Title: Bir Türk Sevdim
Description: Gerçek bir aşk romanı...
Cover: uploaded image
ISBN: ...
Publisher: ...
```

The application automatically produces the following.

### 1. Stable public URL

```text
https://ramazantemelkuran.com/books/bir-turk-sevdim
```

Editing the title or description later does not unexpectedly change this URL.

### 2. Google metadata

Conceptually, the generated page contains:

```html
<title>Bir Türk Sevdim | Ramazan Temelkuran</title>

<meta
  name="description"
  content="Gerçek bir aşk romanı..."
>

<link
  rel="canonical"
  href="https://ramazantemelkuran.com/books/bir-turk-sevdim"
>
```

### 3. Social-sharing information

When the page is shared through social platforms, it provides:

```text
Title: Bir Türk Sevdim
Description: Current book description
Image: Current book cover
URL: Canonical book URL
```

### 4. Book structured data

Google also receives machine-readable information similar to:

```json
{
  "@type": "Book",
  "name": "Bir Türk Sevdim",
  "author": {
    "@type": "Person",
    "name": "Ramazan Temelkuran"
  },
  "image": "book-cover-url",
  "isbn": "current-isbn",
  "publisher": {
    "@type": "Organization",
    "name": "current-publisher"
  },
  "url": "https://ramazantemelkuran.com/books/bir-turk-sevdim"
}
```

Only information that actually exists in Supabase is included.

### 5. Automatic sitemap entry

The published book enters:

```text
https://ramazantemelkuran.com/sitemap.xml
```

If the client saves the book as Draft or later unpublishes it:

- The page stops being publicly accessible.
- It disappears from the Books carousel.
- It is removed from the sitemap.
- Its structured data is no longer public.

This is what we mean by “dynamic SEO.”

The same principle applies elsewhere:

- Biography and social links generate `Person/ProfilePage` data.
- Site Settings generate titles, descriptions and Shopier/social relationships.
- Published books generate Book data and sitemap URLs.
- Admin, API and draft content remain excluded.
- Homepage identity generates `WebSite` structured data.

## Accounts you need

### 1. Natro account

Use this to:

- Purchase `ramazantemelkuran.com`
- Manage DNS records
- Connect the domain to Vercel
- Add Google’s Search Console verification record

Ideally, the domain should be purchased through an account controlled by the client or long-term business owner. That prevents ownership and renewal problems later.

You should retain access to:

- Domain management
- DNS management
- Renewal and billing settings

Do not send me the Natro password.

### 2. Google account

A normal Google/Gmail account is sufficient. You do not need a separate paid SEO account.

This account will own Google Search Console. Ideally, it should be client-controlled or an account that will remain available long-term.

After purchasing the domain:

1. Open [Google Search Console](https://search.google.com/search-console).
2. Select **Add property**.
3. Choose **Domain**.
4. Enter only:

```text
ramazantemelkuran.com
```

Do not enter `https://` or `www`.

A Domain property includes HTTP, HTTPS, apex and `www` variations. Google requires DNS verification for this property type. [Google’s Domain property guidance](https://support.google.com/webmasters/answer/34592)

Google will give you a TXT record resembling:

```text
google-site-verification=xxxxxxxxxxxx
```

Add that TXT record in Natro’s DNS panel, then click **Verify**. Keep the TXT record permanently; Search Console periodically checks it. [Google ownership-verification guidance](https://support.google.com/webmasters/answer/9008080)

After launch, submit:

```text
https://ramazantemelkuran.com/sitemap.xml
```

Google explains that sitemap submission is done through Search Console’s Sitemaps report. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

### 3. Vercel account

You already have this.

We need to use it for:

- Production deployment
- Custom domain connection
- Environment variables
- HTTPS
- `www` redirect
- Deployment logs

Vercel will show the exact DNS records that must be copied into Natro. We should use the records displayed for your project rather than generic example values. [Vercel custom-domain guidance](https://vercel.com/docs/domains/set-up-custom-domain)

### 4. Supabase account

You already have this.

We will use it to verify:

- Migrations
- RLS and Storage policies
- Admin allowlist
- Authentication URLs
- Database backup
- Contact-form functionality

### 5. GitHub account

You already have this, and the repository is currently clean and synchronized.

## Accounts you do not need

For the agreed launch scope, you do not need:

- Google Analytics
- Google Tag Manager
- Google Business Profile
- A paid SEO tool
- An SEO plugin
- A separate Google Ads account

Google Business Profile is for eligible businesses with an appropriate customer-facing presence; it is not required for the author website result we are targeting.

## What you should prepare

The remaining operational items from you are:

1. Purchase `ramazantemelkuran.com`.
2. Keep access to its Natro DNS panel.
3. Choose the long-term Google account for Search Console.
4. Confirm you still control GitHub, Vercel and Supabase.
5. Do not share passwords or secret keys.
6. Make sure the client understands who will renew and legally control the domain.

Assuming content approval is complete, these account/domain preparations and the small indexing-control code adjustment are the next steps.