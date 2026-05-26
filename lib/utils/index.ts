import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function getDaysUntil(date: string | Date): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function getRenewalSeverity(daysUntil: number): "critical" | "high" | "medium" | "low" {
  if (daysUntil <= 3) return "critical";
  if (daysUntil <= 7) return "high";
  if (daysUntil <= 30) return "medium";
  return "low";
}

export const LIFECYCLE_COLORS: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  trial: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  at_risk: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  deprecated: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  archived: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
};

export const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-400/10 border-red-400/20",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  low: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
};