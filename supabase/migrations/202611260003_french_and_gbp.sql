insert into public.currencies (code, name)
values ('GBP', 'Funt brytyjski')
on conflict (code) do nothing;

insert into public.language_currencies (language_code, currency_code)
values ('pl', 'PLN'), ('en', 'GBP'), ('de', 'EUR'), ('fr', 'USD')
on conflict (language_code) do update set currency_code = excluded.currency_code;
