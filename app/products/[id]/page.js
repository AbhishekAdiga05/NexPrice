import { createClient } from "@/utils/supabase/server";
import {
  getProductById,
  getPriceHistory,
  isOnWatchlist,
  getStorePrices,
} from "@/app/actions";
import { calculateTrendIndicator } from "@/lib/deal-score";
import ProductDetail from "./ProductDetail";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product — NexPrice" };
  return {
    title: `${product.name} — NexPrice`,
    description: `Track price history, alerts, and Deal Score for ${product.name}. Current price: ${product.currency} ${product.current_price}.`,
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const product = await getProductById(id);

  if (!product) {
    redirect("/");
  }

  const priceHistory = await getPriceHistory(id);
  const watchlistEntry = await isOnWatchlist(id);
  const trend = calculateTrendIndicator(
    parseFloat(product.current_price),
    priceHistory
  );

  const storePrices = await getStorePrices(id);

  return (
    <ProductDetail
      product={product}
      priceHistory={priceHistory}
      watchlistEntry={watchlistEntry}
      trend={trend}
      storePrices={storePrices}
    />
  );
}
