-- Calculate GBP from the original PLN amounts before rounding any prices.
insert into public.artwork_prices (artwork_id, currency_code, amount)
select artwork_id, 'GBP', ceil(amount / 5.5 / 10) * 10
from public.artwork_prices
where currency_code = 'PLN'
on conflict (artwork_id, currency_code) do nothing;

-- Round all existing currencies upwards, including PLN and manually entered prices.
update public.artwork_prices
set amount = ceil(amount / 10) * 10
where mod(amount, 10) <> 0;
