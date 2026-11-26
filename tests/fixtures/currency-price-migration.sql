\set ON_ERROR_STOP on
begin;
create role anon;
create role authenticated;
create function public.is_admin() returns boolean language sql stable as $$ select current_user = 'authenticated' $$;
create table public.artworks (id uuid primary key, price_pln numeric(12,2), publication_status text not null);
create table public.exhibitions (id uuid primary key, is_published boolean not null);
insert into public.artworks values
  ('00000000-0000-0000-0000-000000000001', 6500.00, 'published'),
  ('00000000-0000-0000-0000-000000000002', 0.00, 'draft'),
  ('00000000-0000-0000-0000-000000000003', null, 'published'),
  ('00000000-0000-0000-0000-000000000004', 5000.00, 'published');
\ir ../../supabase/migrations/202611260001_localization_and_prices.sql
insert into public.artwork_prices values ('00000000-0000-0000-0000-000000000001', 'EUR', 1250.00);
\ir ../../supabase/migrations/202611260002_fill_eur_usd_artwork_prices.sql
\ir ../../supabase/migrations/202611260002_fill_eur_usd_artwork_prices.sql

do $$ begin
  if (select count(*) from public.artwork_prices) <> 9
    or (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000001' and currency_code = 'EUR') is distinct from 1250.00
    or (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000001' and currency_code = 'USD') is distinct from 1585.00
    or (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000002' and currency_code = 'EUR') is distinct from 0.00
    or (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000002' and currency_code = 'USD') is distinct from 0.00
    or (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000004' and currency_code = 'EUR') is distinct from 1111.00
    or (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000004' and currency_code = 'USD') is distinct from 1220.00
    or exists (select 1 from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000003') then
    raise exception 'currency prices were not filled correctly';
  end if;
end $$;
rollback;
