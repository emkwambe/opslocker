"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function relative(then: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export function LastUpdated({ timestampMs }: { timestampMs: number }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <p
      className="inline-flex items-center gap-1.5 text-xs text-slate-500"
      title={new Date(timestampMs).toLocaleString()}
    >
      <Clock className="w-3 h-3" />
      Last updated {relative(timestampMs)}
    </p>
  );
}
