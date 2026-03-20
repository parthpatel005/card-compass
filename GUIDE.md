# CardMaxx — Developer Guide

A reference for making common changes to this project. No prior Next.js experience needed.

---

## Running the project locally

```bash
npm run dev
# Open http://localhost:3000
```

Before starting, make sure `.env.local` has your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
DATABASE_URL=file:local.db
```

---

## Project structure at a glance

```
src/
├── app/                    ← Pages + API routes (Next.js App Router)
│   ├── page.tsx            ← Dashboard (home)
│   ├── cards/page.tsx      ← My Cards
│   ├── benefits/page.tsx   ← Benefits tracker
│   ├── transactions/page.tsx
│   ├── optimizer/page.tsx
│   ├── upload/page.tsx
│   ├── analytics/page.tsx
│   └── api/
│       ├── chat/route.ts   ← Claude streaming chat
│       ├── transactions/   ← GET / POST transactions
│       ├── benefits/       ← GET / PATCH benefits
│       └── upload/         ← PDF parse endpoint
├── components/
│   ├── layout/             ← Sidebar, Header, AppShell (main layout)
│   ├── cards/              ← CreditCardWidget (the visual card)
│   ├── benefits/           ← BenefitTile (progress bar tile)
│   ├── optimizer/          ← CategoryOptimizer (search widget)
│   └── chat/               ← ChatPanel (Claude slide-in)
├── data/
│   └── cardDefinitions.ts  ← ALL card data lives here (rewards, benefits, optimizer)
└── db/
    ├── schema.ts           ← Database table definitions
    └── index.ts            ← DB connection
```

---

## Common changes

### Change a card's rewards rate

Open **[src/data/cardDefinitions.ts](src/data/cardDefinitions.ts)**.

Find the card in the `CARDS` array and edit the `earningRates`:

```ts
earningRates: [
  { category: 'Dining', multiplier: 4 },       // ← change the number here
  { category: 'US Supermarkets', multiplier: 4, note: 'Up to $25k/year' },
]
```

No restart needed — changes reflect on next page load.

---

### Add or edit a benefit

Same file: **[src/data/cardDefinitions.ts](src/data/cardDefinitions.ts)**.

Find the card and edit its `benefits` array:

```ts
benefits: [
  {
    id: 'amex_gold_uber_cash',   // must be unique across all cards
    name: 'Uber Cash',
    amount: 10,                  // dollar amount
    cadence: 'monthly',          // 'monthly' | 'annual' | 'semi_annual'
    description: 'Human-readable description shown in the UI',
  },
]
```

After adding a new benefit, it will automatically appear in the Benefits page on next load (the API seeds missing benefits into the DB).

---

### Change colors

Open **[src/app/globals.css](src/app/globals.css)**.

All color tokens are in the `:root {}` block:

```css
:root {
  --color-blue:      #4f8ef7;   /* buttons, active nav, accents */
  --color-green:     #10b981;   /* points, positive values */
  --color-amber:     #f59e0b;   /* warnings, unclaimed benefits */
  --color-rose:      #f43f5e;   /* alerts, high utilization */
  --color-bg:        #0f1117;   /* page background */
  --color-surface:   #1e2235;   /* cards / panels */
  --color-surface-hi:#252a3d;   /* elevated surfaces, hover states */
}
```

Change any hex value and the whole app updates.

---

### Change the page layout or content

Each page is a single file in `src/app/*/page.tsx`. They all follow the same pattern:

```tsx
export default function MyPage() {
  return (
    <AppShell title="Page Title" subtitle="Optional subtitle">
      {/* Your content goes here */}
    </AppShell>
  )
}
```

`AppShell` provides the sidebar, header, and Claude chat panel automatically.

---

### Change what Claude knows / how it responds

Open **[src/app/api/chat/route.ts](src/app/api/chat/route.ts)**.

Edit the `SYSTEM_PROMPT` string near the top — this is the instruction set Claude follows for every conversation:

```ts
const SYSTEM_PROMPT = `You are a personal credit card rewards assistant...`
```

Add facts, change the tone, restrict topics — all by editing this string.

---

### Change the sidebar navigation

Open **[src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx)**.

Edit the `NAV` array at the top:

```ts
const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cards', label: 'My Cards', icon: CreditCard },
  // add a new entry here
]
```

Icons come from [lucide-react](https://lucide.dev/icons/) — browse the site, copy the name, import it.

---

### Add a new transaction manually (via API)

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "card": "amex_gold",
    "date": "2026-03-19",
    "merchant": "Whole Foods",
    "amount": 84.50,
    "category": "Groceries"
  }'
```

Card IDs: `csp`, `amex_gold`, `amex_platinum`, `venture_x`

---

### Update benefit usage (mark as used)

```bash
curl -X PATCH http://localhost:3000/api/benefits \
  -H "Content-Type: application/json" \
  -d '{ "id": "amex_gold_uber_cash_2026-03", "usedAmount": 10 }'
```

Benefit IDs follow the pattern: `{benefit_id}_{period}` where period is `2026` (annual), `2026-03` (monthly), or `2026-H1` (semi-annual).

---

### Change the database schema

1. Edit **[src/db/schema.ts](src/db/schema.ts)** — add/change columns
2. Run:
```bash
npm run db:generate   # creates a migration file
npm run db:migrate    # applies it to local.db
```

---

## Deploying to Vercel

1. Push to GitHub:
```bash
git add .
git commit -m "your message"
git push
```

2. Connect the repo to [vercel.com](https://vercel.com) (import project).

3. Set these environment variables in the Vercel dashboard:
```
ANTHROPIC_API_KEY    = sk-ant-...
DATABASE_URL         = libsql://your-db.turso.io
TURSO_AUTH_TOKEN     = your-turso-token
```

4. Vercel auto-deploys on every `git push` after that.

**For Turso (production DB):** Sign up at [turso.tech](https://turso.tech), create a database, copy the URL and auth token into Vercel.

---

## Tech stack summary

| Layer | Tool | What it does |
|-------|------|-------------|
| Framework | Next.js 14 | Pages + API routes in one project |
| Styling | Tailwind CSS v4 | Utility classes for all styling |
| UI components | shadcn/ui | Pre-built accessible components (Button, Input, etc.) |
| Animations | Framer Motion | Page transitions, hover effects |
| Charts | Recharts | Spend and points charts |
| Database | SQLite (local) / Turso (prod) | Stores transactions and benefit usage |
| ORM | Drizzle | Type-safe DB queries |
| AI | Anthropic SDK | Claude chat + PDF parsing |

---

## Useful commands

```bash
npm run dev          # start local dev server (localhost:3000)
npm run build        # check for errors before deploying
npm run db:generate  # generate DB migration after schema change
npm run db:migrate   # apply migration to local DB
npm run db:studio    # open visual DB browser (Drizzle Studio)
```
