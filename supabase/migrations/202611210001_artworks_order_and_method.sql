-- Preserve existing method values while replacing their labels with the new catalogue terminology.
-- The blocks are safe when the enum has already been renamed manually.
do $$
begin
  if exists (select 1 from pg_enum where enumtypid = 'public.enum_method'::regtype and enumlabel = 'deska') then
    alter type public.enum_method rename value 'deska' to 'Olej na płycie';
  end if;
  if exists (select 1 from pg_enum where enumtypid = 'public.enum_method'::regtype and enumlabel = 'płótno') then
    alter type public.enum_method rename value 'płótno' to 'Olej na płótnie';
  end if;
  if exists (select 1 from pg_enum where enumtypid = 'public.enum_method'::regtype and enumlabel = 'papier') then
    alter type public.enum_method rename value 'papier' to 'Ołówek na papierze';
  end if;
end $$;

alter table public.artworks
  add column "order" integer not null default 0;

create index artworks_order_idx on public.artworks ("order", created_at);
