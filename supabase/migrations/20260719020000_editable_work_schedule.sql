alter table public.profiles
  add column if not exists working_days_per_month smallint not null default 22
  check (working_days_per_month between 1 and 31);

alter table public.profiles
  add column if not exists working_hours_per_day numeric(4, 2) not null default 8
  check (working_hours_per_day > 0 and working_hours_per_day <= 24);

notify pgrst, 'reload schema';
