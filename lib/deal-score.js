/**
 * Deal Score™ — A 0–100 score that answers "should I buy now?"
 *
 * Factors:
 *   - Distance from all-time low (40%): how close current price is to the minimum
 *   - Discount from average     (30%): how far below the mean price we are
 *   - Recent trend              (20%): has the price been dropping recently?
 *   - Volatility                (10%): does the price fluctuate (more volatility = more chances)
 *
 * @param {number} currentPrice
 * @param {Array<{price: number|string}>} priceHistory — at least 2 entries
 * @returns {{ score: number|null, label: string, tier: string }}
 *   score: 0–100, null if insufficient data
 *   label: "Great deal" | "Good deal" | "Fair" | "Not now"
 *   tier:  "great" | "good" | "fair" | "poor"
 */
export function calculateDealScore(currentPrice, priceHistory) {
  if (!priceHistory || priceHistory.length < 2) {
    return { score: null, label: "Insufficient data", tier: "none" };
  }

  const parsed = priceHistory.map((p) => parseFloat(p.price)).filter((v) => !isNaN(v) && v > 0);
  if (parsed.length < 2) {
    return { score: null, label: "Insufficient data", tier: "none" };
  }

  const prices = parsed;
  const price = typeof currentPrice === "number" ? currentPrice : parseFloat(currentPrice);
  if (isNaN(price) || price <= 0) {
    return { score: null, label: "Invalid price", tier: "none" };
  }

  const avg = prices.reduce((s, v) => s + v, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const range = max - min;
  const proximityToLow = range > 0
    ? ((max - price) / range) * 100
    : 50;

  const discountFromAvg = price < avg
    ? Math.min(100, ((avg - price) / avg) * 200)
    : Math.max(0, 100 - ((price - avg) / avg) * 200);

  const recent = prices.slice(-3);
  const trend =
    recent.length >= 2 && recent[0] > 0
      ? ((recent[0] - recent[recent.length - 1]) / recent[0]) * 100
      : 0;
  const trendScore = Math.min(100, Math.max(0, 50 + trend * 3));

  const variance = prices.reduce((sum, v) => sum + (v - avg) ** 2, 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  const cv = avg > 0 ? stdDev / avg : 0;
  const volatilityScore = Math.min(100, (cv / 0.15) * 100);

  const rawScore =
    proximityToLow * 0.4 +
    discountFromAvg * 0.3 +
    trendScore * 0.2 +
    volatilityScore * 0.1;

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  const tier =
    score >= 70 ? "great" : score >= 50 ? "good" : score >= 30 ? "fair" : "poor";

  const label =
    score >= 70
      ? "Great deal"
      : score >= 50
        ? "Good deal"
        : score >= 30
          ? "Fair"
          : "Not now";

  return { score, label, tier };
}

/**
 * Trend Indicator — How far is the current price from the historical average?
 *
 * Formula: ((avg - current) / avg) * 100
 *
 * Positive value = current price is below average (potential discount)
 * Negative value = current price is above average
 * Null = insufficient data
 *
 * @param {number} currentPrice
 * @param {Array<{price: number|string}>} priceHistory
 * @returns {number|null} percentage difference from average
 */
export function calculateTrendIndicator(currentPrice, priceHistory) {
  if (!priceHistory || priceHistory.length < 2) {
    return null;
  }

  const price = typeof currentPrice === "number" ? currentPrice : parseFloat(currentPrice);
  if (isNaN(price) || price <= 0) return null;

  const prices = priceHistory.map((p) => parseFloat(p.price)).filter((v) => !isNaN(v) && v > 0);
  if (prices.length < 2) return null;

  const avg = prices.reduce((s, v) => s + v, 0) / prices.length;
  if (avg === 0) return null;

  return ((avg - price) / avg) * 100;
}
