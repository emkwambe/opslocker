"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const STATE_LABEL: Record<string, string> = {
  active: "Active",
  trial: "Trial",
  at_risk: "At risk",
  deprecated: "Deprecated",
  archived: "Archived",
};

const STATE_FILL: Record<string, string> = {
  active: "#34d399",
  trial: "#60a5fa",
  at_risk: "#fbbf24",
  deprecated: "#fb923c",
  archived: "#a1a1aa",
};

type Props = { byLifecycle: Record<string, number> };

export function LifecycleBreakdownChart({ byLifecycle }: Props) {
  const data = ["active", "trial", "at_risk", "deprecated", "archived"].map((state) => ({
    state,
    label: STATE_LABEL[state],
    count: byLifecycle[state] ?? 0,
    fill: STATE_FILL[state],
  }));

  const total = data.reduce((acc, d) => acc + d.count, 0);

  if (total === 0) {
    return (
      <div className="text-sm text-slate-500 text-center py-10">
        No resources yet.
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
        >
          <XAxis
            type="number"
            allowDecimals={false}
            stroke="#475569"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={80}
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
            formatter={(value: number) => [`${value} resource${value === 1 ? "" : "s"}`, "Count"]}
          />
          <Bar dataKey="count" radius={[4, 4, 4, 4]}>
            {data.map((d) => (
              <Cell key={d.state} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
