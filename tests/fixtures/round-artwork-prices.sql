\set ON_ERROR_STOP on
begin;
create role anon;
create role authenticated;
create function public.is_admin() returns boolean language sql stable as $$ select current_user = 'authenticated' $$;
create table public.artworks (id uuid primary key, price_pln numeric(12,2), publication_status text not null);
create table public.exhibitions (id uuid primary key, is_published boolean not null);
insert into public.artworks values
  ('00000000-0000-0000-0000-000000000001', 6601.00, 'published'),
  ('00000000-0000-0000-0000-000000000002', 0.00, 'draft'),
  ('00000000-0000-0000-0000-000000000003', null, 'published');
\ir ../../supabase/migrations/202611260001_localization_and_prices.sql
\ir ../../supabase/migrations/202611260003_french_and_gbp.sql
insert into public.artwork_prices values
  ('00000000-0000-0000-0000-000000000001', 'EUR', 112.00),
  ('00000000-0000-0000-0000-000000000001', 'USD', 100.00),
  ('00000000-0000-0000-0000-000000000002', 'GBP', 1225.00);
\ir ../../supabase/migrations/202611260004_gbp_and_round_prices.sql
\ir ../../supabase/migrations/202611260004_gbp_and_round_prices.sql
do $$ begin
  if (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000001' and currency_code = 'PLN') is distinct from 6610.00
    or (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000001' and currency_code = 'GBP') is distinct from 1210.00
    or (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000001' and currency_code = 'EUR') is distinct from 120.00
    or (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000001' and currency_code = 'USD') is distinct from 100.00
    or (select amount from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000002' and currency_code = 'GBP') is distinct from 1230.00
    or exists (select 1 from public.artwork_prices where artwork_id = '00000000-0000-0000-0000-000000000003') then
    raise exception 'price conversion or rounding failed';
  end if;
end $$;
rollback;
