/* eslint-disable no-console */
import { getDb } from "../lib/db/client";
import {
  invoices,
  operationalEvents,
  projects,
  relationships,
  reminders,
  resources,
  workspaces,
} from "../lib/schema";

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

async function main() {
  const db = getDb();
  const now = new Date();

  console.log("Clearing existing data…");
  await db.delete(reminders);
  await db.delete(invoices);
  await db.delete(operationalEvents);
  await db.delete(relationships);
  await db.delete(resources);
  await db.delete(projects);
  await db.delete(workspaces);

  console.log("Inserting workspace…");
  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: "Mpingo Systems",
      description: "Operational memory across all Mpingo infrastructure",
      isDefault: true,
    })
    .returning();

  console.log("Inserting projects…");
  const [taxpilot, vaultnoir, internal] = await db
    .insert(projects)
    .values([
      {
        workspaceId: workspace.id,
        name: "TaxPilot AI",
        description: "AI tax-filing copilot — production application",
        environment: "production",
        color: "#3b82f6",
        tags: ["customer-facing", "ai"],
      },
      {
        workspaceId: workspace.id,
        name: "VaultNoir",
        description: "Encrypted memory product — staging environment",
        environment: "staging",
        color: "#8b5cf6",
        tags: ["product", "encryption"],
      },
      {
        workspaceId: workspace.id,
        name: "Internal Tools",
        description: "Shared developer and ops infrastructure",
        environment: "all",
        color: "#10b981",
        tags: ["internal", "shared"],
      },
    ])
    .returning();

  console.log("Inserting resources…");
  const inserted = await db
    .insert(resources)
    .values([
      // TaxPilot AI stack
      {
        projectId: taxpilot.id,
        workspaceId: workspace.id,
        name: "OpenAI Platform",
        vendorName: "OpenAI",
        category: "api",
        environment: "production",
        owner: "Eddy Mkwambe",
        lifecycleState: "active",
        renewalDate: addDays(now, 12),
        monthlyCost: 380,
        notes: "GPT-4o + embeddings for TaxPilot return reasoning.",
        tags: ["llm", "core"],
        website: "https://platform.openai.com",
      },
      {
        projectId: taxpilot.id,
        workspaceId: workspace.id,
        name: "Stripe",
        vendorName: "Stripe",
        category: "subscription",
        environment: "production",
        owner: "Eddy Mkwambe",
        lifecycleState: "active",
        renewalDate: null,
        monthlyCost: 0,
        notes: "Customer billing for TaxPilot. Per-transaction pricing.",
        tags: ["billing"],
        website: "https://stripe.com",
      },
      {
        projectId: taxpilot.id,
        workspaceId: workspace.id,
        name: "Vercel Pro",
        vendorName: "Vercel",
        category: "cloud",
        environment: "production",
        owner: "Eddy Mkwambe",
        lifecycleState: "active",
        renewalDate: addDays(now, 4),
        monthlyCost: 20,
        notes: "Frontend + serverless hosting for TaxPilot.",
        tags: ["hosting"],
        website: "https://vercel.com",
      },
      {
        projectId: taxpilot.id,
        workspaceId: workspace.id,
        name: "Resend",
        vendorName: "Resend",
        category: "communication",
        environment: "production",
        owner: "Operations",
        lifecycleState: "active",
        renewalDate: addDays(now, 21),
        monthlyCost: 20,
        notes: "Transactional email for receipts and renewal notices.",
        tags: ["email"],
        website: "https://resend.com",
      },
      {
        projectId: taxpilot.id,
        workspaceId: workspace.id,
        name: "Clerk",
        vendorName: "Clerk",
        category: "auth",
        environment: "production",
        owner: "Eddy Mkwambe",
        lifecycleState: "active",
        renewalDate: addDays(now, 55),
        monthlyCost: 25,
        notes: "Customer authentication and session management.",
        tags: ["auth"],
        website: "https://clerk.com",
      },
      {
        projectId: taxpilot.id,
        workspaceId: workspace.id,
        name: "Supabase",
        vendorName: "Supabase",
        category: "database",
        environment: "production",
        owner: "Eddy Mkwambe",
        lifecycleState: "active",
        renewalDate: addDays(now, 9),
        monthlyCost: 25,
        notes: "Primary Postgres + storage. Encrypted backups daily.",
        tags: ["database", "core"],
        website: "https://supabase.com",
      },
      // VaultNoir stack
      {
        projectId: vaultnoir.id,
        workspaceId: workspace.id,
        name: "Anthropic API",
        vendorName: "Anthropic",
        category: "api",
        environment: "staging",
        owner: "Eddy Mkwambe",
        lifecycleState: "trial",
        renewalDate: addDays(now, 2),
        monthlyCost: 0,
        notes: "Trial credits for Claude — evaluating memory summarization.",
        tags: ["llm", "evaluation"],
        website: "https://console.anthropic.com",
      },
      {
        projectId: vaultnoir.id,
        workspaceId: workspace.id,
        name: "Cloudflare R2",
        vendorName: "Cloudflare",
        category: "storage",
        environment: "staging",
        owner: "Eddy Mkwambe",
        lifecycleState: "active",
        renewalDate: addDays(now, 38),
        monthlyCost: 8,
        notes: "Encrypted blob storage for memory snapshots.",
        tags: ["storage"],
        website: "https://www.cloudflare.com/products/r2/",
      },
      {
        projectId: vaultnoir.id,
        workspaceId: workspace.id,
        name: "PostHog Cloud",
        vendorName: "PostHog",
        category: "analytics",
        environment: "staging",
        owner: "Marketing",
        lifecycleState: "at_risk",
        renewalDate: addDays(now, 6),
        monthlyCost: 49,
        notes: "Originally added by ex-contractor — current usage unclear.",
        tags: ["analytics", "review-needed"],
        website: "https://posthog.com",
      },
      // Internal Tools
      {
        projectId: internal.id,
        workspaceId: workspace.id,
        name: "GitHub Team",
        vendorName: "GitHub",
        category: "ci_cd",
        environment: "all",
        owner: "Eddy Mkwambe",
        lifecycleState: "active",
        renewalDate: addDays(now, 75),
        monthlyCost: 44,
        notes: "Source control + Actions CI for all Mpingo projects.",
        tags: ["scm", "shared"],
        website: "https://github.com",
      },
      {
        projectId: internal.id,
        workspaceId: workspace.id,
        name: "Linear",
        vendorName: "Linear",
        category: "communication",
        environment: "all",
        owner: "Eddy Mkwambe",
        lifecycleState: "active",
        renewalDate: addDays(now, 26),
        monthlyCost: 16,
        notes: "Issue tracking + roadmapping for engineering.",
        tags: ["pm"],
        website: "https://linear.app",
      },
      {
        projectId: internal.id,
        workspaceId: workspace.id,
        name: "Datadog Lite",
        vendorName: "Datadog",
        category: "monitoring",
        environment: "production",
        owner: null,
        lifecycleState: "deprecated",
        renewalDate: addDays(now, 18),
        monthlyCost: 31,
        notes:
          "Previous APM tool — replaced by Vercel observability. Cancel before renewal.",
        tags: ["cleanup"],
        website: "https://www.datadoghq.com",
      },
    ])
    .returning();

  const byName: Record<string, (typeof inserted)[number]> = Object.fromEntries(
    inserted.map((r) => [r.name, r])
  );

  console.log("Inserting relationships…");
  const taxpilotApp = byName["Vercel Pro"];
  await db.insert(relationships).values([
    { sourceResourceId: taxpilotApp.id, targetResourceId: byName["OpenAI Platform"].id, relationshipType: "depends_on" },
    { sourceResourceId: taxpilotApp.id, targetResourceId: byName["Supabase"].id, relationshipType: "depends_on" },
    { sourceResourceId: taxpilotApp.id, targetResourceId: byName["Clerk"].id, relationshipType: "authenticates_with" },
    { sourceResourceId: taxpilotApp.id, targetResourceId: byName["Resend"].id, relationshipType: "sends_through" },
    { sourceResourceId: taxpilotApp.id, targetResourceId: byName["Stripe"].id, relationshipType: "bills_through" },
    { sourceResourceId: byName["Cloudflare R2"].id, targetResourceId: byName["Anthropic API"].id, relationshipType: "depends_on" },
  ]);

  console.log("Inserting operational events…");
  await db.insert(operationalEvents).values([
    {
      workspaceId: workspace.id,
      projectId: taxpilot.id,
      resourceId: byName["OpenAI Platform"].id,
      eventType: "resource_created",
      actor: "Eddy Mkwambe",
      description: "OpenAI Platform registered for TaxPilot AI",
      timestamp: isoDaysAgo(34),
    },
    {
      workspaceId: workspace.id,
      projectId: taxpilot.id,
      resourceId: byName["Supabase"].id,
      eventType: "subscription_upgraded",
      actor: "Eddy Mkwambe",
      description: "Supabase upgraded to Pro plan",
      timestamp: isoDaysAgo(21),
    },
    {
      workspaceId: workspace.id,
      projectId: taxpilot.id,
      resourceId: byName["Vercel Pro"].id,
      eventType: "renewal_flagged",
      actor: "system",
      description: "Vercel Pro renews in 4 days",
      timestamp: isoDaysAgo(2),
    },
    {
      workspaceId: workspace.id,
      projectId: vaultnoir.id,
      resourceId: byName["PostHog Cloud"].id,
      eventType: "ownership_changed",
      actor: "Eddy Mkwambe",
      description: "PostHog Cloud owner cleared — pending reassignment",
      timestamp: isoDaysAgo(5),
    },
    {
      workspaceId: workspace.id,
      projectId: internal.id,
      resourceId: byName["Datadog Lite"].id,
      eventType: "service_deprecated",
      actor: "Eddy Mkwambe",
      description: "Datadog Lite marked deprecated — replaced by Vercel observability",
      timestamp: isoDaysAgo(9),
    },
    {
      workspaceId: workspace.id,
      projectId: vaultnoir.id,
      resourceId: byName["Anthropic API"].id,
      eventType: "resource_created",
      actor: "Eddy Mkwambe",
      description: "Anthropic API trial added for VaultNoir evaluation",
      timestamp: isoDaysAgo(13),
    },
    {
      workspaceId: workspace.id,
      projectId: taxpilot.id,
      resourceId: byName["Clerk"].id,
      eventType: "secret_rotated",
      actor: "Eddy Mkwambe",
      description: "Clerk API key rotated as part of quarterly review",
      timestamp: isoDaysAgo(1),
    },
    {
      workspaceId: workspace.id,
      projectId: internal.id,
      resourceId: byName["Linear"].id,
      eventType: "resource_updated",
      actor: "Eddy Mkwambe",
      description: "Linear seats reduced from 5 to 3",
      timestamp: isoDaysAgo(7),
    },
  ]);

  console.log("Inserting reminders…");
  await db.insert(reminders).values([
    {
      resourceId: byName["Vercel Pro"].id,
      reminderType: "renewal",
      triggerDate: addDays(now, 2),
      severity: "high",
      message: "Vercel Pro renews in 4 days — confirm continued use.",
    },
    {
      resourceId: byName["Anthropic API"].id,
      reminderType: "trial_expiration",
      triggerDate: addDays(now, 1),
      severity: "critical",
      message: "Anthropic trial credits expire — decide on conversion.",
    },
    {
      resourceId: byName["PostHog Cloud"].id,
      reminderType: "ownership_review",
      triggerDate: addDays(now, 3),
      severity: "high",
      message: "PostHog Cloud has no owner — assign before renewal.",
    },
    {
      resourceId: byName["Datadog Lite"].id,
      reminderType: "lifecycle_review",
      triggerDate: addDays(now, 14),
      severity: "medium",
      message: "Datadog Lite is deprecated — cancel before next billing cycle.",
    },
  ]);

  console.log("Inserting sample invoices…");
  await db.insert(invoices).values([
    {
      resourceId: byName["OpenAI Platform"].id,
      vendor: "OpenAI",
      amount: 382.14,
      currency: "USD",
      billingPeriod: "2026-04",
      invoiceDate: addDays(now, -12),
      notes: "April usage — embeddings + GPT-4o",
    },
    {
      resourceId: byName["Supabase"].id,
      vendor: "Supabase",
      amount: 25,
      currency: "USD",
      billingPeriod: "2026-04",
      invoiceDate: addDays(now, -8),
    },
    {
      resourceId: byName["Vercel Pro"].id,
      vendor: "Vercel",
      amount: 20,
      currency: "USD",
      billingPeriod: "2026-04",
      invoiceDate: addDays(now, -25),
    },
  ]);

  console.log("Seed complete.");
  console.log(`  workspace: ${workspace.name}`);
  console.log(`  projects:  ${[taxpilot, vaultnoir, internal].length}`);
  console.log(`  resources: ${inserted.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
