alter table public.currencies
  add column format_locale text not null default 'pl-PL' check (length(trim(format_locale)) > 0),
  add column symbol_position text not null default 'locale' check (symbol_position in ('locale', 'after_no_space')),
  add column max_fraction_digits smallint not null default 2 check (max_fraction_digits between 0 and 2);

update public.currencies
set format_locale = case code when 'GBP' then 'en-GB' else 'pl-PL' end,
    symbol_position = case code when 'USD' then 'after_no_space' else 'locale' end,
    max_fraction_digits = case code when 'PLN' then 0 else 2 end
where code in ('PLN', 'GBP', 'EUR', 'USD');
