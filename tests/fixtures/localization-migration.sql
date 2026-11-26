\set ON_ERROR_STOP on
begin;
create role anon;
create role authenticated;
create function public.is_admin() returns boolean language sql stable as $$ select current_user = 'authenticated' $$;
create table public.artworks (id uuid primary key, price_pln numeric(12,2), publication_status text not null);
create table public.exhibitions (id uuid primary key, is_published boolean not null);
grant select on public.artworks, public.exhibitions to anon, authenticated;
insert into public.artworks values
  ('00000000-0000-0000-0000-000000000001', 6500.00, 'published'),
  ('00000000-0000-0000-0000-000000000002', 0.00, 'published'),
  ('00000000-0000-0000-0000-000000000003', 999.00, 'draft');
insert into public.exhibitions values
  ('00000000-0000-0000-0000-000000000004', true),
  ('00000000-0000-0000-0000-000000000005', false);
\ir ../../supabase/migrations/202611260001_localization_and_prices.sql

do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'artworks' and column_name = 'price_pln') then
    raise exception 'price_pln was not removed';
  end if;
  if (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000001' and currency_code = 'PLN') <> 6500.00
    or (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000002' and currency_code = 'PLN') <> 0.00 then
    raise exception 'PLN prices were not preserved';
  end if;
end $$;
insert into public.artwork_translations values
  ('00000000-0000-0000-0000-000000000001', 'en', 'Title', 'Description'),
  ('00000000-0000-0000-0000-000000000003', 'en', 'Draft', 'Private');
insert into public.exhibition_translations values
  ('00000000-0000-0000-0000-000000000004', 'en', 'Public', 'Description'),
  ('00000000-0000-0000-0000-000000000005', 'en', 'Draft', 'Private');
set role anon;
do $$ begin
  if (select count(*) from public.artwork_prices) <> 2 or (select count(*) from public.artwork_translations) <> 1
     or (select count(*) from public.exhibition_translations) <> 1 then
    raise exception 'anonymous access exposed draft data or hid published data';
  end if;
end $$;
reset role;
set role authenticated;
insert into public.artwork_prices values ('00000000-0000-0000-0000-000000000001', 'EUR', 1250.00);
do $$ begin
  if (select count(*) from public.artwork_prices) <> 4 then raise exception 'admin price access failed'; end if;
end $$;
reset role;
rollback;
