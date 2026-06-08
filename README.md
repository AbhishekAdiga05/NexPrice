# NexPrice — Smart Product Price Tracker

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Status" />
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Firecrawl-000?logo=firecrawl&logoColor=white" alt="Firecrawl" />
</p>

**NexPrice** is an AI-powered e-commerce price intelligence platform. It automatically monitors product prices across any online retailer, analyzes historical trends, predicts future price movements, and sends instant alerts when your target price is hit.

---

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Automation & Cron Jobs](#automation--cron-jobs)
- [Deal Score Algorithm](#deal-score-algorithm)
- [Deployment](#deployment)
- [Development Notes](#development-notes)

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Browser   │────▶│  Next.js 16  │────▶│  Supabase  │
│  (React 19) │◀────│  App Router  │◀────│ (Postgres) │
└─────────────┘     │  Server Acts │     └────────────┘
                    │  API Routes  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐     ┌────────────┐
                    │  Firecrawl   │     │   Resend   │
                    │ (Scraping)   │     │  (Email)   │
                    └──────────────┘     └────────────┘
```

- **Frontend**: React 19 with Next.js 16 App Router, server components by default, client components for interactivity.
- **Data Layer**: Supabase (PostgreSQL) with Row Level Security — users only see their own data.
- **AI Layer**: Two API routes — Deal Analysis (Gemini-powered buy recommendations) and Price Prediction (future price forecasting).
- **Scraping**: Firecrawl SDK parses product metadata from e-commerce product URLs.
- **Email**: Resend sends transactional emails when price alerts trigger.

---

## Features

### Automated Price Tracking
Paste any product URL — Amazon, Walmart, Best Buy, or thousands of supported retailers. NexPrice immediately scrapes the product data and begins capturing daily price snapshots.

### Smart Price Alerts
Set a target price on any tracked product. When the current price drops to or below your target, you receive an instant email notification. Alerts are checked automatically every 24 hours.

### Deal Score™
A proprietary 0–100 algorithm that evaluates four weighted signals to tell you exactly when to buy:
1. **Price Position**: Where the current price sits relative to the historical range
2. **Drop Velocity**: How fast the price is dropping
3. **Historical Value**: Whether this price is historically low
4. **Recency**: How recently the price dropped

### AI Deal Analysis
Powered by Gemini, each product gets a contextual buy recommendation:
- *Great time to buy* — price trends and historical data align favorably
- *Wait for a lower price* — the price is expected to drop further
- *Price recently increased* — recent uptick detected
Each analysis includes confidence level, summary, and supporting reasoning.

### Price Prediction
Machine-learning-informed price forecasts that predict where prices are heading, with confidence levels and estimated timeframes.

### Insights Dashboard
A centralized view of total savings, top deals sorted by Deal Score, and a history of every triggered alert with savings amounts.

### Priority Watchlist
Flag products you're considering. Each item is ranked by a Buy Priority score that combines your manual priority (high/medium/low), Deal Score, and time on list.

### Savings Tracking
Every triggered alert automatically calculates savings as the difference between target price and current price at trigger time. Total savings accumulate across all products.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.0.7 |
| UI Library | React | 19.2.0 |
| Styling | Tailwind CSS | v4 |
| Animations | Framer Motion | 12.x |
| Charts | Recharts | 3.5.1 |
| Icons | Lucide React | 0.555.x |
| UI Primitives | Radix UI / shadcn/ui | New York style |
| Database | Supabase (PostgreSQL) | — |
| Auth | Supabase Auth (Google OAuth) | — |
| Scraping | Firecrawl JS SDK | 1.29.x |
| Email | Resend | 6.5.x |
| AI | Google Gemini (via API routes) | — |
| Package Manager | npm / bun | — |

---

## Project Structure

```
app/
├── page.js                    # Dashboard — landing + authenticated home
├── layout.js                  # Root layout (NavBar, fonts, Toaster)
├── globals.css                # Tailwind v4 theme, custom utilities
├── actions.js                 # Server actions (CRUD, alerts, settings)
├── alerts/
│   ├── page.js                # Alerts page (server)
│   └── AlertsDashboard.js     # Alert center (client)
├── insights/
│   ├── page.js                # Insights page (server)
│   └── InsightsDashboard.js   # Insights dashboard (client)
├── watchlist/
│   ├── page.js                # Watchlist page (server)
│   └── WatchlistDashboard.js  # Watchlist (client)
├── settings/
│   ├── page.js                # Settings page (server)
│   └── SettingsForm.js        # Settings form (client)
├── products/[id]/             # Product detail page
└── api/
    ├── cron/check-prices/     # Daily price checker cron route
    └── products/[productId]/
        ├── deal-analysis/     # AI deal analysis endpoint
        └── predict/           # Price prediction endpoint

components/
├── ui/                        # shadcn/ui primitives
├── ProductCard.js             # Dashboard product card
├── AddProductForm.js          # URL submission form
├── SetPriceAlert.js           # Inline price alert management
├── DealScoreBadge.js          # 0-100 score badge
├── PriceChart.js              # Recharts price history chart
├── DealAnalyzer.js            # AI deal analysis display
├── PricePrediction.js         # Price prediction display
├── NavBar.js                  # Top navigation
├── AuthModal.js               # Google OAuth modal
└── ...

lib/
├── deal-score.js              # Deal Score calculation algorithm
├── buy-priority.js            # Buy Priority ranking algorithm
├── firecrawl.js               # Firecrawl scraper wrapper
├── email.js                   # Resend email templates
└── utils.js                   # cn() helper

utils/supabase/
├── client.js                  # Browser Supabase client
├── server.js                  # Server Supabase client
└── middleware.js              # Session refresh middleware
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20 LTS)
- A Supabase project (free tier works)
- A Firecrawl API key
- A Resend API key (for email)
- A Google Cloud OAuth client (for authentication)

### 1. Clone & Install

```bash
git clone https://github.com/ABHISHEK-ADIGA/smart-product-price-tracker.git
cd smart-product-price-tracker
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) for all required values.

### 3. Run Database Migrations

Execute the SQL in [Database Schema](#database-schema) inside your Supabase SQL Editor, or run the migration files from `supabase/`:

```bash
supabase/ migration_phase_b.sql
supabase/ migration_price_alerts.sql
supabase/ migration_savings.sql
supabase/ migration_settings.sql
```

### 4. Start Dev Server

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Environment Variables

```env
# === Supabase ===
NEXT_PUBLIC_SUPABASE_URL=            # Project URL from Supabase dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # Anon/public key from Supabase

# === App URL (used for OAuth redirects) ===
NEXT_PUBLIC_APP_URL=http://localhost:3000

# === Scraping ===
FIRECRAWL_API_KEY=                   # Firecrawl API key

# === Email (Resend) ===
RESEND_API_KEY=                      # Resend API key
RESEND_FROM_EMAIL=alerts@yourdomain.com
```

---

## Database Schema

### `products`
Stores tracked product metadata and the latest known price.

```sql
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  currency TEXT DEFAULT '$',
  current_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, url)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

### `price_history`
Timestamped price snapshots, one row per check.

```sql
CREATE TABLE price_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT '$',
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
```

### `price_alerts`
Target price alerts with status tracking.

```sql
CREATE TABLE price_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  target_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'disabled')),
  price_at_creation NUMERIC,
  savings NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  triggered_at TIMESTAMPTZ
);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
```

### `watchlist`
User-curated shopping list with priority levels.

```sql
CREATE TABLE watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
```

### `user_settings`
Notification preferences per user.

```sql
CREATE TABLE user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  weekly_digest BOOLEAN DEFAULT true,
  digest_day TEXT DEFAULT 'sunday',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
```

---

## API Routes

### `POST /api/cron/check-prices`
Triggered by Supabase `pg_cron` daily at midnight. Iterates all active products, rescrapes current prices, records history, and triggers alerts if target prices are met.

### `GET /api/products/[productId]/deal-analysis`
Returns an AI-generated deal analysis using Gemini:
```json
{
  "analysis": {
    "label": "Great time to buy",
    "confidence": "high",
    "summary": "Price is at its 90-day low...",
    "reasons": ["Price dropped 15% in the last week", "..."]
  },
  "stats": {
    "averagePrice": "$24.99",
    "lowestPrice": "$19.99",
    "highestPrice": "$34.99",
    "historyCount": 45
  },
  "source": "ai"
}
```

### `GET /api/products/[productId]/predict`
Returns a price prediction with forecast timeline and confidence intervals.

---

## Automation & Cron Jobs

NexPrice uses Supabase `pg_cron` to schedule daily price checks, avoiding external cron services.

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'daily-price-scraper',
  '0 0 * * *',
  $$
    SELECT net.http_post(
        url:='https://YOUR_DOMAIN/api/cron/check-prices',
        headers:='{"Content-Type": "application/json"}'::jsonb
    )
  $$
);
```

Replace `YOUR_DOMAIN` with your production URL. For local testing, use a tool like `ngrok` to expose your local server.

---

## Deal Score Algorithm

The Deal Score (`lib/deal-score.js`) is a weighted composite of four signals:

| Signal | Weight | Description |
|---|---|---|
| Price Position | 35% | Where current price falls in the min-max range (lower = better) |
| Drop Velocity | 30% | Recent price change rate (dropping fast = higher score) |
| Historical Value | 25% | How the current price compares to the historical average |
| Recency | 10% | How recently the last price change occurred |

The final score is mapped to a tier:
- **Great** (80–100): Strong buy signal
- **Good** (60–79): Favorable conditions
- **Fair** (40–59): Neutral
- **Poor** (0–39): Wait for a better price

Buy Priority (`lib/buy-priority.js`) extends this by factoring in user-set priority level and time spent on the watchlist.

---

## Deployment

### Vercel (Recommended)

1. Push your repository to GitHub.
2. Create a new project on [Vercel](https://vercel.com) and import your repo.
3. Add all environment variables from `.env.local` to Vercel's Environment Variables section.
4. Deploy.

### Post-Deploy Steps

1. **Supabase Auth**: Go to Supabase → Authentication → URL Configuration. Update Site URL and Redirect URIs to your production domain.
2. **Google OAuth**: Update the Authorized Redirect URIs in Google Cloud Console to `https://your-domain.com/auth/callback`.
3. **Cron Job**: Update the `pg_cron` scheduled task URL to point to your production domain.
4. **Resend**: Verify your sending domain in Resend dashboard.

---

## Development Notes

### TODO / Planned Improvements

- [ ] Dark/light theme toggle
- [ ] Bulk product import (CSV/bookmarklet)
- [ ] Price drop email templates with inline charts
- [ ] Mobile app (React Native)
- [ ] Public deal score leaderboard
- [ ] Multi-currency wallet support

### Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

<p align="center">
  Built by <a href="https://github.com/ABHISHEK-ADIGA">Abhishek Adiga</a>
</p>
