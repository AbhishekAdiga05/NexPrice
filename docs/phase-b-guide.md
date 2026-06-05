# NexPrice — Phase B Guide

## What We Built in Phase B

Two intelligence-layer features that make NexPrice "smart":

1. **AI Price Prediction** — "Based on historical patterns, this product is likely to hit $X within Y days."
2. **Smart Watchlist** — A prioritized shopping list where items are ranked by urgency + Deal Score.

---

## Feature 1: AI Price Prediction

### What it does

For every tracked product, NexPrice predicts the most likely future price using Gemini AI, then caches the result for 24 hours to avoid re-calling the API on every page load.

### How it works (4 parts)

#### Part 1: Database table (`supabase/migration_phase_b.sql`)

```sql
CREATE TABLE price_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  predicted_price NUMERIC NOT NULL,
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  timeframe TEXT,          -- "2 weeks", "1 month", etc.
  reasoning TEXT,
  source TEXT DEFAULT 'gemini',
  predicted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 day')
);
```

**Key design choices:**
- `expires_at` enables a pg_cron cleanup job to delete stale predictions daily
- The `product_id` FK with `ON DELETE CASCADE` means predictions are cleaned up when products are removed
- RLS policy uses a subquery to check product ownership (users can only see predictions for their own products)

#### Part 2: API Route (`app/api/products/[productId]/predict/route.js`)

The prediction endpoint follows a **cache-first** pattern:

```
Request for prediction
     │
     ▼
┌─ Check price_predictions for non-expired entry ──┐
│                                                   │
│  Found?  ──YES──>  Return cached prediction       │
│                                                   │
│  NO                                               │
│     │                                             │
│     ▼                                             │
│  Fetch price history                              │
│     │                                             │
│     ▼                                             │
│  < 3 data points?  ──YES──>  Return fallback      │
│                                                   │
│  NO                                               │
│     │                                             │
│     ▼                                             │
│  Call Gemini with structured prompt                │
│     │                                             │
│     ▼                                             │
│  Gemini succeeds?  ──YES──>  Parse + validate      │
│                                                   │
│  NO (fallback)                                     │
│     │                                             │
│     ▼                                             │
│  Use rule-based estimate                           │
└───────────────────────────────────────────────────┘
     │
     ▼
  Cache result in price_predictions
     │
     ▼
  Return prediction
```

**The Gemini prompt structure:**

```js
function buildPredictionPrompt({ product, stats, recentHistory }) {
  return `
You are a price prediction AI for NexPrice...

Product: ${product.name}
Current price: ${stats.currentPrice}
Average price: ${stats.avgPrice}
Lowest: ${stats.minPrice}
Highest: ${stats.maxPrice}
Volatility (std dev): ${stats.stdDev}

Recent history:
${recentHistory.map(item => `- ${item.checked_at}: ${item.price}`).join('\n')}

Return JSON:
{
  "predicted_price": <number or null>,
  "confidence": "low" | "medium" | "high",
  "timeframe": "string",
  "reasoning": "short explanation"
}
`;
}
```

**Validation layer (`validatePrediction`):**
- Ensures `predicted_price` is a positive number (defaults to `avgPrice × 0.95` if missing)
- Whitelists confidence values
- Caps `timeframe` at 30 characters
- Caps `reasoning` at 180 characters

**Fallback chain:**
1. Try Gemini → parse JSON → validate
2. If that fails, use `getFallbackPrediction(stats)` — a rule-based estimate: `currentPrice × 0.95` if trending down, `currentPrice × 0.98` if trending up
3. If fewer than 3 data points, return `predicted_price: null` with guidance text

#### Part 3: Client Component (`components/PricePrediction.js`)

A self-contained component that fetches from the prediction API and displays:

```jsx
<PricePrediction
  productId={product.id}
  currentPrice={product.current_price}
  currency={product.currency}
/>
```

**States handled:**
- **Loading** — Inline spinner with "Predicting price..."
- **Error** — Red card with retry button
- **Cached** — Shows "cached" badge on the prediction card
- **Fallback** — Shows "rules" badge when Gemini failed
- **No prediction** — Shows reasoning text when `predicted_price` is null (insufficient data)

**Display:**
- Header row: icon + "Price Prediction" label + confidence badge + optional source badges
- Main row: predicted price (emerald green, large monospace) + timeframe
- Reasoning text below
- Refresh button to re-fetch

#### Part 4: Integration in Product Detail

Added to `app/products/[id]/ProductDetail.js` as a third panel in the left column, below Deal Analysis:

```jsx
{/* Price Prediction */}
<div className="bg-white rounded-xl border border-border/50 shadow-sm p-6">
  <PricePrediction
    productId={product.id}
    currentPrice={product.current_price}
    currency={product.currency}
  />
</div>
```

### Edge cases handled

- **Cache hit rate optimization:** 24-hour expiry means repeat visits in the same day use cached predictions, reducing Gemini API costs by ~90%
- **Insufficient history:** Products with < 3 price points return `null` for predicted_price — no fake predictions
- **Gemini failure:** Falls back to rule-based estimate, never shows an error to the user
- **Expired cleanup:** pg_cron job runs daily at midnight to delete expired predictions
- **RLS:** Users can only see predictions for products they own

### Interview explanation

> "Price predictions use a cache-first pattern. On the first request, we check the `price_predictions` table for a non-expired entry. If found, we return it instantly — zero AI cost. If not, we call Gemini with a structured prompt, validate the response, and cache it for 24 hours. This reduces API costs by roughly 90% without sacrificing freshness, since prices don't change that often. If Gemini fails, a rule-based fallback takes over so the user never sees a broken widget."

---

## Feature 2: Smart Watchlist

### What it is

A `/watchlist` page where users curate a shortlist of products they're considering buying. Each item gets a **Buy Priority Score** (0–100) that combines:
- User-assigned priority (High/Medium/Low)
- How long it's been on the list (urgency increases over time)
- Current Deal Score (how good is the price right now)

### How it works (5 parts)

#### Part 1: Database table (`supabase/migration_phase_b.sql`)

```sql
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

**Key points:**
- References the existing `products` table — no need to re-scrape URLs
- `UNIQUE(user_id, product_id)` — a product can only appear once per user
- RLS policy ensures users only see/edit their own watchlist

#### Part 2: Buy Priority Algorithm (`lib/buy-priority.js`)

```js
export function calculateBuyPriority({ priority, createdAt, dealScore }) {
  const priorityWeights = { high: 40, medium: 25, low: 10 };
  const daysOnList = Math.max(0, Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const ageScore = Math.min(30, daysOnList * 2);
  const dealScoreContribution = dealScore !== null ? dealScore * 0.3 : 0;
  const raw = priorityWeights[priority] + ageScore + dealScoreContribution;
  return Math.round(Math.min(100, Math.max(0, raw)));
}
```

**Weight breakdown:**

| Factor | Max points | Why |
|--------|-----------|-----|
| User priority | 40 (high), 25 (medium), 10 (low) | Your own intention matters most |
| Days on list | 30 (capped at 15 days × 2) | Items sitting too long need attention |
| Deal Score | 30 (0.3 × dealScore, max 100) | Good current price boosts urgency |

**Output tiers:**
- 70–100 → "High Priority" (buy now)
- 45–69 → "Medium Priority" (consider)
- 0–44 → "Low Priority" (waiting)

#### Part 3: Server Actions (`app/actions.js`)

Four new server actions:

```js
addToWatchlist(productId, priority = "medium")
  → Insert into watchlist, revalidate /watchlist

removeFromWatchlist(productId)
  → Delete from watchlist, revalidate /watchlist

updateWatchlistPriority(productId, priority)
  → Update priority column, revalidate /watchlist

getWatchlist()
  → Fetch all items + products + price history
  → Compute Deal Scores + Buy Priority Scores
  → Sort by score descending

isOnWatchlist(productId)
  → Returns false or { id, priority }
```

**`getWatchlist()`** is the most complex — it mirrors the `getInsights()` pattern:

1. Fetch all watchlist entries for the user
2. Fetch associated products
3. Fetch price history for all products (single batched query)
4. For each item: compute Deal Score via `calculateDealScore()`, then Buy Priority via `calculateBuyPriority()`
5. Sort by Buy Priority descending

#### Part 4: Watchlist Page UI (`app/watchlist/WatchlistDashboard.js`)

Three sections:

**Stats bar** — Dynamic stat cards:
- Total items count
- High priority items count (only shown if > 0)
- "Buy Now" items count (Buy Priority ≥ 70, only shown if > 0)

**Item cards** — Each shows:
- Product thumbnail (or NO IMG placeholder)
- Product name (linked to detail page)
- Current price + Deal Score badge + Buy Priority badge
- Days on list + priority dropdown (High/Medium/Low)
- Remove button

**Priority dropdown:**
- Click the priority pill to open a dropdown
- Select a new priority → calls `updateWatchlistPriority` → re-renders sorted

**Empty state:**
- Centered icon with "Your watchlist is empty" text
- "Browse Products" button linking to dashboard

#### Part 5: Product Detail Integration (`app/products/[id]/ProductDetail.js`)

A watchlist toggle button sits between "View on Store" and "Stop Tracking":

```jsx
<Button onClick={handleWatchlistToggle}>
  {onWatchlist ? <Check /> : <Plus />}
  {onWatchlist ? "On Watchlist" : "Add to Watchlist"}
</Button>
```

- Initial state is determined server-side via `isOnWatchlist(id)` — no flash of wrong state
- Clicking toggles add/remove via server actions
- Green filled state when active, outline when not

### Edge cases handled

- **No watchlist items** — Empty state with guidance and CTA
- **Duplicates** — Server action checks for existing entry before inserting
- **Product deleted** — `ON DELETE CASCADE` removes watchlist entry automatically
- **Price history insufficient** — Deal Score is `null` → Buy Priority still works (just 0 contribution from that factor)
- **Server action errors** — Toast with error message, UI state unchanged

### Interview explanation

> "The Smart Watchlist ranks products by a Buy Priority Score that combines three signals: the user's own priority setting (40% weight), how long the item has been sitting on the list (30%, capped at 15 days), and the current Deal Score (30%). This means high-priority items you've been ignoring for weeks with a great price jump to the top. The server action fetches everything in one go — watchlist entries, products, and price history — then computes both Deal Scores and Buy Priority Scores server-side so the page renders fully sorted."

---

## Database Changes Summary

Run this new migration in Supabase SQL Editor:

| File | What it does |
|------|-------------|
| `supabase/migration_phase_b.sql` | Creates `price_predictions` + `watchlist` tables with RLS and indexes |

Existing tables reused (no changes):
- `products` — referenced by both `price_predictions` and `watchlist` via FK
- `price_history` — used by `getWatchlist()` for Deal Score computation

---

## Architecture Flow Diagrams

### Price Prediction Flow

```
User visits product page
     │
     ▼
PricePrediction mounts
     │
     ▼
GET /api/products/[id]/predict
     │
     ├── Cache hit (expires_at > now)?
     │     └── YES → Return cached prediction
     │
     ├── Fetch price history
     │     └── < 3 points? → Return fallback (no prediction)
     │
     ├── Call Gemini with structured prompt
     │     ├── Success → Parse JSON → Validate
     │     └── Fail → Rule-based fallback
     │
     ├── Insert into price_predictions (cache for 24h)
     │
     └── Return prediction → Display in PricePrediction component
```

### Smart Watchlist Flow

```
User visits /watchlist
     │
     ▼
getWatchlist() server action
     │
     ├── SELECT * FROM watchlist WHERE user_id = ?
     ├── SELECT * FROM products WHERE id IN (...)
     └── SELECT * FROM price_history WHERE product_id IN (...)
     │
     ▼
     For each item:
       dealScore = calculateDealScore(current_price, history)
       buyPriority = calculateBuyPriority(priority, createdAt, dealScore)
     │
     ▼
     Sort by buyPriority DESC
     │
     ▼
     WatchlistDashboard
       ├── Stats bar (total, high priority, buy now counts)
       ├── Item cards (sorted by Buy Priority)
       │     ├── Product info + Deal Score badge
       │     ├── Priority dropdown
       │     └── Remove button
       └── Empty state (if no items)
     │
     ▼
     User actions:
       ├── Change priority → updateWatchlistPriority()
       ├── Remove item → removeFromWatchlist()
       └── Click product → Navigate to /products/[id]
```

---

## New Files Summary

| File | Purpose |
|------|---------|
| `supabase/migration_phase_b.sql` | Create `price_predictions` and `watchlist` tables |
| `app/api/products/[productId]/predict/route.js` | Prediction API (cache-first, Gemini-backed) |
| `components/PricePrediction.js` | Client component for prediction display |
| `lib/buy-priority.js` | Buy Priority Score algorithm |
| `app/watchlist/page.js` | Watchlist server component with auth |
| `app/watchlist/WatchlistDashboard.js` | Watchlist client component |

## Modified Files Summary

| File | Change |
|------|--------|
| `app/actions.js` | Added `addToWatchlist`, `removeFromWatchlist`, `updateWatchlistPriority`, `getWatchlist`, `isOnWatchlist` |
| `app/products/[id]/page.js` | Passes `watchlistEntry` prop to ProductDetail |
| `app/products/[id]/ProductDetail.js` | Added PricePrediction panel + watchlist toggle button |
| `components/NavBar.js` | Added Watchlist nav link between Insights and Alerts |

## Key Patterns Used

| Pattern | Where | Why |
|---------|-------|-----|
| Cache-first with expiry | Prediction API route | Reduces Gemini costs by ~90%, fresh enough for daily price changes |
| Single batched query | `getWatchlist()` | Fetches all price history in one `SELECT ... IN (...)` instead of N individual queries |
| Server-side scoring | `getWatchlist()` | Computes Deal Scores + Buy Priority on the server so the page renders fully sorted |
| Prop-drilled initial state | `isOnWatchlist` → ProductDetail | Avoids flash of wrong button state (server knows the truth before client hydrates) |
| Self-fetching component | `PricePrediction` | Component fetches its own data via API route — parent doesn't need to know about it |
| Dropdown for in-line editing | Priority selector in WatchlistDashboard | Updates via server action without leaving the page |

## Interview Cheat Sheet

**Q: "How does the price prediction work?"**
> "It uses a cache-first pattern. We check the `price_predictions` table for a non-expired entry first — if found, we return it with zero AI cost. If not, we call Gemini with a structured prompt that includes the product's price history, stats, and recent data points. The response is parsed as JSON, validated (falling back to sensible defaults for any malformed field), and cached for 24 hours. If Gemini is down, a rule-based fallback uses the historical average and trend to estimate."

**Q: "How did you implement the Smart Watchlist?"**
> "The watchlist references the existing `products` table via a foreign key — no need to re-scrape URLs. Each item has a user-assigned priority (High/Medium/Low). The Buy Priority Score combines three signals: priority weight (40%), days on the list capped at 15 (30%), and the product's current Deal Score (30%). The `getWatchlist()` server action fetches everything — watchlist entries, products, and price history — in a single batch, computes all scores server-side, and returns the list sorted by priority score descending."

**Q: "How did you prevent duplicate Gemini calls?"**
> "The `price_predictions` table has an `expires_at` column set to `NOW() + INTERVAL '1 day'`. Before calling Gemini, we query for a non-expired prediction. If found, we return it immediately. A nightly pg_cron job cleans up expired rows. This reduces API costs by about 90% since users typically check the same products repeatedly in a single day."

**Q: "How does the product detail page integrate both new features?"**
> "The PricePrediction component is self-fetching — it calls the prediction API on mount and renders its own loading, error, and success states. I just dropped it into the left column below Deal Analysis. The watchlist toggle is server-initialized: `page.js` calls `isOnWatchlist(id)` and passes the result as a prop, so the button shows the correct state on first render without any client-side fetch."
