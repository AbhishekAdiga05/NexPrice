import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeProduct } from "@/lib/firecrawl";
import { sendPriceDropAlert as sendEmailPriceDrop, sendTargetPriceAlert as sendEmailTarget } from "@/lib/email";
import { sendPriceDropAlert as sendTelegramDrop, sendTargetReachedAlert as sendTelegramTarget } from "@/lib/telegram";

const CHUNK_SIZE = 5;

async function logNotification(supabase, { userId, productId, alertId, type, channel, status, recipient, priceAtEvent, targetPrice, oldPrice, errorMessage }) {
  try {
    await supabase.from("notifications").insert({
      user_id: userId,
      product_id: productId,
      alert_id: alertId,
      notification_type: type,
      channel,
      status,
      recipient,
      price_at_event: priceAtEvent,
      target_price: targetPrice,
      old_price: oldPrice,
      error_message: errorMessage,
    });
  } catch (err) {
    console.error("Failed to log notification:", err);
  }
}

async function sendTelegramNotification(supabase, userId, product, type, data) {
  try {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("telegram_chat_id, telegram_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    const chatId = settings?.telegram_chat_id;
    if (!chatId || !settings?.telegram_enabled) return null;

    let result;
    if (type === "price_drop") {
      result = await sendTelegramDrop(chatId, product, data.oldPrice, data.newPrice);
    } else {
      result = await sendTelegramTarget(chatId, product, data.targetPrice, data.currentPrice);
    }

    await logNotification(supabase, {
      userId,
      productId: product.id,
      alertId: data.alertId || null,
      type,
      channel: "telegram",
      status: result.success ? "sent" : "failed",
      recipient: chatId,
      priceAtEvent: type === "price_drop" ? data.newPrice : data.currentPrice,
      targetPrice: data.targetPrice || null,
      oldPrice: data.oldPrice || null,
      errorMessage: result.error || null,
    });

    return result;
  } catch (error) {
    console.error("Telegram notification error:", error);
    await logNotification(supabase, {
      userId,
      productId: product.id,
      alertId: data?.alertId || null,
      type,
      channel: "telegram",
      status: "failed",
      recipient: null,
      errorMessage: error.message,
    });
    return { success: false, error: error.message };
  }
}

async function processProduct(product, supabase) {
  const result = { id: product.id, updated: false, failed: false, priceChanged: false, alertSent: false };

  try {
    const productData = await scrapeProduct(product.url);

    if (!productData.currentPrice) {
      result.failed = true;
      return result;
    }

    const newPrice = parseFloat(productData.currentPrice);
    const oldPrice = parseFloat(product.current_price);

    await supabase
      .from("products")
      .update({
        current_price: newPrice,
        currency: productData.currencyCode || product.currency,
        name: productData.productName || product.name,
        image_url: productData.productImageUrl || product.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (oldPrice !== newPrice) {
      await supabase.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency: productData.currencyCode || product.currency,
      });

      result.priceChanged = true;

      if (newPrice < oldPrice) {
        const { data: { user } } = await supabase.auth.admin.getUserById(product.user_id);

        if (user?.email) {
          const emailResult = await sendEmailPriceDrop(user.email, product, oldPrice, newPrice);
          await logNotification(supabase, {
            userId: product.user_id,
            productId: product.id,
            alertId: null,
            type: "price_drop",
            channel: "email",
            status: emailResult.success ? "sent" : "failed",
            recipient: user.email,
            priceAtEvent: newPrice,
            oldPrice,
            errorMessage: emailResult.error || null,
          });
          if (emailResult.success) result.alertSent = true;
        }

        await sendTelegramNotification(supabase, product.user_id, product, "price_drop", {
          oldPrice,
          newPrice,
          alertId: null,
        });
      }

      const { data: activeAlerts } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("product_id", product.id)
        .eq("status", "active");

      for (const alert of activeAlerts || []) {
        if (newPrice <= alert.target_price) {
          const { data: { user: alertUser } } = await supabase.auth.admin.getUserById(product.user_id);

          if (alertUser?.email) {
            const emailResult = await sendEmailTarget(alertUser.email, product, alert.target_price, newPrice);
            await logNotification(supabase, {
              userId: product.user_id,
              productId: product.id,
              alertId: alert.id,
              type: "target_reached",
              channel: "email",
              status: emailResult.success ? "sent" : "failed",
              recipient: alertUser.email,
              priceAtEvent: newPrice,
              targetPrice: alert.target_price,
              errorMessage: emailResult.error || null,
            });
          }

          await sendTelegramNotification(supabase, product.user_id, product, "target_reached", {
            targetPrice: alert.target_price,
            currentPrice: newPrice,
            alertId: alert.id,
          });

          const savings = alert.price_at_creation
            ? parseFloat(alert.price_at_creation) - newPrice
            : null;

          await supabase
            .from("price_alerts")
            .update({
              status: "triggered",
              triggered_at: new Date().toISOString(),
              savings: savings && savings > 0 ? savings : 0,
            })
            .eq("id", alert.id);

          result.alertSent = true;
        }
      }
    }

    result.updated = true;
  } catch (error) {
    console.error(`Error processing product ${product.id}:`, error);
    result.failed = true;
  }

  return result;
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*");

    if (productsError) throw productsError;

    console.log(`Found ${products.length} products to check`);

    const results = { total: products.length, updated: 0, failed: 0, priceChanges: 0, alertsSent: 0 };

    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
      const chunk = products.slice(i, i + CHUNK_SIZE);
      const chunkResults = await Promise.allSettled(
        chunk.map((product) => processProduct(product, supabase))
      );

      for (const settled of chunkResults) {
        if (settled.status === "fulfilled") {
          const r = settled.value;
          if (r.updated) results.updated++;
          if (r.failed) results.failed++;
          if (r.priceChanged) results.priceChanges++;
          if (r.alertSent) results.alertsSent++;
        } else {
          console.error("Chunk promise rejected:", settled.reason);
          results.failed++;
        }
      }

      console.log(`Chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(products.length / CHUNK_SIZE)} complete`);
    }

    return NextResponse.json({
      success: true,
      message: "Price check completed",
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Price check endpoint is working. Use POST to trigger.",
  });
}
