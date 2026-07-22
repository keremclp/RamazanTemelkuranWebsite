# Homepage Curated Book and Event Slider Plan

## Implementation Status — 18 July 2026

- [x] Batch 1 — data foundation, RLS, transactional save RPC, types, validation, and tests
- [x] Batch 2 — admin visual-source selection, ordered book/event curation, and source-aware fallback management
- [x] Batch 3 — homepage relational loading and responsive book/event compositions
- [x] Batch 4 — revalidation review, integration verification, and documentation
- [x] Shopier extension — selected-book Shopier destination and dedicated storefront composition
- [ ] Apply `20260719_add_curated_hero_slide_sources.sql` to the remote Supabase project
- [ ] Apply `20260720_allow_shopier_book_showcases.sql` after `20260719`
- [ ] Deploy, convert the existing Books/Events slides, verify with real content, and remove old fallback banners after approval

The homepage slider will support three visual-source modes while preserving the current carousel behavior.

## Final Admin Structure

### 1. Uploaded promotional image

Used for:

- Interviews
- General announcements
- Campaigns
- Other manually designed banners

The current image uploader remains available.

### 2. Selected books

Used for the `Kitaplarımız` slide.

The administrator will:

- Select specific published books.
- Arrange their presentation order.
- Continue editing books through Admin → Books.
- Keep the slide title, subtitle, and button configurable.

The slide automatically uses each selected book’s current cover.

### 3. Selected events

Used for the `Etkinliklerimiz` slide.

The administrator will:

- Select specific events.
- Arrange their presentation order.
- Continue managing events and media through Events/Gallery.
- Keep the slide title, subtitle, and button configurable.

Each selected event uses its configured `Etkinlik kapak görseli`.

## Responsive Presentation

### Books slide

Desktop:

- Display up to six selected covers.
- Arrange them in a polished grid or layered composition on the right.
- Keep title, subtitle, and CTA on the left.

Mobile:

- Display the first three or four selected covers.
- Use a compact layered/fanned composition.
- Place the text and CTA below or beside the covers without overlap.
- Preserve arrows, dots, and pause control visibility.

The selection order determines which books receive priority on mobile.

### Events slide

Desktop:

- Display selected event covers as a layered photo composition.
- Keep the promotional text on the left.

Mobile:

- Show the first three selected event covers.
- Use a compact collage that does not depend on landscape cropping.
- Keep text and controls readable.

## Database Changes

Create a new forward migration without modifying previous migrations.

### Add a visual-source field

Add to `hero_slides`:

```sql
visual_source TEXT NOT NULL DEFAULT 'uploaded_image'
```

Allowed values:

```text
uploaded_image
selected_books
selected_events
```

Make `image_url` nullable because dynamic slides do not require an uploaded image.

### Add book selections

Create:

```text
hero_slide_books
```

Fields:

- `hero_slide_id`
- `book_id`
- `display_order`

Use foreign keys with `ON DELETE CASCADE` and prevent duplicate selections.

### Add event selections

Create:

```text
hero_slide_events
```

Fields:

- `hero_slide_id`
- `event_id`
- `display_order`

Use the same cascade and uniqueness protections.

### Security

Add RLS policies so:

- Visitors can read selections belonging to active slides.
- Only allowlisted administrators can create, update, reorder, or delete selections.
- Draft books remain unavailable through their existing Books RLS policy.

## Admin Form Changes

Add a `Görsel kaynağı` section above the visual controls:

```text
○ Yüklenen tanıtım görseli
○ Seçilen kitaplar
○ Seçilen etkinlikler
```

### Uploaded image mode

Show the existing image uploader.

Require an image before saving.

### Selected-books mode

Show published books as selectable cards containing:

- Cover
- Title
- Publication status
- Selection control

After selection, show an ordered list with move-up/move-down controls.

Validation:

- At least one published book
- Maximum six books
- No duplicates
- Allow either `Kitaplar` or `Shopier` as the CTA destination
- Render Shopier-targeted selections with the dedicated storefront composition

### Selected-events mode

Show events as selectable cards containing:

- Event cover
- Title
- Date
- Location

Validation:

- At least one event
- Maximum six events
- No duplicates
- Warn when an event has no usable cover
- Automatically use `Galeri` as the CTA destination

## Server Action Changes

Update slider create/edit actions to:

1. Validate the selected visual source.
2. Validate UUIDs and selection limits.
3. Confirm selected books are published.
4. Confirm selected events exist.
5. Save the slide.
6. Replace the related book/event selections.
7. Remove selections belonging to the other source.
8. Revalidate `/`, `/admin`, and `/admin/slider`.

Switching source should not immediately delete the previous uploaded image. It can remain temporarily as a fallback until the dynamic presentation is verified.

The existing explicit image-removal action will then safely remove the old Storage file.

## Homepage Data Loading

Extend the homepage query to retrieve:

- Active hero slides
- Selected published books and their covers
- Selected events
- Each event’s selected cover and media fallback

Selection ordering comes from the junction tables.

If content changes:

- Replacing a book cover updates the homepage.
- Unpublishing a selected book hides it.
- Deleting a book removes its selection automatically.
- Changing an event cover updates the homepage.
- Deleting an event removes its selection automatically.

## Public Slider Components

Keep `HeroSlider` responsible for autoplay and navigation, but extract visual rendering into separate components:

```text
UploadedImageSlideVisual
BookCollectionSlideVisual
EventCollectionSlideVisual
```

This keeps the carousel logic independent from presentation logic.

Fallback behavior:

- No valid selected books → optional uploaded fallback or neutral book design.
- No valid event covers → optional uploaded fallback or neutral gallery design.
- Missing individual image → skip it without breaking the slide.

## Image and Performance Rules

- Render only the active slide’s selected images.
- Limit each composition to six assets.
- Use correct responsive `sizes`.
- Prioritize only the first visible composition.
- Lazy-load non-critical images.
- Preserve image dimensions to avoid layout shifts.
- Use book titles and event titles as accessible image descriptions.
- Do not load both the obsolete banner and dynamic images unnecessarily.

## Revalidation Updates

Book actions should additionally revalidate `/` when:

- A selected book is edited
- Its cover changes
- It is published/unpublished
- It is deleted

Event/media actions should revalidate `/` when:

- A selected event changes
- Its cover changes
- Its cover media is deleted
- The event is deleted

## Testing

Automated tests should cover:

- Visual-source validation
- Book/event selection limits
- Duplicate prevention
- Draft-book rejection
- Selection ordering
- Deleted/unpublished content handling
- Event-cover fallback
- Existing uploaded-image slides
- Storage preservation while switching sources
- CTA enforcement
- Empty and partially missing selections

Browser testing should cover:

- Desktop, tablet, and mobile
- One, three, and six selected items
- Long book/event titles
- Missing covers
- Autoplay, arrows, dots, pause, swipe, and reduced motion
- No text/image overlap
- No horizontal overflow
- Controls visible within the initial viewport

## Recommended Implementation Batches

### Batch 1 — Data foundation

- Migration
- RLS policies
- TypeScript types
- Selection and validation helpers
- Unit tests

### Batch 2 — Admin workflow

- Visual-source selector
- Book selection
- Event selection
- Ordering controls
- Server-action persistence
- Admin list previews

### Batch 3 — Public presentation

- Homepage relational query
- Responsive book composition
- Responsive event composition
- Fallback behavior
- Loading and accessibility optimization

### Batch 4 — Integration and cleanup

- Revalidation updates
- Full automated verification
- Desktop/mobile browser testing
- Documentation updates
- Apply migration and deploy
- Switch the existing slides to dynamic sources
- Remove old uploaded banners only after approval

## Safe Content Migration Order

1. Keep the existing book and event promotional images.
2. Implement and apply the new database migration.
3. Deploy the new code.
4. Open the existing `Kitaplarımız` slide.
5. Select `Seçilen kitaplar` and choose/order the books.
6. Open `Etkinliklerimiz`.
7. Select `Seçilen etkinlikler` and choose/order the events.
8. Verify desktop and mobile.
9. Obtain client approval.
10. Remove the old uploaded banners from those slides.
11. Convert the Shopier slide to `Seçilen kitaplar`, select/order the promoted books, and choose `Shopier mağazası` as its destination.
12. Keep uploaded-image mode for future announcements and campaigns.

No files were changed.
