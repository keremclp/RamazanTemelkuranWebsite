alter table public.books
add column if not exists is_published boolean not null default true;

drop policy if exists "Public can read books" on public.books;
create policy "Public can read books"
on public.books
for select
to anon, authenticated
using (is_published = true);

create index if not exists idx_books_published_order
on public.books (is_published, display_order);

notify pgrst, 'reload schema';
