import { createClient } from "@/utils/supabase/server";
import { getInsights } from "@/app/actions";
import InsightsDashboard from "./InsightsDashboard";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Insights — NexPrice",
  description: "Savings, deal scores, and tracking stats at a glance.",
};

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const insights = await getInsights();

  return <InsightsDashboard insights={insights} />;
}
