import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const DEFAULT_ANALYSIS = {
  label: "Price is stable",
  confidence: "low",
  summary: "Not enough price history yet. Keep tracking this product.",
  reasons: [
    "NexPrice needs more price checks before making a strong recommendation.",
  ],
};

function round(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function calculateStats(product, history) {
  const historyPrices = history
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price));

  const currentPrice = Number(product.current_price);
  const prices = historyPrices.length > 0 ? historyPrices : [currentPrice];

  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const averagePrice =
    prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const firstPrice = prices[0];
  const previousPrice =
    prices.length > 1 ? prices[prices.length - 2] : currentPrice;

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
    label: allowedLabels.includes(value.label)
      ? value.label
      : DEFAULT_ANALYSIS.label,
    confidence: allowedConfidence.includes(value.confidence)
      ? value.confidence
      : DEFAULT_ANALYSIS.confidence,
    summary:
      typeof value.summary === "string" && value.summary.length <= 180
        ? value.summary
        : DEFAULT_ANALYSIS.summary,
    reasons: Array.isArray(value.reasons)
      ? value.reasons
          .filter((reason) => typeof reason === "string")
          .slice(0, 3)
      : DEFAULT_ANALYSIS.reasons,
  };
}

function getRuleBasedAnalysis(stats) {
  if (stats.historyCount < 2) return DEFAULT_ANALYSIS;

  if (stats.priceChangePercentFromPrevious >= 5) {
    return {
      label: "Price recently increased",
      confidence: "medium",
      summary: "The price moved up since the last tracked check.",
      reasons: [
        "The latest price is higher than the previous price.",
        "Waiting may be better if you are not in a hurry.",
      ],
    };
  }

  if (stats.priceChangePercentFromAverage <= -8) {
    return {
      label: "Great time to buy",
      confidence: "medium",
      summary: "The current price is clearly below the tracked average.",
      reasons: [
        "The current price is below the average tracked price.",
        "This may be a useful buying window.",
      ],
    };
  }

  if (Math.abs(stats.priceChangePercentFromAverage) <= 3) {
    return {
      label: "Price is stable",
      confidence: "medium",
      summary: "The current price is close to its tracked average.",
      reasons: [
        "No major price movement was detected.",
        "The product is not unusually cheap or expensive right now.",
      ],
    };
  }

  return {
    label: "Wait for a lower price",
    confidence: "medium",
    summary: "The current price is not close to the best tracked price.",
    reasons: [
      "Better prices have appeared in the tracked history.",
      "Waiting could be reasonable if the purchase is not urgent.",
    ],
  };
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
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

    if (historyError) throw historyError;

    const stats = calculateStats(product, history || []);

    if (!history || history.length < 2) {
      return NextResponse.json({
        analysis: DEFAULT_ANALYSIS,
        stats,
        source: "fallback",
      });
    }

    const recentHistory = history.slice(-12);
    const prompt = buildDealAnalyzerPrompt({ product, stats, recentHistory });

    try {
      const geminiText = await callGemini(prompt);
      const parsed = safeParseGeminiJson(geminiText);

      return NextResponse.json({
        analysis: validateAnalysis(parsed),
        stats,
        source: "gemini",
      });
    } catch (geminiError) {
      console.error("Gemini deal analysis error:", geminiError);

      return NextResponse.json({
        analysis: getRuleBasedAnalysis(stats),
        stats,
        source: "fallback",
      });
    }
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
