import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { resources } from "@/lib/schema";

export async function GET(req: NextRequest) {
  try {
    const workspaceId = new URL(req.url).searchParams.get("workspaceId");
    if (!workspaceId)
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    const all = await getDb()
      .select()
      .from(resources)
      .where(eq(resources.workspaceId, workspaceId));

    const totalMonthlyCost = all
      .filter((r) => r.lifecycleState !== "archived")
      .reduce((sum, r) => sum + (r.monthlyCost ?? 0), 0);

    const byLifecycle = {
      active: 0,
      trial: 0,
      at_risk: 0,
      deprecated: 0,
      archived: 0,
    } as Record<string, number>;
    for (const r of all) {
      byLifecycle[r.lifecycleState] = (byLifecycle[r.lifecycleState] ?? 0) + 1;
    }

    const today = new Date().toISOString().slice(0, 10);
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 90);
    const horizonISO = horizon.toISOString().slice(0, 10);

    const upcomingRenewals = all
      .filter(
        (r) =>
          r.renewalDate &&
          r.renewalDate >= today &&
          r.renewalDate <= horizonISO &&
          r.lifecycleState !== "archived"
      )
      .sort((a, b) => (a.renewalDate ?? "").localeCompare(b.renewalDate ?? ""));

    const inactiveVendors = all
      .filter((r) => r.lifecycleState === "deprecated" || r.lifecycleState === "archived")
      .sort((a, b) => a.name.localeCompare(b.name));

    const spendByCategory: Record<string, number> = {};
    for (const r of all) {
      if (r.lifecycleState === "archived") continue;
      const cost = r.monthlyCost ?? 0;
      if (cost <= 0) continue;
      spendByCategory[r.category] = (spendByCategory[r.category] ?? 0) + cost;
    }

    return NextResponse.json({
      totalMonthlyCost,
      byLifecycle,
      upcomingRenewals,
      inactiveVendors,
      spendByCategory,
      currency: all[0]?.currency ?? "USD",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
