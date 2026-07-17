"use client";

import { useState } from "react";
import { updateUserSettings } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Loader2,
  Save,
  User,
  Check,
  Calendar,
  AtSign,
} from "lucide-react";
import { toast } from "sonner";

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
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg flex items-center justify-center bg-orange-50 text-orange-600 shrink-0">
            <Icon className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-orange-500 transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm peer-checked:translate-x-4 transition-transform" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-foreground group-hover:text-orange-600 transition-colors leading-snug">
          {label}
        </span>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
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
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Section icon={User} title="Account" description="Your profile and authentication details">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-sm">
              {user.email?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <AtSign className="size-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground truncate leading-snug">
                  {user.email || "Signed in"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Connected via Google</span>
              </div>
            </div>
          </div>
        </Section>

        <Section icon={Bell} title="Notifications" description="Control what you receive via email">
          <div className="space-y-5">
            <Toggle
              checked={weeklyDigest}
              onChange={setWeeklyDigest}
              label="Weekly Digest"
              description="A weekly report of price changes, biggest drops, alert activity, and total savings."
            />

            {weeklyDigest && (
              <div className="ml-10 pl-4 border-l-2 border-orange-200">
                <div className="flex items-center gap-1.5 mb-3">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">Send on</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDigestDay(value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        digestDay === value
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-muted-foreground border-gray-200 hover:border-orange-300 hover:text-orange-600"
                      }`}
                    >
                      {label}
                      {digestDay === value && (
                        <Check className="size-3 inline ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground">Changes are saved to your account</p>
          <Button type="submit" disabled={saving} className="gap-1.5">
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </form>
    </div>
  );
}
