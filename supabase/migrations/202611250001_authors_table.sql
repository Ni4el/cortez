-- Replace enum_author with a dedicated authors table so authors can be managed
-- through the admin panel (add/edit/delete) instead of a static enum.

-- 1. Create authors table
create table public.authors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null unique check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger authors_set_updated_at before update on public.authors
  for each row execute function public.set_updated_at();

-- 2. Seed authors from existing enum values
insert into public.authors (slug, name) values
  ('cortez', 'Zbigniew Cortez Zając'),
  ('rembrant', 'Rembrandt van Rijn'),
  ('wierusz-kowalski', 'Wierusz-Kowalski')
on conflict (slug) do nothing;

-- 3. Add author reference to artworks
alter table public.artworks
  add column author uuid;

-- 4. Add foreign key
alter table public.artworks
  add constraint artworks_author_fkey
  foreign key (author)
  references public.authors(id)
  on delete set null;

-- 5. Drop the obsolete enum type
--drop type public.enum_author; DONE

-- 6. Enable RLS and grant admin access for the new table
alter table public.authors enable row level security;
create policy "Public can read authors" on public.authors
  for select to anon, authenticated using (true);
create policy "Admins manage authors" on public.authors
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.authors to anon, authenticated;
grant insert, update, delete on public.authors to authenticated;
