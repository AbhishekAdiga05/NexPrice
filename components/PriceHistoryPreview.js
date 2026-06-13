"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const MOCK_PRICES = [
  { day: "Oct 1", price: 899 },
  { day: "Oct 3", price: 879 },
  { day: "Oct 5", price: 869 },
  { day: "Oct 7", price: 849 },
  { day: "Oct 9", price: 839 },
  { day: "Oct 11", price: 829 },
  { day: "Oct 13", price: 819 },
  { day: "Oct 15", price: 824 },
  { day: "Oct 17", price: 809 },
  { day: "Oct 19", price: 799 },
  { day: "Oct 21", price: 789 },
  { day: "Oct 23", price: 779 },
  { day: "Oct 25", price: 769 },
  { day: "Oct 27", price: 759 },
  { day: "Oct 29", price: 749 },
  { day: "Oct 31", price: 739 },
  { day: "Nov 2", price: 729 },
  { day: "Nov 4", price: 719 },
  { day: "Nov 6", price: 714 },
  { day: "Nov 8", price: 709 },
  { day: "Nov 10", price: 699 },
  { day: "Nov 12", price: 694 },
  { day: "Nov 14", price: 689 },
  { day: "Nov 16", price: 749 },
  { day: "Nov 18", price: 729 },
  { day: "Nov 20", price: 709 },
  { day: "Nov 22", price: 689 },
  { day: "Nov 24", price: 674 },
  { day: "Nov 26", price: 664 },
  { day: "Nov 28", price: 659 },
];

export default function PriceHistoryPreview() {
  const minPrice = Math.min(...MOCK_PRICES.map((d) => d.price));
  const maxPrice = Math.max(...MOCK_PRICES.map((d) => d.price));
  const latestPrice = MOCK_PRICES[MOCK_PRICES.length - 1].price;
  const firstPrice = MOCK_PRICES[0].price;
  const change = latestPrice - firstPrice;
  const changePercent = ((change / firstPrice) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        <div className="px-5 py-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Current</span>
          <div className="text-lg font-bold font-mono text-foreground tracking-tight mt-0.5">$659</div>
        </div>
        <div className="px-5 py-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Target</span>
          <div className="text-lg font-bold font-mono text-foreground tracking-tight mt-0.5">$699</div>
        </div>
        <div className="px-5 py-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Change</span>
          <div className="text-lg font-bold font-mono text-emerald-600 tracking-tight mt-0.5">
            -{changePercent}%
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="h-[240px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_PRICES} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                domain={[minPrice - 50, maxPrice + 50]}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
                formatter={(value) => [`$${value}`, "Price"]}
                labelStyle={{ fontWeight: 600, marginBottom: 2 }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-5">
            <div>
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Low</span>
              <div className="text-sm font-bold font-mono text-foreground tracking-tight mt-0.5">$659</div>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">High</span>
              <div className="text-sm font-bold font-mono text-foreground tracking-tight mt-0.5">$899</div>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Average</span>
              <div className="text-sm font-bold font-mono text-foreground tracking-tight mt-0.5">$759</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg">
            <span className="size-1.5 rounded-full bg-teal-500" />
            Near low
          </span>
        </div>
      </div>
    </div>
  );
}
