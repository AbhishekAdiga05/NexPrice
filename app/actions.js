"use server";

import { createClient } from "@/utils/supabase/server";
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
        .select("id, target_price, status, created_at, triggered_at, product_id")
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

    // Verify the product belongs to this user
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
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
    });

    if (insertError) throw insertError;

    revalidatePath("/");
    revalidatePath("/alerts");
    return { success: true, message: "Target price alert set! We'll email you when the price drops." };
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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}
