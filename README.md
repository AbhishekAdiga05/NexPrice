<div align="center">
  <h1>NexPrice</h1>
  <p><strong>Smart Product Price Tracker</strong></p>
  <p>
    Monitor e-commerce prices, get alerted on drops, compare across stores, and make data-driven buying decisions.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Firecrawl-F97316?logo=firecrawl&logoColor=white" alt="Firecrawl" />
    <img src="https://img.shields.io/badge/Resend-000000?logo=resend&logoColor=white" alt="Resend" />
  </p>
</div>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

### Product Price Tracking
Users paste any e-commerce product URL (Amazon, Flipkart, etc.). The app scrapes the page using Firecrawl to extract the product name, price, currency, and image. Each product is saved to the user's personal dashboard.

### Price History & Charts
Every price check is recorded in a time-series history. Interactive line charts (Recharts) display price trends over time with low/high/average annotations.

### Target Price Alerts
Users set a target price on any product they track. A cron job checks prices daily; when the price drops to or below the target, the user receives an email notification via Resend. Alerts are deduplicated — once triggered, they won't fire again for the same price drop.

### Deal Score Algorithm
Each product gets a 0–100 score based on four weighted factors:

| Factor | Weight | Description |
|---|---|---|
| Proximity to Low | 40% | How close the price is to the all-time low |
| Discount from Average | 30% | How much below the historical average |
| Recent Trend | 20% | Whether the price is currently trending down |
| Volatility | 10% | How much the price typically fluctuates |

The score translates to a tier: **Great Deal (70+)**, **Good Deal (50–69)**, **Fair (30–49)**, or **Not Now (<30)**.

### Buy Priority Score
For watchlisted products, a composite urgency score (0–100) that combines:
- User-set priority weight (High/Medium/Low)
- Days spent on the watchlist (up to 30 days)
- Current Deal Score

### Multi-Store Price Comparison
The app searches the same product across 5 Indian retailers — Amazon, Flipkart, Croma, Reliance Digital, and Tata CLiQ — using product name matching with Jaccard similarity. Prices are displayed side by side with the cheapest store highlighted.

### Watchlist
Users can save products to a watchlist with a priority level (High/Medium/Low). Items are sorted by the computed Buy Priority score so the most urgent purchase appears first.

### Dashboard & Insights
A tabbed dashboard with sections for:
- **Products** — list of tracked items with deal scores, price alerts, and charts
- **Insights** — total savings, top deals, deal score distribution chart, recent activity timeline
- **Watchlist** — prioritized product shortlist with buy urgency scores
- **Alerts** — all active, triggered, and disabled price alerts
- **Settings** — weekly digest preference and account info

### Google OAuth Authentication
Users sign in with Google via Supabase Auth. Sessions are managed with cookies and refreshed automatically via middleware on every request. Row-Level Security ensures users can only see their own data.

### Automated Cron Job
A `POST /api/cron/check-prices` endpoint processes all tracked products in chunks of 5. It rescrapes each URL, updates prices, records history, sends email notifications for price drops and triggered alerts, and refreshes store comparison data.

### Email Notifications
HTML email templates for two notification types:
- **Price Drop Alert** — sent when a product's price decreases, showing the old price, new price, savings amount, and percentage drop
- **Target Price Reached** — sent when a price hits or falls below the user's target, showing the target and current price

Every notification attempt is logged in a `notifications` table with status tracking.

### Dark / Light Theme
Toggle between dark and light mode. Preference persists in localStorage with a pre-hydration script to prevent flash on page load.

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | SSR, routing, server actions |
| **UI** | React 19, Tailwind CSS v4 | Component rendering, styling |
| **UI Primitives** | shadcn/ui (Radix) | Accessible dialog, button, card, badge, input |
| **Charts** | Recharts | Interactive price history line/area charts |
| **Icons** | Lucide React | Consistent icon set |
| **Animation** | Framer Motion | Scroll-triggered fade-in animations |
| **Database** | Supabase (PostgreSQL) | Relational data store with RLS |
| **Auth** | Supabase Auth | Google OAuth + session cookies |
| **Scraping** | Firecrawl | Product data extraction from e-commerce URLs |
| **Email** | Resend | Transactional email alerts with HTML templates |
| **Notifications** | Sonner | In-app toast notifications |

---

## Architecture

```
                      Browser (Client)
         Next.js App Router · React 19 · Tailwind v4
                            |
                  HTTP / Server Actions
                            |
                    Next.js 16 Server
         ┌──────────────────┬──────────────────┐
         │  Server          │  Server          │
         │  Components      │  Actions         │
         │  (app/page.js)   │  (app/actions.js)│
         └──────────────────┴──────────────────┘
                            |
              ┌─────────────┴─────────────┐
              │                           │
         Supabase                     Firecrawl
     (PostgreSQL + Auth)           (Web Scraper)
              │
              │
          Resend
         (Email)
```

### Frontend
- **Server Components** render page layouts and fetch data directly from Supabase
- **Client Components** (`"use client"`) handle interactivity: charts, forms, modals, theme toggle
- **Server Actions** (`app/actions.js`) handle all mutations — adding products, setting alerts, managing watchlist — with automatic `revalidatePath` cache invalidation
- **Middleware** (`middleware.js`) refreshes the Supabase auth session on every request and includes an in-memory rate limiter (30 requests/minute per IP)

### Backend
- **API Routes** — `POST /api/cron/check-prices` protected by a Bearer token (`CRON_SECRET`). Processes all products in parallel chunks of 5
- **Server Actions** — 19 exported functions handling auth, CRUD, and data aggregation

### Data Flow
1. User adds a product URL → Server Action scrapes via Firecrawl → upserts into `products` table → inserts `price_history` row → triggers store discovery
2. Cron job runs daily → for each product: scrape URL → compare price → update DB → log history → send email if alert triggered → refresh store prices
3. Dashboard loads → multiple Server Actions fetch products, insights, watchlist, alerts, settings in parallel

---

## Database Design

The database has 8 tables with Row-Level Security on every table.

| Table | Purpose | Key Columns | RLS Policy |
|---|---|---|---|
| `products` | Tracked products per user | `id`, `user_id`, `url`, `name`, `current_price`, `currency` | `user_id = auth.uid()` |
| `price_history` | Time-series price records | `id`, `product_id`, `price`, `checked_at` | Via products subquery |
| `price_alerts` | Target price alerts | `id`, `user_id`, `product_id`, `target_price`, `status` | `user_id = auth.uid()` |
| `store_prices` | Multi-store comparison | `id`, `product_id`, `store_name`, `price`, `product_url` | Via products subquery |
| `watchlist` | Prioritized product shortlist | `id`, `user_id`, `product_id`, `priority` | `user_id = auth.uid()` |
| `user_settings` | Notification preferences | `id`, `user_id`, `weekly_digest`, `digest_day` | `user_id = auth.uid()` |
| `notifications` | Notification audit log | `id`, `user_id`, `product_id`, `type`, `channel`, `status` | `user_id = auth.uid()` |
| `price_predictions` | Cached AI predictions | `id`, `product_id`, `predicted_price`, `confidence`, `expires_at` | Via products subquery |

Key constraints:
- `products`: `UNIQUE(user_id, url)` — prevents duplicate tracking
- `store_prices`: `UNIQUE(product_id, store_name)` — one price per store per product
- `price_alerts`: `CHECK (target_price > 0)`
- `watchlist`: `UNIQUE(user_id, product_id)`

A single migration file (`supabase/migration.sql`) creates all tables, indexes, and policies.

---

## Project Structure

```
nexprice/
├── app/
│   ├── actions.js                    # Server actions (19 functions)
│   ├── layout.js                     # Root layout + Toaster
│   ├── page.js                       # Landing page / authenticated dashboard
│   ├── globals.css                   # Tailwind v4 + dark mode vars
│   ├── loading.js                    # Loading skeleton
│   ├── error.js                      # Error boundary
│   ├── not-found.js                  # 404 page
│   ├── auth/
│   │   └── callback/route.js         # Google OAuth callback handler
│   ├── api/
│   │   └── cron/check-prices/route.js # Daily price check cron endpoint
│   ├── products/[id]/
│   │   ├── page.js                   # Product detail page (server)
│   │   └── ProductDetail.js          # Product detail (client component)
│   └── dashboard/
│       ├── page.js                   # Dashboard redirect
│       └── product/[productId]/
│           ├── page.js               # Full product detail page
│           ├── loading.js            # Loading skeleton
│           └── ProductActions.js     # Action buttons
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   │   ├── button.jsx, card.jsx, dialog.jsx, input.jsx
│   │   ├── badge.jsx, alert.jsx, sonner.jsx
│   ├── AddProductForm.js             # URL input + submit
│   ├── AlertsDashboard.js            # Price alerts list + management
│   ├── AuthModal.js / AuthButton.js  # Google OAuth modal/button
│   ├── DashboardAnalyticsChart.js    # Deal score distribution chart
│   ├── DashboardShell.js             # App layout wrapper
│   ├── DealScoreBadge.js             # 0-100 deal score display
│   ├── InsightsDashboard.js          # Analytics + top deals
│   ├── LandingShell.js               # Landing page composer
│   ├── NavBar.js / Sidebar.js        # Navigation
│   ├── PriceChart.js                 # Interactive price history chart
│   ├── PricePrediction.js            # Trend indicator + buying advice
│   ├── ProductCard.js                # Product card with actions
│   ├── RecentActivity.js             # Activity timeline
│   ├── SectionFade.js                # Scroll animation wrapper
│   ├── SetPriceAlert.js              # Target price form + progress
│   ├── SettingsForm.js               # Weekly digest preferences
│   ├── StoreComparison.js            # Multi-store price table
│   ├── StorePriceBadge.js            # Compact store price display
│   ├── ThemeToggle.js                # Dark/light mode toggle
│   └── WatchlistDashboard.js         # Watchlist with priorities
├── lib/
│   ├── buy-priority.js               # Buy urgency scoring algorithm
│   ├── dates.js                      # Relative time formatting
│   ├── deal-score.js                 # Deal Score (0-100) algorithm
│   ├── email.js                      # HTML email templates (Resend)
│   ├── firecrawl.js                  # Firecrawl scraper wrapper
│   ├── product-matcher.js            # Text similarity matching
│   ├── retailers.js                  # 5 retailer configurations
│   ├── store-discovery.js            # Cross-store product search
│   ├── store-utils.js                # Store price comparison helpers
│   └── utils.js                      # cn() Tailwind utility
├── utils/supabase/
│   ├── server.js                     # Server-side Supabase client
│   ├── client.js                     # Browser-side Supabase client
│   └── middleware.js                  # Auth session refresh
├── supabase/
│   └── migration.sql                 # Complete database migration
├── middleware.js                      # Session refresh + rate limiter
├── next.config.mjs
├── package.json
└── postcss.config.mjs
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Firecrawl API key ([firecrawl.dev](https://firecrawl.dev))
- Resend API key ([resend.com](https://resend.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/nexprice.git
cd nexprice

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see below)

# 4. Run database migration
# Open Supabase Dashboard → SQL Editor → paste supabase/migration.sql → Run

# 5. Start the dev server
npm run dev
```

### Running Commands

```bash
# Development
npm run dev              # Start at http://localhost:3000

# Production
npm run build
npm start

# Linting
npm run lint

# Run the cron job (replace YOUR_CRON_SECRET)
Invoke-RestMethod -Uri "http://localhost:3000/api/cron/check-prices" `
  -Method Post `
  -Headers @{ Authorization = "Bearer YOUR_CRON_SECRET" }
```

---

## Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Web Scraping (required)
FIRECRAWL_API_KEY=fc-your-firecrawl-key

# Email (required for notifications)
RESEND_API_KEY=re_your-resend-key
RESEND_FROM_EMAIL=onboarding@resend.dev

# Cron Security (required)
CRON_SECRET=your-random-secret

# App URL (required)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Predictions (optional)
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash
```

---

## API Endpoints

### `POST /api/cron/check-prices`

Triggers the daily price check workflow. Requires `Authorization: Bearer <CRON_SECRET>`.

**What it does:**
1. Fetches all products from the database
2. Processes them in parallel chunks of 5
3. For each product: scrapes URL via Firecrawl, updates price, logs history if changed
4. Sends email notifications for price drops and triggered alerts
5. Refreshes multi-store price data

**Response:**
```json
{
  "success": true,
  "message": "Price check completed",
  "results": {
    "total": 10,
    "updated": 9,
    "failed": 1,
    "priceChanges": 3,
    "alertsSent": 2,
    "storePricesRefreshed": 1
  }
}
```

### `GET /api/cron/check-prices`

Returns a status message confirming the endpoint is alive.

### `GET /auth/callback`

Handles the Google OAuth redirect. Exchanges the authorization code for a session and redirects to the dashboard. Validates redirect URLs to prevent open-redirect attacks.

---

## Testing

### Manual Test Flow

```bash
# 1. Start the app
npm run dev

# 2. Sign in with Google at http://localhost:3000

# 3. Add a product (paste an Amazon/Flipkart URL)

# 4. Set a price alert on the product

# 5. Inflate the price in Supabase to trigger alerts:
UPDATE products SET current_price = 99999 WHERE id = '<product-uuid>';

# 6. Run the cron job:
Invoke-RestMethod -Uri "http://localhost:3000/api/cron/check-prices" `
  -Method Post `
  -Headers @{ Authorization = "Bearer YOUR_CRON_SECRET" }

# 7. Check email and Supabase notifications table
```

Key features to test:
- Google sign-in/sign-out flow
- Add product with valid/invalid URLs
- Set and remove price alerts
- View price history charts and deal scores
- Multi-store price comparison
- Watchlist add/remove/priority
- Dashboard insights and analytics
- Dark/light theme toggle
- Rate limiting (30 requests/minute per IP)
- Cron job response with real data

---

## Future Improvements

- **Weekly Email Digest** — Scheduled job to compile and send a weekly summary of price changes, savings, and recommendations (database schema already supports this)
- **Browser Extension** — Chrome/Firefox extension for one-click product tracking from any e-commerce page
- **WhatsApp Notifications** — Extend the notification system to support WhatsApp Business API
- **Store Affiliate APIs** — Replace Firecrawl scraping with official affiliate APIs (Amazon PA-API, Flipkart Affiliate) for more reliable pricing
- **AI Price Predictions** — Gemini integration for time-series forecasting to predict optimal buy windows
- **Public Share Pages** — Shareable URLs showing product price history and deal score without requiring sign-in
- **Rate Limiting Upgrade** — Replace in-memory rate limiter with Redis-backed (Upstash) for multi-instance deployments

---

## License

MIT — see [LICENSE](LICENSE) for details.
