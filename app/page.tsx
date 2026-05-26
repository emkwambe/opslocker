import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { workspaces } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const rows = await getDb().select({ id: workspaces.id }).from(workspaces).limit(1);
  redirect(rows.length === 0 ? "/setup" : "/dashboard");
}
