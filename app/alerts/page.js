import { createClient } from "@/utils/supabase/server";
import { getAlerts } from "@/app/actions";
import AlertsDashboard from "./AlertsDashboard";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Alerts — NexPrice",
  description: "Manage your target price alerts across all tracked products.",
};

export default async function AlertsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const alerts = await getAlerts();

  return <AlertsDashboard alerts={alerts} />;
}
