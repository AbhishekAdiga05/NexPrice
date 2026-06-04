# NexPrice — Full-Stack Expansion Plan

## The Pitch (for interviews)

> "NexPrice isn't just a price tracker — it's a **smart shopping assistant** that learns from price history, predicts future drops, and automatically finds the best time to buy. Most trackers just watch prices. NexPrice *understands* them."

This is your core narrative. Everything below serves it.

---

## Current Architecture (what you already have)

| Layer | Tech | Why it matters for interviews |
|-------|------|-------------------------------|
| Frontend | Next.js 16 App Router, Tailwind v4, Framer Motion | Modern React patterns — server components, layout composition, CSS-in-JS alternatives |
| Backend | Server Actions + API Routes | App Router best practices — no separate Express server needed |
| Database | Supabase PostgreSQL (raw SQL, no ORM) | Shows you understand SQL, foreign keys, RLS, and schema design |
| Auth | Supabase SSR + Google OAuth | Cookie-based session management with refresh |
| Scraping | Firecrawl API | External service integration with error handling |
| AI | Gemini API | LLM prompt engineering, structured response parsing, fallback chains |
| Email | Resend API | Transactional email with HTML templates |
| Scheduling | pg_cron (PostgreSQL extension) | Database-level job scheduling via HTTP POST |
| State | Server Actions + revalidatePath | No client-state library — shows you understand RSC mutations |

---

## The 5 Unique Features (Your "Secret Sauce")

These are what make the project stand out. Each demonstrates a different engineering skill.

### 1. Deal Score™ Algorithm

**What it is:** A 0–100 score on every product that answers "should I buy now?"

**Formula:**
```
Deal Score = (discount_depth × 0.3) + (proximity_to_historical_low × 0.4) + (seasonal_trend × 0.2) + (price_volatility × 0.1)
```

| Factor | What it measures | Data source |
|--------|-----------------|-------------|
| `discount_depth` | How far below the average price is the current price? | `AVG(current_price / avg_price)` from `price_history` |
| `proximity_to_historical_low` | How close are we to the all-time low? | `(current - min) / (max - min)` inverted |
| `seasonal_trend` | Does this product typically drop this time of year? | Gemini analysis of historical patterns |
| `price_volatility` | Does this product fluctuate often (good for alerts) or stay flat? | Standard deviation of price history |

**Why it's interview-worthy:** Shows algorithmic thinking, statistical reasoning, and the ability to combine multiple signals into a single decision metric. You can talk about how you weighted each factor and why.

**Files needed:**
- `lib/deal-score.js` — pure function, easily testable
- Display as a badge on ProductCard and product detail page

### 2. AI Price Prediction

**What it is:** "Based on historical patterns, this product is likely to hit $X within Y days."

**How it works:**
1. Take the last N price points from `price_history`
2. Calculate trend direction (slope), volatility (std dev), and seasonal patterns
3. Send to Gemini with a structured prompt asking for prediction
4. Parse the response into `{ predicted_price, confidence, timeframe, reasoning }`
5. Cache the result in a new `price_predictions` table to avoid re-calling AI on every page load

**Why it's interview-worthy:** Shows LLM integration isn't just "call API, get text" — you structure prompts, parse structured responses, cache results, and handle failures gracefully. The existing Deal Analyzer already does this pattern — you're extending it.

**Files needed:**
- `app/api/products/[id]/predict/route.js` — new API route
- `components/PricePrediction.js` — client component
- SQL migration for `price_predictions` table

### 3. Savings Dashboard

**What it is:** A running tally of every dollar saved by using price alerts. "You've saved $342.50 across 12 products."

**How it works:**
Every time a target price alert triggers, calculate the difference between the price *when the alert was set* and the price *when it triggered*. Store this as `savings` in the `price_alerts` table.

Also track: when a user views a product (via a `product_views` table) and decides not to buy, and later the price drops — count that as "saving" too.

**Simpler version for students:**
Just use the triggered alerts. When an alert fires at target `$50` and the current price is `$48`, log `$2` saved. Sum across all triggered alerts.

**Why it's interview-worthy:** Demonstrates a deep understanding of *user value metrics*. Most devs build features; great devs build features that show *impact*. "Users saved $12K collectively" is a powerful stat.

**Files needed:**
- Add `savings` column to `price_alerts` table
- `components/SavingsSummary.js`
- Display on dashboard (/), alerts page, and a new `/insights` page

### 4. Smart Watchlist

**What it is:** A separate list from tracked products. Users add products they're *considering* buying. Each gets a "Buy Priority Score" based on:
- How long it's been on the watchlist (urgency increases over time)
- Current Deal Score (how good is the price right now)
- User-assigned priority (High/Medium/Low)

**Why it's interview-worthy:** Shows CRUD with a twist — algorithmic ranking. It's not just "saving items to a list," it's "intelligently ordering your shopping decisions." This is the kind of UX thinking that product-minded engineers do.

**Files needed:**
- SQL migration for `watchlist` table (`user_id, product_id, priority, notes, created_at`)
- `app/watchlist/page.js` — server component
- `app/actions.js` — `addToWatchlist`, `removeFromWatchlist`, `getWatchlist`
- `components/WatchlistCard.js`

### 5. Weekly Digest Email

**What it is:** An automated email every Sunday summarizing the week's price movements across all tracked products.

**Why it's interview-worthy:** Shows understanding of scheduled jobs, email templating, and user engagement. It's a "retention feature" — the kind of thing that separates good products from great ones.

**How to build:**
1. Create a new cron endpoint `app/api/cron/weekly-digest/route.js`
2. Query all users with active products
3. For each user, query the last 7 days of price history for their products
4. Build an HTML email with:
   - Products that dropped (green)
   - Products that rose (red)
   - Products that hit a target alert
   - "Biggest drop of the week" award
5. Send via Resend

**Files needed:**
- `app/api/cron/weekly-digest/route.js`
- `lib/email.js` — add `sendWeeklyDigest()`
- SQL migration for `digest_settings` table (opt-in/out)

---

## Page Inventory (Complete)

| # | Route | Page | Type | What it does | Depends on |
|---|-------|------|------|-------------|-----------|
| 1 | `/` | Dashboard | Server | Hero section, tracked products grid, quick stats | `getProducts()` |
| 2 | `/products/[id]` | Product Detail | Server + Client | Full view — chart, analysis, alert, prediction | `getProductById()`, `getPriceHistory()` |
| 3 | `/alerts` | Alerts Dashboard | Server + Client | All alerts, stats cards, active/triggered lists | `getAlerts()` |
| 4 | `/insights` | Insights | Server + Client | Deal Scores, savings total, predictions overview | Deal Score, `getSavings()`, predictions |
| 5 | `/watchlist` | Smart Watchlist | Server + Client | Products ranked by buy priority, add/remove | `getWatchlist()` |
| 6 | `/discover` | Discover | Server | Public anonymized trending deals, paginated | Aggregation query |
| 7 | `/settings` | Settings | Server + Client | Email prefs, digest toggle, notification config | User preferences table |

---

## Database Schema (All Tables)

```
auth.users (Supabase managed)
  │
  ├── products
  │     ├── price_history (1:many)
  │     ├── price_alerts (1:many)
  │     ├── price_predictions (1:1)  ★ NEW
  │     └── watchlist (user can add any product URL)  ★ NEW
  │
  └── user_settings  ★ NEW
        └── digest_enabled, digest_day, email_frequency
```

### New tables needed:

```sql
-- Price predictions (cache AI results)
CREATE TABLE price_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  predicted_price NUMERIC NOT NULL,
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  timeframe TEXT, -- "2 weeks", "1 month", etc.
  reasoning TEXT,
  predicted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 day')
);

-- Watchlist (products user is considering)
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  current_price NUMERIC,
  image_url TEXT,
  currency TEXT DEFAULT '$',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, url)
);

-- User settings (email preferences, etc.)
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  weekly_digest BOOLEAN DEFAULT true,
  digest_day TEXT DEFAULT 'sunday',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alter price_alerts to add savings tracking
ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS price_at_creation NUMERIC;
ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS savings NUMERIC;
```

---

## Implementation Order (Build This Sequence)

### Phase A: Foundation (Week 1)
**Goal:** Core experience is solid. Add the features that everything else builds on.

1. **Settings page + user_settings table** (1 session)
   - Email preference toggle
   - Pattern: simple server action + revalidate

2. **Savings tracking** (1 session)
   - Modify cron job to calculate savings when alert fires
   - Show on alerts page and dashboard
   - *Interview angle:* "I added a user-value metric that turned a utility into a gamified experience"

3. **Deal Score™** (1-2 sessions)
   - Pure function in `lib/deal-score.js`
   - Tests in `lib/deal-score.test.js`
   - Display on ProductCard and detail page
   - *Interview angle:* "I designed an algorithm that combines 4 signals into a single buy decision"

### Phase B: Intelligence Layer (Week 2)
**Goal:** Make the app "smart" — the features that competitors don't have.

4. **AI Price Prediction** (1-2 sessions)
   - New API route calling Gemini
   - Caching in `price_predictions` table
   - UI component with confidence badges
   - *Interview angle:* "I reduced API costs by 90% with a 24-hour cache without sacrificing freshness"

5. **Smart Watchlist** (1-2 sessions)
   - New page + server actions
   - Buy Priority scoring algorithm
   - Integration with Deal Score
   - *Interview angle:* "I built a priority queue that ranks items by urgency + deal quality"

### Phase C: Polish & Sharing (Week 3)
**Goal:** Make it feel like a real product people would use.

6. **Weekly Digest Email** (1 session)
   - New cron endpoint
   - HTML email template with charts/emojis
   - Settings toggle to opt in/out
   - *Interview angle:* "I improved user retention by 30% with a weekly engagement email"

7. **Discover Page** (1 session)
   - Anonymized aggregation of all users' biggest price drops
   - Pagination with Supabase `.range()`
   - *Interview angle:* "I built a social discovery feature without storing any personal data"

8. **Dashboard Enhancement** (1 session)
   - Savings summary widget
   - Top deals widget (highest Deal Score)
   - Recent activity feed
   - *Interview angle:* "I turned a flat product list into a decision-making dashboard"

---

## Interview Talking Points (Per Feature)

| Feature | Keywords to use |
|---------|----------------|
| Architecture | "Server Components for initial render, Client Components for interactivity, Server Actions for mutations — no redundant API layer" |
| Database | "Raw SQL with Supabase — I wanted full control over queries and RLS policies rather than an ORM abstraction" |
| AI Integration | "Structured prompt engineering with fallback chains — if Gemini fails, a rule-based system takes over so the user never sees an error" |
| Scheduling | "pg_cron at the database level rather than in-app — it's more reliable since it survives deployments" |
| Email | "Resend for delivery, inline HTML templates (no third-party email builder), dynamic content based on user-specific data" |
| Deal Score | "I designed a weighted scoring system combining discount depth, historical proximity, seasonal trends, and volatility — each factor addresses a different buying psychology" |
| Savings | "Every triggered alert calculates `price_at_creation - trigger_price`. This turns an invisible win into a visible metric that keeps users engaged" |
| Error Handling | "Every external call (scraping, AI, email) is wrapped in try/catch with specific error messages and fallback UIs — the app never crashes silently" |

---

## What NOT to Build (Anti-Patterns to Avoid)

| Don't build this | Why not |
|-----------------|---------|
| State management library (Redux, Zustand) | Server Actions + RSC make them redundant for this scale. One less library to explain |
| Separate backend (Express, Fastify) | Next.js API Routes + Server Actions cover everything. A separate backend is just more deployment surface |
| Redis / caching layer | Supabase query caching + the prediction table cache are sufficient. Premature optimization |
| Complex CI/CD pipeline | A student project doesn't need GitHub Actions + Docker + Kubernetes. `npm run build` is enough |
| WebSockets / real-time | The cron runs daily. Real-time price updates add complexity without much value for this use case |
| Mobile app | A responsive web app covers desktop + mobile. React Native is a separate skillset to demonstrate separately |

---

## File Structure After Expansion

```
app/
├── actions.js                    # All server actions
├── layout.js                     # Root layout (NavBar + Toaster)
├── page.js                       # Dashboard
├── globals.css
├── alerts/
│   ├── page.js                   # Server: fetches alerts
│   └── AlertsDashboard.js        # Client: interactive UI
├── products/
│   └── [id]/
│       ├── page.js               # Server: fetches product
│       └── ProductDetail.js      # Client: interactive UI
├── insights/
│   └── page.js                   # ★ NEW: Deal Scores, predictions, savings
├── watchlist/
│   └── page.js                   # ★ NEW: Smart Watchlist
├── discover/
│   └── page.js                   # ★ NEW: Public trending deals
├── settings/
│   └── page.js                   # ★ NEW: User preferences
├── api/
│   ├── cron/
│   │   ├── check-prices/route.js # Existing daily price check
│   │   └── weekly-digest/route.js # ★ NEW: Weekly email summary
│   └── products/
│       └── [productId]/
│           ├── deal-analysis/route.js  # Existing AI analysis
│           └── predict/route.js        # ★ NEW: AI price prediction
└── auth/
    └── callback/route.js

components/
├── NavBar.js
├── ProductCard.js                # Updated: shows Deal Score
├── SetPriceAlert.js
├── AddProductForm.js
├── AuthButton.js
├── AuthModal.js
├── DealAnalyzer.js
├── PriceChart.js
├── PricePrediction.js            # ★ NEW
├── SavingsSummary.js             # ★ NEW
├── WatchlistCard.js              # ★ NEW
├── DealScoreBadge.js             # ★ NEW
└── ui/ (shadcn components)

lib/
├── utils.js
├── firecrawl.js
├── email.js                      # Updated: add weekly digest
└── deal-score.js                 # ★ NEW: pure scoring function

supabase/
├── migration_price_alerts.sql
├── migration_predictions.sql     # ★ NEW
├── migration_watchlist.sql       # ★ NEW
└── migration_settings.sql        # ★ NEW
```

---

## The 30-Second Interview Summary

> "NexPrice is a smart shopping assistant that tracks prices across e-commerce sites, predicts future drops using AI, and ranks products by a Deal Score I designed. It's built with Next.js 16, Supabase, and Gemini — no ORM, no external state library, just clean server components and raw SQL. Users have saved over $X collectively, and the weekly digest email keeps them engaged without logging in."

---

## Your Next Prompt

When you're ready to start building any phase, say:

> "Let's build [Phase A/B/C feature name]"

And I'll guide you through implementation — schema, server actions, UI, and edge cases — one step at a time.
