export function getCheapestStore(prices) {
  if (!prices || prices.length === 0) return null;
  const sorted = [...prices].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  return sorted[0];
}

export function getStoreSummary(prices, currency = "INR") {
  if (!prices || prices.length === 0) return null;

  const sorted = [...prices].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  const cheapest = sorted[0];
  const cheapestPrice = parseFloat(cheapest.price);
  const highestPrice = parseFloat(sorted[sorted.length - 1].price);
  const savings = (highestPrice - cheapestPrice).toFixed(2);

  return {
    cheapestStore: cheapest.store_name,
    cheapestPrice,
    currency,
    storeCount: prices.length,
    savings,
    highestPrice,
    prices: sorted,
  };
}

export function getStorePriceHistory(prices) {
  if (!prices || prices.length === 0) return [];
  return prices.map((p) => ({
    store: p.store_name,
    price: parseFloat(p.price),
    currency: p.currency || "INR",
    lastUpdated: p.last_updated,
    url: p.product_url,
  }));
}
