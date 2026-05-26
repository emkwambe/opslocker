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

function reviewedDaysAgo(days: number): string {
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
        notes:
          "Primary LLM backbone for TaxPilot document analysis. Switched from GPT-3.5 to GPT-4o in March 2026 — quality jump justified the 2x cost. Anthropic is the leading fallback if pricing changes.",
        tags: ["llm", "core"],
        website: "https://platform.openai.com",
        lastReviewedAt: reviewedDaysAgo(18),
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
        notes:
          "Customer billing for TaxPilot — per-transaction pricing, no recurring subscription fee. Connect account is in test mode for sandboxed customers.",
        tags: ["billing"],
        website: "https://stripe.com",
        lastReviewedAt: reviewedDaysAgo(42),
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
        notes:
          "Frontend + serverless hosting for TaxPilot. Bumped from Hobby to Pro in March 2026 for the bandwidth + team seats. Build-time budget watched via the dashboard.",
        tags: ["hosting"],
        website: "https://vercel.com",
        lastReviewedAt: reviewedDaysAgo(7),
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
        notes:
          "Transactional email for receipts, renewal notices, and password resets. SPF + DKIM verified for mpingo.io and taxpilot.ai.",
        tags: ["email"],
        website: "https://resend.com",
        lastReviewedAt: reviewedDaysAgo(60),
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
        notes:
          "Auth provider — replaced Auth0 in January 2026 due to pricing. Handles SSO for enterprise customers and is on the critical login path.",
        tags: ["auth"],
        website: "https://clerk.com",
        lastReviewedAt: reviewedDaysAgo(28),
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
        notes:
          "Production database for TaxPilot — Postgres + storage + auth tokens. Daily encrypted backups, PITR enabled. Do not deprecate without a full migration plan.",
        tags: ["database", "core"],
        website: "https://supabase.com",
        lastReviewedAt: reviewedDaysAgo(11),
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
        notes:
          "Trial credits for Claude — evaluating against OpenAI for memory summarization in VaultNoir. Decision deadline before trial expiry.",
        tags: ["llm", "evaluation"],
        website: "https://console.anthropic.com",
        lastReviewedAt: null,
      },
      {
        projectId: vaultnoir.id,
        workspaceId: workspace.id,
        name: "Cloudflare R2",
        vendorName: "Cloudflare",
        category: "storage",
        environment: "staging",
        owner: null,
        lifecycleState: "active",
        renewalDate: addDays(now, 38),
        monthlyCost: 8,
        notes:
          "Encrypted blob storage for VaultNoir memory snapshots. Previously owned by an ex-contractor — needs an owner reassigned before next renewal.",
        tags: ["storage"],
        website: "https://www.cloudflare.com/products/r2/",
        lastReviewedAt: null,
      },
      {
        projectId: vaultnoir.id,
        workspaceId: workspace.id,
        name: "PostHog Cloud",
        vendorName: "PostHog",
        category: "analytics",
        environment: "staging",
        owner: null,
        lifecycleState: "at_risk",
        renewalDate: addDays(now, 6),
        monthlyCost: 49,
        notes:
          "Originally added by an ex-contractor for VaultNoir analytics — current usage unclear, no owner, and the account access list hasn't been audited. Review before renewal.",
        tags: ["analytics", "review-needed"],
        website: "https://posthog.com",
        lastReviewedAt: null,
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
        notes:
          "Source control + Actions CI for every Mpingo project. SSO enforced, branch protections required on main. Org owner controls billing.",
        tags: ["scm", "shared"],
        website: "https://github.com",
        lastReviewedAt: reviewedDaysAgo(120),
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
        notes:
          "Issue tracking + roadmapping. Reduced from 5 seats to 3 last month after team consolidation. Slack integration drives notification fanout.",
        tags: ["pm"],
        website: "https://linear.app",
        lastReviewedAt: reviewedDaysAgo(35),
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
          "Previous APM tool — replaced by Vercel observability in March 2026 but the subscription kept billing. Cancel before the next renewal to stop the $31/mo bleed.",
        tags: ["cleanup"],
        website: "https://www.datadoghq.com",
        lastReviewedAt: null,
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
      description:
        "OpenAI Platform added to TaxPilot AI — production API integration for document reasoning",
      timestamp: isoDaysAgo(34),
    },
    {
      workspaceId: workspace.id,
      projectId: taxpilot.id,
      resourceId: byName["OpenAI Platform"].id,
      eventType: "resource_updated",
      actor: "Eddy Mkwambe",
      description:
        "OpenAI Platform model upgraded from GPT-3.5 to GPT-4o — accuracy gain justified higher per-token cost",
      timestamp: isoDaysAgo(28),
    },
    {
      workspaceId: workspace.id,
      projectId: taxpilot.id,
      resourceId: byName["Supabase"].id,
      eventType: "subscription_upgraded",
      actor: "Eddy Mkwambe",
      description:
        "Supabase upgraded from Free to Pro for TaxPilot AI — point-in-time recovery and daily encrypted backups enabled",
      timestamp: isoDaysAgo(21),
    },
    {
      workspaceId: workspace.id,
      projectId: taxpilot.id,
      resourceId: byName["Clerk"].id,
      eventType: "resource_created",
      actor: "Eddy Mkwambe",
      description:
        "Clerk added to TaxPilot AI as auth provider — replaced Auth0 to cut $89/mo and unlock org SSO",
      timestamp: isoDaysAgo(40),
    },
    {
      workspaceId: workspace.id,
      projectId: taxpilot.id,
      resourceId: byName["Vercel Pro"].id,
      eventType: "renewal_flagged",
      actor: "system",
      description:
        "Vercel Pro renews in 4 days — $20/mo recurring, hosts customer-facing TaxPilot frontend",
      timestamp: isoDaysAgo(2),
    },
    {
      workspaceId: workspace.id,
      projectId: vaultnoir.id,
      resourceId: byName["PostHog Cloud"].id,
      eventType: "ownership_changed",
      actor: "Eddy Mkwambe",
      description:
        "PostHog Cloud owner cleared — ex-contractor offboarded, no current owner before next renewal",
      timestamp: isoDaysAgo(5),
    },
    {
      workspaceId: workspace.id,
      projectId: vaultnoir.id,
      resourceId: byName["Cloudflare R2"].id,
      eventType: "ownership_changed",
      actor: "Eddy Mkwambe",
      description:
        "Cloudflare R2 ownership cleared — ex-contractor offboarded, needs an owner before VaultNoir launch",
      timestamp: isoDaysAgo(5),
    },
    {
      workspaceId: workspace.id,
      projectId: internal.id,
      resourceId: byName["Datadog Lite"].id,
      eventType: "service_deprecated",
      actor: "Eddy Mkwambe",
      description:
        "Datadog Lite marked deprecated — replaced by Vercel observability, cancel before next billing cycle to stop the $31/mo bleed",
      timestamp: isoDaysAgo(9),
    },
    {
      workspaceId: workspace.id,
      projectId: vaultnoir.id,
      resourceId: byName["Anthropic API"].id,
      eventType: "resource_created",
      actor: "Eddy Mkwambe",
      description:
        "Anthropic API trial added to VaultNoir — evaluating Claude against OpenAI for memory summarization",
      timestamp: isoDaysAgo(13),
    },
    {
      workspaceId: workspace.id,
      projectId: taxpilot.id,
      resourceId: byName["Clerk"].id,
      eventType: "secret_rotated",
      actor: "Eddy Mkwambe",
      description:
        "Clerk API key rotated as part of quarterly review — old key revoked, deployment redeployed cleanly",
      timestamp: isoDaysAgo(1),
    },
    {
      workspaceId: workspace.id,
      projectId: taxpilot.id,
      resourceId: byName["OpenAI Platform"].id,
      eventType: "resource_reviewed",
      actor: "Eddy Mkwambe",
      description: "OpenAI Platform reviewed — operational status confirmed",
      timestamp: isoDaysAgo(18),
    },
    {
      workspaceId: workspace.id,
      projectId: taxpilot.id,
      resourceId: byName["Vercel Pro"].id,
      eventType: "resource_reviewed",
      actor: "Eddy Mkwambe",
      description: "Vercel Pro reviewed — operational status confirmed",
      timestamp: isoDaysAgo(7),
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
  function monthsAgo(months: number, day = 8): string {
    const d = new Date(now.getFullYear(), now.getMonth() - months, day);
    return d.toISOString().slice(0, 10);
  }
  function periodMonthsAgo(months: number): string {
    const d = new Date(now.getFullYear(), now.getMonth() - months, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  await db.insert(invoices).values([
    // OpenAI — usage climbing
    { resourceId: byName["OpenAI Platform"].id, vendor: "OpenAI", amount: 215.4, currency: "USD", billingPeriod: periodMonthsAgo(5), invoiceDate: monthsAgo(5) },
    { resourceId: byName["OpenAI Platform"].id, vendor: "OpenAI", amount: 248.92, currency: "USD", billingPeriod: periodMonthsAgo(4), invoiceDate: monthsAgo(4) },
    { resourceId: byName["OpenAI Platform"].id, vendor: "OpenAI", amount: 291.07, currency: "USD", billingPeriod: periodMonthsAgo(3), invoiceDate: monthsAgo(3) },
    { resourceId: byName["OpenAI Platform"].id, vendor: "OpenAI", amount: 332.58, currency: "USD", billingPeriod: periodMonthsAgo(2), invoiceDate: monthsAgo(2) },
    { resourceId: byName["OpenAI Platform"].id, vendor: "OpenAI", amount: 382.14, currency: "USD", billingPeriod: periodMonthsAgo(1), invoiceDate: monthsAgo(1), notes: "Embeddings + GPT-4o" },

    // Supabase — flat $25/mo
    { resourceId: byName["Supabase"].id, vendor: "Supabase", amount: 25, currency: "USD", billingPeriod: periodMonthsAgo(4), invoiceDate: monthsAgo(4, 14) },
    { resourceId: byName["Supabase"].id, vendor: "Supabase", amount: 25, currency: "USD", billingPeriod: periodMonthsAgo(3), invoiceDate: monthsAgo(3, 14) },
    { resourceId: byName["Supabase"].id, vendor: "Supabase", amount: 25, currency: "USD", billingPeriod: periodMonthsAgo(2), invoiceDate: monthsAgo(2, 14) },
    { resourceId: byName["Supabase"].id, vendor: "Supabase", amount: 25, currency: "USD", billingPeriod: periodMonthsAgo(1), invoiceDate: monthsAgo(1, 14) },

    // Vercel — bumped up two months ago
    { resourceId: byName["Vercel Pro"].id, vendor: "Vercel", amount: 20, currency: "USD", billingPeriod: periodMonthsAgo(3), invoiceDate: monthsAgo(3, 22) },
    { resourceId: byName["Vercel Pro"].id, vendor: "Vercel", amount: 20, currency: "USD", billingPeriod: periodMonthsAgo(2), invoiceDate: monthsAgo(2, 22) },
    { resourceId: byName["Vercel Pro"].id, vendor: "Vercel", amount: 35, currency: "USD", billingPeriod: periodMonthsAgo(1), invoiceDate: monthsAgo(1, 22), notes: "Plan upgraded mid-cycle" },

    // Datadog Lite — being phased out
    { resourceId: byName["Datadog Lite"].id, vendor: "Datadog", amount: 31, currency: "USD", billingPeriod: periodMonthsAgo(2), invoiceDate: monthsAgo(2, 5) },
    { resourceId: byName["Datadog Lite"].id, vendor: "Datadog", amount: 31, currency: "USD", billingPeriod: periodMonthsAgo(1), invoiceDate: monthsAgo(1, 5) },
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
