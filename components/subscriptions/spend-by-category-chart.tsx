"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

type Props = { spendByCategory: Record<string, number>; currency?: string };

export function SpendByCategoryChart({ spendByCategory, currency = "USD" }: Props) {
  const data = Object.entries(spendByCategory)
    .map(([category, amount], i) => ({
      category,
      label: CATEGORY_LABEL[category] ?? category,
      amount,
      fill: PALETTE[i % PALETTE.length],
    }))
    .sort((a, b) => b.amount - a.amount);

  if (data.length === 0) {
    return (
      <div className="text-sm text-slate-500 text-center py-10">
        No tracked spend in this workspace.
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 4, left: 4 }}
        >
          <XAxis
            dataKey="label"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-25}
            dy={8}
            height={42}
          />
          <YAxis
            stroke="#475569"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v}`}
            width={48}
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
            formatter={(value: number) => [`${formatCurrency(value, currency)}/mo`, "Spend"]}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.category} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
