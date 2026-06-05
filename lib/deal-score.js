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

  const prices = priceHistory.map((p) => parseFloat(p.price));
  const avg = prices.reduce((s, v) => s + v, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  // 1. Distance from all-time low (40%)
  // 100 = at all-time low, 0 = at all-time high
  const range = max - min;
  const proximityToLow = range > 0
    ? ((max - currentPrice) / range) * 100
    : 50;

  // 2. Discount from average (30%)
  // 100 = far below average, 0 = far above average
  const discountFromAvg = currentPrice < avg
    ? Math.min(100, ((avg - currentPrice) / avg) * 200)
    : Math.max(0, 100 - ((currentPrice - avg) / avg) * 200);

  // 3. Recent trend (20%)
  // Look at the last 3 points — is price trending down?
  const recent = prices.slice(-3);
  const trend =
    recent.length >= 2
      ? ((recent[0] - recent[recent.length - 1]) / recent[0]) * 100
      : 0;
  // Positive trend = price dropping = good
  const trendScore = Math.min(100, Math.max(0, 50 + trend * 3));

  // 4. Volatility (10%)
  // High CV means prices swing — more chances to catch a low
  const stdDev = Math.sqrt(
    prices.reduce((sum, v) => sum + (v - avg) ** 2, 0) / prices.length
  );
  const cv = avg > 0 ? stdDev / avg : 0;
  const volatilityScore = Math.min(100, (cv / 0.15) * 100);

  // Weighted score
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
