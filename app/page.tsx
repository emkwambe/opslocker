import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { workspaces } from "@/lib/schema";
import { Landing } from "@/components/landing/landing";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const rows = await getDb().select({ id: workspaces.id }).from(workspaces).limit(1);
  if (rows.length > 0) {
    redirect("/dashboard");
  }
  return <Landing />;
}
