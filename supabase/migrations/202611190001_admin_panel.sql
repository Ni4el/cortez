-- Private admin panel schema. Existing public records and migration history remain intact.

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
grant select on public.admin_users to authenticated;
create unique index admin_users_singleton_idx on public.admin_users ((true));
create policy "Admin can verify own access" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.rooms
  add column parent_room_id uuid references public.rooms(id) on delete restrict,
  add column is_primary boolean not null default false;
alter table public.rooms add constraint rooms_primary_is_root check (not is_primary or parent_room_id is null);
create unique index rooms_one_primary_idx on public.rooms (is_primary) where is_primary;
create index rooms_parent_idx on public.rooms (parent_room_id, sort_order);

create function public.validate_room_parent()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.parent_room_id is not null and not exists (
    select 1 from public.rooms r where r.id = new.parent_room_id and r.is_primary
  ) then
    raise exception 'Pomieszczenie podrzędne musi należeć do pomieszczenia głównego.';
  end if;
  if new.parent_room_id = new.id then
    raise exception 'Pomieszczenie nie może być własnym rodzicem.';
  end if;
  return new;
end;
$$;
create trigger rooms_validate_parent before insert or update of parent_room_id, is_primary on public.rooms
  for each row execute function public.validate_room_parent();

create table public.room_artworks (
  artwork_id uuid primary key references public.artworks(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index room_artworks_room_idx on public.room_artworks (room_id, sort_order);

create table public.exhibitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) > 0),
  venue text,
  start_date date,
  end_date date,
  description text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_date is null or end_date is null or end_date >= start_date)
);
create trigger exhibitions_set_updated_at before update on public.exhibitions
  for each row execute function public.set_updated_at();

alter table public.media_assets add column exhibition_id uuid references public.exhibitions(id) on delete cascade;
alter table public.media_assets drop constraint media_assets_check;
alter table public.media_assets add constraint media_assets_one_owner check (
  (artwork_id is not null)::integer + (room_id is not null)::integer + (exhibition_id is not null)::integer = 1
);
create unique index media_assets_exhibition_role_idx on public.media_assets (exhibition_id, role) where exhibition_id is not null;

create function public.validate_room_artwork_room()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.rooms r where r.id = new.room_id and r.parent_room_id is not null) then
    raise exception 'Dzieło można przypisać tylko do jednego pomieszczenia podrzędnego.';
  end if;
  return new;
end;
$$;
create trigger room_artworks_validate_room before insert or update on public.room_artworks
  for each row execute function public.validate_room_artwork_room();

-- Align legacy public policies with the separate publication_status column.
drop policy if exists "Anyone can read public artworks" on public.artworks;
drop policy if exists "Public can read published artworks" on public.artworks;
create policy "Public can read published artworks" on public.artworks
  for select to anon, authenticated using (publication_status = 'published' and visibility = 'public');
drop policy if exists "Anyone can read public media" on public.media_assets;
drop policy if exists "Public can read media of public records" on public.media_assets;
create policy "Public can read media of public records" on public.media_assets
  for select to anon, authenticated using (
    is_public and (
      (artwork_id is not null and exists (select 1 from public.artworks a where a.id = artwork_id and a.publication_status = 'published' and a.visibility = 'public')) or
      (room_id is not null and exists (select 1 from public.rooms r where r.id = room_id and r.is_published)) or
      (exhibition_id is not null and exists (select 1 from public.exhibitions e where e.id = exhibition_id and e.is_published))
    )
  );
drop policy if exists "Public can read tags assigned to published artworks" on public.tags;
create policy "Public can read tags assigned to published artworks" on public.tags
  for select to anon, authenticated using (
    exists (select 1 from public.artwork_tags at join public.artworks a on a.id = at.artwork_id
      where at.tag_id = tags.id and a.publication_status = 'published' and a.visibility = 'public')
  );
drop policy if exists "Public can read links for published artworks" on public.artwork_tags;
create policy "Public can read links for published artworks" on public.artwork_tags
  for select to anon, authenticated using (
    exists (select 1 from public.artworks a where a.id = artwork_id and a.publication_status = 'published' and a.visibility = 'public')
  );
drop policy if exists "Anyone can read hotspots of published rooms with public targets" on public.room_hotspots;
drop policy if exists "Public can read hotspots of published rooms" on public.room_hotspots;
create policy "Public can read hotspots of published rooms" on public.room_hotspots
  for select to anon, authenticated using (
    exists (select 1 from public.rooms r where r.id = room_id and r.is_published)
    and ((kind = 'artwork' and exists (select 1 from public.artworks a where a.id = artwork_id and a.publication_status = 'published' and a.visibility = 'public'))
      or (kind = 'room' and exists (select 1 from public.rooms r where r.id = target_room_id and r.is_published)))
  );

do $$
declare t text;
begin
  foreach t in array array['artworks','rooms','media_assets','tags','artwork_tags','room_hotspots','room_artworks','exhibitions'] loop
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t || ' admin full access', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

alter table public.room_artworks enable row level security;
alter table public.exhibitions enable row level security;
create policy "Public can read published exhibition records" on public.exhibitions
  for select to anon, authenticated using (is_published);
create policy "Public can read artwork room links" on public.room_artworks
  for select to anon, authenticated using (
    exists (select 1 from public.rooms r where r.id = room_id and r.is_published)
    and exists (select 1 from public.artworks a where a.id = artwork_id and a.publication_status = 'published' and a.visibility = 'public')
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 20971520, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "Portfolio images are publicly readable" on storage.objects
  for select to anon, authenticated using (bucket_id = 'portfolio');
create policy "Admins manage portfolio images" on storage.objects
  for all to authenticated using (bucket_id = 'portfolio' and public.is_admin())
  with check (bucket_id = 'portfolio' and public.is_admin());

grant select on public.exhibitions, public.room_artworks to anon, authenticated;
grant insert, update, delete on public.exhibitions, public.room_artworks to authenticated;
