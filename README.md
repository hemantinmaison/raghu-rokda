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

2. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.

3. Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. Enable Supabase Auth providers:

- Email/password
- Google OAuth, with the callback URL set to `http://localhost:3000/auth/callback`

5. Start the app:

```bash
npm run dev
```

## Checks

```bash
npm run typecheck
npm run test
npm run lint
```
