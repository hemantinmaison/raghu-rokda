# Finance Planner

A Next.js + Supabase personal finance planner for monthly budget, debt payoff, and wishlist forecasting.

## Features

- Email/password and Google authentication through Supabase.
- Private per-user data with Supabase row-level security.
- Monthly salary and INR cashflow summary.
- Budget, debt, and wishlist CRUD forms.
- Drag-and-drop priority ordering plus sort-by-amount controls.
- Simple payoff forecast: monthly savings pays debts first, then wishlist items.
- Optional debt interest and tenure fields are stored for future richer calculations.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create the Supabase tables:

- Open your Supabase project dashboard.
- Go to SQL Editor -> New query.
- Paste the full contents of `supabase/schema.sql`.
- Click Run.
- Confirm Table Editor shows `profiles`, `budget_items`, `debt_items`, and `wishlist_items` under the `public` schema.

If the app says a table is missing from the schema cache, make sure your `.env.local` points to the same Supabase project where you ran the SQL, then rerun the final line from `supabase/schema.sql`:

```sql
notify pgrst, 'reload schema';
```

3. Add demo data, optional but useful while developing:

- Sign up once in the app so the user exists in Supabase Auth.
- Open `supabase/seed-demo-data.sql`.
- Replace `you@example.com` with that signed-up user's email.
- Run the full seed file in the Supabase SQL Editor.

This fills salary, budget items, debts, and wishlist items for that user.

4. Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

5. Enable Supabase Auth providers:

- Email/password
- Google OAuth, with the callback URL set to `http://localhost:3000/auth/callback`

6. Start the app:

```bash
npm run dev
```

## Checks

```bash
npm run typecheck
npm run test
npm run lint
```
