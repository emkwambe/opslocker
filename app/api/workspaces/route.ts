import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { workspaces } from "@/lib/schema";
import { createWorkspaceSchema } from "@/lib/validators";
export async function GET() {
  try { return NextResponse.json(await getDb().select().from(workspaces)); }
  catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = createWorkspaceSchema.parse(await req.json());
    const [ws] = await getDb().insert(workspaces).values(body).returning();
    return NextResponse.json(ws, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}