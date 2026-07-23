-- Fix the contact RPC's timestamp comparison. `current_time` is a PostgreSQL
-- keyword that resolves to time with time zone, so using it as a PL/pgSQL
-- variable name caused timestamptz < timetz at runtime.

begin;

create or replace function public.submit_contact_message(
  p_client_key text,
  p_name text,
  p_email text,
  p_subject text,
  p_message text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := now();
  limit_row public.contact_rate_limits%rowtype;
begin
  if p_client_key !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid client key';
  end if;

  if length(btrim(p_name)) not between 1 and 120
    or length(btrim(p_email)) not between 3 and 254
    or btrim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or length(btrim(p_subject)) not between 1 and 160
    or length(btrim(p_message)) not between 10 and 3000 then
    raise exception 'Invalid contact payload';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_client_key, 0));
  delete from public.contact_rate_limits
    where updated_at < v_now - interval '24 hours';

  select * into limit_row
  from public.contact_rate_limits
  where client_key = p_client_key
  for update;

  if not found or limit_row.window_started_at <= v_now - interval '10 minutes' then
    insert into public.contact_rate_limits (
      client_key, request_count, window_started_at, updated_at
    ) values (
      p_client_key, 1, v_now, v_now
    )
    on conflict (client_key) do update set
      request_count = 1,
      window_started_at = v_now,
      updated_at = v_now;
  elsif limit_row.request_count >= 5 then
    return 'rate_limited';
  else
    update public.contact_rate_limits set
      request_count = request_count + 1,
      updated_at = v_now
    where client_key = p_client_key;
  end if;

  insert into public.contact_messages (name, email, subject, message)
  values (p_name, p_email, p_subject, p_message);

  return 'accepted';
end;
$$;

revoke all on function public.submit_contact_message(text, text, text, text, text)
from public;
grant execute on function public.submit_contact_message(text, text, text, text, text)
to service_role;

notify pgrst, 'reload schema';

commit;
