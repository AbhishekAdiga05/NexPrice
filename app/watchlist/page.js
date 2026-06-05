import { createClient } from "@/utils/supabase/server";
import { getWatchlist } from "@/app/actions";
import WatchlistDashboard from "./WatchlistDashboard";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Watchlist — NexPrice",
  description:
    "Your prioritized shopping list powered by Deal Scores and smart urgency tracking.",
};

export default async function WatchlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const items = await getWatchlist();

  return <WatchlistDashboard items={items} />;
}
