# NexPrice AI Deal Analyzer Feature Guide

This guide teaches you how to add an AI Deal Analyzer to NexPrice, your Next.js, Supabase, Firecrawl, and Gemini-powered price tracker.

The goal is simple:

When a user opens or expands a product, NexPrice looks at that product's price history and returns a short buying recommendation:

- Great time to buy
- Wait for a lower price
- Price is stable
- Price recently increased

This guide uses your current project style:

- Next.js App Router
- Supabase server helper from `utils/supabase/server.js`
- Existing `products` table
- Existing `price_history` table
- Existing `ProductCard` and `PriceChart` pattern
- Gemini REST API through `fetch`, so you do not need to install a new SDK

Official Gemini reference used: https://ai.google.dev/api

## Step 1: Overall Architecture

### What we are building

The feature has three parts:

1. Database data source: Supabase stores products and price history.
2. Backend API route: Next.js retrieves the product history, builds a compact prompt, calls Gemini, and returns a safe JSON response.
3. Frontend component: React calls the API and displays the recommendation inside each product card or product page.

### Request flow

```txt
User opens product card/page
        |
        v
React component calls /api/products/[productId]/deal-analysis
        |
        v
Next.js API checks logged-in user
        |
        v
Supabase fetches product + price_history
        |
        v
API calculates basic stats
        |
        v
Gemini receives a structured prompt
        |
        v
API returns recommendation JSON
        |
        v
Frontend renders the AI deal card
```

### Why do it this way?

We keep Gemini calls on the backend because:

- Your Gemini API key must never be exposed to the browser.
- The backend can verify that the product belongs to the logged-in user.
- The backend can limit the amount of data sent to Gemini.
- The backend can return a predictable JSON shape to the frontend.

### Alternative approaches

You could call Gemini from a server action instead of an API route. That would also work in Next.js, but an API route is easier to call from a client component with `fetch`.

You could also pre-generate analysis during the daily cron price check. That is cheaper for repeated page visits, but it means the recommendation might be slightly stale.

For a fresher developer, the API route approach is the clearest first version.

## Step 2: Required Data

The AI needs enough historical context to understand the price trend. It does not need the full product page HTML or every field in your database.

### Existing product data

From your `products` table:

```txt
id
user_id
name
url
current_price
currency
created_at
updated_at
```

### Existing price history data

From your `price_history` table:

```txt
id
product_id
price
currency
checked_at
```

### Useful calculated data

Before calling Gemini, calculate:

```txt
currentPrice
lowestPrice
highestPrice
averagePrice
firstPrice
previousPrice
priceChangeFromPrevious
priceChangePercentFromPrevious
priceChangeFromAverage
priceChangePercentFromAverage
historyCount
```

### Why calculate stats ourselves?

AI is good at explaining patterns, but your backend should calculate important numeric facts. This reduces hallucination and makes the prompt smaller.

For example, instead of asking Gemini:

```txt
Look at these 200 prices and calculate everything.
```

You give it:

```txt
Current price: 899
Average price: 960
Lowest price: 849
Previous price: 949
```

Then Gemini can focus on the recommendation.

### Alternative approaches

You could build the recommendation using only JavaScript rules without AI. That is faster and free, but less flexible in wording.

You could send the full history to Gemini and ask it to do all calculations. That is simpler to code, but more expensive and easier for the model to misread.

Best beginner-friendly approach: calculate stats in code, use Gemini for the final human-friendly recommendation.

## Step 3: Retrieve Price History from Supabase

You already have this server action in `app/actions.js`:

```js
export async function getPriceHistory(productId) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("product_id", productId)
      .order("checked_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get price history error:", error);
    return [];
  }
}
```

For the AI analyzer API, we will do something similar, but with one important addition: we will also verify that the product belongs to the logged-in user.

### API-side Supabase query

```js
const { data: product, error: productError } = await supabase
  .from("products")
  .select("id, user_id, name, current_price, currency")
  .eq("id", productId)
  .eq("user_id", user.id)
  .single();
```

Then retrieve price history:

```js
const { data: history, error: historyError } = await supabase
  .from("price_history")
  .select("price, currency, checked_at")
  .eq("product_id", productId)
  .order("checked_at", { ascending: true });
```

### Why check `user_id`?

Because product IDs are usually guessable or visible in the frontend. If the API only checks product ID, one user might request another user's analysis.

This line protects the data:

```js
.eq("user_id", user.id)
```

### Alternative approaches

You can rely fully on Supabase Row Level Security policies. That is recommended for production, but checking ownership in your API is still a good extra habit.

You can also fetch the product and history in one nested Supabase query if you define relationships. Separate queries are easier to understand for now.

## Step 4: Structure a Good Gemini Prompt

### What Gemini needs

A good prompt should include:

- Role: what the model is acting as
- Task: what output you want
- Data: the exact product stats
- Rules: what it should avoid
- Format: JSON only

### Why ask for JSON?

The frontend is easier to build when the API returns structured data:

```json
{
  "label": "Great time to buy",
  "confidence": "high",
  "summary": "The current price is below the average and close to the lowest tracked price.",
  "reasons": [
    "Current price is 8% below the average.",
    "Price dropped compared with the previous check."
  ]
}
```

If Gemini returns random paragraphs, your UI has to guess how to display them.

### Prompt builder code

Create this helper in the API route:

```js
function buildDealAnalyzerPrompt({ product, stats, recentHistory }) {
  return `
You are an AI deal analyst for an e-commerce price tracker called NexPrice.

Analyze the product's historical price data and return a short buying recommendation.

Allowed labels:
- Great time to buy
- Wait for a lower price
- Price is stable
- Price recently increased

Product:
- Name: ${product.name}
- Currency: ${product.currency}
- Current price: ${stats.currentPrice}

Stats:
- Lowest tracked price: ${stats.lowestPrice}
- Highest tracked price: ${stats.highestPrice}
- Average tracked price: ${stats.averagePrice}
- First tracked price: ${stats.firstPrice}
- Previous tracked price: ${stats.previousPrice}
- Price change from previous: ${stats.priceChangeFromPrevious}
- Price change percent from previous: ${stats.priceChangePercentFromPrevious}%
- Price change percent from average: ${stats.priceChangePercentFromAverage}%
- Number of price points: ${stats.historyCount}

Recent history:
${recentHistory
  .map((item) => `- ${item.checked_at}: ${item.currency} ${item.price}`)
  .join("\n")}

Rules:
- Do not invent prices.
- Do not guarantee future price drops.
- Keep the summary under 25 words.
- Use simple language for shoppers.
- Return JSON only.

JSON shape:
{
  "label": "one allowed label",
  "confidence": "low | medium | high",
  "summary": "short shopper-friendly explanation",
  "reasons": ["reason 1", "reason 2"]
}
`;
}
```

### Alternative approaches

You could use a shorter prompt and let Gemini infer more, but that increases inconsistency.

You could skip Gemini and hard-code labels with JavaScript rules. That is best for cost-sensitive apps, and you can still use Gemini later only to rewrite the explanation.

## Step 5: Backend API Implementation

Create this file:

```txt
app/api/products/[productId]/deal-analysis/route.js
```

Full code:

```js
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const DEFAULT_ANALYSIS = {
  label: "Price is stable",
  confidence: "low",
  summary: "Not enough price history yet. Keep tracking this product.",
  reasons: ["NexPrice needs more price checks before making a strong recommendation."],
};

function round(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function calculateStats(product, history) {
  const prices = history
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price));

  const currentPrice = Number(product.current_price);

  if (prices.length === 0) {
    prices.push(currentPrice);
  }

  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const firstPrice = prices[0];
  const previousPrice = prices.length > 1 ? prices[prices.length - 2] : currentPrice;

  const priceChangeFromPrevious = currentPrice - previousPrice;
  const priceChangePercentFromPrevious =
    previousPrice > 0 ? (priceChangeFromPrevious / previousPrice) * 100 : 0;

  const priceChangeFromAverage = currentPrice - averagePrice;
  const priceChangePercentFromAverage =
    averagePrice > 0 ? (priceChangeFromAverage / averagePrice) * 100 : 0;

  return {
    currentPrice: round(currentPrice),
    lowestPrice: round(lowestPrice),
    highestPrice: round(highestPrice),
    averagePrice: round(averagePrice),
    firstPrice: round(firstPrice),
    previousPrice: round(previousPrice),
    priceChangeFromPrevious: round(priceChangeFromPrevious),
    priceChangePercentFromPrevious: round(priceChangePercentFromPrevious),
    priceChangeFromAverage: round(priceChangeFromAverage),
    priceChangePercentFromAverage: round(priceChangePercentFromAverage),
    historyCount: prices.length,
  };
}

function buildDealAnalyzerPrompt({ product, stats, recentHistory }) {
  return `
You are an AI deal analyst for an e-commerce price tracker called NexPrice.

Analyze the product's historical price data and return a short buying recommendation.

Allowed labels:
- Great time to buy
- Wait for a lower price
- Price is stable
- Price recently increased

Product:
- Name: ${product.name}
- Currency: ${product.currency}
- Current price: ${stats.currentPrice}

Stats:
- Lowest tracked price: ${stats.lowestPrice}
- Highest tracked price: ${stats.highestPrice}
- Average tracked price: ${stats.averagePrice}
- First tracked price: ${stats.firstPrice}
- Previous tracked price: ${stats.previousPrice}
- Price change from previous: ${stats.priceChangeFromPrevious}
- Price change percent from previous: ${stats.priceChangePercentFromPrevious}%
- Price change percent from average: ${stats.priceChangePercentFromAverage}%
- Number of price points: ${stats.historyCount}

Recent history:
${recentHistory
  .map((item) => `- ${item.checked_at}: ${item.currency} ${item.price}`)
  .join("\n")}

Rules:
- Do not invent prices.
- Do not guarantee future price drops.
- Keep the summary under 25 words.
- Use simple language for shoppers.
- Return JSON only.

JSON shape:
{
  "label": "one allowed label",
  "confidence": "low | medium | high",
  "summary": "short shopper-friendly explanation",
  "reasons": ["reason 1", "reason 2"]
}
`;
}

function safeParseGeminiJson(text) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function validateAnalysis(value) {
  const allowedLabels = [
    "Great time to buy",
    "Wait for a lower price",
    "Price is stable",
    "Price recently increased",
  ];

  const allowedConfidence = ["low", "medium", "high"];

  if (!value || typeof value !== "object") return DEFAULT_ANALYSIS;

  return {
    label: allowedLabels.includes(value.label) ? value.label : DEFAULT_ANALYSIS.label,
    confidence: allowedConfidence.includes(value.confidence)
      ? value.confidence
      : DEFAULT_ANALYSIS.confidence,
    summary:
      typeof value.summary === "string" && value.summary.length <= 180
        ? value.summary
        : DEFAULT_ANALYSIS.summary,
    reasons: Array.isArray(value.reasons)
      ? value.reasons.filter((reason) => typeof reason === "string").slice(0, 3)
      : DEFAULT_ANALYSIS.reasons,
  };
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 300,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function GET(_request, { params }) {
  try {
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, user_id, name, current_price, currency")
      .eq("id", productId)
      .eq("user_id", user.id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { data: history, error: historyError } = await supabase
      .from("price_history")
      .select("price, currency, checked_at")
      .eq("product_id", productId)
      .order("checked_at", { ascending: true });

    if (historyError) {
      throw historyError;
    }

    if (!history || history.length < 2) {
      return NextResponse.json({
        analysis: DEFAULT_ANALYSIS,
        stats: calculateStats(product, history || []),
      });
    }

    const stats = calculateStats(product, history);
    const recentHistory = history.slice(-12);
    const prompt = buildDealAnalyzerPrompt({ product, stats, recentHistory });
    const geminiText = await callGemini(prompt);
    const parsed = safeParseGeminiJson(geminiText);
    const analysis = validateAnalysis(parsed);

    return NextResponse.json({
      analysis,
      stats,
    });
  } catch (error) {
    console.error("Deal analysis API error:", error);

    return NextResponse.json(
      {
        analysis: DEFAULT_ANALYSIS,
        error: "Could not generate deal analysis right now.",
      },
      { status: 500 }
    );
  }
}
```

### Environment variables

Add this to `.env`:

```env
GEMINI_API_KEY=your_google_ai_studio_api_key
GEMINI_MODEL=gemini-3.5-flash
```

The Gemini docs show that API keys are sent with the `x-goog-api-key` header and that `generateContent` is the standard full-response endpoint. Keeping `GEMINI_MODEL` in `.env` lets you change models without editing code.

### Why use REST instead of an SDK?

Your project does not currently include a Gemini package in `package.json`. REST keeps the feature lightweight.

### Alternative approaches

You can install the official Google Gen AI SDK later if you prefer typed helpers and SDK abstractions.

You can also add a `deal_analysis_cache` table and store the latest result, which reduces Gemini calls.

## Step 6: Frontend Integration

Create this file:

```txt
components\DealAnalyzer.js
```

Full code:

```js
"use client";

import { useEffect, useState } from "react";
import { Brain, Loader2, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function getIcon(label) {
  if (label === "Great time to buy") return TrendingDown;
  if (label === "Price recently increased") return TrendingUp;
  return Minus;
}

function getTone(label) {
  if (label === "Great time to buy") return "text-green-600 border-green-200 bg-green-50";
  if (label === "Wait for a lower price") return "text-amber-600 border-amber-200 bg-amber-50";
  if (label === "Price recently increased") return "text-red-600 border-red-200 bg-red-50";
  return "text-slate-600 border-slate-200 bg-slate-50";
}

export default function DealAnalyzer({ productId }) {
  const [analysis, setAnalysis] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAnalysis() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/products/${productId}/deal-analysis`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load deal analysis");
      }

      setAnalysis(result.analysis);
      setStats(result.stats);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalysis();
  }, [productId]);

  if (loading && !analysis) {
    return (
      <div className="w-full rounded-md border border-border bg-background p-4 text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        Analyzing deal...
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="w-full rounded-md border border-red-200 bg-red-50 p-4">
        <div className="text-sm font-medium text-red-600">AI analysis unavailable</div>
        <p className="mt-1 text-xs text-red-500">{error}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadAnalysis}
          className="mt-3"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!analysis) return null;

  const Icon = getIcon(analysis.label);
  const tone = getTone(analysis.label);

  return (
    <div className={`w-full rounded-md border p-4 ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Brain className="size-4" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold">AI Deal Analyzer</h4>
              <Badge variant="outline" className="text-[10px] uppercase">
                {analysis.confidence} confidence
              </Badge>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Icon className="size-4" />
              <span className="text-sm font-semibold">{analysis.label}</span>
            </div>

            <p className="mt-2 text-sm leading-relaxed">{analysis.summary}</p>

            {analysis.reasons?.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs">
                {analysis.reasons.map((reason) => (
                  <li key={reason}>- {reason}</li>
                ))}
              </ul>
            )}

            {stats && (
              <div className="mt-3 text-[11px] opacity-80">
                Average: {stats.averagePrice} | Lowest: {stats.lowestPrice} | Points:{" "}
                {stats.historyCount}
              </div>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={loadAnalysis}
          disabled={loading}
          className="shrink-0 text-xs"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : "Refresh"}
        </Button>
      </div>
    </div>
  );
}
```

### Add it to `ProductCard`

In `components\ProductCard.js`, import the component:

```js
import DealAnalyzer from "./DealAnalyzer";
```

Then render it inside the expanded chart area, near `PriceChart`:

```jsx
<CardFooter className="flex flex-col items-start border-t border-border/50 bg-muted/10 p-6 gap-4">
  <div className="font-semibold text-xs uppercase text-muted-foreground w-full mb-2 border-b border-border/50 pb-2">
    PRICE HISTORY
  </div>

  <DealAnalyzer productId={product.id} />
  <PriceChart productId={product.id} />
</CardFooter>
```

### Why put it near the chart?

The chart shows raw history. The analyzer explains that history. Keeping them together helps the user compare "what happened" with "what should I do?"

### Alternative approaches

You could create a full dynamic product details page:

```txt
app/products/[productId]/page.js
```

Then place `PriceChart` and `DealAnalyzer` there. That is cleaner if product cards become too crowded.

You could also load the analyzer only when the user clicks an "Analyze" button. That saves Gemini usage.

## Step 7: Error Handling

Good error handling matters because AI APIs can fail for normal reasons:

- Missing API key
- Invalid Gemini model name
- Rate limit
- Network failure
- Supabase query error
- User not logged in
- Product has too little history
- Gemini returns text that is not valid JSON

### Backend protections used

The API includes these protections:

```js
if (!user) {
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}
```

This prevents anonymous analysis requests.

```js
.eq("user_id", user.id)
```

This prevents users from analyzing products they do not own.

```js
if (!history || history.length < 2) {
  return NextResponse.json({
    analysis: DEFAULT_ANALYSIS,
    stats: calculateStats(product, history || []),
  });
}
```

This avoids wasting Gemini calls when there is not enough data.

```js
validateAnalysis(parsed)
```

This makes sure the frontend receives a safe shape even if Gemini returns something unexpected.

### Frontend protections used

The component has:

- loading state
- error state
- retry button
- empty state
- fallback if the API fails

### Alternative approaches

For production, add rate limiting. Without rate limiting, a user could repeatedly click Refresh and spend your Gemini quota.

You could also cache each analysis result for a few hours. For a price tracker, the analysis does not need to change every minute.

## Step 8: Suggested Improvements

### 1. Cache analysis in Supabase

Create a table:

```sql
create table deal_analyses (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  label text not null,
  confidence text not null,
  summary text not null,
  reasons jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

Then before calling Gemini, check whether an analysis already exists from the last few hours.

Why this helps:

- Faster page loads
- Lower AI cost
- Fewer rate-limit problems

### 2. Add a rule-based fallback

You can produce a simple recommendation without Gemini:

```js
function getRuleBasedAnalysis(stats) {
  if (stats.historyCount < 2) {
    return DEFAULT_ANALYSIS;
  }

  if (stats.priceChangePercentFromAverage <= -8) {
    return {
      label: "Great time to buy",
      confidence: "medium",
      summary: "The current price is meaningfully below the tracked average.",
      reasons: ["Current price is below average.", "This may be a good buying window."],
    };
  }

  if (stats.priceChangePercentFromPrevious >= 5) {
    return {
      label: "Price recently increased",
      confidence: "medium",
      summary: "The latest price is higher than the previous tracked price.",
      reasons: ["Price increased since the last check.", "Waiting may be better."],
    };
  }

  if (Math.abs(stats.priceChangePercentFromAverage) <= 3) {
    return {
      label: "Price is stable",
      confidence: "medium",
      summary: "The price is close to its recent average.",
      reasons: ["No major movement detected.", "The product is not unusually cheap right now."],
    };
  }

  return {
    label: "Wait for a lower price",
    confidence: "medium",
    summary: "The current price is not close to the lowest tracked price.",
    reasons: ["Better prices have appeared before.", "Waiting could be reasonable."],
  };
}
```

Then use Gemini only to improve the wording.

### 3. Store lowest price on the product row

For faster dashboards, add:

```txt
lowest_price
highest_price
average_price
last_analysis_label
```

This avoids recalculating everything on every request.

### 4. Analyze product category

Some products behave differently:

- Phones often drop after launches.
- Fashion changes by season.
- Groceries may be stable.
- Electronics often have sale cycles.

Later, you can include product category in the prompt.

### 5. Add confidence explanation

Confidence should depend on data quality:

```txt
1 price point: low confidence
2-4 price points: medium confidence
5+ price points across several days: high confidence
```

This makes the UI more honest.

## Final Beginner Mental Model

Do not think of AI as replacing your app logic.

Think of your app like this:

```txt
Supabase = source of truth
JavaScript = calculations and safety
Gemini = human-friendly explanation
React = user experience
```

That is the right architecture for this feature.

The most important rule: keep secrets and database access on the server, and send only clean, useful results to the browser.

