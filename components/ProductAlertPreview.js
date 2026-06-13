import { CheckCircle2, Bell, ShoppingBag } from "lucide-react";

export default function ProductAlertPreview() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100/80 shadow-hero-card overflow-hidden max-w-sm lg:max-w-md w-full">
      <div className="flex items-center gap-3 bg-emerald-50/80 px-6 py-4 border-b border-emerald-100/60">
        <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_0_4px_rgba(34,197,94,0.12)]">
          <CheckCircle2 className="size-4.5 text-white" />
        </div>
        <div>
          <span className="text-sm font-semibold text-emerald-700">Target Reached</span>
          <p className="text-xs text-emerald-500/80 mt-0.5">Alert triggered 2 minutes ago</p>
        </div>
      </div>

      <div className="p-7">
        <div className="flex items-center gap-5">
          <div className="size-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center shrink-0">
            <ShoppingBag className="size-9 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 leading-snug">
              OnePlus 15R
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Smartphone · 256GB</p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-6 bg-gray-50/50 rounded-2xl p-5">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.06em]">
              Current Price
            </span>
            <div className="text-3xl font-bold font-mono text-foreground tracking-tight mt-1.5">
              ₹49,999
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.06em]">
              Target Price
            </span>
            <div className="text-3xl font-bold font-mono text-muted-foreground mt-1.5 line-through decoration-gray-300">
              ₹50,000
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 bg-orange-50/80 rounded-2xl px-5 py-4">
          <div className="size-9 rounded-xl bg-orange-100 flex items-center justify-center">
            <Bell className="size-4.5 text-orange-600" />
          </div>
          <div>
            <span className="text-sm font-semibold text-orange-700">Alert Sent</span>
            <p className="text-xs text-orange-500/80 mt-0.5">
              We&apos;ll notify you when the price drops again
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
