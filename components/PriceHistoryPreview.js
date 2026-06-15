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

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const DEMO_PRICES = (() => {
  const rand = seededRandom(42);
  const data = [];
  let price = 899;
  const start = new Date("2025-10-01");
  for (let i = 0; i < 30; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i * 2);
    const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    price = Math.round(price - (rand() * 15 + 5));
    data.push({ day, price });
  }
  return data;
})();

export default function PriceHistoryPreview() {
  const minPrice = Math.min(...DEMO_PRICES.map((d) => d.price));
  const maxPrice = Math.max(...DEMO_PRICES.map((d) => d.price));
  const latestPrice = DEMO_PRICES[DEMO_PRICES.length - 1].price;
  const firstPrice = DEMO_PRICES[0].price;
  const change = latestPrice - firstPrice;
  const changePercent = ((change / firstPrice) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="px-5 py-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Current</span>
          <div className="text-lg font-bold font-mono text-foreground tracking-tight mt-0.5">${latestPrice}</div>
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

      <div className="px-5 pt-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">
          Demo preview
        </span>
      </div>

      <div className="p-5">
        <div className="h-[240px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEMO_PRICES} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
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
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                  color: "var(--color-card-foreground)",
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

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-5">
            <div>
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Low</span>
              <div className="text-sm font-bold font-mono text-foreground tracking-tight mt-0.5">${minPrice}</div>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">High</span>
              <div className="text-sm font-bold font-mono text-foreground tracking-tight mt-0.5">${maxPrice}</div>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Average</span>
              <div className="text-sm font-bold font-mono text-foreground tracking-tight mt-0.5">
                ${Math.round(DEMO_PRICES.reduce((s, d) => s + d.price, 0) / DEMO_PRICES.length)}
              </div>
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
