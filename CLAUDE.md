# Credit Card Management — Project Context

## Core Purpose

A personal tool to **maximize credit card rewards** across 4 travel cards. The primary value is:
1. **Knowing which card to use for each spending category** (real-time recommendation)
2. **Tracking benefits/credits used vs. remaining** per card per year
3. **Logging transactions from PDF bill uploads** automatically
4. **Claude agent chat** for natural language queries about cards, rewards, and spending

This is NOT a general finance tracker — it is laser-focused on travel card optimization.

---

## The Cards

### Chase Sapphire Preferred (CSP)
**Annual Fee:** $95

**Earning Rates:**
| Category | Rate |
|----------|------|
| Dining (worldwide) | 3x |
| Online Groceries (excl. Target/Walmart/wholesale) | 3x |
| Streaming services | 3x |
| Travel (via Chase Travel portal) | 5x |
| All other travel | 2x |
| Everything else | 1x |

**Key Benefits to Track:**
- $50 annual hotel credit (via Chase Travel) — resets each cardmember year
- 10% anniversary point bonus (on prior year spend)
- Primary rental car insurance
- Trip cancellation/interruption insurance
- No foreign transaction fees

**Points:** Chase Ultimate Rewards (transfer to United, Hyatt, Southwest, BA, etc.)

---

### Amex Gold Card
**Annual Fee:** $250

**Earning Rates:**
| Category | Rate |
|----------|------|
| Restaurants (worldwide) | 4x |
| US Supermarkets (up to $25,000/yr, then 1x) | 4x |
| Flights (booked directly with airline or amextravel.com) | 3x |
| Everything else | 1x |

**Key Benefits to Track (Annual Credits):**
- $120 Uber Cash ($10/month, Uber Eats or Rides, US only) — track monthly
- $120 Dining Credit ($10/month at Grubhub, The Cheesecake Factory, Goldbelly, Wine.com, Five Guys, Milk Bar) — track monthly
- $100 hotel credit (on eligible bookings via Amex Travel, 2-night min)
- No foreign transaction fees

**Points:** Amex Membership Rewards (transfer to Delta, Air France, BA, Hilton, Marriott, etc.)
**Cap to Watch:** US Supermarkets 4x capped at $25k/year spend

---

### Amex Platinum Card
**Annual Fee:** $695

**Earning Rates:**
| Category | Rate |
|----------|------|
| Flights (booked directly with airline or amextravel.com, up to $500k/yr) | 5x |
| Prepaid hotels (via amextravel.com) | 5x |
| Everything else | 1x |

**Key Benefits to Track (Annual/Monthly Credits):**
| Benefit | Amount | Cadence |
|---------|--------|---------|
| Airline Fee Credit | $200 | Annual (1 airline) |
| Hotel Credit (Fine Hotels + Resorts / Hotel Collection) | $200 | Annual |
| Uber Cash (US Uber/Uber Eats) | $200 | $15/mo + $35 Dec |
| Digital Entertainment (Disney+, Hulu, ESPN+, Peacock, NYT, WSJ, etc.) | $240 | $20/month |
| Walmart+ Credit | $155 | Annual |
| CLEAR Plus Credit | $189 | Annual |
| Equinox Credit | $300 | Annual |
| TSA PreCheck / Global Entry | $100/$120 | Every 4.5 years |
| Saks Fifth Avenue | $100 | $50 Jan–Jun, $50 Jul–Dec |

**Lounge Access:** Centurion Lounges, Priority Pass (limited), Delta SkyClubs (when flying Delta)
**Points:** Amex Membership Rewards (same pool as Gold)
**Note:** Platinum is best for flights and hotel bookings through Amex Travel; Gold is better for day-to-day dining/groceries.

---

### Capital One Venture X
**Annual Fee:** $395

**Earning Rates:**
| Category | Rate |
|----------|------|
| Hotels (via Capital One Travel) | 10x |
| Rental Cars (via Capital One Travel) | 10x |
| Flights (via Capital One Travel) | 5x |
| Everything else | 2x |

**Key Benefits to Track:**
- $300 annual travel credit (Capital One Travel bookings) — resets each cardmember year
- 10,000 anniversary bonus miles (worth ~$100 in travel)
- Up to 4 authorized users free (each gets Priority Pass)
- Priority Pass lounge access (unlimited visits)
- Capital One Lounges access
- Primary rental car insurance
- No foreign transaction fees

**Points:** Capital One Miles (transfer to Air Canada, Turkish Airlines, Virgin Atlantic, Avianca, etc.)
**Note:** The 2x on everything makes this a strong catch-all card for non-bonus spend.

---

## Category Optimization Guide (Claude should use this for recommendations)

| Spending Category | Best Card | Rate | Runner-up |
|-------------------|-----------|------|-----------|
| Flights (direct/airline site) | Amex Platinum | 5x MR | Amex Gold (3x) |
| Flights (via portal) | Chase (5x UR) or C1 Venture X (5x miles) | 5x | — |
| Hotels (via Amex Travel) | Amex Platinum | 5x MR | — |
| Hotels (via C1 Travel) | Venture X | 10x miles | — |
| Dining / Restaurants | Amex Gold | 4x MR | CSP (3x UR) |
| US Supermarkets | Amex Gold | 4x MR (up to $25k) | CSP (3x online only) |
| Online Groceries | CSP | 3x UR | — |
| Streaming | CSP | 3x UR | — |
| Uber / Lyft | Amex Gold (Uber Cash credit) | — | Amex Platinum |
| Rental Cars (via C1) | Venture X | 10x miles | — |
| Everything else | Venture X | 2x miles | — |
| Foreign spend | Any (all no FTF) | varies | — |

---

## PDF Bill Upload Feature

Users upload their monthly PDF statements for each card. The system:
1. Parses the PDF to extract transactions (date, merchant, amount, category)
2. Maps transactions to the correct card
3. Deduplicates against existing logged transactions
4. Auto-categorizes merchants (using known merchant → category mappings + Claude)
5. Updates analytics and benefit usage tracking in real time

**Implementation approach:**
- Frontend: drag-and-drop upload UI per card
- Next.js API route (`/api/upload`) handles file, uses `pdfjs-dist` to extract text
- Claude API call to parse unstructured transaction text into structured JSON
- Store parsed transactions in Turso via Drizzle ORM
- Show a review/confirm step before committing (user can correct any misclassifications)

**PDF parsing prompt (Claude):** Extract all transactions from this credit card statement as JSON with fields: `date`, `merchant`, `amount`, `category`. Statement text: `{text}`

---

## Tech Stack

| Layer | Tool | Cost |
|-------|------|------|
| **Framework** | Next.js 14 (App Router) | Free / open source |
| **Styling** | Tailwind CSS + shadcn/ui | Free / open source |
| **State** | Zustand | Free / open source |
| **Charts** | Recharts | Free / open source |
| **Animations** | Framer Motion | Free / open source |
| **Database** | Turso (libSQL) + Drizzle ORM | Free tier (9GB, 1B reads/mo) |
| **PDF Parsing** | `pdfjs-dist` + Claude API | Free lib + ~pennies/mo API |
| **AI Chat** | `@anthropic-ai/sdk` claude-sonnet-4-6 | Pay-per-use (~$1-2/mo personal use) |
| **Hosting** | Vercel Hobby | Free |
| **Repo** | GitHub | Free |

**Local dev DB:** `DATABASE_URL=file:local.db` (SQLite file, no network)
**Production DB:** `DATABASE_URL=libsql://...` + `TURSO_AUTH_TOKEN` (Turso free tier)
Same Drizzle schema works for both — just swap the env var.

### Environment Variables
```bash
# .env.local (never committed)
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=file:local.db          # local dev
# DATABASE_URL=libsql://...         # production (set in Vercel dashboard)
# TURSO_AUTH_TOKEN=...              # production (set in Vercel dashboard)
```

### Deployment Flow
```
Local dev  →  git push GitHub  →  Vercel auto-deploys  →  live URL
```
Vercel picks up `main` branch automatically. Set env vars in Vercel dashboard (not in code).

---

## Front-End Design Philosophy

> Claude should apply these design principles by default when building any UI for this project.

### Visual Language
- **Dark-first** — `#0f1117` background, `#1e2235` surfaces, `#252a3d` elevated
- **Accent colors:** Blue `#4f8ef7` (actions), Green `#10b981` (rewards/positive), Amber `#f59e0b` (warnings/partial), Rose `#f43f5e` (alerts/high utilization)
- **Typography:** Inter or Geist — clean, modern, `tabular-nums` on all financial figures
- **Glassmorphism:** `backdrop-blur-md bg-white/5 border border-white/[0.08] shadow-xl`
- **Micro-animations:** framer-motion throughout — page transitions, hover lifts, number count-ups

### Spacing System (8px grid)
- Page padding: `px-8 py-6` | Card padding: `p-6` | Section gaps: `gap-6`
- Sidebar: 240px expanded / 64px collapsed
- Chat panel: 420px wide, full-height, fixed right
- Credit card widget: `w-72 h-44` (standard 1.586 aspect ratio)

### Color Tokens (tailwind.config.ts)
```ts
colors: {
  bg:           '#0f1117',
  surface:      '#1e2235',
  'surface-hi': '#252a3d',
  blue:         '#4f8ef7',
  green:        '#10b981',
  amber:        '#f59e0b',
  rose:         '#f43f5e',
  'text-base':  '#f1f5f9',
  'text-muted': '#94a3b8',
}
```

### Typography Scale
| Role | Classes |
|------|---------|
| Page title | `text-2xl font-semibold` |
| Section heading | `text-xs font-medium text-muted uppercase tracking-wider` |
| Stat value | `text-3xl font-bold tabular-nums` |
| Body | `text-sm` |
| Caption | `text-xs text-muted` |
| Badge | `text-xs font-medium px-2 py-0.5 rounded-full` |

### Key Component Patterns

**Credit Card Widget** — realistic card with gradient unique to each card:
- CSP: blue-indigo gradient
- Amex Gold: gold-amber gradient
- Amex Platinum: platinum/silver gradient
- Venture X: dark navy-teal gradient
- Shows: card name, last 4, network logo, current balance, utilization bar

**Benefit Tracker Tile** — per benefit per card:
```
[Icon]  Uber Cash (Amex Platinum)
        $85 used  /  $200 annual
        ████████░░░░░  43%       ← color-coded progress bar
        $115 remaining           ← resets Dec 31
```

**Category Optimizer Widget** — "What am I buying?" → instant card recommendation:
- Input: spending category or merchant name
- Output: ranked card list with earn rate and estimated points value

**Utilization Bar:** 0–29% green, 30–49% amber, 50–74% orange, 75%+ rose + pulse

**Transaction Row:**
```
[Avatar]  Whole Foods Market     [Groceries]   -$67.20
          Mar 19 · Amex Gold                   4x → 268 MR
```
Always show the earn rate and points earned per transaction.

**Due Date Badge:** >14d green, 7–14d amber, <7d rose + animated pulse dot

### Animation Conventions (Framer Motion)
```ts
// Page enter
{ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } }

// Card hover lift
{ whileHover: { y: -4, scale: 1.01 }, transition: { type: 'spring', stiffness: 400, damping: 25 } }

// Chat panel slide-in
{ initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' },
  transition: { type: 'spring', stiffness: 300, damping: 30 } }
```

### Layout Architecture
```
┌──────────┬──────────────────────────────────────┬───────────┐
│ Sidebar  │  Page Header + Actions                │  Claude   │
│ Nav      │  ────────────────────────────────────  │  Chat     │
│ 240px    │  Content (scrollable)                 │  420px    │
│          │                                       │ (toggle)  │
└──────────┴──────────────────────────────────────┴───────────┘
```

### Sidebar Nav (Lucide React icons)
- Dashboard → `LayoutDashboard`
- My Cards → `CreditCard`
- Transactions → `ArrowLeftRight`
- Benefits → `Gift`
- Optimizer → `Zap`
- Upload Statement → `Upload`
- Analytics → `BarChart3`

Active: `bg-blue/10 text-blue border-l-2 border-blue`
Inactive: `text-muted hover:text-base hover:bg-surface-hi`

### Chat Interface (Claude Agent)
- Slide-in panel from right, 420px, `bg-surface border-l border-white/[0.08]`
- User bubbles: right, `bg-blue text-white rounded-2xl rounded-br-sm`
- Assistant bubbles: left, `bg-surface-hi rounded-2xl rounded-bl-sm`
- Streaming token-by-token with blinking cursor
- Tool call blocks: collapsible `🔧 Looking up your cards...`
- Markdown: `react-markdown` + `remark-gfm`
- Suggested prompts (empty state):
  - "Which card should I use for groceries?"
  - "How much Uber Cash do I have left on Platinum?"
  - "What's my best card for my next flight?"
  - "Show me my dining spend this month"

---

## Key Pages / Features

### Dashboard
- Total points balance per rewards currency (UR, MR, C1 Miles)
- Upcoming payment due dates
- Monthly spend summary
- Benefits expiring soon (end of month / year)
- Quick card optimizer: type a merchant → get best card recommendation

### My Cards
- Card widget grid (all 4 cards)
- Per-card: balance, limit, utilization, next due date, points balance
- Expandable: full benefit list with used/remaining trackers

### Benefits Tracker
- Full benefit list per card
- Annual vs. monthly credits clearly labeled
- Progress bar for each (amount used / total)
- Expiry dates and reset dates
- Alert when a monthly benefit hasn't been used yet

### Transactions
- Full transaction log across all cards
- Columns: date, merchant, card, category, amount, points earned
- Filter by card, category, date range
- Category auto-assigned with ability to edit
- PDF upload button per card

### Upload Statement (PDF)
- Drag-and-drop or file picker per card
- Progress indicator during parse
- Preview table of extracted transactions
- User confirms / edits before saving
- Duplicate detection

### Optimizer
- Input: merchant name or spending category
- Output: ranked card recommendations with earn rates
- Side-by-side comparison of earn rates across all 4 cards

### Analytics
- Spend by category (pie/bar — Recharts)
- Monthly spend trend (line chart)
- Points earned per month per card (stacked bar)
- Benefit utilization summary (how much value captured vs. annual fee)

---

## Claude Agent Tools

The agent has read access to live data to answer questions:

| Tool | Description |
|------|-------------|
| `get_cards` | All 4 cards with balances, limits, due dates |
| `get_transactions` | Transactions with filters (card, category, date range) |
| `get_benefits` | Benefit credits with used/remaining amounts |
| `get_optimizer` | Best card for a given category or merchant |
| `get_summary` | Spend totals, points earned, benefit value captured |
| `get_points_value` | Estimated dollar value of points balances |

---

## File Structure (Target)

```
card-compass/
├── CLAUDE.md
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── store/
│   │   ├── cards.ts
│   │   ├── transactions.ts
│   │   └── benefits.ts
│   ├── data/
│   │   └── cardDefinitions.ts   # Static rewards rates + benefits for all 4 cards
│   ├── components/
│   │   ├── ui/                  # shadcn primitives
│   │   ├── cards/               # CreditCardWidget, CardGrid
│   │   ├── benefits/            # BenefitTile, BenefitTracker
│   │   ├── transactions/        # TransactionRow, TransactionTable
│   │   ├── optimizer/           # CategoryOptimizer
│   │   ├── upload/              # PDFUpload, TransactionPreview
│   │   ├── charts/              # SpendChart, PointsChart
│   │   └── chat/                # ChatPanel, Message, ToolCallBlock
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Cards.tsx
│   │   ├── Benefits.tsx
│   │   ├── Transactions.tsx
│   │   ├── Upload.tsx
│   │   ├── Optimizer.tsx
│   │   └── Analytics.tsx
│   ├── lib/
│   │   ├── claude.ts            # Anthropic SDK + agent tools
│   │   ├── pdfParser.ts         # PDF extraction client
│   │   └── optimizer.ts         # Category → best card logic
│   └── hooks/
├── server/
│   ├── index.ts
│   ├── routes/
│   │   ├── cards.ts
│   │   ├── transactions.ts
│   │   ├── benefits.ts
│   │   ├── chat.ts              # SSE streaming endpoint
│   │   └── upload.ts            # PDF upload + parse endpoint
│   └── db/
│       ├── schema.ts
│       └── migrations/
└── .env                         # ANTHROPIC_API_KEY
```

## Development Notes

- `ANTHROPIC_API_KEY` in `.env` — never committed
- SQLite at `server/db/local.db` — gitignored
- Frontend: `localhost:5173` | API: `localhost:3001`
- Card definitions (rewards rates, benefits) are static data in `src/data/cardDefinitions.ts` — source of truth for the optimizer and agent
- PDF upload flow: file → server → pdfjs extract text → Claude parse → return JSON → frontend review → save
