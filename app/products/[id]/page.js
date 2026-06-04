import { createClient } from "@/utils/supabase/server";
import { getProductById, getPriceHistory } from "@/app/actions";
import ProductDetail from "./ProductDetail";
import { redirect } from "next/navigation";

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

  return <ProductDetail product={product} priceHistory={priceHistory} />;
}
