# OpsLocker v2 — Operational Memory + Tool Faucet
**Version:** 2.0  
**Company:** Mpingo Systems LLC  
**Status:** Core v1 built — v2 spec  
**Date:** June 2026  
**Tagline:** Every tool you run. Every key you hold. Every dollar you spend. One place.

---

## 1. Product Vision

OpsLocker is the operational memory layer for developers and teams — fully agnostic across every tool, every cloud, every AI agent, and every environment.

**Not MCP-only. Not cloud-only. Not AI-only.**

Everything a developer runs → one place. One dashboard. One source of truth.

---

## 2. The Problem

Modern developers manage:
- 10–50 SaaS subscriptions
- 20–100 API keys and secrets
- 5–15 cloud services per project
- 5–30 MCP servers (growing fast)
- Multiple environments (dev/staging/prod)
- Team members with overlapping access

Result:
- Keys scattered across .env files, dashboards, notes, Slack DMs
- Spend climbing unnoticed ($618/mo becoming $7,416/yr unnoticed)
- Nobody knows who owns what
- Deprecated services still billing
- Renewals missed
- AI agents loading all tools when only 2 are needed (context bloat)

---

## 3. The Faucet Metaphor

```
Without OpsLocker:
All your pipes are open all the time.
You don't know what's flowing, what it costs,
or who turned it on.

With OpsLocker:
Turn on exactly what you need.
See exactly what it costs.
Know exactly who has access.
Get alerted before anything expires or breaks.
```

---

## 4. Three Product Layers

### Layer 1 — INVENTORY ✅ (Built in v1)
- Register every resource, API, service, subscription
- Track ownership, cost, status, renewal dates
- Dependency graph visualization
- Activity timeline
- Import from CSV or .env

### Layer 2 — INTELLIGENCE ✅ (Partially built in v1)
- Spend anomaly detection
- Renewal risk alerts
- Orphaned resource detection
- Deprecation warnings
- → v2 adds: Security risk scoring
- → v2 adds: Compliance status per resource
- → v2 adds: Unused resource detection

### Layer 3 — CONTROL 🔲 (v2 — to build)
- **Tool Faucet** — toggle resources on/off per project/session
- **Secret Vault** — centralized credential management
- **Access Control** — per-role resource permissions
- **Environment Profiles** — dev/staging/prod configurations
- **AI Context Manager** — which MCPs active per Claude Code session
- **Audit Log** — who accessed what and when

---

## 5. Resource Categories (Fully Agnostic)

OpsLocker manages ALL of these — not just MCPs:

### AI Tools & Models
- MCP servers (Cloudflare, Supabase, Stripe, Vercel, Neon...)
- LLM API keys (Anthropic, OpenAI, Gemini, Groq, Mistral)
- AI agent frameworks (LangChain, CrewAI, AutoGen)
- Embedding models
- Vector databases (Pinecone, Weaviate, Qdrant)

### Cloud Infrastructure
- Cloudflare (Workers, Pages, KV, D1, R2)
- AWS (Lambda, S3, RDS, EC2)
- GCP (Cloud Run, BigQuery, Firestore)
- Azure (Functions, Blob, CosmosDB)
- Vercel, Netlify, Railway, Render

### Data & Databases
- Supabase (multiple projects)
- Neon (multiple branches)
- PlanetScale, Turso, CockroachDB
- Firebase, Firestore, Redis, Upstash, MongoDB Atlas

### Auth & Identity
- Clerk, Auth0, WorkOS, Supabase Auth
- SAML/SSO providers, Magic, Passage

### Payments & Billing
- Stripe (multiple accounts — live/test)
- Lemon Squeezy, Paddle, RevenueCat

### Communication & Notifications
- Resend, SendGrid, Postmark (email)
- Twilio, Vonage (SMS)
- Pusher, Ably (real-time)
- Slack, Discord webhooks

### Monitoring & Observability
- Sentry, Datadog, New Relic
- LogFlare, Better Stack
- Checkly (uptime), PostHog (analytics)

### Developer Tools
- GitHub repos + secrets
- npm tokens, Docker registries
- CI/CD pipelines
- Domain registrars, SSL certificates

### Business SaaS
- Notion, Linear, Jira
- Figma, Canva, Calendly
- Zapier, n8n workflows

### Secrets & Credentials
- API keys across all products
- .env files (all projects)
- Wrangler secrets
- Database connection strings
- OAuth tokens

---

## 6. Tool Faucet — Core v2 Feature

### What It Does
Per-project tool profiles that control which resources/MCPs are
active for a given Claude Code session or development context.

### UI Concept
```
Project: realitydb-sandbox
──────────────────────────────────────
[ON]  ✅ Cloudflare Workers
[ON]  ✅ Supabase
[ON]  ✅ Stripe
[OFF] ○  Vercel
[OFF] ○  Neon
[ON]  ✅ GitHub
[OFF] ○  Resend
──────────────────────────────────────
Active: 4/7 tools
Context budget: ████░░░░ 52% used
Estimated cost/session: $0.18
```

### Project Profiles
```
Profile: SQL Learn Sprint
  Cloudflare ✅ | Supabase ✅ | Stripe ✅ | GitHub ✅

Profile: MathAthlone Sprint
  Vercel ✅ | Supabase ✅ | GitHub ✅

Profile: SafeSQL Pro Sprint
  Cloudflare ✅ | Supabase ✅ | Stripe ✅ | GitHub ✅

Profile: OpsLocker Sprint
  Vercel ✅ | Supabase ✅ | GitHub ✅
```

### Claude Code Integration
OpsLocker generates a `.claude-profile.json` per project:
```json
{
  "project": "realitydb-sandbox",
  "active_mcps": ["cloudflare", "supabase", "stripe", "github"],
  "inactive_mcps": ["vercel", "neon", "resend"],
  "context_budget": "50%"
}
```
Claude Code reads this and loads only active MCPs.

---

## 7. Secret Vault

### Problem
Secrets scattered across:
- `.env.local` files (per project)
- Wrangler secrets (per Worker)
- Cloudflare Pages env vars (per project)
- Supabase vault (per project)
- Mental notes and Slack DMs

### OpsLocker Solution
```
Centralized vault with:
- Project-scoped secrets
- Environment-scoped (dev/staging/prod)
- One-click inject into .env.local
- One-click push to Wrangler secrets
- One-click push to Cloudflare Pages
- Rotation reminders
- Access logs
```

### Security
- Encrypted at rest (Supabase vault)
- Zero-knowledge option (client-side encryption)
- Access control per team member
- Audit trail per secret access

---

## 8. Competitive Landscape

| Tool | Focus | Gap vs OpsLocker |
|------|-------|-----------------|
| Infracost | AWS/GCP cost | No SaaS, no AI tools, no secrets |
| Pulumi/Terraform | IaC | No inventory, no AI layer, no SaaS |
| 1Password Teams | Secrets | No spend, no AI tools, no context mgmt |
| Doppler | Env vars | No inventory, no AI layer, no spend |
| Retool | Internal tools | No operational memory concept |
| **OpsLocker** | **Everything** | **First mover in AI-era ops management** |

---

## 9. Target Markets

### Segment 1 — Solo AI Developers (Primary)
- Building with Claude Code, Cursor, Windsurf
- 15–40 MCPs and SaaS tools across 5+ projects
- Pain: context bloat + spend blindness + key sprawl
- Price: $19/mo

### Segment 2 — Small Dev Teams (2–15 people)
- Shared tools with unclear ownership
- Pain: "Who set this up? Do we still need it?"
- Price: $49/mo

### Segment 3 — Agencies
- Managing tools across multiple client projects
- Pain: Client billing reconciliation + security audits
- Price: $99/mo

### Segment 4 — AI-Native Startups
- Running multiple AI agents with multiple MCPs
- Pain: Agent context management + cost control
- Price: $149/mo

---

## 10. Pricing Architecture

| Plan | Price | For | Key Features |
|------|-------|-----|-------------|
| **Solo** | $0 | 1 developer, 3 projects | Inventory + basic alerts |
| **Pro** | $19/mo | 1 developer, unlimited projects | + Secret vault + Tool Faucet |
| **Team** | $49/mo | Up to 10 developers | + Access control + audit log |
| **Agency** | $99/mo | Unlimited developers | + Client workspaces + billing |
| **Enterprise** | Custom | Large teams | + SSO + compliance + SLA |

---

## 11. Tech Stack

```
Frontend:   Next.js 14 + Tailwind + shadcn/ui
Backend:    Supabase (auth + DB + vault)
Deploy:     Vercel (frontend) + Cloudflare Workers (API)
Payments:   Stripe
Email:      Resend
Analytics:  PostHog
```

---

## 12. v2 Sprint Plan

### Sprint O1 — Tool Faucet UI
- Project profile creation
- MCP toggle interface
- Active/inactive state management
- Context budget indicator
- .claude-profile.json generation

### Sprint O2 — Secret Vault
- Encrypted secret storage (Supabase vault)
- Project-scoped secret management
- .env.local injection
- Wrangler secret push
- Cloudflare Pages env var push
- Rotation reminder system

### Sprint O3 — AI Context Manager
- Claude Code profile integration
- Per-session MCP activation
- Context window usage estimation
- Cost per session tracking

### Sprint O4 — Team Access Control
- Role-based resource permissions
- Secret access control
- Activity audit log
- Team member invite flow

### Sprint O5 — Resource Integrations
- Direct API connections to major providers
- Auto-discovery of resources
- Spend sync (Stripe, Cloudflare, Vercel, AWS)
- Renewal detection

---

## 13. Differentiation Statement

> OpsLocker is the first operational memory platform built for the AI-agent era.
> While other tools manage infrastructure or secrets in isolation,
> OpsLocker connects everything — inventory, spend, access, secrets, and
> AI tool activation — in one agnostic platform that works across every
> cloud, every LLM, and every MCP server a modern developer runs.

---

## 14. Go-To-Market

### Phase 1 — Developer Community
- Product Hunt launch (OpsLocker + RealityDB together)
- HackerNews Show HN
- Dev.to article: "How I manage 40+ SaaS tools across 11 products"
- Twitter/X thread: The $618/mo problem every solo dev has

### Phase 2 — AI Developer Community
- Claude Code community
- Cursor community
- AI agent builders (LangChain, CrewAI users)

### Phase 3 — Teams
- Outbound to dev agencies
- Partnership with Anthropic (Claude for Work customers)

---

## 15. Connection to Mpingo Systems

OpsLocker is the meta-product — it manages all the infrastructure
that runs RealityDB, SafeSQL Pro, MathAthlone, and every other
Mpingo Systems product. It's both a product and internal tooling.

"We built it for ourselves. Now it's available to everyone."

---

*OpsLocker v2 Blueprint — June 2026 | Mpingo Systems LLC | mpingo.ai*
