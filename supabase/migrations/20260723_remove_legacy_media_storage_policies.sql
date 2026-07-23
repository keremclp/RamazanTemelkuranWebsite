-- Remove legacy Dashboard-created policies that predate the administrator
-- allowlist. The current public-read and administrator-only mutation policies
-- remain unchanged.

begin;

drop policy if exists "Allow uploads to media bucket 1ps738_0"
  on storage.objects;

drop policy if exists "Allow uploads to media bucket 1ps738_1"
  on storage.objects;

commit;
