const STORES = [
  { name: "Amazon India", domain: "amazon.in", color: "bg-orange-500" },
  { name: "Flipkart", domain: "flipkart.com", color: "bg-emerald-500" },
  { name: "Croma", domain: "croma.com", color: "bg-indigo-500" },
  { name: "Reliance Digital", domain: "reliancedigital.in", color: "bg-rose-500" },
  { name: "Tata CLiQ", domain: "tatacliq.com", color: "bg-sky-500" },
  { name: "Vijay Sales", domain: "vijaysales.com", color: "bg-amber-500" },
];

function randomBetween(min, max) {
  return +(min + Math.random() * (max - min)).toFixed(2);
}

function hoursAgo(n) {
  return new Date(Date.now() - n * 3600000).toISOString();
}

export function getStoreDomain(storeName) {
  const store = STORES.find((s) => s.name === storeName);
  return store ? store.domain : "example.com";
}

export function generateMockStorePrices(productId, basePrice) {
  const base = parseFloat(basePrice);

  return STORES.map((store, i) => {
    const variation = randomBetween(-0.12, 0.08);
    const price = +(base * (1 + variation)).toFixed(2);

    return {
      id: `mock-${productId}-${i}`,
      product_id: productId,
      store_name: store.name,
      product_url: `https://www.${store.domain}/search?q=product-${productId.slice(0, 8)}`,
      price,
      currency: "INR",
      last_updated: hoursAgo(randomBetween(0.5, 48)),
      created_at: hoursAgo(randomBetween(24, 168)),
    };
  });
}
