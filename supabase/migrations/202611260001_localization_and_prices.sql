-- Preserve existing PLN prices before removing the old column.
create table public.currencies (
  code text primary key check (code ~ '^[A-Z]{3}$'),
  name text not null check (length(trim(name)) > 0)
);
insert into public.currencies (code, name) values
  ('PLN', 'Złoty polski'), ('EUR', 'Euro'), ('USD', 'US dollar');

create table public.language_currencies (
  language_code text primary key check (language_code ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
  currency_code text not null references public.currencies(code) on update cascade on delete restrict
);
insert into public.language_currencies (language_code, currency_code) values
  ('pl', 'PLN'), ('en', 'USD'), ('de', 'EUR');

create table public.artwork_prices (
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  currency_code text not null references public.currencies(code) on update cascade on delete restrict,
  amount numeric(12,2) not null check (amount >= 0),
  primary key (artwork_id, currency_code)
);
insert into public.artwork_prices (artwork_id, currency_code, amount)
  select id, 'PLN', price_pln from public.artworks where price_pln is not null;
alter table public.artworks drop column price_pln;

create table public.artwork_translations (
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  language_code text not null,
  title text,
  description text,
  primary key (artwork_id, language_code)
);
create table public.exhibition_translations (
  exhibition_id uuid not null references public.exhibitions(id) on delete cascade,
  language_code text not null,
  title text,
  description text,
  primary key (exhibition_id, language_code)
);

do $$
declare t text;
begin
  foreach t in array array['currencies', 'language_currencies', 'artwork_prices', 'artwork_translations', 'exhibition_translations'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t || ' admin full access', t);
  end loop;
end $$;
create policy "Public can read currencies" on public.currencies for select to anon, authenticated using (true);
create policy "Public can read language currencies" on public.language_currencies for select to anon, authenticated using (true);
create policy "Public can read prices of published artworks" on public.artwork_prices for select to anon, authenticated
  using (exists (select 1 from public.artworks a where a.id = artwork_id and a.publication_status = 'published'));
create policy "Public can read translations of published artworks" on public.artwork_translations for select to anon, authenticated
  using (exists (select 1 from public.artworks a where a.id = artwork_id and a.publication_status = 'published'));
create policy "Public can read translations of published exhibitions" on public.exhibition_translations for select to anon, authenticated
  using (exists (select 1 from public.exhibitions e where e.id = exhibition_id and e.is_published));
