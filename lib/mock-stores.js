const STORES = [
  { name: "Amazon India", color: "bg-orange-500" },
  { name: "Flipkart", color: "bg-emerald-500" },
  { name: "Croma", color: "bg-indigo-500" },
  { name: "Reliance Digital", color: "bg-rose-500" },
  { name: "Tata CLiQ", color: "bg-sky-500" },
  { name: "Vijay Sales", color: "bg-amber-500" },
];

function randomBetween(min, max) {
  return +(min + Math.random() * (max - min)).toFixed(2);
}

function hoursAgo(n) {
  return new Date(Date.now() - n * 3600000).toISOString();
}

export function generateMockStorePrices(productId, basePrice) {
  const base = parseFloat(basePrice);

  return STORES.map((store, i) => {
    const variation = randomBetween(-0.12, 0.08);
    const price = +(base * (1 + variation)).toFixed(2);
    const urlSlug = store.name.toLowerCase().replace(/\s+/g, "-");

    return {
      id: `mock-${productId}-${i}`,
      product_id: productId,
      store_name: store.name,
      product_url: `https://www.${urlSlug}.com/products/iphone-17`,
      price,
      currency: "INR",
      last_updated: hoursAgo(randomBetween(0.5, 48)),
      created_at: hoursAgo(randomBetween(24, 168)),
    };
  });
}
