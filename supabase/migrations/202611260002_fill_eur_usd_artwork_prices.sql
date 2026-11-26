-- Fill missing EUR and USD prices from PLN without overwriting manually set prices.
insert into public.artwork_prices (artwork_id, currency_code, amount)
select prices.artwork_id, rates.currency_code, round(prices.amount / rates.pln_per_unit)
from public.artwork_prices as prices
cross join (values ('EUR', 4.5::numeric), ('USD', 4.1::numeric)) as rates(currency_code, pln_per_unit)
where prices.currency_code = 'PLN'
on conflict (artwork_id, currency_code) do nothing;
