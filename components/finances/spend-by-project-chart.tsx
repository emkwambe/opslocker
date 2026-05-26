"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

type Entry = {
  projectId: string;
  projectName: string;
  projectColor: string | null;
  monthlyCost: number;
  resourceCount: number;
};

const FALLBACK_COLORS = [
  "#60a5fa",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#fb923c",
  "#22d3ee",
  "#f472b6",
];

export function SpendByProjectChart({
  data,
  currency = "USD",
}: {
  data: Entry[];
  currency?: string;
}) {
  const chartData = data
    .filter((d) => d.monthlyCost > 0)
    .map((d, i) => ({
      ...d,
      fill: d.projectColor ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));

  const total = chartData.reduce((acc, d) => acc + d.monthlyCost, 0);

  if (chartData.length === 0 || total === 0) {
    return (
      <div className="text-sm text-slate-500 text-center py-12">
        No project-level spend yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="monthlyCost"
              nameKey="projectName"
              innerRadius={48}
              outerRadius={76}
              paddingAngle={2}
              stroke="#0a0b0e"
              strokeWidth={2}
            >
              {chartData.map((d) => (
                <Cell key={d.projectId} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip
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
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5">
        {chartData.map((d) => {
          const pct = total > 0 ? Math.round((d.monthlyCost / total) * 100) : 0;
          return (
            <li
              key={d.projectId}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: d.fill }}
                />
                <span className="text-slate-200 truncate">{d.projectName}</span>
                <span className="text-slate-500">{pct}%</span>
              </div>
              <span className="text-slate-300 tabular-nums shrink-0">
                {formatCurrency(d.monthlyCost, currency)}/mo
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
