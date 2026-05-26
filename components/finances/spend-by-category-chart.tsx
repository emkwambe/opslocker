"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  database: "Database",
  api: "API",
  domain: "Domain",
  cloud: "Cloud",
  auth: "Auth",
  ci_cd: "CI/CD",
  analytics: "Analytics",
  communication: "Communication",
  storage: "Storage",
  monitoring: "Monitoring",
  subscription: "Subscription",
  other: "Other",
};

const PALETTE = [
  "#60a5fa",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#fb923c",
  "#22d3ee",
  "#f472b6",
  "#94a3b8",
  "#f87171",
  "#4ade80",
  "#facc15",
  "#818cf8",
];

type Entry = { category: string; monthlyCost: number; resourceCount: number };

export function SpendByCategoryChart({
  data,
  currency = "USD",
}: {
  data: Entry[];
  currency?: string;
}) {
  const chartData = data.map((d, i) => ({
    ...d,
    label: CATEGORY_LABEL[d.category] ?? d.category,
    fill: PALETTE[i % PALETTE.length],
  }));

  if (chartData.length === 0) {
    return (
      <div className="text-sm text-slate-500 text-center py-12">
        No tracked spend in this workspace.
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
        >
          <XAxis
            type="number"
            stroke="#475569"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v}`}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip
            cursor={{ fill: "#1a1d26" }}
            contentStyle={{
              background: "#0d0f14",
              border: "1px solid #1e2028",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#cbd5e1" }}
            itemStyle={{ color: "#e2e8f0" }}
            formatter={(value: number, _name, item) => [
              `${formatCurrency(value, currency)}/mo · ${
                (item.payload as Entry).resourceCount
              } resource${(item.payload as Entry).resourceCount === 1 ? "" : "s"}`,
              "Spend",
            ]}
          />
          <Bar dataKey="monthlyCost" radius={[4, 4, 4, 4]}>
            {chartData.map((d) => (
              <Cell key={d.category} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
