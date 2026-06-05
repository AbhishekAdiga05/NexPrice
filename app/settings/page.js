import { createClient } from "@/utils/supabase/server";
import { getUserSettings } from "@/app/actions";
import SettingsForm from "./SettingsForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings — NexPrice",
  description: "Manage your account preferences and notification settings.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const settings = await getUserSettings();

  return <SettingsForm user={user} settings={settings} />;
}
