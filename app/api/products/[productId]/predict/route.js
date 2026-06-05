import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const DEFAULT_PREDICTION = {
  predicted_price: null,
  confidence: "low",
  timeframe: null,
  reasoning: "Not enough price history to make a prediction yet.",
  source: "fallback",
};

function round(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function calculateStats(product, history) {
  const prices = history
    .map((item) => Number(item.price))
    .filter((p) => Number.isFinite(p));

  const currentPrice = Number(product.current_price);
  const all = prices.length > 0 ? prices : [currentPrice];

  const avg = all.reduce((s, v) => s + v, 0) / all.length;
  const min = Math.min(...all);
  const max = Math.max(...all);
  const stdDev = Math.sqrt(
    all.reduce((sum, v) => sum + (v - avg) ** 2, 0) / all.length
  );

  return {
    currentPrice,
    avgPrice: round(avg),
    minPrice: round(min),
    maxPrice: round(max),
    stdDev: round(stdDev),
    historyCount: prices.length,
  };
}

function buildPredictionPrompt({ product, stats, recentHistory }) {
  return `
You are a price prediction AI for NexPrice, a smart shopping assistant.

Analyze this product's price history and predict the most likely future price.

Product:
- Name: ${product.name}
- Currency: ${product.currency}
- Current price: ${stats.currentPrice}

Historical data:
- Average price: ${stats.avgPrice}
- Lowest price: ${stats.minPrice}
- Highest price: ${stats.maxPrice}
- Price volatility (std dev): ${stats.stdDev}
- Number of data points: ${stats.historyCount}

Recent price history (newest first):
${recentHistory
  .slice(0, 15)
  .map((item) => `- ${item.checked_at}: ${product.currency} ${item.price}`)
  .join("\n")}

Based on this data, predict the price this product will likely reach soon.

Return JSON only with this exact structure:
{
  "predicted_price": <number or null>,
  "confidence": "low" | "medium" | "high",
  "timeframe": "string describing when (e.g. '2 weeks', '1 month')",
  "reasoning": "short explanation under 30 words"
}

Rules:
- If there are fewer than 3 data points, set predicted_price to null.
- Do NOT invent fake data or guarantee future prices.
- Keep reasoning short (under 30 words).
- Return ONLY valid JSON, no other text.
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

function validatePrediction(value, stats) {
  if (!value || typeof value !== "object") return DEFAULT_PREDICTION;

  const allowedConfidence = ["low", "medium", "high"];
  const price =
    typeof value.predicted_price === "number" && value.predicted_price > 0
      ? round(value.predicted_price)
      : stats.historyCount >= 3
        ? round(stats.avgPrice * 0.95)
        : null;

  return {
    predicted_price: price,
    confidence: allowedConfidence.includes(value.confidence)
      ? value.confidence
      : "low",
    timeframe:
      typeof value.timeframe === "string" && value.timeframe.length <= 30
        ? value.timeframe
        : null,
    reasoning:
      typeof value.reasoning === "string" && value.reasoning.length <= 180
        ? value.reasoning
        : DEFAULT_PREDICTION.reasoning,
    source: "gemini",
  };
}

function getFallbackPrediction(stats) {
  if (stats.historyCount < 3) {
    return {
      predicted_price: null,
      confidence: "low",
      timeframe: null,
      reasoning: "Track more price points for a prediction.",
      source: "fallback",
    };
  }

  const trend = stats.currentPrice - stats.avgPrice;
  const predicted = trend < 0
    ? round(stats.currentPrice * 0.95)
    : round(stats.currentPrice * 0.98);

  return {
    predicted_price: predicted,
    confidence: "low",
    timeframe: "2-4 weeks",
    reasoning: "Based on historical average and recent trend.",
    source: "fallback",
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
          temperature: 0.3,
          maxOutputTokens: 200,
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

    // Check for cached prediction
    const { data: cached } = await supabase
      .from("price_predictions")
      .select("*")
      .eq("product_id", productId)
      .gt("expires_at", new Date().toISOString())
      .order("predicted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      return NextResponse.json({
        prediction: {
          predicted_price: cached.predicted_price,
          confidence: cached.confidence,
          timeframe: cached.timeframe,
          reasoning: cached.reasoning,
        },
        source: cached.source,
        cached: true,
      });
    }

    // Fetch price history
    const { data: history, error: historyError } = await supabase
      .from("price_history")
      .select("price, currency, checked_at")
      .eq("product_id", productId)
      .order("checked_at", { ascending: false });

    if (historyError) throw historyError;

    const stats = calculateStats(product, history || []);

    if (!history || history.length < 3) {
      const fallback = getFallbackPrediction(stats);
      return NextResponse.json({
        prediction: {
          predicted_price: fallback.predicted_price,
          confidence: fallback.confidence,
          timeframe: fallback.timeframe,
          reasoning: fallback.reasoning,
        },
        source: "fallback",
        cached: false,
      });
    }

    // Call Gemini for prediction
    const recentHistory = history.slice(0, 15);
    const prompt = buildPredictionPrompt({ product, stats, recentHistory });

    let parsed;
    let geminiText;

    try {
      geminiText = await callGemini(prompt);
      parsed = safeParseGeminiJson(geminiText);
    } catch (geminiError) {
      console.error("Gemini prediction error:", geminiError);
      const fallback = getFallbackPrediction(stats);
      return NextResponse.json({
        prediction: {
          predicted_price: fallback.predicted_price,
          confidence: fallback.confidence,
          timeframe: fallback.timeframe,
          reasoning: fallback.reasoning,
        },
        source: "fallback",
        cached: false,
      });
    }

    const prediction = validatePrediction(parsed, stats);

    // Cache the prediction
    await supabase.from("price_predictions").insert({
      product_id: productId,
      predicted_price: prediction.predicted_price,
      confidence: prediction.confidence,
      timeframe: prediction.timeframe,
      reasoning: prediction.reasoning,
      source: prediction.source,
    });

    return NextResponse.json({
      prediction: {
        predicted_price: prediction.predicted_price,
        confidence: prediction.confidence,
        timeframe: prediction.timeframe,
        reasoning: prediction.reasoning,
      },
      source: prediction.source,
      cached: false,
    });
  } catch (error) {
    console.error("Prediction API error:", error);
    return NextResponse.json(
      {
        prediction: DEFAULT_PREDICTION,
        source: "fallback",
        error: "Could not generate prediction right now.",
      },
      { status: 500 }
    );
  }
}
