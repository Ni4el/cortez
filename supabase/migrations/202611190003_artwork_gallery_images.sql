-- Allow an artwork to have an ordered set of gallery images.
alter table public.media_assets
  add column sort_order integer not null default 0;

drop index if exists public.media_assets_artwork_role_idx;
create index media_assets_artwork_order_idx
  on public.media_assets (artwork_id, sort_order, created_at)
  where artwork_id is not null;

update public.media_assets
set sort_order = case when role = 'thumbnail' then 0 else 1 end
where artwork_id is not null;
