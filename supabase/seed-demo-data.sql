-- Run supabase/schema.sql first.
-- Then replace this email with the user you created in Supabase Auth.

do $$
declare
  target_email text := 'you@example.com';
  target_user_id uuid;
  housing_category_id uuid;
  food_category_id uuid;
  transport_category_id uuid;
  subscriptions_category_id uuid;
  family_category_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where email = target_email
  limit 1;

  if target_user_id is null then
    raise exception 'No Supabase auth user found for email %. Sign up in the app first, then rerun this seed.', target_email;
  end if;

  insert into public.profiles (user_id, monthly_salary, currency)
  values (target_user_id, 180000, 'INR')
  on conflict (user_id)
  do update set
    monthly_salary = excluded.monthly_salary,
    currency = excluded.currency;

  insert into public.categories (user_id, name, emoji, color, sort_order)
  values
    (target_user_id, 'Housing', '🏠', 'brown', 0),
    (target_user_id, 'Food & Groceries', '🛒', 'green', 1),
    (target_user_id, 'Transportation', '🚌', 'blue', 2),
    (target_user_id, 'Subscriptions', '🧾', 'purple', 3),
    (target_user_id, 'Family', '🤝', 'pink', 4),
    (target_user_id, 'Other', '📦', 'gray', 5)
  on conflict do nothing;

  select id into housing_category_id from public.categories where user_id = target_user_id and lower(name) = 'housing';
  select id into food_category_id from public.categories where user_id = target_user_id and lower(name) = 'food & groceries';
  select id into transport_category_id from public.categories where user_id = target_user_id and lower(name) = 'transportation';
  select id into subscriptions_category_id from public.categories where user_id = target_user_id and lower(name) = 'subscriptions';
  select id into family_category_id from public.categories where user_id = target_user_id and lower(name) = 'family';

  delete from public.budget_items
  where user_id = target_user_id
    and details like 'Demo seed:%';

  delete from public.debt_items
  where user_id = target_user_id
    and details like 'Demo seed:%';

  delete from public.wishlist_items
  where user_id = target_user_id
    and details like 'Demo seed:%';

  insert into public.budget_items (user_id, name, amount, category_id, details, sort_order)
  values
    (target_user_id, 'Rent', 45000, housing_category_id, 'Demo seed: apartment rent and maintenance', 0),
    (target_user_id, 'Groceries', 18000, food_category_id, 'Demo seed: food, household items, and pantry restock', 1),
    (target_user_id, 'Transport', 9000, transport_category_id, 'Demo seed: fuel, cab rides, and metro pass', 2),
    (target_user_id, 'Subscriptions', 3500, subscriptions_category_id, 'Demo seed: streaming, cloud storage, and tools', 3),
    (target_user_id, 'Family support', 22000, family_category_id, 'Demo seed: monthly family transfer', 4);

  insert into public.debt_items (user_id, name, amount, interest_rate, tenure_months, details, sort_order)
  values
    (target_user_id, 'Credit card balance', 65000, 0, null, 'Demo seed: clear this first because it is high priority', 0),
    (target_user_id, 'Personal loan', 240000, 12.5, 24, 'Demo seed: stored interest and tenure, not used in v1 projection', 1),
    (target_user_id, 'Laptop EMI', 78000, 9.5, 10, 'Demo seed: remaining purchase EMI', 2);

  insert into public.wishlist_items (user_id, name, amount, details, sort_order)
  values
    (target_user_id, 'Emergency fund top-up', 150000, 'Demo seed: build three months of buffer', 0),
    (target_user_id, 'Goa trip', 60000, 'Demo seed: flights, hotel, food, and local travel', 1),
    (target_user_id, 'New phone', 85000, 'Demo seed: planned upgrade after debt payoff', 2),
    (target_user_id, 'Home office chair', 22000, 'Demo seed: ergonomic chair for work setup', 3);
end $$;

notify pgrst, 'reload schema';
