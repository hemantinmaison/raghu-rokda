-- Refresh untouched onboarding rows without overwriting user-edited budgets.
create temporary table rr_default_budget_users on commit drop as
select distinct user_id
from public.budget_items
where name = 'Monthly Savings'
  and amount = 3000
  and details = 'Planned monthly savings';

update public.budget_items b
set details = 'Landlord’s monthly subscription', sort_order = 0
from rr_default_budget_users u
where b.user_id = u.user_id and b.name = 'Rent' and b.amount = 8000
  and b.details = 'Monthly housing cost';

update public.budget_items b
set name = 'Groceries & Ghee', amount = 3500,
  details = 'Thoda Ghee Khaya karo Ashok', sort_order = 1
from rr_default_budget_users u
where b.user_id = u.user_id and b.name = 'Groceries' and b.amount = 4000
  and b.details = 'Food and household essentials';

update public.budget_items b
set name = 'E20 Petrol', emoji = '⛽', details = 'Ganne ka Juice', sort_order = 2
from rr_default_budget_users u
where b.user_id = u.user_id and b.name = 'Transport' and b.amount = 2000
  and b.details = 'Fuel, public transport, or cab fares';

update public.budget_items b
set name = 'Mobile Recharge', amount = 500, details = 'Data khatam, duniya khatam', sort_order = 3
from rr_default_budget_users u
where b.user_id = u.user_id and b.name = 'Mobile & Internet' and b.amount = 1000
  and b.details = 'Phone and internet plans';

update public.budget_items b
set details = 'AC chala toh meter bhi daudega', sort_order = 4
from rr_default_budget_users u
where b.user_id = u.user_id and b.name = 'Electricity & Water' and b.amount = 1500
  and b.details = 'Monthly utility bills';

update public.budget_items b
set name = 'Monthly Investment', amount = 2500,
  details = 'Monthly SIP investment', sort_order = 5
from rr_default_budget_users u
where b.user_id = u.user_id and b.name = 'Monthly Savings' and b.amount = 3000
  and b.details = 'Planned monthly savings';

update public.debt_items
set name = 'iPhone', amount = 134900, details = null
where name = 'iPhone 17 Pro Max 2TB'
  and amount = 229900
  and interest_rate is null
  and tenure_months is null
  and monthly_emi is null
  and details = 'Latest highest-capacity iPhone; update financing details if purchased.';

create or replace function public.initialize_user_finances_for(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_should_seed boolean;
  v_profile_created boolean;
  v_housing uuid;
  v_food uuid;
  v_transport uuid;
  v_bills uuid;
  v_savings uuid;
begin
  select not (
    exists (select 1 from public.profiles where user_id = p_user_id)
    or exists (select 1 from public.budget_items where user_id = p_user_id)
    or exists (select 1 from public.debt_items where user_id = p_user_id)
    or exists (select 1 from public.wishlist_items where user_id = p_user_id)
  ) into v_should_seed;

  insert into public.profiles (user_id, monthly_salary, currency)
  values (p_user_id, 25000, 'INR')
  on conflict (user_id) do nothing
  returning true into v_profile_created;

  if not v_should_seed or not coalesce(v_profile_created, false) then return false; end if;

  insert into public.categories (user_id, name, emoji, color, sort_order)
  values
    (p_user_id, 'Housing', '🏠', 'brown', 0),
    (p_user_id, 'Food & Groceries', '🛒', 'green', 1),
    (p_user_id, 'Transportation', '🚌', 'blue', 2),
    (p_user_id, 'Bills & Utilities', '🧾', 'yellow', 3),
    (p_user_id, 'Healthcare', '🏥', 'red', 4),
    (p_user_id, 'Entertainment', '🎬', 'purple', 5),
    (p_user_id, 'Shopping', '🛍️', 'pink', 6),
    (p_user_id, 'Savings', '💰', 'green', 7),
    (p_user_id, 'Other', '📦', 'gray', 8)
  on conflict do nothing;

  select id into v_housing from public.categories where user_id = p_user_id and lower(name) = 'housing';
  select id into v_food from public.categories where user_id = p_user_id and lower(name) = 'food & groceries';
  select id into v_transport from public.categories where user_id = p_user_id and lower(name) = 'transportation';
  select id into v_bills from public.categories where user_id = p_user_id and lower(name) = 'bills & utilities';
  select id into v_savings from public.categories where user_id = p_user_id and lower(name) = 'savings';

  insert into public.budget_items (user_id, name, emoji, amount, category_id, details, sort_order)
  values
    (p_user_id, 'Rent', '🏠', 8000, v_housing, 'Landlord’s monthly subscription', 0),
    (p_user_id, 'Groceries & Ghee', '🛒', 3500, v_food, 'Thoda Ghee Khaya karo Ashok', 1),
    (p_user_id, 'E20 Petrol', '⛽', 2000, v_transport, 'Ganne ka Juice', 2),
    (p_user_id, 'Mobile Recharge', '📱', 500, v_bills, 'Data khatam, duniya khatam', 3),
    (p_user_id, 'Electricity & Water', '💡', 1500, v_bills, 'AC chala toh meter bhi daudega', 4),
    (p_user_id, 'Monthly Investment', '💰', 2500, v_savings, 'Monthly SIP investment', 5);

  insert into public.debt_items
    (user_id, name, emoji, amount, interest_rate, tenure_months, monthly_emi, details, sort_order)
  values (p_user_id, 'iPhone', '📱', 134900, null, null, null, null, 0);

  insert into public.wishlist_items (user_id, name, emoji, amount, details, is_active, sort_order)
  values
    (p_user_id, 'Emergency Fund', '🛟', 75000, 'Target of three months’ salary', true, 0),
    (p_user_id, 'Vacation Fund', '🏖️', 30000, 'Future travel goal', true, 1),
    (p_user_id, 'New Laptop', '💻', 80000, 'Personal or work upgrade', true, 2);

  return true;
end;
$$;

revoke all on function public.initialize_user_finances_for(uuid) from public, anon, authenticated;

notify pgrst, 'reload schema';
