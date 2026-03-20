# Quickstart Guide

Get the credit card management app running locally in a few steps.

---

## 1. Install Node.js

You need **Node.js 20 or later**.

### macOS
```bash
# Option A — Homebrew (recommended)
brew install node

# Option B — nvm (version manager, useful if you switch projects)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Restart terminal, then:
nvm install 20
nvm use 20
```

### Linux (Debian/Ubuntu)
```bash
# Option A — NodeSource official repo
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Option B — nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Restart terminal, then:
nvm install 20
nvm use 20
```

### Windows
Download the **LTS installer** from [nodejs.org](https://nodejs.org) and run it.

Or use **nvm-windows**:
1. Download the installer from [github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)
2. Run `nvm-setup.exe`
3. In a new terminal (as Administrator):
```powershell
nvm install 20
nvm use 20
```

Verify the install:
```bash
node -v   # should print v20.x.x or higher
npm -v    # should print 10.x.x or higher
```

---

## 2. Clone and install dependencies

```bash
git clone <your-repo-url>
cd credit-card-management
npm install
```

---

## 3. Set up environment variables

Create a `.env.local` file in the project root:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...      # Required — get from console.anthropic.com
DATABASE_URL=file:local.db        # Local SQLite file (auto-created on first run)
```

> `.env.local` is gitignored — never commit API keys.

Get your Anthropic API key at **[console.anthropic.com](https://console.anthropic.com)** → API Keys.

---

## 4. Set up the database

Run migrations to create the tables (`transactions` and `benefits`):

```bash
npm run db:migrate
```

This creates `local.db` in the project root. The app will auto-seed benefit records on first load.

---

## 5. Run the app

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 6. View the database — Drizzle Studio

Drizzle Studio is a visual database browser. It runs locally and lets you inspect and edit `transactions` and `benefits` tables directly.

```bash
npm run db:studio
```

Then open **[https://local.drizzle.studio](https://local.drizzle.studio)** in your browser.

> Drizzle Studio uses HTTPS on `local.drizzle.studio` — it requires a trusted local certificate to load. This is where **mkcert** comes in.

---

## 7. Install mkcert (required for Drizzle Studio)

`mkcert` creates locally-trusted TLS certificates so your browser trusts `https://local.drizzle.studio`.

### macOS
```bash
# Install mkcert via Homebrew
brew install mkcert

# Install the local CA into your system trust store
mkcert -install
```

### Linux (Debian/Ubuntu)
```bash
# Install dependencies
sudo apt install libnss3-tools

# Download the mkcert binary
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert

# Install the local CA
mkcert -install
```

### Windows
```powershell
# Option A — Chocolatey
choco install mkcert

# Option B — Scoop
scoop bucket add extras
scoop install mkcert

# Then in an Administrator terminal:
mkcert -install
```

After installing mkcert, **restart your browser** so it picks up the new trusted CA.

Then run Drizzle Studio again:

```bash
npm run db:studio
```

Open **[https://local.drizzle.studio](https://local.drizzle.studio)** — you should see your tables with no certificate warning.

---

## All commands at a glance

| Command | What it does |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start the dev server at localhost:3000 |
| `npm run build` | Build for production |
| `npm run db:generate` | Generate new migration files after schema changes |
| `npm run db:migrate` | Apply pending migrations to the local database |
| `npm run db:studio` | Open Drizzle Studio at local.drizzle.studio |

---

## Database schema overview

Two tables are created by `db:migrate`:

**`transactions`** — every credit card transaction
| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | UUID |
| `card` | text | `csp`, `amex_gold`, `amex_platinum`, `venture_x` |
| `date` | text | YYYY-MM-DD |
| `merchant` | text | |
| `amount` | real | USD |
| `category` | text | e.g. Dining, Groceries, Travel |
| `points_earned` | real | Calculated at insert time |
| `multiplier` | real | e.g. 3.0 for 3x |
| `notes` | text | Optional |

**`benefits`** — credit card benefit credits (auto-seeded per period)
| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | e.g. `amex_plat_uber_cash_2026-03` |
| `card` | text | Card ID |
| `name` | text | e.g. "Uber Cash" |
| `total_amount` | real | Max credit value |
| `used_amount` | real | How much has been used |
| `cadence` | text | `annual`, `monthly`, `semi_annual` |
| `period_key` | text | `2026`, `2026-03`, or `2026-H1` |

---

## Production deployment (Vercel + Turso)

For production, swap the local SQLite file for a free [Turso](https://turso.tech) database:

1. Create a free Turso database at **turso.tech**
2. In your Vercel project dashboard, add these environment variables:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   DATABASE_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   ```
3. Push to `main` — Vercel auto-deploys.

No code changes needed. The same Drizzle schema works for both SQLite (local) and Turso (production).
