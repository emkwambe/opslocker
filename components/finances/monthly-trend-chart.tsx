"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Point = { month: string; label: string; total: number };

export function MonthlyTrendChart({
  data,
  currency = "USD",
}: {
  data: Point[];
  currency?: string;
}) {
  const hasData = data.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <div className="text-center py-10 px-4">
        <FileText className="w-5 h-5 text-slate-500 mx-auto" />
        <p className="text-sm text-slate-300 font-medium mt-3">
          No invoices recorded yet
        </p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Add invoices to track spend over time and detect month-over-month changes.
        </p>
        <p className="text-xs text-slate-500 mt-3">
          <Link
            href="#invoices"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Record your first invoice ↓
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid stroke="#1e2028" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
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
            cursor={{ stroke: "#1e2028", strokeWidth: 1 }}
            contentStyle={{
              background: "#0d0f14",
              border: "1px solid #1e2028",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#cbd5e1" }}
            itemStyle={{ color: "#e2e8f0" }}
            formatter={(value: number) => [
              formatCurrency(value, currency),
              "Invoiced",
            ]}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ r: 3, fill: "#60a5fa", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#60a5fa", stroke: "#0a0b0e", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
