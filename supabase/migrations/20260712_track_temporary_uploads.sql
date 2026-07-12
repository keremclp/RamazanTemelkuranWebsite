update storage.buckets
set
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'media';

create table if not exists public.temporary_uploads (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media',
  object_path text not null unique,
  url text not null unique,
  uploaded_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.temporary_uploads enable row level security;

drop policy if exists "Admins can manage temporary uploads" on public.temporary_uploads;
create policy "Admins can manage temporary uploads"
on public.temporary_uploads
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists temporary_uploads_created_at_idx
on public.temporary_uploads (created_at);

alter table public.media
drop constraint if exists media_event_id_fkey;

alter table public.media
add constraint media_event_id_fkey
foreign key (event_id) references public.events(id) on delete cascade;
