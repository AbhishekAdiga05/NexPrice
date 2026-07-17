export const RETAILERS = [
  {
    name: "Amazon",
    domain: "amazon.in",
    searchUrl: (query) =>
      `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
    color: "bg-orange-500",
  },
  {
    name: "Flipkart",
    domain: "flipkart.com",
    searchUrl: (query) =>
      `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
    color: "bg-emerald-500",
  },
  {
    name: "Croma",
    domain: "croma.com",
    searchUrl: (query) =>
      `https://www.croma.com/search/?q=${encodeURIComponent(query)}`,
    color: "bg-indigo-500",
  },
  {
    name: "Reliance Digital",
    domain: "reliancedigital.in",
    searchUrl: (query) =>
      `https://www.reliancedigital.in/search?q=${encodeURIComponent(query)}`,
    color: "bg-rose-500",
  },
  {
    name: "Tata CLiQ",
    domain: "tatacliq.com",
    searchUrl: (query) =>
      `https://www.tatacliq.com/search/?searchTerm=${encodeURIComponent(query)}`,
    color: "bg-sky-500",
  },
];

export function getRetailerByName(name) {
  return RETAILERS.find((r) => r.name === name) || null;
}

export function getRetailerByDomain(url) {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return RETAILERS.find((r) => hostname.includes(r.domain)) || null;
  } catch {
    return null;
  }
}

export const SIMILARITY_THRESHOLD = 0.35;
export const DISCOVERY_TIMEOUT = 25000;
export const SEARCH_RESULT_COUNT = 8;
