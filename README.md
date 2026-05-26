# OpsLocker

**Infrastructure & Operational Memory for Modern Engineering Teams**

> Preserve operational continuity as infrastructure evolves.

OpsLocker is a local-first operational memory platform. It helps engineering teams remember what they run, who owns it, what it costs, what depends on what, and what's quietly bleeding money — without forcing them to upload that map into someone else's cloud.

Built by Mpingo Systems LLC — Eddy Mkwambe, Technical Director.

---

## Quick start

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed      # optional — populates a realistic demo workspace
npm run dev
```

App runs at `http://localhost:3000`. On a fresh database you'll be sent to `/setup` to create your first workspace; with the seed loaded you'll land on `/dashboard`.

---

## What OpsLocker is

A **persistent operational memory layer** for the infrastructure your team relies on.

It answers questions your tools currently can't:

- Why does this service exist?
- Who owns this vendor?
- Is this API still being used?
- When does this renew?
- Why are we still paying for this?
- What depends on this if we turn it off?

It is **not** a password manager, a SIEM, a cloud observability platform, an accounting suite, or runtime monitoring. Secrets are optional supporting metadata, not the product's identity.

---

## What OpsLocker tracks

Resources are organized into projects inside a workspace. Each resource has a category, lifecycle state, owner, environment, monthly cost, renewal date, and operational notes.

**Categories:**

- **Database** — Postgres, SQLite, managed datastores
- **API** — third-party APIs (OpenAI, Anthropic, Stripe, …)
- **Domain** — custom domains and DNS providers
- **Cloud** — hosting platforms, IaaS, PaaS
- **Auth** — identity providers (Clerk, Auth0, Cognito, …)
- **CI/CD** — source control and pipelines
- **Analytics** — product analytics, BI
- **Communication** — email, Slack-style, transactional
- **Storage** — blob, object, file storage
- **Monitoring** — APM, log aggregation, uptime
- **Subscription** — pure billing relationships
- **Other** — anything that doesn't fit cleanly

**Lifecycle states** (govern what surfaces in dashboards and risk panels):

- `active` · `trial` · `at_risk` · `deprecated` · `archived`

**Relationships** map operational dependencies between resources:

- `depends_on` · `bills_through` · `authenticates_with` · `sends_through` · `deploys_to` · `integrates_with`

Every change — adding a resource, rotating a secret, flagging a renewal, acknowledging a reminder — is written to an immutable operational timeline.

---

## Pages

- **Dashboard** — operational overview, renewal risk, recent activity, waste signals
- **Projects** — group infrastructure by application or environment
- **Registry** — full resource inventory with filters, sortable table, and a slide-over detail drawer
- **Graph** — React Flow dependency map with dagre auto-layout and orphan detection
- **Timeline** — chronological event feed grouped by date with type filters
- **Subscriptions** — renewal calendar, lifecycle breakdown, inactive vendor review
- **Finances** — vendor spend table, spend by category/project, monthly trend, waste signals, invoices
- **Reminders** — severity-grouped reminders with optimistic acknowledge
- **Search** — debounced full-text search across vendors, owners, notes, tags
- **Settings** — workspace identity, data ownership, import/export

---

## Import your infrastructure

OpsLocker is most useful with your real inventory loaded — and most users don't want to type it in by hand. Two import paths:

### CSV import

`Settings → Data → Import resources → CSV tab`, or hit the **Import** button on the registry empty state.

Expected columns (extras are ignored, missing columns are treated as empty):

```
name, vendorName, category, environment, owner, lifecycleState,
renewalDate, monthlyCost, currency, notes, tags, website
```

Each row is validated with Zod; invalid rows are skipped and reported with the specific failure reason. There's a **Download template** button in the dialog that generates a sample CSV with the correct headers and one example row.

### .env import

`Settings → Data → Import resources → .env file tab`.

Paste an `.env` file content and OpsLocker will create one resource per `KEY=value` pair (category: `api`, lifecycle: `active`). Comments, blank lines, malformed lines, and duplicate keys are skipped — counts are shown in the live preview before you commit.

CRLF line endings are handled.

---

## Keyboard shortcuts

- **⌘K / Ctrl+K** — open the command palette. Jump to any page, create a resource, create a project, or open the importer in a single keystroke. The palette also live-filters resources by name.

---

## Local-first philosophy

OpsLocker stores everything in a SQLite file on your machine (`opslocker.db` in the project directory by default; override with `DATABASE_PATH`). There is no required cloud sync, no third-party data dependency, and no vendor lock-in.

This is intentional. Infrastructure maps, vendor relationships, billing metadata, and operational notes are exactly the kind of data engineering teams have learned to be careful about handing to centralized services. SQLite is portable, inspectable, backup-friendly, and outlasts any specific tool — including OpsLocker.

Export is first-class. From `Settings → Data → Preview & export` you get a per-table count of exactly what's about to leave, then a workspace-named JSON or CSV download:

```
opslocker-{workspace-slug}-{YYYY-MM-DD}.json
opslocker-{workspace-slug}-{YYYY-MM-DD}.csv
```

If you ever want to migrate, host this yourself, or just walk away with your data, the export is the whole story.

---

## Tech stack

- **Next.js 15** (App Router) · **React 18** · **TypeScript strict**
- **SQLite** via `better-sqlite3` · **Drizzle ORM** with typed migrations
- **Tailwind CSS 3** · **shadcn/ui** · **Lucide icons** · dark theme only
- **TanStack Table** for tables · **React Flow + dagre** for the dependency graph · **Recharts** for finance charts
- **React Hook Form + Zod** for every form · **Zustand** for global UI state
- **cmdk** for the command palette · **Sonner** for toasts · **PapaParse** for CSV

---

## Screenshots

Run `npm run db:seed` to load demo data before capturing screenshots, then save them under `screenshots/` at the repo root:

- `screenshots/dashboard.png`
- `screenshots/projects.png`
- `screenshots/registry.png`
- `screenshots/graph.png`
- `screenshots/timeline.png`
- `screenshots/subscriptions.png`
- `screenshots/reminders.png`

---

## Project docs

- `docs/OpsLocker-PRD-and-TRD.md` — product and technical requirements
- `docs/OpsLocker-Value-Proposition-and-Monetization.md` — positioning and business model
- `docs/CLAUDE-CODE-EXECUTION-PROMPT.md` — original sprint plan

---

## Status

Pre-release (`0.1.0`). Local-only. The data model, API surface, and route structure are stable enough to build against; future sprints may add optional encrypted sync, multi-user collaboration, and integrations.
