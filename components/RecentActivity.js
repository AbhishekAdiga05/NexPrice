import { Clock, CheckCircle2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/dates";

export default function RecentActivity({ recentSavings = [], recentProducts = [] }) {
  const events = [
    ...recentSavings.map((s) => ({
      id: `saving-${s.id}`,
      type: "alert_triggered",
      date: s.triggeredAt,
      description: `Price target reached for ${s.productName}`,
      detail: `Saved ${s.currency} ${s.savings.toFixed(2)}`,
      href: `/dashboard/product/${s.productId}`,
    })),
    ...recentProducts.map((p) => ({
      id: `product-${p.id}`,
      type: "product_added",
      date: p.created_at,
      description: `Started tracking ${p.name}`,
      detail: `${p.currency} ${parseFloat(p.current_price).toFixed(2)}`,
      href: `/dashboard/product/${p.id}`,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-8 text-center">
        <Clock className="size-8 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No activity yet. Start tracking products to see updates here.</p>
      </div>
    );
  }

  const typeStyles = {
    alert_triggered: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
    product_added: "text-orange-600 bg-orange-50 border-orange-200/60",
  };

  const typeIcons = {
    alert_triggered: CheckCircle2,
    product_added: PlusCircle,
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <Clock className="size-4 text-orange-500" />
        <h3 className="text-section">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {events.map((event, idx) => {
          const Icon = typeIcons[event.type] || Clock;
          const style = typeStyles[event.type] || "text-muted-foreground bg-gray-50";
          return (
            <Link
              key={event.id}
              href={event.href}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors group"
            >
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={`size-9 rounded-xl border flex items-center justify-center ${style}`}>
                  <Icon className="size-4" />
                </div>
                {idx < events.length - 1 && (
                  <div className="w-px h-full min-h-[8px] bg-gray-100" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-foreground group-hover:text-orange-600 transition-colors truncate leading-snug">
                  {event.description}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{event.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{formatTimeAgo(event.date)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
