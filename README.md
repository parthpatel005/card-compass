# Card Compass

> AI-powered credit card rewards dashboard — maximize every swipe across your travel cards.

Card Compass is a personal finance tool built for travel card enthusiasts who want to **stop leaving rewards on the table**. It tracks benefits, recommends the right card for every purchase, analyzes spending patterns, and lets you chat with an AI assistant that knows your cards inside and out.

---

## What It Does

### Smart Card Optimizer
Type any merchant or spending category and instantly see which of your cards earns the most rewards — with earn rates, points value estimates, and runner-up options shown side by side.

### Benefit Tracker
Every annual and monthly credit across all 4 cards in one place. Slide to log what you've used, see what's remaining, and get alerts before credits expire unused.

| Card | Key Credits |
|------|-------------|
| Chase Sapphire Preferred | $50 hotel credit |
| Amex Gold | $120 Uber Cash, $120 Dining |
| Amex Platinum | $200 airline, $200 hotel, $200 Uber, $240 entertainment, and more |
| Capital One Venture X | $300 travel credit, 10k anniversary miles |

### AI Chat Assistant (Powered by Claude)
A built-in Claude AI assistant that has live access to your cards, transactions, and benefits data. Ask it anything:

- *"Which card should I use for my flight to Tokyo?"*
- *"How much Uber Cash do I have left this month?"*
- *"Where am I overspending compared to last month?"*
- *"What's my total dining spend this year?"*
- *"Which benefits am I not using that I'm paying for?"*
- *"Show me all transactions over $100 this month"*
- *"How much in rewards did I earn last quarter?"*

The assistant streams responses token-by-token and can call tools to look up live data from your database — not just static advice.

### PDF Statement Upload
Upload your monthly credit card PDF statements. The app extracts transactions using `pdfjs-dist`, sends them through Claude to parse and categorize merchants, and presents a review step before saving. No manual entry.

### Spending Analytics
- Spend by category (pie + bar charts)
- Monthly spend trends across all cards
- Points earned per card per month
- Benefit utilization: how much value you captured vs. annual fees paid

### Transaction Log
Full history across all 4 cards with category tagging, earn rate display, and points earned per transaction. Filter by card, category, or date range.

---

## Cards Supported

- **Chase Sapphire Preferred** — 3x dining, streaming, online groceries; 5x Chase Travel; 2x all travel
- **Amex Gold** — 4x restaurants + US supermarkets; 3x flights
- **Amex Platinum** — 5x flights + Amex Travel hotels; best for premium travel
- **Capital One Venture X** — 10x hotels/cars via C1 Travel; 2x everything else

---

## GenAI Capabilities

Card Compass uses **Claude (claude-sonnet-4-6)** from Anthropic in two ways:

### 1. Conversational Agent
The chat panel gives Claude access to a set of tools backed by live database queries:

| Tool | What It Does |
|------|-------------|
| `get_cards` | Fetches all 4 cards with balances, limits, due dates |
| `get_transactions` | Queries transactions with filters (card, category, date range) |
| `get_benefits` | Returns benefit credits with used/remaining amounts |
| `get_optimizer` | Returns best card for a given category or merchant |
| `get_summary` | Spend totals, points earned, benefit value captured |
| `get_points_value` | Estimated dollar value of current points balances |

Claude decides which tools to call, chains them as needed, and synthesizes the results into a natural language response — streamed live to the chat panel.

### 2. PDF Transaction Parsing
When you upload a statement PDF, the raw extracted text is sent to Claude with a structured prompt to parse it into clean JSON (date, merchant, amount, category). Claude handles the messy, inconsistent formatting of real bank statements so you don't have to.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Turso (libSQL) + Drizzle ORM |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| PDF Parsing | `pdfjs-dist` + Claude |
| Charts | Recharts |
| Animations | Framer Motion |
| Hosting | Vercel |

---

## Getting Started

See [QUICKSTART.md](QUICKSTART.md) for full setup instructions including Node.js, environment variables, and database setup.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=file:local.db
```

Never commit `.env.local` — it's in `.gitignore`.

---
