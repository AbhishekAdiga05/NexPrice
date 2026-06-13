const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function callTelegram(method, payload) {
  if (!BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not set, skipping Telegram notification");
    return { success: false, error: "Bot token not configured" };
  }

  try {
    const response = await fetch(`${API_BASE}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram API error:", data);
      return { success: false, error: data.description || "Telegram API error" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Telegram request failed:", error);
    return { success: false, error: error.message };
  }
}

export async function sendTargetReachedAlert(chatId, product, targetPrice, currentPrice) {
  const productUrl = product.url || `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.id}`;
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const message = [
    "\u{1F514} *Price Alert*",
    "",
    `*${product.name}*`,
    "",
    `\u{1F4B0} Current Price: \`${product.currency} ${currentPrice.toFixed(2)}\``,
    `\u{1F3AF} Target Price: \`${product.currency} ${targetPrice.toFixed(2)}\``,
    "",
    `\u{2705} *Your target price has been reached!*`,
    "",
    `\u{1F517} [View Product](${productUrl})`,
    "",
    `\u{23F0} ${timestamp}`,
  ].join("\n");

  return callTelegram("sendMessage", {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
    disable_web_page_preview: false,
  });
}

export async function sendPriceDropAlert(chatId, product, oldPrice, newPrice) {
  const productUrl = product.url || `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.id}`;
  const dropAmount = oldPrice - newPrice;
  const percentageDrop = ((dropAmount / oldPrice) * 100).toFixed(1);
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const message = [
    "\u{1F389} *Price Drop Alert!*",
    "",
    `*${product.name}*`,
    "",
    `\u{1F4B0} New Price: \`${product.currency} ${newPrice.toFixed(2)}\``,
    `\u{1F4C9} Was: ~~${product.currency} ${oldPrice.toFixed(2)}~~`,
    `\u{1F4B8} You Save: \`${product.currency} ${dropAmount.toFixed(2)} (${percentageDrop}%)\``,
    "",
    `\u{1F517} [View Product](${productUrl})`,
    "",
    `\u{23F0} ${timestamp}`,
  ].join("\n");

  return callTelegram("sendMessage", {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
    disable_web_page_preview: false,
  });
}

export async function sendTestMessage(chatId) {
  const message = [
    "\u{2705} *NexPrice Telegram Connected*",
    "",
    "You will now receive price alerts directly here.",
    "No more missing a deal!",
  ].join("\n");

  return callTelegram("sendMessage", {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
  });
}
