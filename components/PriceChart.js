"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { getPriceHistory } from "@/app/actions";
import { Loader2 } from "lucide-react";

export default function PriceChart({ productId, targetPrice, alerts }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowest, setLowest] = useState(null);
  const [highest, setHighest] = useState(null);

  useEffect(() => {
    async function loadData() {
      const history = await getPriceHistory(productId);
      if (history.length === 0) {
        setLoading(false);
        return;
      }

      const chartData = history.map((item) => ({
        date: new Date(item.checked_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        price: parseFloat(item.price),
      }));

      const prices = chartData.map((d) => d.price);
      setLowest(Math.min(...prices));
      setHighest(Math.max(...prices));
      setData(chartData);
      setLoading(false);
    }

    loadData();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground w-full">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Loading chart...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground w-full text-sm leading-relaxed">
        Not enough data yet. Price history will populate after the first daily check.
      </div>
    );
  }

  const latestPrice = data[data.length - 1]?.price || 0;
  const firstPrice = data[0]?.price || 0;
  const change = latestPrice - firstPrice;
  const changePercent = firstPrice > 0 ? ((change / firstPrice) * 100).toFixed(1) : "0";
  const isDown = change < 0;

  const activeTarget = alerts?.find((a) => a.status === "active");
  const showTarget = activeTarget && parseFloat(activeTarget.target_price) > 0;

  const margin = (highest - lowest) * 0.15 || 10;
  const domainMin = Math.max(0, lowest - margin);
  const domainMax = highest + margin;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Low</span>
            <div className="text-sm font-bold font-mono text-foreground tracking-tight">{lowest}</div>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">High</span>
            <div className="text-sm font-bold font-mono text-foreground tracking-tight">{highest}</div>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-bold font-mono tracking-tight ${
          isDown ? "text-emerald-600" : "text-red-500"
        }`}>
          {isDown ? "↓" : "↑"} {Math.abs(change).toFixed(2)} ({isDown ? "" : "+"}{changePercent}%)
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            stroke="var(--color-border)"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            stroke="var(--color-border)"
            tickLine={false}
            axisLine={false}
            domain={[domainMin, domainMax]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              color: "var(--color-card-foreground)",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [value, "Price"]}
          />
          {showTarget && (
            <ReferenceLine
              y={parseFloat(activeTarget.target_price)}
              stroke="#10b981"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: `Target ${activeTarget.target_price}`,
                position: "insideBottomRight",
                fontSize: 11,
                fill: "#10b981",
                fontWeight: 600,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="price"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#priceGrad)"
            dot={{ fill: "#f97316", r: 3, stroke: "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#f97316", stroke: "#ffffff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
