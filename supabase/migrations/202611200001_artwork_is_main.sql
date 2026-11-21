-- The selected artwork is used as the image background for the home hero.
alter table public.artworks
  add column is_main boolean not null default false;

-- There can be only one selected hero artwork at a time.
create unique index artworks_one_main_idx
  on public.artworks ((is_main))
  where is_main;
