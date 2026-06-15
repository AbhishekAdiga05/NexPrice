"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/app/actions";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingDown, Sparkles, Activity } from "lucide-react";
import { calculateDealScore } from "@/lib/deal-score";
import { createClient } from "@/utils/supabase/client";

export default function DashboardAnalyticsChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const products = await getProducts();
      if (cancelled || !products.length) {
        if (!cancelled) setLoading(false);
        return;
      }

      const productIds = products.map((p) => p.id);
      const supabase = createClient();

      const { data: historyRows } = await supabase
        .from("price_history")
        .select("product_id, price")
        .in("product_id", productIds)
        .order("checked_at", { ascending: true });

      const historyByProduct = {};
      for (const h of historyRows || []) {
        if (!historyByProduct[h.product_id]) historyByProduct[h.product_id] = [];
        historyByProduct[h.product_id].push({ price: h.price });
      }

      const dealScores = products.map((p) => {
        const history = historyByProduct[p.id] || [];
        const score = calculateDealScore(parseFloat(p.current_price), history);
        return {
          name: p.name?.substring(0, 18) || "Product",
          score: score?.score ?? 0,
          price: parseFloat(p.current_price),
          currency: p.currency || "₹",
        };
      });

      dealScores.sort((a, b) => b.score - a.score);

      const avgScore = dealScores.length
        ? Math.round(dealScores.reduce((s, p) => s + p.score, 0) / dealScores.length)
        : 0;
      const avgPrice = dealScores.length
        ? dealScores.reduce((s, p) => s + p.price, 0) / dealScores.length
        : 0;

      const chartData = dealScores.slice(0, 8);

      if (!cancelled) {
        setData({ chartData, avgScore, avgPrice, total: dealScores.length });
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
          <Loader2 className="size-3.5 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="size-3.5" />
          Add products to see analytics
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-orange-500" />
          <span className="text-sm font-semibold text-foreground">Overview</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Sparkles className="size-3 text-orange-500" />
            Avg Score: <span className="font-bold text-foreground font-mono">{data.avgScore}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <TrendingDown className="size-3 text-emerald-500" />
            Products: <span className="font-bold text-foreground font-mono">{data.total}</span>
          </span>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={24}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
                formatter={(value, name) => [
                  name === "score" ? `${value}/100` : value,
                  name === "score" ? "Deal Score" : "Price",
                ]}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#scoreGrad)"
                dot={{ r: 3, fill: "#f97316", stroke: "white", strokeWidth: 2 }}
                activeDot={{ r: 4, fill: "#f97316", stroke: "white", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
