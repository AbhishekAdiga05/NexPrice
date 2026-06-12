import { Clock, CheckCircle2, PlusCircle } from "lucide-react";
import Link from "next/link";

function formatTimeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

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

  if (events.length === 0) return null;

  const typeStyles = {
    alert_triggered: "text-emerald-600 bg-emerald-50",
    product_added: "text-orange-600 bg-orange-50",
  };

  const typeIcons = {
    alert_triggered: CheckCircle2,
    product_added: PlusCircle,
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200/60 shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
        <Clock className="size-3.5 text-orange-500" />
        <h3 className="text-section">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {events.map((event) => {
          const Icon = typeIcons[event.type] || Clock;
          const style = typeStyles[event.type] || "text-gray-600 bg-gray-50";
          return (
            <Link
              key={event.id}
              href={event.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
            >
              <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${style}`}>
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors truncate leading-snug">
                  {event.description}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{event.detail}</p>
              </div>
              <span className="text-[11px] text-gray-400 shrink-0">{formatTimeAgo(event.date)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
