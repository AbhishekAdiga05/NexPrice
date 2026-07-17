import FirecrawlApp from "@mendable/firecrawl-js";
import {
  RETAILERS,
  getRetailerByDomain,
  SIMILARITY_THRESHOLD,
  DISCOVERY_TIMEOUT,
  SEARCH_RESULT_COUNT,
} from "@/lib/retailers";
import { findBestMatch, isProductMatch } from "@/lib/product-matcher";

function getFirecrawl() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not set in environment variables.");
  }
  return new FirecrawlApp({ apiKey });
}

async function searchRetailer(retailer, query) {
  const url = retailer.searchUrl(query);

  const firecrawl = getFirecrawl();
  const result = await firecrawl.scrapeUrl(url, {
    formats: ["extract"],
    extract: {
      prompt: `Search results for "${query}" on ${retailer.name}. Extract up to ${SEARCH_RESULT_COUNT} product listings visible on this page. For each product, provide the full product title, the complete clickable URL to the product page, and the current selling price as a number. Only return products that are clearly visible and distinct.`,
      schema: {
        type: "object",
        properties: {
          products: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                url: { type: "string" },
                price: { type: "number" },
              },
              required: ["title", "url"],
            },
          },
        },
        required: ["products"],
      },
    },
  });

  if (!result.extract?.products || result.extract.products.length === 0) {
    return [];
  }

  return result.extract.products
    .filter((p) => p.title && p.url && p.title.length > 5)
    .map((p) => {
      try {
        new URL(p.url);
        return p;
      } catch {
        try {
          const baseUrl = new URL(url).origin;
          p.url = new URL(p.url, baseUrl).href;
        } catch (e) {
          // ignore parsing error
        }
        return p;
      }
    })
    .slice(0, SEARCH_RESULT_COUNT);
}

async function scrapeRetailerProduct(url) {
  const firecrawl = getFirecrawl();

  const result = await firecrawl.scrapeUrl(url, {
    formats: ["extract"],
    extract: {
      prompt:
        "Extract the product name as 'productName', current price as a number as 'currentPrice', currency code (INR, USD, etc) as 'currencyCode', and product image URL as 'productImageUrl' if available",
      schema: {
        type: "object",
        properties: {
          productName: { type: "string" },
          currentPrice: { type: "number" },
          currencyCode: { type: "string" },
          productImageUrl: { type: "string" },
        },
        required: ["productName", "currentPrice"],
      },
    },
  });

  if (!result.extract?.productName || !result.extract?.currentPrice) {
    return null;
  }

  return {
    storeName: result.extract.productName,
    price: parseFloat(result.extract.currentPrice),
    currency: result.extract.currencyCode || "INR",
    imageUrl: result.extract.productImageUrl || null,
  };
}

function isOwnProductUrl(candidateUrl, originalUrl) {
  try {
    const candidate = new URL(candidateUrl).hostname.replace("www.", "");
    const original = new URL(originalUrl).hostname.replace("www.", "");
    return candidate === original;
  } catch {
    return false;
  }
}

async function tryScrapeWithTimeout(url, timeoutMs) {
  return Promise.race([
    scrapeRetailerProduct(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Scrape timeout for ${url}`)), timeoutMs)
    ),
  ]);
}

async function trySearchWithTimeout(retailer, query, timeoutMs) {
  return Promise.race([
    searchRetailer(retailer, query),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Search timeout for ${retailer.name}`)), timeoutMs)
    ),
  ]);
}

export async function discoverForProduct(product, options = {}) {
  const {
    threshold = SIMILARITY_THRESHOLD,
    searchTimeout = DISCOVERY_TIMEOUT,
    scrapeTimeout = 15000,
  } = options;

  const productName = product.name;
  const originalUrl = product.url;
  const originalRetailer = getRetailerByDomain(originalUrl);

  const retailerPromises = RETAILERS.map(async (retailer) => {
    if (originalRetailer && originalRetailer.name === retailer.name) {
      return null;
    }

    try {
      const candidates = await trySearchWithTimeout(retailer, productName, searchTimeout);

      if (!candidates || candidates.length === 0) {
        return null;
      }

      const externalCandidates = candidates.filter(
        (c) => !isOwnProductUrl(c.url, originalUrl)
      );

      if (externalCandidates.length === 0) {
        return null;
      }

      const searchMatch = findBestMatch(productName, externalCandidates, threshold * 0.6);

      if (!searchMatch) {
        return null;
      }

      const { url: candidateUrl, title: searchTitle } = searchMatch;

      const scrapeResult = await tryScrapeWithTimeout(candidateUrl, scrapeTimeout);

      if (!scrapeResult) {
        return null;
      }

      const matchResult = isProductMatch(productName, scrapeResult.storeName, threshold);

      if (!matchResult.match) {
        return null;
      }

      return {
        storeName: retailer.name,
        productUrl: candidateUrl,
        searchTitle,
        storeTitle: scrapeResult.storeName,
        price: scrapeResult.price,
        currency: scrapeResult.currency,
        imageUrl: scrapeResult.imageUrl,
        similarityScore: matchResult.score,
        productName: scrapeResult.storeName,
      };
    } catch (error) {
      console.warn(`[StoreDiscovery] ${retailer.name}: ${error.message}`);
      return null;
    }
  });

  const settled = await Promise.allSettled(retailerPromises);
  const results = [];

  for (const s of settled) {
    if (s.status === "fulfilled" && s.value !== null) {
      results.push(s.value);
    }
  }

  return results;
}

export async function refreshStorePrices(product, supabase) {
  const discoveries = await discoverForProduct(product);

  let updatedCount = 0;

  for (const d of discoveries) {
    const { error } = await supabase.from("store_prices").upsert(
      {
        product_id: product.id,
        store_name: d.storeName,
        product_url: d.productUrl,
        price: d.price,
        currency: d.currency,
        product_name: d.productName,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "product_id,store_name" }
    );

    if (!error) {
      updatedCount++;
    } else {
      console.error(
        `[StoreDiscovery] Failed to save ${d.storeName} price:`,
        error.message
      );
    }
  }

  return updatedCount;
}
