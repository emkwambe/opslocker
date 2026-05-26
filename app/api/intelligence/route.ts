import { NextRequest, NextResponse } from "next/server";
import { computeInsights } from "@/lib/db/intelligence";

export async function GET(req: NextRequest) {
  try {
    const workspaceId = new URL(req.url).searchParams.get("workspaceId");
    if (!workspaceId)
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    const insights = await computeInsights(workspaceId);
    return NextResponse.json({ insights });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
