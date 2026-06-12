# NexPrice — Smart Product Price Tracker

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Status" />
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Firecrawl-000?logo=firecrawl&logoColor=white" alt="Firecrawl" />
</p>

**NexPrice** is an AI-powered e-commerce price intelligence platform. It automatically monitors product prices across any online retailer, analyzes historical trends, calculates deal scores, and sends instant alerts when your target price is hit.

---

## Table of Contents

- [How It Works — Step by Step](#how-it-works--step-by-step)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Algorithms](#key-algorithms)
- [Getting Started](#getting-started)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Automation & Cron Jobs](#automation--cron-jobs)
- [Deployment](#deployment)

---

## How It Works — Step by Step

### 1. Add a Product

Paste any product URL (Amazon, Walmart, Best Buy, etc.) into the dashboard form. The app uses **Firecrawl** to scrape the product name, image, and current price, then stores it in Supabase.

### 2. Price Tracking

Every 24 hours, a cron job rescrapes all tracked products and records a new row in `price_history`. Products are processed in parallel chunks of 5 using `Promise.allSettled`, so multiple scrapes run concurrently rather than one at a time. This keeps the job well under serverless timeout limits even with hundreds of products. Over time, this builds a historical record of price fluctuations.

### 3. Deal Score Calculation

Each product gets a **Deal Score** — a 0–100 value computed locally in `lib/deal-score.js` using four weighted factors:

| Factor | Weight | What it measures |
|---|---|---|
| Distance from all-time low | 40% | How close the current price is to the historical minimum |
| Discount from average | 30% | How far below the mean price the current price sits |
| Recent trend | 20% | Whether the price has been dropping recently |
| Volatility | 10% | How much the price swings (more volatility = more chances to catch a low) |

The score maps to a tier: **Great** (70+), **Good** (50–69), **Fair** (30–49), or **Poor** (< 30).

### 4. Trend Indicator

The prediction panel shows a **Trend Indicator** — a pure JavaScript calculation that answers "how far is the current price from the historical average?":

```
trend = ((avgPrice - currentPrice) / avgPrice) × 100
```

- **Positive %** = current price is below average (discount opportunity)
- **Negative %** = current price is above average (consider waiting)

This replaces the previous Gemini-powered prediction API, making the trend calculation instant, free, and explainable.

### 5. Smart Alerts

Set a target price on any product. The daily cron job checks if the current price is at or below your target. When it hits, the alert status changes to "triggered", savings are calculated, and you receive an email notification via **Resend**.

### 6. Priority Watchlist

Flag products you're considering. Each item is ranked by a **Buy Priority** score (`lib/buy-priority.js`) that combines:

- Your manual priority level (high / medium / low)
- Time spent on the watchlist (older items get a boost)
- Deal Score contribution (better deals rank higher)

### 7. Dashboard — Single Page App

All features are consolidated into a **single dashboard** at `/`. After login, you get a tabbed interface:

| Tab | Content |
|---|---|
| **Products** | Add new products, view your tracked list with Deal Scores |
| **Insights** | Total savings, active alerts, best deals grid, recent savings history |
| **Watchlist** | Flagged items sorted by Buy Priority, priority management |
| **Alerts** | Active, triggered, and disabled alerts with progress tracking |
| **Settings** | Account info, weekly digest toggle, digest day picker |

### 8. Product Detail Page

Click any product to see:
- **Price History Chart** — interactive Recharts visualization
- **Deal Analysis** — AI-powered buy/sell recommendation via Gemini (separate from predictions)
- **Trend Indicator** — current price vs historical average
- **Price Alerts** — set and manage target prices
- **Mini Stats** — low, high, average prices and tracking duration

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

### Key Design Decisions

- **Server Components by default** — data fetching happens server-side, reducing client bundle size
- **Conditional data fetching** — the dashboard only queries data for the active tab, avoiding unnecessary database load
- **URL-driven tabs** — uses `?tab=` search params instead of client state, enabling direct linking and browser navigation
- **Local calculations** — Deal Score, Buy Priority, and Trend Indicator are pure JS functions with no API calls
- **RLS policies** — all database queries are scoped to the authenticated user via Supabase Row Level Security

---

## Features

### Automated Price Tracking
Paste any product URL — NexPrice immediately scrapes the product data and begins capturing daily price snapshots.

### Smart Price Alerts
Set a target price on any tracked product. When the price drops to your target, you receive an instant email notification. Alerts are checked automatically every 24 hours.

### Deal Score™
A proprietary 0–100 algorithm that evaluates four weighted signals to tell you exactly when to buy. No external API calls — pure client-side math.

### Trend Indicator
A local calculation that shows how far the current price deviates from the historical average. Positive values signal a discount opportunity.

### AI Deal Analysis
Powered by Gemini, each product gets a contextual buy recommendation:
- *Great time to buy* — price trends and historical data align favorably
- *Wait for a lower price* — the price is expected to drop further
- *Price recently increased* — recent uptick detected

### Insights Dashboard
A centralized view of total savings, top deals sorted by Deal Score, and a history of every triggered alert with savings amounts.

### Priority Watchlist
Flag products you're considering. Each item is ranked by a Buy Priority score that combines your manual priority, Deal Score, and time on list.

### Savings Tracking
Every triggered alert automatically calculates savings. Total savings accumulate across all products.

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
| AI (Deal Analysis only) | Google Gemini | — |
| Package Manager | npm / bun | — |

---

## Project Structure

```
app/
├── page.js                    # SPA Dashboard — landing + tabs
├── layout.js                  # Root layout (NavBar, fonts, Toaster)
├── globals.css                # Tailwind v4 theme
├── actions.js                 # All server actions
├── products/[id]/             # Product detail page
│   ├── page.js                # Server component, fetches data
│   └── ProductDetail.js       # Client component, full layout
├── api/
│   ├── cron/check-prices/     # Daily price checker
│   └── products/[productId]/
│       └── deal-analysis/     # AI deal analysis (Gemini)
├── auth/callback/             # OAuth callback
└── error/                     # Auth error page

components/
├── NavBar.js                  # Top navigation (logo + auth only)
├── AddProductForm.js          # URL submission
├── ProductCard.js             # Dashboard product card
├── InsightsDashboard.js       # Insights tab panel
├── WatchlistDashboard.js      # Watchlist tab panel
├── AlertsDashboard.js         # Alerts tab panel
├── SettingsForm.js            # Settings tab panel
├── PriceChart.js              # Recharts chart component
├── PricePrediction.js         # Trend indicator display
├── DealAnalyzer.js            # AI deal analysis display
├── DealScoreBadge.js          # 0-100 score badge
├── SetPriceAlert.js           # Alert management
├── AuthModal.js               # Google OAuth modal
├── AuthButton.js              # Sign in/out button
├── LandingCTA.js              # Landing page CTA
├── Footer.js                  # Site footer
└── ui/                        # shadcn/ui primitives

lib/
├── deal-score.js              # Deal Score + Trend Indicator
├── buy-priority.js            # Buy Priority ranking
├── firecrawl.js               # Firecrawl scraper wrapper
├── email.js                   # Resend email templates
└── utils.js                   # cn() utility

utils/supabase/
├── client.js                  # Browser Supabase client
├── server.js                  # Server Supabase client
└── middleware.js              # Session refresh
```

---

## Key Algorithms

### Deal Score (`lib/deal-score.js`)

```js
calculateDealScore(currentPrice, priceHistory)
```

Returns `{ score, label, tier }` — a 0–100 score computed from:

1. **Proximity to all-time low (40%)**: `((max - current) / range) × 100` — 100 when at the lowest price ever
2. **Discount from average (30%)**: Scaled distance from the mean — 100 when far below average
3. **Recent trend (20%)**: Rate of change over the last 3 price points — positive trend (dropping) boosts score
4. **Volatility (10%)**: Coefficient of variation — more price swings mean more opportunities

### Trend Indicator (`lib/deal-score.js`)

```js
calculateTrendIndicator(currentPrice, priceHistory)
```

Returns `number | null` — the percentage difference between the current price and the historical average:

```
trend = ((avgPrice - currentPrice) / avgPrice) × 100
```

- **+15%** → current price is 15% below average (good deal)
- **−8%** → current price is 8% above average (wait for drop)
- **null** → fewer than 2 data points

### Buy Priority (`lib/buy-priority.js`)

```js
calculateBuyPriority({ priority, createdAt, dealScore })
```

Returns a 0–100 score combining:
- User priority weight (high=40, medium=25, low=10)
- Age bonus (up to 30 points for older items)
- Deal Score contribution (scaled by 0.3)

---

## Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20 LTS)
- A Supabase project (free tier works)
- A Firecrawl API key
- A Resend API key (for email alerts)
- A Google Cloud OAuth client (for authentication)

### 1. Clone & Install

```bash
git clone <repo-url>
cd smart-product-price-tracker
npm install
```

### 2. Configure Environment

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Firecrawl
FIRECRAWL_API_KEY=your_firecrawl_key

# Email (Resend)
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=onboarding@resend.dev

# Cron security
CRON_SECRET=your_random_secret

# OAuth
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional — Gemini (only needed for Deal Analyzer)
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Run Database Migrations

Execute the SQL from [Database Schema](#database-schema) in your Supabase SQL Editor.

### 4. Start Dev Server

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

---

## API Routes

### `POST /api/cron/check-prices`
Triggered by Supabase `pg_cron` daily at midnight. Iterates all active products, rescrapes current prices, records history, and triggers alerts if target prices are met. Products are processed in parallel chunks of 5 using `Promise.allSettled` — each chunk runs concurrently, and failures are isolated so one product doesn't block the rest.

### `GET /api/products/[productId]/deal-analysis`
Returns an AI-generated deal analysis using Gemini:
```json
{
  "analysis": {
    "label": "Great time to buy",
    "confidence": "high",
    "summary": "Price is at its 90-day low...",
    "reasons": ["Price dropped 15% in the last week"]
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

---

## Database Schema

### `products`
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

## Automation & Cron Jobs

NexPrice uses Supabase `pg_cron` to schedule daily price checks, avoiding external cron services. The cron endpoint processes products in parallel chunks of 5 using `Promise.allSettled` — each chunk's `scrapeProduct()` calls run concurrently, and a single failure never blocks the rest.

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

Replace `YOUR_DOMAIN` with your production URL. For local testing, use `ngrok`.

---

## Deployment

### Vercel (Recommended)

1. Push your repository to GitHub.
2. Create a new project on [Vercel](https://vercel.com) and import your repo.
3. Add all environment variables from `.env.local` to Vercel.
4. Deploy.

### Post-Deploy Steps

1. **Supabase Auth**: Update Site URL and Redirect URIs to your production domain.
2. **Google OAuth**: Update Authorized Redirect URIs in Google Cloud Console.
3. **Cron Job**: Update the `pg_cron` URL to your production domain.
4. **Resend**: Verify your sending domain.

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
