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
  Check,
  Calendar,
  AtSign,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const DAYS = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

function Section({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-card rounded-xl border border-white/[0.06] shadow-panel overflow-hidden">
      <div className="px-5 md:px-8 py-4 md:py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-accent/[0.08] rounded-lg text-accent shrink-0">
            <Icon className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="px-5 md:px-8 py-5 md:py-6">
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start gap-3.5 cursor-pointer group">
      <div className="relative shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 rounded-full bg-white/[0.08] peer-checked:bg-accent transition-colors duration-200" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-foreground shadow-sm peer-checked:translate-x-4 transition-transform duration-200 peer-checked:bg-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
            {label}
          </span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </label>
  );
}

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
    <main className="min-h-screen font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/"
                className="size-7 md:size-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors shrink-0"
              >
                <ArrowLeft className="size-3.5 md:size-4" />
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Settings
              </h1>
            </div>
            <p className="text-sm text-muted-foreground/70 ml-10 md:ml-11">
              Manage your account and notification preferences.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Account Section */}
          <Section icon={User} title="Account" description="Your profile and authentication details">
            <div className="flex items-center gap-4">
              <div className="size-12 md:size-14 rounded-full bg-accent/[0.08] flex items-center justify-center text-accent font-bold text-lg md:text-xl font-mono border border-accent/20">
                {user.email?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <AtSign className="size-3.5 text-muted-foreground/60" />
                  <span className="text-sm font-semibold text-foreground truncate">
                    {user.email || "Signed in"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-muted-foreground/70 font-mono">
                    Connected via Google
                  </span>
                </div>
              </div>
            </div>
          </Section>

          {/* Notifications Section */}
          <Section icon={Bell} title="Notifications" description="Control what you receive via email">
            <div className="space-y-6">
              <Toggle
                checked={weeklyDigest}
                onChange={setWeeklyDigest}
                label="Weekly Digest"
                description="A curated weekly report of price changes, biggest drops, alert activity, and total savings across all tracked products."
              />

              {weeklyDigest && (
                <div className="ml-12 pl-5 border-l border-accent/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="size-3.5 text-muted-foreground/60" />
                    <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/80">
                      Send on
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setDigestDay(value)}
                        className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition-all duration-200 border ${
                          digestDay === value
                            ? "bg-accent text-white border-accent shadow-sm"
                            : "bg-background text-muted-foreground/80 border-white/[0.06] hover:border-accent/40 hover:text-foreground"
                        }`}
                      >
                        {label}
                        {digestDay === value && (
                          <Check className="size-2.5 absolute -top-1 -right-1 text-white bg-accent rounded-full p-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Save Footer */}
          <div className="flex items-center justify-between gap-4 px-1">
            <p className="text-[11px] text-muted-foreground/50 font-mono">
              Changes are saved to your account
            </p>
            <Button
              type="submit"
              disabled={saving}
              className="h-11 px-6 gap-2 font-bold text-xs cursor-pointer"
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
