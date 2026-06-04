# NexPrice — Target Price Alert Feature

## Overview

Users want to be notified the *moment* a product they're tracking drops to a price they're willing to pay. The existing price-drop alert fires *any time* the price drops (an event). A target price alert lets the user define a specific threshold and only fires when the price crosses *that line* (a condition).

---

## Step 1 — Database Schema: The `price_alerts` Table

### Why a new table?

Each product can have multiple alerts (different target prices set at different times). That's a one-to-many relationship — the correct modeling choice is a separate table with a foreign key back to `products`. We also need to track alert state so we don't send duplicate emails.

### The schema

```sql
CREATE TABLE price_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  target_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'triggered', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  triggered_at TIMESTAMPTZ,
  CHECK (target_price > 0)
);

-- Speed up the cron job's lookup: "find all active alerts"
CREATE INDEX idx_price_alerts_active
  ON price_alerts (product_id, status)
  WHERE status = 'active';

-- RLS: users see only their own alerts
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own alerts"
  ON price_alerts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Key decisions explained

| Decision | Why |
|---|---|
| `status TEXT` with a `CHECK` constraint | Enforces valid states at the database level — no orphan "maybe" states |
| Index on `(product_id, status) WHERE status = 'active'` | The cron job will query this exact slice every run. A partial index is smaller and faster than a full index |
| `ON DELETE CASCADE` on both FK columns | If a user deletes their account or a product, their alerts disappear automatically |
| `CHECK (target_price > 0)` | A zero or negative price is meaningless. Enforce it in the DB, not just in the UI |
| `triggered_at` | Useful for analytics and showing the user "this alert fired on March 3" |

### How to apply it

Run this in the Supabase SQL Editor (or add it to your migration scripts). There's no ORM migration tool in this project, so raw SQL executed once is the approach.

---

## Step 2 — UI: The Alert Creation Form

### Where to put it?

The most intuitive place is inside `ProductCard.js`, alongside the existing CHART / VIEW / REMOVE buttons. We'll add a new button that opens a small form to set a target price.

### Conceptual approach

We'll use a **server action** (matching the existing `addProduct` / `deleteProduct` pattern in `app/actions.js`). The form will be a controlled client component that calls the action and shows a toast on success/error.

### The server action (`app/actions.js`)

Add alongside existing actions:

```js
export async function setPriceAlert(productId, targetPrice) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify the product belongs to this user
  const { data: product } = await supabase
    .from("products")
    .select("id, current_price")
    .eq("id", productId)
    .eq("user_id", user.id)
    .single();

  if (!product) return { error: "Product not found" };

  const price = parseFloat(targetPrice);
  if (isNaN(price) || price <= 0) {
    return { error: "Target price must be a positive number" };
  }

  const { error } = await supabase.from("price_alerts").insert({
    user_id: user.id,
    product_id: productId,
    target_price: price,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true, message: "Alert set! We'll email you when the price drops." };
}

export async function removePriceAlert(alertId) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("price_alerts")
    .update({ status: "disabled" })
    .eq("id", alertId);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}
```

### Why server actions instead of an API route?

Server actions are the idiomatic Next.js App Router way to mutate data from a client component. They handle progressive enhancement, work without JavaScript, and keep the logic colocated. An API route would be overkill for a form submission that re-renders the same page.

### The client component (`components/SetPriceAlert.js`)

A small controlled form:

```jsx
"use client";

import { useState } from "react";
import { setPriceAlert } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Target, Loader2 } from "lucide-react";

export default function SetPriceAlert({ productId, currentPrice, currency }) {
  const [targetPrice, setTargetPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await setPriceAlert(productId, targetPrice);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
      setTargetPrice("");
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {currency}
        </span>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Target price"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          className="pl-6 h-8 text-xs"
          required
        />
      </div>
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={submitting || !targetPrice}
        className="gap-1 text-xs h-8"
      >
        {submitting ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Target className="size-3" />
        )}
        SET
      </Button>
    </form>
  );
}
```

### Integrating into `ProductCard.js`

Add a line of buttons in the card footer, or below the existing three-button row. The exact placement is a UI decision — what matters is that `product.id`, `product.current_price`, and `product.currency` are passed down.

---

## Step 3 — Validation: Defense in Depth

### Why validate in three places?

| Layer | Purpose |
|---|---|
| **Browser / form** | Instant UX feedback — no round trip |
| **Server action** | Trust boundary — the request could come from curl, not your UI |
| **Database constraint** | Last resort — even if your code has a bug, the DB won't accept bad data |

### What to validate

1. **targetPrice is a positive number** — `parseFloat`, check `> 0`
2. **Product belongs to the user** — `eq("user_id", user.id)` prevents one user setting alerts on another's product
3. **No duplicate active alerts** (optional, but good UX) — check if an active alert already exists for this product + user before inserting

### The duplicate check (server action addition)

```js
// Before inserting, check for existing active alert
const { data: existing } = await supabase
  .from("price_alerts")
  .select("id, target_price")
  .eq("user_id", user.id)
  .eq("product_id", productId)
  .eq("status", "active")
  .maybeSingle();

if (existing) {
  return {
    error: `You already have an active alert at ${existing.target_price}`,
  };
}
```

---

## Step 4 — Backend: Fetching Alerts for the UI

The user needs to *see* their active alerts on the product card. We need a way to fetch them.

### Option A: Extend `getProducts()` to include alerts

```js
export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      price_alerts (
        id,
        target_price,
        status,
        created_at,
        triggered_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
```

Supabase's `.select()` supports **Joins via nested resource embedding** — the `price_alerts` key in the select string tells Supabase to include matching rows from the related table. Since `products.id → price_alerts.product_id` is a foreign key, Supabase infers the relationship automatically.

### Why this approach?

A single query instead of N+1. If the user has 20 products, making 20 separate alert queries would be wasteful. The join happens in the database, which is optimized for this.

---

## Step 5 — Cron Job Integration: The Core Logic

### Where does the check happen?

The existing cron endpoint (`app/api/cron/check-prices/route.js`) already iterates over every product, scrapes the current price, and handles price-drop alerts. We extend it to also check target price alerts.

### The conceptual flow

```
For each product after scraping new price:

  1. Fetch all ACTIVE alerts for this product
  2. For each alert:
     a. If newPrice <= alert.target_price → alert is TRIGGERED
     b. Send email
     c. Update status to 'triggered' + set triggered_at
```

### Why check after scraping?

The cron job already has the new price in hand. Adding the alert check here avoids a second, separate pass over all products. It's the same `for` loop — just an extra block of code inside it.

### Code addition (inside the product loop, after `oldPrice !== newPrice` block)

```js
// After updating product price and inserting price_history...

// Check target price alerts
const { data: activeAlerts } = await supabase
  .from("price_alerts")
  .select("*")
  .eq("product_id", product.id)
  .eq("status", "active");

for (const alert of activeAlerts || []) {
  if (newPrice <= alert.target_price) {
    // Fetch user email
    const { data: { user } } = await supabase.auth.admin.getUserById(product.user_id);

    if (user?.email) {
      const emailResult = await sendTargetPriceAlert(
        user.email,
        product,
        alert.target_price,
        newPrice,
      );

      if (emailResult.success) {
        // Mark alert as triggered
        await supabase
          .from("price_alerts")
          .update({
            status: "triggered",
            triggered_at: new Date().toISOString(),
          })
          .eq("id", alert.id);

        results.alertsSent++;
      }
    }
  }
}
```

### Edge cases to consider

| Scenario | Handling |
|---|---|
| Price exactly equals target | Use `<=` so the alert fires if the price *reaches* the target |
| Price drops below target, then goes back up | The alert has already fired (status = triggered). No re-fire |
| Multiple alerts on the same product | Each is checked independently |
| User deletes product mid-scan | The DELETE CASCADE already removed the alerts. The scan loaded product IDs at the start, so this race is unlikely but benign — the update will affect 0 rows |
| Alert was manually disabled between scrape and check | The WHERE status='active' filter handles this |

---

## Step 6 — Email Notification Logic

### A new email function

Pattern-match `sendPriceDropAlert` in `lib/email.js` but with different content:

```js
export async function sendTargetPriceAlert(userEmail, product, targetPrice, currentPrice) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: userEmail,
      subject: `🎯 Target Price Reached: ${product.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: ...">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎯 Target Price Reached!</h1>
            </div>

            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

              ${product.image_url ? `
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="${product.image_url}" alt="${product.name}" style="max-width: 200px; height: auto; border-radius: 8px; border: 1px solid #e5e7eb;">
                </div>
              ` : ""}

              <h2 style="color: #1f2937; margin-top: 0;">${product.name}</h2>

              <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #065f46;">
                  <strong>Price has dropped to your target!</strong>
                </p>
              </div>

              <table style="width: 100%; margin: 20px 0;">
                <tr>
                  <td style="padding: 10px; background: #f9fafb; border-radius: 4px;">
                    <div style="font-size: 14px; color: #6b7280;">Your Target Price</div>
                    <div style="font-size: 24px; color: #10b981; font-weight: bold;">
                      ${product.currency} ${targetPrice.toFixed(2)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px;">
                    <div style="font-size: 14px; color: #6b7280;">Current Price</div>
                    <div style="font-size: 32px; color: #059669; font-weight: bold;">
                      ${product.currency} ${currentPrice.toFixed(2)}
                    </div>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${product.url}"
                   style="display: inline-block; background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Buy Now →
                </a>
              </div>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                <p>You set this price alert on Price Tracker.</p>
                <p style="margin-top: 10px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #10b981; text-decoration: none;">
                    View All Tracked Products
                  </a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email error:", error);
    return { error: error.message };
  }
}
```

### Why a separate function?

- Different subject line, different hero color, different messaging
- `sendPriceDropAlert` uses amber/orange branding (a general drop). This uses green branding (a goal reached)
- Keeps the mental model clean — one concern per function

---

## Step 7 — Testing

### No test framework exists, so manual testing

**Test 1: Create an alert**
1. Sign in, add a product
2. Set the target price slightly *above* the current price
3. Refresh — verify the alert appears in the UI (visible if you show active alerts in the card)
4. Check the `price_alerts` table in Supabase — row exists with `status = 'active'`

**Test 2: Alert fires**
1. Set a target price *below* the current price (or use a product whose price will drop)
2. Trigger the cron job manually:
   ```
   curl -X POST http://localhost:3000/api/cron/check-prices \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
3. Verify:
   - The alert's status changes to `triggered`
   - `triggered_at` is set
   - An email arrives (check your inbox or Resend dashboard)
4. Run the cron again — the alert should NOT fire again (idempotency)

**Test 3: Validation**
1. Try setting a target price of 0 — should be rejected
2. Try setting a target price of -5 — should be rejected
3. Try setting an alert on another user's product (by manually calling the server action with a different productId) — should be rejected

**Test 4: RLS**
1. Sign in as User A, create an alert
2. Sign in as User B, try to query `price_alerts` from the browser — should return empty

---

## Summary: Full File Change List

| File | Change |
|---|---|
| (Supabase SQL Editor) | Create `price_alerts` table + index + RLS |
| `app/actions.js` | Add `setPriceAlert()` and `removePriceAlert()` server actions. Extend `getProducts()` to include `price_alerts` |
| `components/SetPriceAlert.js` | New client component — controlled form with validation |
| `components/ProductCard.js` | Import and render `SetPriceAlert`, display active alerts |
| `lib/email.js` | Add `sendTargetPriceAlert()` function |
| `app/api/cron/check-prices/route.js` | After price update, query `price_alerts` and trigger + email if target reached |

---

## Next Steps Beyond This Feature

Once this works, consider:

1. **Alert management UI** — a list of all alerts with the ability to edit target price or re-enable a triggered alert
2. **Multiple alerts per product** — let users set tiered targets (I want alerts at $50, $40, and $30)
3. **Email preferences** — opt out of certain alert types
4. **Push notifications** — add web push or a mobile companion
