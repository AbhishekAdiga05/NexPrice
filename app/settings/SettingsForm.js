"use client";

import { useState } from "react";
import { updateUserSettings } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bell,
  Mail,
  Loader2,
  Save,
  User,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export default function SettingsForm({ user, settings }) {
  const [weeklyDigest, setWeeklyDigest] = useState(settings?.weekly_digest ?? true);
  const [digestDay, setDigestDay] = useState(settings?.digest_day || "sunday");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append("weekly_digest", weeklyDigest ? "on" : "off");
    formData.append("digest_day", digestDay);

    const result = await updateUserSettings(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
    }
    setSaving(false);
  };

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/[0.08]">
          <Link
            href="/"
            className="size-8 rounded-full border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <Shield className="size-6 text-accent" />
              Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customize your account, notification preferences, and email digest settings.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Section */}
          <div className="bg-card rounded-xl border border-white/[0.06] shadow-card p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/[0.06]">
              <User className="size-4 text-accent" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                Account
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="size-14 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xl font-mono">
                {user.email?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {user.email || "Signed in"}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  Connected via Google
                </div>
              </div>
            </div>
          </div>

          {/* Email Notifications Section */}
          <div className="bg-card rounded-xl border border-white/[0.06] shadow-card p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/[0.06]">
              <Bell className="size-4 text-accent" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                Email Notifications
              </h2>
            </div>

            <div className="space-y-6">
              {/* Weekly Digest Toggle */}
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 rounded-full bg-white/[0.1] peer-checked:bg-accent transition-colors duration-200" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-foreground shadow-md peer-checked:translate-x-4 transition-transform duration-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-sm font-semibold text-foreground">
                      Weekly Digest
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                    Get a curated weekly report of every price change across your tracked products — biggest drops, alert activity, and total savings.
                  </p>
                </div>
              </label>

              {/* Digest Day Selector */}
              {weeklyDigest && (
                <div className="ml-14 pl-4 border-l-2 border-accent/30">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Send on
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setDigestDay(value)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono uppercase tracking-wider transition-all duration-200 border ${
                          digestDay === value
                            ? "bg-accent text-white border-accent shadow-sm"
                            : "bg-background text-muted-foreground border-white/10 hover:border-accent/50 hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="h-12 px-8 gap-2 font-bold cursor-pointer"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "SAVING..." : "SAVE PREFERENCES"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
