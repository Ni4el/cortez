-- Remove fields that are no longer part of the artwork model.
-- Existing artwork rows are preserved; removed values are intentionally discarded.

drop index if exists public.artworks_public_catalog_idx;

drop policy if exists "Public can read published artworks" on public.artworks;
drop policy if exists "Public can read media of public records" on public.media_assets;
drop policy if exists "Public can read tags assigned to published artworks" on public.tags;
drop policy if exists "Public can read links for published artworks" on public.artwork_tags;
drop policy if exists "Public can read hotspots of published rooms" on public.room_hotspots;
drop policy if exists "Public can read artwork room links" on public.room_artworks;

create policy "Public can read published artworks" on public.artworks
  for select to anon, authenticated using (publication_status = 'published');
create policy "Public can read media of public records" on public.media_assets
  for select to anon, authenticated using (
    is_public and (
      (artwork_id is not null and exists (select 1 from public.artworks a where a.id = artwork_id and a.publication_status = 'published')) or
      (room_id is not null and exists (select 1 from public.rooms r where r.id = room_id and r.is_published)) or
      (exhibition_id is not null and exists (select 1 from public.exhibitions e where e.id = exhibition_id and e.is_published))
    )
  );
create policy "Public can read tags assigned to published artworks" on public.tags
  for select to anon, authenticated using (
    exists (select 1 from public.artwork_tags at join public.artworks a on a.id = at.artwork_id
      where at.tag_id = tags.id and a.publication_status = 'published')
  );
create policy "Public can read links for published artworks" on public.artwork_tags
  for select to anon, authenticated using (
    exists (select 1 from public.artworks a where a.id = artwork_id and a.publication_status = 'published')
  );
create policy "Public can read hotspots of published rooms" on public.room_hotspots
  for select to anon, authenticated using (
    exists (select 1 from public.rooms r where r.id = room_id and r.is_published)
    and ((kind = 'artwork' and exists (select 1 from public.artworks a where a.id = artwork_id and a.publication_status = 'published'))
      or (kind = 'room' and exists (select 1 from public.rooms r where r.id = target_room_id and r.is_published)))
  );
create policy "Public can read artwork room links" on public.room_artworks
  for select to anon, authenticated using (
    exists (select 1 from public.rooms r where r.id = room_id and r.is_published)
    and exists (select 1 from public.artworks a where a.id = artwork_id and a.publication_status = 'published')
  );

alter table public.artworks
  drop constraint if exists artworks_check,
  drop constraint if exists artworks_price_check,
  drop constraint if exists artworks_currency_check;

alter table public.artworks
  drop column if exists dimensions,
  drop column if exists medium,
  drop column if exists price,
  drop column if exists currency,
  drop column if exists status,
  drop column if exists visibility,
  alter column author drop not null,
  alter column author drop default;
