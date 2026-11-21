-- Initial schema for the artist portfolio. No production records are inserted.
create extension if not exists pgcrypto with schema extensions;

create type public.enum_availability as enum ('available', 'reserved', 'sold', 'gifted', 'not_for_sale');
create type public.enum_method as enum ('deska', 'płótno', 'papier');
create type public.enum_author as enum ('cortez', 'rembrant', 'wierusz-kowalski');
create type public.enum_status as enum ('draft', 'published', 'hidden');
create type public.content_visibility as enum ('public', 'unlisted', 'private');
create type public.media_role as enum ('thumbnail', 'wall_view', 'high_resolution', 'room_image');
create type public.hotspot_type as enum ('artwork', 'room');

create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  image_id uuid,
  availability public.enum_availability not null default 'not_for_sale',
  title text,
  description text,
  method public.enum_method,
  size text,
  place text,
  author public.enum_author not null default 'cortez',
  price_pln numeric(12,2) check (price_pln is null or price_pln >= 0),
  status public.enum_status not null default 'draft',
  visibility public.content_visibility not null default 'private',
  frame text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  label text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null,
  storage_path text not null,
  role public.media_role not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  byte_size bigint check (byte_size is null or byte_size > 0),
  alt_text text,
  is_public boolean not null default false,
  artwork_id uuid references public.artworks(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((artwork_id is not null)::integer + (room_id is not null)::integer = 1),
  unique (storage_bucket, storage_path)
);

alter table public.artworks add constraint artworks_image_id_fkey
  foreign key (image_id) references public.media_assets(id) on delete set null;

create unique index media_assets_artwork_role_idx on public.media_assets (artwork_id, role) where artwork_id is not null;
create unique index media_assets_room_role_idx on public.media_assets (room_id, role) where room_id is not null;
create index artworks_public_idx on public.artworks (author, method, availability) where status = 'published' and visibility = 'public';
create index rooms_public_order_idx on public.rooms (sort_order, slug) where is_published;

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

create table public.artwork_tags (
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (artwork_id, tag_id)
);
create index artwork_tags_tag_idx on public.artwork_tags (tag_id, artwork_id);

create table public.room_hotspots (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  kind public.hotspot_type not null,
  x numeric(5,2) not null check (x between 0 and 100),
  y numeric(5,2) not null check (y between 0 and 100),
  width numeric(5,2) not null check (width > 0 and width <= 100),
  height numeric(5,2) not null check (height > 0 and height <= 100),
  accessible_label text not null check (length(trim(accessible_label)) > 0),
  artwork_id uuid references public.artworks(id) on delete cascade,
  target_room_id uuid references public.rooms(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (
    (kind = 'artwork' and artwork_id is not null and target_room_id is null) or
    (kind = 'room' and target_room_id is not null and artwork_id is null)
  ),
  check (x + width <= 100 and y + height <= 100)
);

create index room_hotspots_room_idx on public.room_hotspots (room_id);
create index room_hotspots_artwork_idx on public.room_hotspots (artwork_id) where artwork_id is not null;
create index room_hotspots_target_room_idx on public.room_hotspots (target_room_id) where target_room_id is not null;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger artworks_set_updated_at before update on public.artworks for each row execute function public.set_updated_at();
create trigger rooms_set_updated_at before update on public.rooms for each row execute function public.set_updated_at();

alter table public.artworks enable row level security;
alter table public.rooms enable row level security;
alter table public.media_assets enable row level security;
alter table public.tags enable row level security;
alter table public.artwork_tags enable row level security;
alter table public.room_hotspots enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.artworks, public.rooms, public.media_assets, public.tags, public.artwork_tags, public.room_hotspots to anon, authenticated;

create policy "Public can read published artworks" on public.artworks
  for select to anon, authenticated using (status = 'published' and visibility = 'public');
create policy "Public can read published rooms" on public.rooms
  for select to anon, authenticated using (is_published);
create policy "Public can read media of public records" on public.media_assets
  for select to anon, authenticated using (
    is_public and (
      (artwork_id is not null and exists (select 1 from public.artworks a where a.id = artwork_id and a.status = 'published' and a.visibility = 'public')) or
      (room_id is not null and exists (select 1 from public.rooms r where r.id = room_id and r.is_published))
    )
  );
create policy "Public can read tags assigned to published artworks" on public.tags
  for select to anon, authenticated using (
    exists (select 1 from public.artwork_tags at join public.artworks a on a.id = at.artwork_id where at.tag_id = id and a.status = 'published' and a.visibility = 'public')
  );
create policy "Public can read links for published artworks" on public.artwork_tags
  for select to anon, authenticated using (
    exists (select 1 from public.artworks a where a.id = artwork_id and a.status = 'published' and a.visibility = 'public')
  );
create policy "Public can read hotspots of published rooms" on public.room_hotspots
  for select to anon, authenticated using (
    exists (select 1 from public.rooms r where r.id = room_id and r.is_published)
    and ((kind = 'artwork' and exists (select 1 from public.artworks a where a.id = artwork_id and a.status = 'published' and a.visibility = 'public'))
      or (kind = 'room' and exists (select 1 from public.rooms r where r.id = target_room_id and r.is_published)))
  );

-- No public write policies. Admin write access will be added with authenticated panel roles.
