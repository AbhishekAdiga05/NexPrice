# NexPrice

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Status" />
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Telegram_Bot-26A5E4?logo=telegram&logoColor=white" alt="Telegram Bot API" />
</p>

**NexPrice** is a full-stack product price tracking application that monitors e-commerce prices across multiple stores, analyzes historical trends, and sends real-time alerts via Telegram and email when products reach target prices.

---

## Screenshots

```
Screenshot placeholders — add these after deployment:

[Landing Page]     → public/screenshots/landing.png
[Dashboard]        → public/screenshots/dashboard.png
[Product Tracking] → public/screenshots/product-tracking.png
[Price Comparison] → public/screenshots/price-comparison.png
[Price Analytics]  → public/screenshots/price-analytics.png
[Telegram Alert]   → public/screenshots/telegram-alert.png
```

---

## Features

- **Product Price Tracking** — Add any product URL; the app scrapes the page and records the price. A cron job rescrapes all tracked products daily to build a historical record.
- **Target Price Alerts** — Set a target price per product. When the price drops to or below the target, you receive an immediate notification.
- **Telegram Notifications** — Connect your Telegram account to receive instant price alerts. Supports both price-drop and target-reached notifications.
- **Multi-Store Price Comparison** — View the same product priced across multiple retailers (Amazon, Flipkart, Croma, Reliance Digital, Tata CLiQ, Vijay Sales) side by side. The cheapest store is highlighted.
- **Historical Price Trends** — Interactive Recharts line chart showing price changes over time with min/max/average annotations.
- **Deal Score** — A 0–100 algorithm rating that answers "should I buy now?" based on proximity to all-time low, discount from average, recent trend, and volatility.
- **Watchlist with Buy Priority** — Save products to a watchlist with high/medium/low priority. A composite score (priority + time on list + deal score) suggests what to buy next.
- **Responsive UI** — Full desktop and mobile layout with collapsible sidebar, dark/light theme toggle, and sticky navigation.
- **Google OAuth Authentication** — Sign in with Google via Supabase Auth. Session managed via cookies with middleware refresh.
- **Dashboard Analytics** — Tabbed dashboard showing products, insights (total savings, top deals), watchlist (sorted by buy priority), alerts (active/triggered/disabled), and settings.

---

## Problem Statement

Online shoppers face several challenges:

1. **Price volatility** — Product prices change frequently, often daily. Manually checking multiple stores is impractical.
2. **No centralized view** — A product may be available on 5+ stores at different prices. Comparing them requires opening multiple tabs.
3. **Missed opportunities** — Without monitoring, price drops and deals go unnoticed. A product might hit the desired price for a few hours and then revert.
4. **Decision uncertainty** — Knowing the current price isn't enough. Shoppers need context: is this a good price relative to history? Is the trend dropping further?

---

## Solution

NexPrice addresses these problems through automated monitoring and analysis:

- **Automated scheduled scraping** — A cron job rescrapes every tracked product daily, recording prices in a time-series history table. No manual checking required.
- **Multi-store aggregation** — The same product's price across different retailers is stored and compared, with the cheapest option highlighted automatically.
- **Proactive alerts** — Users set a target price once. The system monitors continuously and pushes alerts via Telegram and email when the target is reached, without the user having to check.
- **Data-driven purchase decisions** — The Deal Score algorithm provides a quantitative answer to "should I buy now?" using historical price data, reducing guesswork.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (Client)                       │
│  Next.js App Router · React 19 · Tailwind v4 · Recharts │
└────────────────────────┬────────────────────────────────┘
                         │  HTTP / Server Actions
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js 16 Server (App Router)              │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Server      │  │  Server      │  │  API Routes   │  │
│  │  Components  │  │  Actions     │  │  (cron, etc)  │  │
│  └──────────────┘  └──────────────┘  └───────┬───────┘  │
│                                               │          │
└───────────────────────────────────────────────┼──────────┘
                                                │
        ┌───────────────────────────────────────┼───────────────┐
        │                                       │               │
        ▼                                       ▼               ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Supabase       │  │   Firecrawl      │  │   Telegram Bot   │
│   (PostgreSQL)   │  │   (Web Scraper)  │  │   API            │
│   · Auth         │  │                  │  │                  │
│   · RLS          │  │  scrapeProduct() │  │  sendMessage()   │
│   · Storage      │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        │                                                   
        ▼                                                   
┌──────────────────┐                                        
│   Resend         │                                        
│   (Email)        │                                        
└──────────────────┘                                        
```

### Frontend

- **Server Components** — Page-level data fetching and layout rendering. Each page fetches its own data directly from Supabase using server actions.
- **Client Components** — Interactive UI elements (price charts, alert forms, watchlist toggles, theme switch). Marked with `"use client"`.
- **State Management** — Server actions for mutations (add product, set alert, update watchlist) with automatic `revalidatePath` cache invalidation. No client-side state library needed.
- **Routing** — Next.js App Router with dynamic route segments (`/products/[id]`, `/dashboard/product/[productId]`).
- **Styling** — Tailwind CSS v4 with CSS variables for theming. Dark mode via class-based toggling with pre-hydration script to prevent flash.

### Backend

- **Server Actions** — All mutations implemented as `"use server"` functions in `app/actions.js`. Each action validates authentication, performs the operation, and revalidates the cache.
- **API Routes** — `POST /api/cron/check-prices` handles the daily price check cron job. Authenticated via `CRON_SECRET` bearer token.
- **Middleware** — Supabase session refresh on every request via `utils/supabase/middleware.js`.

### Database

- **Supabase (PostgreSQL)** — All persistent state. Row-Level Security (RLS) on every table scopes data to the authenticated user.
- **Migrations** — 6 SQL migration files in `supabase/` covering all tables, indexes, and policies.

### Notification Service

- **Email (Resend)** — HTML-formatted email templates for price drops and target-reached alerts.
- **Telegram Bot API** — Markdown-formatted messages sent via `https://api.telegram.org/bot<TOKEN>/sendMessage`.
- **Notifications Table** — Every sent notification (both email and Telegram) is logged with status, recipient, and error tracking for auditability.

---

## Database Design

### Main Entities

| Table | Purpose | Key Columns |
|---|---|---|
| `products` | Tracked products per user | `id`, `user_id`, `name`, `url`, `current_price`, `currency`, `image_url` |
| `price_history` | Time-series price data | `id`, `product_id`, `price`, `currency`, `checked_at` |
| `price_alerts` | User-set target price alerts | `id`, `user_id`, `product_id`, `target_price`, `status` (active/triggered/disabled) |
| `store_prices` | Multi-store price records | `id`, `product_id`, `store_name`, `product_url`, `price`, `last_updated` |
| `watchlist` | Prioritized product shortlist | `id`, `user_id`, `product_id`, `priority` (low/medium/high) |
| `user_settings` | User preferences | `id`, `user_id`, `weekly_digest`, `telegram_chat_id`, `telegram_enabled` |
| `notifications` | Notification history audit log | `id`, `user_id`, `product_id`, `channel`, `status` (sent/failed) |
| `price_predictions` | Cached ML predictions | `id`, `product_id`, `predicted_price`, `confidence`, `expires_at` |

Each table has Row-Level Security enabled. Policies verify `user_id = auth.uid()` or check product ownership via a subquery.

---

## Multi-Store Price Comparison

When viewing a product's detail page, the server fetches all rows from `store_prices` for that product. The data is sorted by `price ASC`, and the cheapest store is visually highlighted with a "Best Price" badge.

- **Data source**: Real prices come from the `store_prices` table, populated via server actions. For demo purposes, fallback mock data generates realistic prices across 6 Indian retailers.
- **Architecture**: The `StoreComparison` component receives an array of price objects, sorts them client-side, and renders responsive cards with store name, price, price difference from cheapest, last-updated timestamp, and a direct link to the product page on that store.
- **Extensibility**: When real store APIs are integrated, the mock fallback is removed and `upsertStorePrice` is called from the scraping pipeline instead.

---

## Telegram Alert System

### Alert Flow

1. **User sets a target price** via the `SetPriceAlert` component on any product. This inserts a row in `price_alerts` with `status = 'active'`.
2. **Cron job runs daily** — `POST /api/cron/check-prices` authenticates via `CRON_SECRET`, iterates all products in chunks of 5, rescrapes each via Firecrawl, and updates the price.
3. **Trigger condition** — For each active alert on a product, if `newPrice <= alert.target_price`:
   - The alert is marked `status = 'triggered'` with a timestamp and computed savings.
   - An **email notification** is sent via Resend.
   - A **Telegram notification** is sent if the user has connected their Telegram account (`user_settings.telegram_chat_id` exists and `telegram_enabled` is true).
4. **Deduplication** — Once an alert is triggered, its status changes from `active` to `triggered`. The cron job only processes alerts with `status = 'active'`, preventing duplicate notifications for the same price drop.

### Telegram Bot Integration

- The bot sends messages via the REST API: `POST https://api.telegram.org/bot<TOKEN>/sendMessage`
- Messages use **Markdown formatting** with product name, prices, timestamps, and a clickable product link.
- Two message templates: price drop alert (shows savings) and target reached alert (shows target vs current).
- A test message endpoint is available in the Settings page to verify the connection.

### Notification Logging

Every notification attempt (both email and Telegram) is recorded in the `notifications` table with:

- Channel (email / telegram)
- Status (sent / failed / pending)
- Prices at the time of the event
- Error messages for debugging

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server-side rendering, routing, server actions |
| **UI Library** | React 19 | Component-based UI |
| **Styling** | Tailwind CSS v4 + tw-animate-css | Utility-first CSS with animation utilities |
| **Components** | shadcn/ui (Radix primitives) | Accessible UI primitives (dialog, button, badge, card) |
| **Charts** | Recharts | Interactive price history line charts |
| **Icons** | Lucide React | Consistent icon set |
| **Database** | Supabase (PostgreSQL) | Relational data store with RLS |
| **Authentication** | Supabase Auth (Google OAuth) | User authentication and session management |
| **Web Scraping** | Firecrawl | Product data extraction from any e-commerce URL |
| **Email** | Resend | Transactional email alerts |
| **Notifications** | Telegram Bot API | Real-time push notifications |
| **Animation** | Framer Motion | Scroll-triggered fade-in animations |
| **Linting** | ESLint (Next.js config) | Code quality |
| **Package Manager** | npm / bun | Dependency management |

---

## Installation

### Prerequisites

- Node.js 18+ and npm/bun
- A Supabase account (free tier)
- A Firecrawl API key (free tier available)
- A Resend API key (free tier: 100 emails/day)
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/nexprice.git
cd nexprice

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your keys (see Environment Variables below)

# 4. Run database migrations
# Open the Supabase SQL Editor and run the migrations in order:
# supabase/migration_price_alerts.sql
# supabase/migration_settings.sql
# supabase/migration_savings.sql
# supabase/migration_phase_b.sql
# supabase/migration_store_prices.sql
# supabase/migration_telegram.sql

# 5. Start the development server
npm run dev
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firecrawl (web scraping)
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Resend (email notifications)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=notifications@yourdomain.com

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Cron job security
CRON_SECRET=a_random_secret_string_for_authorization

# App URL (for email/webhook links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Running Locally

```bash
npm run dev
# Open http://localhost:3000
```

Build for production:

```bash
npm run build
npm start
```

Run linting:

```bash
npm run lint
```

---

## Future Improvements

- **Browser Extension** — A Chrome/Firefox extension that adds a "Track on NexPrice" button to any e-commerce product page, allowing one-click addition to the user's dashboard.
- **AI-Based Price Prediction** — Currently the app shows a trend indicator (above/below average). Integration with a price prediction model (time-series forecasting) could predict the optimal buy window.
- **WhatsApp Notifications** — Extend the notification system beyond email and Telegram to support WhatsApp Business API for users in markets where WhatsApp is the primary messaging platform.
- **More Store Integrations** — Replace mock store prices with real data from affiliate APIs (Amazon PA-API, Flipkart Affiliate, etc.) and automated cross-store scraping.
- **Email Digest** — The weekly digest setting exists in the database but the email generation logic is not yet implemented. A scheduled job could compile a weekly summary of price changes, savings, and recommendations.
- **Public Share Pages** — Generate a public, shareable URL for any tracked product showing its price history and Deal Score, allowing users to share deals without requiring recipients to sign up.

---

## Key Learnings

This project demonstrates competence in several software engineering areas:

- **API Integration** — Working with external APIs (Firecrawl for scraping, Resend for email, Telegram Bot API for notifications) and handling failures gracefully.
- **Database Design** — Schema design with RLS policies, unique constraints, indexes for query performance, and migration-based schema evolution.
- **State Management** — Next.js server actions for mutations with automatic cache revalidation. No client-side state library needed due to the server-centric data model.
- **Full-Stack Development** — Single codebase spanning database (SQL), backend (Node.js server actions), and frontend (React components with responsive design).
- **Data Visualization** — Interactive time-series charts using Recharts with dynamic domain calculations and responsive containers.
- **Notification Systems** — Multi-channel notification delivery (email + Telegram) with deduplication, status tracking, and failure logging.
- **Authentication & Authorization** — Google OAuth flow, session management via cookies, RLS for row-level data isolation.
- **Automated Workflows** — Cron-driven price checking with chunked parallel processing, progress logging, and error isolation per product.

---

## Resume Highlights

1. Built a full-stack production-grade web application using Next.js 16, React 19, Supabase (PostgreSQL), and Tailwind CSS v4, featuring automated product price tracking with daily cron-based scraping across multiple e-commerce stores.

2. Designed and implemented a multi-channel notification system integrating Telegram Bot API and Resend (email) with status tracking, deduplication logic, and failure logging — delivering real-time price alerts to users.

3. Developed a weighted Deal Score algorithm (0–100) analyzing four quantitative factors (proximity to historical low, discount from average, recent trend, and volatility) to provide data-driven purchase recommendations.

4. Engineered a responsive single-page dashboard with tabbed navigation (products, insights, watchlist, alerts, settings), interactive Recharts visualizations, dark/light theme support, and Google OAuth authentication with Row-Level Security.

---

## Project Structure

```
nexprice/
├── app/
│   ├── actions.js                    # All server actions
│   ├── globals.css                   # Tailwind v4 theme + dark mode
│   ├── layout.js                     # Root layout with fonts + toaster
│   ├── page.js                       # Homepage / authenticated dashboard
│   ├── loading.js                    # Root loading skeleton
│   ├── error.js                      # Global error boundary
│   ├── not-found.js                  # 404 page
│   ├── auth/callback/route.js        # OAuth callback handler
│   ├── api/cron/check-prices/route.js # Daily price check cron endpoint
│   ├── products/[id]/
│   │   ├── page.js                   # Product detail (server)
│   │   └── ProductDetail.js          # Product detail (client)
│   └── dashboard/
│       ├── page.js                   # Dashboard redirect
│       └── product/[productId]/
│           ├── page.js               # Full product detail page
│           ├── loading.js            # Loading skeleton
│           └── ProductActions.js     # Action buttons
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── input.jsx
│   │   ├── badge.jsx
│   │   ├── alert.jsx
│   │   └── sonner.jsx
│   ├── NavBar.js
│   ├── Sidebar.js
│   ├── DashboardShell.js
│   ├── AddProductForm.js
│   ├── ProductCard.js
│   ├── PriceChart.js
│   ├── PricePrediction.js
│   ├── PriceHistoryPreview.js
│   ├── DealScoreBadge.js
│   ├── SetPriceAlert.js
│   ├── StoreComparison.js
│   ├── AlertsDashboard.js
│   ├── WatchlistDashboard.js
│   ├── InsightsDashboard.js
│   ├── SettingsForm.js
│   ├── RecentActivity.js
│   ├── AuthModal.js
│   ├── AuthButton.js
│   ├── ThemeToggle.js
│   ├── HeroVisual.js
│   ├── AmbientCanvas.js
│   ├── SectionFade.js
│   ├── LandingCTA.js
│   └── Footer.js
├── lib/
│   ├── utils.js                      # cn() utility
│   ├── deal-score.js                 # Deal Score algorithm
│   ├── buy-priority.js               # Buy Priority algorithm
│   ├── firecrawl.js                  # Firecrawl scraper wrapper
│   ├── email.js                      # Email notification templates
│   ├── telegram.js                   # Telegram Bot API service
│   ├── mock-stores.js                # Mock store price generator
│   ├── dates.js                      # Date formatting utilities
│   └── constants.js                  # Design constants
├── utils/supabase/
│   ├── server.js                     # Server-side Supabase client
│   ├── client.js                     # Browser-side Supabase client
│   └── middleware.js                  # Auth session middleware
├── supabase/
│   ├── migration_price_alerts.sql
│   ├── migration_settings.sql
│   ├── migration_savings.sql
│   ├── migration_phase_b.sql
│   ├── migration_store_prices.sql
│   └── migration_telegram.sql
├── proxy.js                          # Next.js middleware
├── next.config.mjs
├── postcss.config.mjs
├── package.json
└── README.md
```

---

## License

MIT

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
