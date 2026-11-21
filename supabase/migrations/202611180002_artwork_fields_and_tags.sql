-- Upgrade the already-applied initial schema without rewriting migration history.
-- Existing artwork data is preserved; legacy columns remain for a safe transition.

create type public.enum_availability as enum ('available', 'reserved', 'sold', 'gifted', 'not_for_sale');
create type public.enum_method as enum ('deska', 'płótno', 'papier');
create type public.enum_author as enum ('cortez', 'rembrant', 'wierusz-kowalski');
create type public.enum_status as enum ('draft', 'published', 'hidden');

alter table public.artworks
  add column availability public.enum_availability,
  add column method public.enum_method,
  add column size text,
  add column place text,
  add column author public.enum_author not null default 'cortez',
  add column price_pln numeric(12,2),
  add column publication_status public.enum_status,
  add column frame text,
  add column image_id uuid;

-- Map the initial migration's transaction status into the requested availability enum.
update public.artworks
set availability = case status::text
  when 'available' then 'available'::public.enum_availability
  when 'reserved' then 'reserved'::public.enum_availability
  when 'sold' then 'sold'::public.enum_availability
  when 'gifted' then 'gifted'::public.enum_availability
  else 'not_for_sale'::public.enum_availability
end;

-- Preserve existing publication semantics: public visibility becomes published;
-- all other records remain hidden from the public catalog.
update public.artworks
set publication_status = case
  when visibility::text = 'public' then 'published'::public.enum_status
  when visibility::text = 'unlisted' then 'hidden'::public.enum_status
  else 'draft'::public.enum_status
end;

update public.artworks
set price_pln = price
where currency = 'PLN' and price is not null;

update public.artworks a
set image_id = m.id
from public.media_assets m
where m.artwork_id = a.id and m.role = 'thumbnail';

alter table public.artworks
  alter column availability set default 'not_for_sale',
  alter column availability set not null,
  alter column publication_status set default 'draft',
  alter column publication_status set not null;

alter table public.artworks
  add constraint artworks_image_id_fkey
    foreign key (image_id) references public.media_assets(id) on delete set null,
  add constraint artworks_price_pln_nonnegative check (price_pln is null or price_pln >= 0);

create index artworks_publication_catalog_idx
  on public.artworks (publication_status, availability, author, method)
  where publication_status = 'published';

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

alter table public.tags enable row level security;
alter table public.artwork_tags enable row level security;
grant select on public.tags, public.artwork_tags to anon, authenticated;

create policy "Public can read tags assigned to published artworks" on public.tags
  for select to anon, authenticated using (
    exists (
      select 1 from public.artwork_tags at
      join public.artworks a on a.id = at.artwork_id
      where at.tag_id = id and a.publication_status = 'published' and a.visibility = 'public'
    )
  );
create policy "Public can read links for published artworks" on public.artwork_tags
  for select to anon, authenticated using (
    exists (
      select 1 from public.artworks a
      where a.id = artwork_id and a.publication_status = 'published' and a.visibility = 'public'
    )
  );

-- No public insert/update/delete policies are added. Existing columns (status,
-- medium, dimensions, sale_mode, price, currency) are retained for data safety.
