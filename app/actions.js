"use server";

import { createClient } from "@/utils/supabase/server";
import { calculateDealScore } from "@/lib/deal-score";
import { calculateBuyPriority } from "@/lib/buy-priority";
import { scrapeProduct } from "@/lib/firecrawl";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addProduct(formData) {
  const url = formData.get("url");

  if (!url) {
    return { error: "URL is required" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Scrape product data with Firecrawl
    const productData = await scrapeProduct(url);

    if (!productData.productName || !productData.currentPrice) {
      console.log(productData, "productData");
      return { error: "Could not extract product information from this URL" };
    }

    const newPrice = parseFloat(productData.currentPrice);
    const currency = productData.currencyCode || "USD";

    // Check if product exists to determine if it's an update
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id, current_price")
      .eq("user_id", user.id)
      .eq("url", url)
      .single();

    const isUpdate = !!existingProduct;

    // Upsert product (insert or update based on user_id + url)
    const { data: product, error } = await supabase
      .from("products")
      .upsert(
        {
          user_id: user.id,
          url,
          name: productData.productName,
          current_price: newPrice,
          currency: currency,
          image_url: productData.productImageUrl,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,url", // Unique constraint on user_id + url
          ignoreDuplicates: false, // Always update if exists
        }
      )
      .select()
      .single();

    if (error) throw error;

    // Add to price history if it's a new product OR price changed
    const shouldAddHistory =
      !isUpdate || existingProduct.current_price !== newPrice;

    if (shouldAddHistory) {
      await supabase.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency: currency,
      });
    }

    revalidatePath("/");
    return {
      success: true,
      product,
      message: isUpdate
        ? "Product updated with latest price!"
        : "Product added successfully!",
    };
  } catch (error) {
    console.error("Add product error:", error);
    return { error: error.message || "Failed to add product" };
  }
}

export async function deleteProduct(productId) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getProducts() {
  try {
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const result = products || [];

    // Attach price_alerts to each product via a separate query
    const productIds = result.map((p) => p.id);
    if (productIds.length > 0) {
      const { data: alerts } = await supabase
        .from("price_alerts")
        .select("id, target_price, status, created_at, triggered_at, product_id, price_at_creation, savings")
        .in("product_id", productIds);

      const alertsByProduct = {};
      for (const alert of alerts || []) {
        if (!alertsByProduct[alert.product_id]) {
          alertsByProduct[alert.product_id] = [];
        }
        alertsByProduct[alert.product_id].push(alert);
      }

      for (const product of result) {
        product.price_alerts = alertsByProduct[product.id] || [];
      }
    }

    return result;
  } catch (error) {
    console.error("Get products error:", error.message || error);
    if (error.details) console.error("Details:", error.details);
    if (error.hint) console.error("Hint:", error.hint);
    if (error.code) console.error("Code:", error.code);
    return [];
  }
}

export async function setPriceAlert(productId, targetPrice) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Verify the product belongs to this user and get current price
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, current_price")
      .eq("id", productId)
      .eq("user_id", user.id)
      .single();

    if (productError || !product) {
      return { error: "Product not found" };
    }

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      return { error: "Target price must be a positive number" };
    }

    // Check for existing active alert on this product
    const { data: existing } = await supabase
      .from("price_alerts")
      .select("id, target_price")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .eq("status", "active")
      .maybeSingle();

    if (existing) {
      return {
        error: `You already have an active alert set at ${existing.target_price}`,
      };
    }

    const { error: insertError } = await supabase.from("price_alerts").insert({
      user_id: user.id,
      product_id: productId,
      target_price: price,
      price_at_creation: parseFloat(product.current_price),
    });

    if (insertError) throw insertError;

    revalidatePath("/");
    revalidatePath("/alerts");
    return { success: true, message: "Alert set! We'll notify you when your target price is hit." };
  } catch (error) {
    console.error("Set price alert error:", error);
    return { error: error.message || "Failed to set price alert" };
  }
}

export async function removePriceAlert(alertId) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("price_alerts")
      .update({ status: "disabled" })
      .eq("id", alertId);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/alerts");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getAlerts() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: alerts } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!alerts || alerts.length === 0) return [];

    const productIds = [...new Set(alerts.map((a) => a.product_id))];

    const { data: products } = await supabase
      .from("products")
      .select("id, name, image_url, current_price, currency")
      .in("id", productIds);

    const productMap = {};
    for (const p of products || []) {
      productMap[p.id] = p;
    }

    return alerts.map((alert) => ({
      ...alert,
      product: productMap[alert.product_id] || null,
    }));
  } catch (error) {
    console.error("Get alerts error:", error);
    return [];
  }
}

export async function getProductById(productId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("user_id", user.id)
      .single();

    if (!product) return null;

    const { data: alerts } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("product_id", productId);

    product.price_alerts = alerts || [];

    return product;
  } catch (error) {
    console.error("Get product error:", error);
    return null;
  }
}

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

export async function getUserSettings() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: existing } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) return existing;

    // Auto-create settings row on first visit
    const { data: created } = await supabase
      .from("user_settings")
      .insert({ user_id: user.id })
      .select()
      .single();

    return created;
  } catch (error) {
    console.error("Get user settings error:", error);
    return null;
  }
}

export async function updateUserSettings(formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const weeklyDigest = formData.get("weekly_digest") === "on";
    const digestDay = formData.get("digest_day") || "sunday";

    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          weekly_digest: weeklyDigest,
          digest_day: digestDay,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true, message: "Preferences saved successfully" };
  } catch (error) {
    return { error: error.message || "Failed to save settings" };
  }
}

export async function getNotificationHistory(limit = 20) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("notifications")
      .select("*, products:product_id(name)")
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get notifications error:", error);
    return [];
  }
}

export async function getInsights() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: products } = await supabase
      .from("products")
      .select("id, name, image_url, current_price, currency, url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!products || products.length === 0) {
      return {
        totalSavings: 0,
        totalSavingsFormatted: "$0.00",
        activeCount: 0,
        triggeredCount: 0,
        totalAlerts: 0,
        productCount: 0,
        topDeals: [],
        recentSavings: [],
      };
    }

    const alerts = await getAlerts();

    const productIds = products.map((p) => p.id);
    const { data: history } =
      productIds.length > 0
        ? await supabase
            .from("price_history")
            .select("product_id, price")
            .in("product_id", productIds)
            .order("checked_at", { ascending: true })
        : { data: [] };

    const historyByProduct = {};
    for (const h of history || []) {
      if (!historyByProduct[h.product_id])
        historyByProduct[h.product_id] = [];
      historyByProduct[h.product_id].push({ price: h.price });
    }

    const productsWithScores = products.map((p) => {
      const price = parseFloat(p.current_price);
      const pHistory = historyByProduct[p.id] || [];
      const dealScore = calculateDealScore(price, pHistory);
      return { ...p, current_price: price, dealScore };
    });

    const topDeals = productsWithScores
      .filter((p) => p.dealScore.score !== null)
      .sort((a, b) => b.dealScore.score - a.dealScore.score)
      .slice(0, 5);

    const triggeredAlerts = alerts.filter((a) => a.status === "triggered");
    const totalSavings = triggeredAlerts.reduce(
      (sum, a) => sum + (parseFloat(a.savings) || 0),
      0
    );

    const currency = products[0]?.currency || "$";

    const recentSavings = triggeredAlerts
      .filter((a) => a.savings > 0)
      .sort(
        (a, b) =>
          new Date(b.triggered_at || b.created_at) -
          new Date(a.triggered_at || a.created_at)
      )
      .slice(0, 10)
      .map((a) => ({
        id: a.id,
        productName: a.product?.name || "Unknown",
        productId: a.product_id,
        imageUrl: a.product?.image_url,
        targetPrice: parseFloat(a.target_price),
        currentPrice: parseFloat(a.product?.current_price || 0),
        savings: parseFloat(a.savings),
        currency: a.product?.currency || currency,
        triggeredAt: a.triggered_at || a.created_at,
      }));

    return {
      totalSavings,
      totalSavingsFormatted: `${currency} ${totalSavings.toFixed(2)}`,
      activeCount: alerts.filter((a) => a.status === "active").length,
      triggeredCount: triggeredAlerts.length,
      totalAlerts: alerts.length,
      productCount: products.length,
      topDeals,
      recentSavings,
    };
  } catch (error) {
    console.error("Get insights error:", error);
    return null;
  }
}

export async function addToWatchlist(productId, priority = "medium") {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { data: existing } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      return { error: "This product is already on your watchlist" };
    }

    const { error } = await supabase.from("watchlist").insert({
      user_id: user.id,
      product_id: productId,
      priority,
    });

    if (error) throw error;

    revalidatePath("/watchlist");
    return { success: true, message: "Added to your watchlist" };
  } catch (error) {
    console.error("Add to watchlist error:", error);
    return { error: error.message || "Failed to add to watchlist" };
  }
}

export async function removeFromWatchlist(productId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) throw error;

    revalidatePath("/watchlist");
    return { success: true };
  } catch (error) {
    console.error("Remove from watchlist error:", error);
    return { error: error.message || "Failed to remove from watchlist" };
  }
}

export async function updateWatchlistPriority(productId, priority) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("watchlist")
      .update({ priority })
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) throw error;

    revalidatePath("/watchlist");
    return { success: true };
  } catch (error) {
    return { error: error.message || "Failed to update priority" };
  }
}

export async function getWatchlist() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: items, error } = await supabase
      .from("watchlist")
      .select("id, product_id, priority, notes, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!items || items.length === 0) return [];

    const productIds = items.map((i) => i.product_id);

    const { data: products } = await supabase
      .from("products")
      .select("id, name, image_url, current_price, currency, url")
      .in("id", productIds);

    const productMap = {};
    for (const p of products || []) {
      productMap[p.id] = p;
    }

    const { data: history } = await supabase
      .from("price_history")
      .select("product_id, price")
      .in("product_id", productIds)
      .order("checked_at", { ascending: true });

    const historyByProduct = {};
    for (const h of history || []) {
      if (!historyByProduct[h.product_id])
        historyByProduct[h.product_id] = [];
      historyByProduct[h.product_id].push({ price: h.price });
    }

    const result = items.map((item) => {
      const product = productMap[item.product_id];
      const pHistory = historyByProduct[item.product_id] || [];
      const price = product ? parseFloat(product.current_price) : 0;
      const dealScore = calculateDealScore(price, pHistory);
      const buyPriority = calculateBuyPriority({
        priority: item.priority,
        createdAt: item.created_at,
        dealScore: dealScore.score,
      });

      return {
        id: item.id,
        productId: item.product_id,
        priority: item.priority,
        notes: item.notes,
        createdAt: item.created_at,
        product: product || null,
        dealScore,
        buyPriority,
      };
    });

    return result.sort((a, b) => b.buyPriority - a.buyPriority);
  } catch (error) {
    console.error("Get watchlist error:", error);
    return [];
  }
}

export async function isOnWatchlist(productId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
      .from("watchlist")
      .select("id, priority")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    return data || false;
  } catch (error) {
    return false;
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function getStorePrices(productId) {
  try {
    const supabase = await createClient();
    const { data: prices, error } = await supabase
      .from("store_prices")
      .select("*")
      .eq("product_id", productId)
      .order("price", { ascending: true });

    if (error) throw error;
    return prices || [];
  } catch (error) {
    console.error("Get store prices error:", error);
    return [];
  }
}

export async function upsertStorePrice(productId, storeName, productUrl, price, currency = "INR") {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("store_prices").upsert(
      {
        product_id: productId,
        store_name: storeName,
        product_url: productUrl,
        price,
        currency,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "product_id,store_name" }
    );

    if (error) throw error;
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    return { error: error.message || "Failed to save store price" };
  }
}

export async function deleteStorePrice(priceId) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("store_prices").delete().eq("id", priceId);
    if (error) throw error;
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}
