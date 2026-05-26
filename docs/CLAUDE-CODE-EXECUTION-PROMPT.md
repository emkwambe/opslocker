# OPSLOCKER — CLAUDE CODE MASTER EXECUTION PROMPT
## Mpingo Systems LLC | Technical Director: Eddy Mkwambe

---

# CONTEXT

You are the autonomous senior engineering team building OpsLocker —
an infrastructure and operational memory platform for modern engineering teams.

Project location: C:\Users\HP\Documents\opslocker

Full product specifications are in docs/:
- docs/OpsLocker-PRD-and-TRD.md
- docs/OpsLocker-Value-Proposition-and-Monetization.md

Read BOTH documents before writing any code.

---

# WHAT IS ALREADY SCAFFOLDED

- package.json (all dependencies defined)
- tsconfig.json, next.config.js, tailwind.config.ts, postcss.config.js, drizzle.config.ts
- lib/schema/index.ts — full Drizzle SQLite schema (8 tables)
- lib/db/client.ts — SQLite connection with WAL mode
- lib/validators/index.ts — Zod validators
- lib/utils/index.ts — cn, formatCurrency, formatDate helpers
- store/index.ts — Zustand stores (workspace + UI)
- types/index.ts — TypeScript domain types
- app/layout.tsx, app/globals.css, app/page.tsx (redirects to /dashboard)
- app/dashboard/layout.tsx, app/dashboard/page.tsx
- components/layout/app-sidebar.tsx, app-header.tsx
- app/api/resources/route.ts, app/api/workspaces/route.ts, app/api/export/route.ts
- Page stubs for: projects, registry, graph, timeline, subscriptions, reminders, search, settings

---

# YOUR FIRST THREE COMMANDS

## 1. Install dependencies
npm install

## 2. Run DB migration
npx drizzle-kit generate
npx drizzle-kit migrate

## 3. Verify dev server starts
npm run dev
# Confirm http://localhost:3000 loads before building features

---

# SPRINT BUILD ORDER — FOLLOW THIS EXACTLY

## SPRINT 1 — Foundation
1. Run: npx shadcn@latest init (dark theme, slate base color, CSS variables ON)
2. Add shadcn components needed: button, input, label, card, dialog, select, badge, tabs, tooltip, separator, scroll-area, dropdown-menu
3. Workspace initialization flow: if no workspace exists, show a first-run screen to create one
4. Dashboard page: 4 summary metric cards (total resources, active, at-risk, upcoming renewals), renewal risk panel, recent activity feed
5. Database seed script at scripts/seed.ts with realistic sample data (3 projects, 10+ resources, relationships, events)

## SPRINT 2 — Projects & Registry
6. Projects page: list view with cards, create project dialog, filter by environment/tags
7. Registry page: full resource list with TanStack Table, filters (lifecycle/category/env/owner), create resource form
8. Resource detail: slide-over drawer with full metadata, edit form, operational event log, reminders panel

## SPRINT 3 — Operational Intelligence
9. Timeline page: chronological event feed grouped by date, filter by event type and resource
10. Subscriptions page: renewal calendar, lifecycle state breakdown, monthly spend summary, inactive detection
11. Reminders page: list by severity, create reminder form, acknowledge action

## SPRINT 4 — Graph & Search
12. Graph page: React Flow dependency map, nodes colored by lifecycle state, edge labels by relationship type, orphan detection highlight
13. Search page: full-text search across resource name, vendor, notes, owner with instant results

## SPRINT 5 — Finances & Export
14. Finances: vendor spend table, monthly cost chart (Recharts), annual summary, invoice attachment list
15. Export: JSON and CSV download buttons, export preview modal

## SPRINT 6 — Polish
16. Empty states for every module (helpful, well-designed, with a CTA)
17. Command palette (cmdk, triggered by Cmd+K / Ctrl+K)
18. Loading skeletons for all data-fetching components
19. Settings page: workspace rename, data export, about section with version

---

# WINDOWS POWERSHELL RULES — MANDATORY

- Use PowerShell for ALL terminal commands
- For file writes use: [System.IO.File]::WriteAllText() with UTF8 encoding
- Use absolute paths: C:\Users\HP\Documents\opslocker\...
- NEVER use cd + relative paths for Node commands
- Run npm commands from C:\Users\HP\Documents\opslocker

---

# TECH STACK RULES — NON-NEGOTIABLE

- Next.js 15 App Router ONLY — no Pages Router
- TypeScript strict — no `any` types
- Drizzle ORM for ALL database ops — no raw SQL
- Zod validation on ALL API inputs
- ShadCN + Tailwind for ALL UI — no inline styles
- Zustand for global state
- React Hook Form + Zod for ALL forms
- TanStack Table for data tables
- React Flow for the relationship graph
- Recharts for charts

---

# UI/UX RULES — NON-NEGOTIABLE

OpsLocker must feel like Linear, Vercel, Stripe, or Supabase.
Dark theme only. Background: #0a0b0e. Surface: #111318. Border: #1e2028.

Every screen must answer:
1. What am I looking at?
2. What matters most right now?
3. What action should I take next?
4. What risk needs attention?
5. What changed recently?

Every module must have:
- A proper empty state with illustration/icon, headline, subtext, and a CTA button
- Loading skeleton while data fetches
- Error boundary if something fails

---

# DEFINITION OF DONE — PER MODULE

A module is complete ONLY when:
[ ] Data reads and writes correctly in SQLite
[ ] API routes handle errors with proper status codes
[ ] UI has loading, empty, and error states
[ ] Forms use React Hook Form + Zod
[ ] Table/list views use filters
[ ] Integrates correctly in sidebar navigation
[ ] Would pass a senior developer UX review

---

# AFTER EACH SPRINT

Report back in this format:

## Sprint [N] Complete

### Completed
- item

### Known Issues
- item

### Next Sprint
- item

Share with Eddy (Claude Chat) before proceeding to next sprint.

---

# PRODUCT PHILOSOPHY

OpsLocker is NOT a password manager.
OpsLocker IS infrastructure memory.

Core insight: infrastructure evolves faster than organizational memory.
Every feature should reduce cognitive load and preserve operational continuity.