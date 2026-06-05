# NexPrice — Phase A Guide

## What We Built in Phase A

Four features that turn a basic price tracker into a smart shopping tool:

1. **Settings Page** — User preferences for email digests
2. **Savings Tracking** — Automatically calculates money saved by using price alerts
3. **Deal Score™** — A 0–100 score that tells you "should I buy now?"
4. **Insights Page** — Central hub showing savings totals, top deals by score, and recent alert history

---

## Feature 1: Settings Page

### What it does

Users can toggle a "Weekly Digest" email on/off and choose which day of the week to receive it. The page also shows their account info.

### How it works (3 parts)

#### Part 1: Database table (`supabase/migration_settings.sql`)

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  weekly_digest BOOLEAN DEFAULT true,
  digest_day TEXT DEFAULT 'sunday',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key points:**
- `UNIQUE` on `user_id` — each user gets exactly one settings row
- `ON DELETE CASCADE` — if user deletes account, settings go away
- RLS policy ensures users can only read/write their own settings

#### Part 2: Server actions (`app/actions.js`)

**`getUserSettings()`** — Fetch settings or auto-create them on first visit:

```js
export async function getUserSettings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Auto-create if first visit
  if (existing) return existing;
  const { data: created } = await supabase
    .from("user_settings")
    .insert({ user_id: user.id })
    .select()
    .single();
  return created;
}
```

**`updateUserSettings(formData)`** — Save preferences using `upsert`:

```js
export async function updateUserSettings(formData) {
  const weeklyDigest = formData.get("weekly_digest") === "on";
  const digestDay = formData.get("digest_day") || "sunday";

  await supabase.from("user_settings").upsert(
    { user_id: user.id, weekly_digest: weeklyDigest, digest_day: digestDay },
    { onConflict: "user_id" }  // update if exists, insert if not
  );
  revalidatePath("/settings");
}
```

**Why `onConflict: "user_id"`?** Supabase's `upsert` checks the unique constraint. If a row with this `user_id` exists, it updates. If not, it inserts. One line handles both create and update.

#### Part 3: UI (`app/settings/SettingsForm.js`)

A client component with a **custom toggle switch** (built with CSS, no library) and a **day-of-week pill selector**:

```jsx
// Custom toggle switch
<label>
  <input type="checkbox" className="sr-only peer" />
  <div className="w-10 h-6 rounded-full bg-muted-foreground/30 peer-checked:bg-accent" />
  <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white peer-checked:translate-x-4" />
</label>

// Day selector — buttons that highlight when selected
{DAYS.map(day => (
  <button onClick={() => setDigestDay(day.value)}
    className={digestDay === day.value
      ? "bg-accent text-white"
      : "bg-background text-muted-foreground"} >
    {day.label}
  </button>
))}
```

### Interview explanation

> "The Settings page uses Supabase's `upsert` with `onConflict` — a single operation that inserts or updates depending on whether the row exists. This avoids a separate `if exists then update else insert` pattern. The UI uses CSS-only toggle switches and conditional day pills; no external component library needed for either."

---

## Feature 2: Savings Tracking

### What it does

Every time a target price alert fires, NexPrice calculates how much money the user saved: `price when alert was created — price when alert triggered`.

### How it works (3 parts)

#### Part 1: New columns on `price_alerts` (`supabase/migration_savings.sql`)

```sql
ALTER TABLE price_alerts
  ADD COLUMN price_at_creation NUMERIC,
  ADD COLUMN savings NUMERIC;
```

**`price_at_creation`** = the product's current price the moment the user clicks "Set Alert"
**`savings`** = calculated later by the cron job when the alert triggers

#### Part 2: Capture price_at_creation (`app/actions.js`)

When the user creates an alert, we now fetch the product's current price and store it:

```js
// Before (Phase 0):
const { data: product } = await supabase
  .from("products")
  .select("id")          // only needed for ownership check
  .eq("id", productId)
  .single();

// After (Phase A):
const { data: product } = await supabase
  .from("products")
  .select("id, current_price")  // now also gets the price
  .eq("id", productId)
  .single();

// Store it when inserting the alert:
await supabase.from("price_alerts").insert({
  user_id: user.id,
  product_id: productId,
  target_price: price,
  price_at_creation: parseFloat(product.current_price),  // ★ NEW
});
```

**Why this matters:** Without `price_at_creation`, we'd have no baseline to calculate savings against. The "savings" number is what makes the feature feel real to users.

#### Part 3: Calculate savings in the cron job (`app/api/cron/check-prices/route.js`)

When the daily cron finds that `newPrice <= target_price` and sends the email:

```js
// Before (Phase 0):
await supabase.from("price_alerts").update({
  status: "triggered",
  triggered_at: new Date().toISOString(),
});

// After (Phase A):
const savings = alert.price_at_creation
  ? parseFloat(alert.price_at_creation) - newPrice
  : null;

await supabase.from("price_alerts").update({
  status: "triggered",
  triggered_at: new Date().toISOString(),
  savings: savings && savings > 0 ? savings : 0,  // ★ NEW
});
```

**Edge cases handled:**
- `price_at_creation` might be `null` (alerts created before this feature existed) → savings = 0
- Price might go below target but still be above the creation price → savings = 0 (no negative savings)

#### Part 4: Display savings in the UI

**On the Alerts Dashboard** (`app/alerts/AlertsDashboard.js`):

```jsx
// Inside AlertCard, next to the target price:
{isTriggered && alert.savings > 0 && (
  <span className="text-emerald-600 font-mono">
    · Saved {currency} {alert.savings.toFixed(2)}
  </span>
)}
```

**On the Product Card** (`components/SetPriceAlert.js`):

```jsx
// Inside triggered alert badges:
{alert.savings > 0 && (
  <span className="text-emerald-600">
    +{currency} {alert.savings.toFixed(2)}
  </span>
)}
```

### Interview explanation

> "Savings tracking works in two phases. When the user creates an alert, we snapshot the product's current price. When the cron job later triggers that alert, it subtracts the new price from the snapshot. The gap is the savings. This is stored directly on the alert record — no separate transactions table needed."

---

## Feature 3: Deal Score™

### What it is

A **0–100 score** that answers "should I buy this product right now?" using four weighted factors from price history.

### The Algorithm (`lib/deal-score.js`)

```js
export function calculateDealScore(currentPrice, priceHistory) {
  // Need at least 2 data points
  if (!priceHistory || priceHistory.length < 2) return null;

  const prices = priceHistory.map(p => parseFloat(p.price));
  const avg = average(prices);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  // Factor 1 (40%): How close to all-time low?
  const proximityToLow = ((max - currentPrice) / (max - min)) * 100;

  // Factor 2 (30%): How far below average?
  const discountFromAvg = currentPrice < avg
    ? ((avg - currentPrice) / avg) * 200
    : 100 - ((currentPrice - avg) / avg) * 200;

  // Factor 3 (20%): Is price trending down?
  const recent = prices.slice(-3);
  const trend = ((recent[0] - recent[recent.length-1]) / recent[0]) * 100;
  const trendScore = Math.max(0, Math.min(100, 50 + trend * 3));

  // Factor 4 (10%): How volatile is this product?
  const stdDev = standardDeviation(prices);
  const volatilityScore = Math.min(100, (stdDev / avg / 0.15) * 100);

  // Combine with weights
  return proximityToLow * 0.4 + discountFromAvg * 0.3
       + trendScore * 0.2 + volatilityScore * 0.1;
}
```

**Why these factors?**

| Factor | Weight | Why |
|--------|--------|-----|
| Distance from all-time low | 40% | The strongest signal — if we're at the lowest price ever, buy |
| Discount from average | 30% | Even if not at all-time low, being well below average is good |
| Recent trend | 20% | If the price has been dropping, it might drop more (or not) |
| Volatility | 10% | High volatility means more chances for deals — less urgency |

### Display (`components/DealScoreBadge.js`)

A client component that fetches price history and renders a color-coded badge:

```jsx
// Color tiers:
// 70-100 → green  ("Great deal")  → TrendingDown icon
// 50-69  → indigo ("Good deal")   → TrendingDown icon
// 30-49  → amber  ("Fair")        → Minus icon
// 0-29   → red    ("Not now")     → TrendingUp icon

<DealScoreBadge productId={product.id} currentPrice={product.current_price} />
```

The badge fetches its own data using `getPriceHistory(productId)`, computes the score, and caches it via React state.

### Where it appears

- **ProductCard** — next to the price
- **Product Detail page** — next to the current price heading

### Interview explanation

> "The Deal Score combines four signals into a single number using a weighted average. I chose these weights based on their predictive value: whether a price is near its all-time low is the strongest signal (40%), while volatility matters least (10%) because even volatile products need a reason to buy now. The score is computed client-side from cached price history, so it doesn't require any new API endpoints."

---

## Feature 4: Insights Page

### What it does

A central dashboard (`/insights`) that pulls together all Phase A features — savings totals, top Deal Score products, and recent triggered alert history — into one glanceable page. No new data or migrations required; it reuses existing tables.

### How it works (3 parts)

#### Part 1: Server action (`getInsights` in `app/actions.js`)

A single server action that joins three data sources:

```js
export async function getInsights() {
  // 1. Fetch all products for the user
  const { data: products } = await supabase
    .from("products")
    .select("id, name, image_url, current_price, currency")
    .eq("user_id", user.id);

  // 2. Fetch all alerts (reuses existing getAlerts())
  const alerts = await getAlerts();

  // 3. Fetch price history for Deal Score calculation
  const { data: history } = await supabase
    .from("price_history")
    .select("product_id, price")
    .in("product_id", productIds)
    .order("checked_at", { ascending: true });

  // 4. Group history by product, compute scores
  const historyByProduct = groupBy(history, "product_id");
  const productsWithScores = products.map(p => ({
    ...p,
    dealScore: calculateDealScore(p.current_price, historyByProduct[p.id] || [])
  }));

  // 5. Aggregate
  const topDeals = productsWithScores
    .filter(p => p.dealScore.score !== null)
    .sort((a, b) => b.dealScore.score - a.dealScore.score)
    .slice(0, 5);

  const totalSavings = triggeredAlerts.reduce(
    (sum, a) => sum + (parseFloat(a.savings) || 0), 0
  );

  return { totalSavings, topDeals, recentSavings, activeCount, ... };
}
```

**Key design choice:** Everything happens in one server action so the page component only calls a single `getInsights()` — no waterfall of separate fetches.

#### Part 2: Page component (`app/insights/page.js`)

A thin server component with auth guard:

```jsx
export default async function InsightsPage() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const insights = await getInsights();
  return <InsightsDashboard insights={insights} />;
}
```

This stays as a server component so the `redirect` happens before any client JavaScript runs.

#### Part 3: Client UI (`app/insights/InsightsDashboard.js`)

Three visual sections:

**Stats cards** — Four inline cards showing Total Savings, Active Alerts, Triggered Alerts, and Product Count. Uses the same card pattern as AlertsDashboard (colored icon container + large monospace number + uppercase tracking label).

```jsx
<StatCard
  label="Total Savings"
  value={totalSavingsFormatted}    // "$ 42.50"
  icon={Wallet}
  color="text-emerald-600 bg-emerald-50 border-emerald-200"
/>
```

**Top Deals grid** — A responsive 2–5 column grid of product cards showing image, name, current price, and a Deal Score badge. Each card links to the product detail page. Empty state shows a dashed placeholder.

```jsx
{topDeals.map(deal => (
  <Link href={`/products/${deal.id}`} className="...">
    <img src={deal.image_url} />
    <span>{deal.currency} {deal.current_price}</span>
    <DealScoreBadgeSmall score={deal.dealScore.score} tier={deal.dealScore.tier} />
  </Link>
))}
```

**Recent Savings list** — Triggered alerts with positive savings, sorted newest-first. Each row shows product thumbnail, target vs paid price, savings amount in green, and the trigger date.

```jsx
// Each savings row:
[Product thumbnail]
Product Name
Target: $X.XX · Paid: $Y.YY
                  +$Z.ZZ
                  Mar 15
```

#### Part 4: NavBar integration

Added to `components/NavBar.js` — appears between Dashboard and Alerts:

```jsx
{ href: "/insights", label: "Insights", icon: TrendingUp },
```

### Edge cases handled

- **No products yet** — Returns zero-filled stats and empty-state placeholders for both Top Deals and Recent Savings sections
- **No price history** — Products with < 2 price history entries have `dealScore: null` and are filtered out of Top Deals
- **No triggered alerts** — Recent Savings shows an empty state with guidance text
- **Different currencies** — Uses the first product's currency for the total savings stat; per-row savings use each alert's own product currency
- **Old alerts without `savings`** — Filtered with `parseFloat(a.savings) || 0`, so null/missing savings default to 0

### Interview explanation

> "The Insights page is a read-only aggregation layer — no new tables, no new migrations. It reuses the existing `getAlerts()` helper and `calculateDealScore()` function to assemble a single dashboard. The server action does all the work so the client component is just a display shell. Each section (stats, deals, savings) degrades gracefully with its own empty state if data is missing."

---

## Database Changes Summary

No new migration for Insights — it reuses existing `products`, `price_alerts`, and `price_history` tables.

Run these SQL files in Supabase (for the other Phase A features):

| File | What it does |
|------|-------------|
| `supabase/migration_settings.sql` | Creates `user_settings` table |
| `supabase/migration_savings.sql` | Adds `price_at_creation` + `savings` columns to `price_alerts` |

---

## Architecture Flow Diagrams

### Savings Flow

```
User sets alert           Cron checks price           Alert triggers
     │                         │                          │
     v                         v                          v
  Product                          newPrice <= target?
  current_price ──> price_at_creation (saved in DB)
                                          │
                                          v
                                  savings = price_at_creation - newPrice
                                          │
                                          v
                                  savings stored on alert record
                                          │
                                          v
                                  Displayed in AlertsDashboard
                                  and ProductCard badges
```

### Deal Score Flow

```
ProductCard mounts
     │
     v
getPriceHistory(productId)  ──>  [12.99, 11.50, 10.25, ...]
     │
     v
calculateDealScore(current, history)
     │
     ├── proximityToLow = ((max - current) / range) × 100  × 0.4
     ├── discountFromAvg = ...                              × 0.3
     ├── trendScore = ...                                   × 0.2
     └── volatilityScore = ...                              × 0.1
     │
     v
     Score: 0–100
     │
     v
     Badge: green/indigo/amber/red
```

### Insights Flow

```
User visits /insights
     │
     v
getInsights()  (single server action)
     │
     ├── products ──> all user's products
     ├── alerts   ──> all user's alerts (via getAlerts())
     └── history  ──> all price history for user's products
     │
     v
     For each product:
       calculateDealScore(current_price, history)
     │
     v
     Aggregate:
       ├── topDeals       (sort by score, take top 5)
       ├── totalSavings   (sum of triggered alert savings)
       └── recentSavings  (triggered alerts, newest first)
     │
     v
     InsightsDashboard
     ├── 4 stat cards
     ├── Top Deals grid (with Deal Score badges)
     └── Recent Savings list
```

---

## Key Patterns Used

| Pattern | Where | Why |
|---------|-------|-----|
| `upsert({...}, { onConflict })` | `updateUserSettings` | Single operation for insert-or-update |
| `.maybeSingle()` | `getUserSettings` | Returns `null` instead of throwing if no row found |
| Auto-create on first visit | `getUserSettings` | No separate "registration" step — settings row created when first viewed |
| Pure function | `calculateDealScore` | No dependencies, easy to unit test, works server or client |
| Lazy fetching | `DealScoreBadge` | Component fetches own data — parent doesn't need to know about it |
| Single-server-action pattern | `getInsights` | One action fetches products, alerts, and history — no client-side waterfall |
| Reuse helpers in new contexts | `getInsights` uses `getAlerts()` + `calculateDealScore()` | Insights page adds zero new DB queries beyond what already exists |
| Empty states per section | InsightsDashboard | Each section (stats/deals/savings) gracefully handles missing data independently |

---

## Interview Cheat Sheet

**Q: "How does the savings tracking work?"**
> "We snapshot the product price when the user creates an alert. When the cron job later triggers that alert, it subtracts the trigger price from the snapshot. This value is stored on the alert record and displayed in the UI. Alerts created before this feature just show $0 savings."

**Q: "How did you design the Deal Score?"**
> "I identified four signals that indicate a good deal — proximity to all-time low, discount from average, recent downward trend, and price volatility. I weighted them 40/30/20/10 based on how predictive each one is. The function is pure — same inputs always give the same output — which makes it testable and cacheable."

**Q: "Why did you use `upsert` for settings?"**
> "Supabase's upsert with `onConflict: 'user_id'` handles both insert and update in one database call. This avoids race conditions and simplifies the code — no need to check existence before deciding which operation to run."

**Q: "How do auto-created settings rows work?"**
> "When `getUserSettings` runs and finds no row, it inserts one with defaults before returning. This means the settings page always has data to display — no loading states or empty forms."

**Q: "How does the Insights page work without a new database migration?"**
> "It's a pure aggregation layer. It reuses the existing `getAlerts()` helper to get alerts with product data, and `calculateDealScore()` to score products from their price history. The server action does one additional query — fetching price history for all of the user's products in a single `SELECT ... IN (...)` — which is far more efficient than N individual queries. No new tables or columns needed."
