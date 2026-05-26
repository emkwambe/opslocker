# **OpsLocker — Product Requirements Document (PRD)**

## **Version 2.0 — Repositioned Around Infrastructure & Operational Memory**

---

# **Product Name**

# **OpsLocker**

### **Positioning**

# **Infrastructure & Operational Memory for Modern Engineering Teams**

---

# **1\. Executive Summary**

OpsLocker is a local-first operational memory platform designed to help engineering teams preserve visibility, continuity, governance, and lifecycle awareness across modern software infrastructure.

The platform enables teams to:

* remember operational assets,  
* govern vendor relationships,  
* track subscriptions,  
* preserve ownership continuity,  
* prevent infrastructure decay,  
* reduce cognitive overload,  
* and maintain operational clarity over time.

OpsLocker is NOT a password manager.

It is:

# **an infrastructure and operational memory system.**

---

# **2\. Core Problem**

Modern engineering organizations increasingly suffer from:

# **Organizational Infrastructure Amnesia.**

Teams rapidly create:

* cloud resources,  
* AI APIs,  
* vendors,  
* integrations,  
* developer environments,  
* subscriptions,  
* automation workflows,  
* and SaaS dependencies,

without maintaining persistent operational memory.

Over time this causes:

* forgotten subscriptions,  
* abandoned APIs,  
* orphaned vendors,  
* unclear ownership,  
* zombie infrastructure,  
* shadow services,  
* operational drift,  
* billing waste,  
* and security blindspots.

---

# **3\. Product Vision**

# **“Preserve operational continuity as infrastructure evolves.”**

OpsLocker becomes:

* the operational memory layer,  
* governance layer,  
* and continuity layer

for modern engineering organizations.

---

# **4\. Product Philosophy**

## **Core Principle**

# **Infrastructure evolves faster than organizational memory.**

OpsLocker externalizes operational context so teams do not rely on:

* tribal knowledge,  
* Slack history,  
* memory,  
* spreadsheets,  
* Notion fragments,  
* or scattered browser bookmarks.

---

# **5\. Strategic Positioning**

OpsLocker SHALL position itself as:

# **“Infrastructure & Operational Memory for Modern Engineering Teams.”**

---

## **OpsLocker Is NOT**

* a cloud monitoring platform  
* a SIEM  
* an observability system  
* an accounting platform  
* a password manager  
* a DevOps orchestration platform

---

## **OpsLocker IS**

* operational continuity infrastructure  
* infrastructure memory  
* infrastructure governance  
* vendor lifecycle intelligence  
* operational asset tracking  
* infrastructure relationship mapping

---

# **6\. Primary Objectives**

| Objective | Description |
| ----- | ----- |
| Preserve Infrastructure Memory | Prevent operational knowledge decay |
| Reduce Cognitive Load | Externalize operational context |
| Prevent Operational Drift | Track lifecycle and ownership |
| Improve Governance | Centralize operational visibility |
| Improve Financial Awareness | Reduce forgotten spend |
| Improve Team Continuity | Preserve organizational memory |

---

# **7\. Core Product Pillars**

---

# **Pillar 1 — Infrastructure Registry**

## **Purpose**

Persistent inventory of operational infrastructure.

---

## **Managed Asset Types**

### **Infrastructure**

* databases  
* APIs  
* domains  
* queues  
* cloud projects

### **Vendors**

* OpenAI  
* Resend  
* Stripe  
* Vercel  
* Supabase

### **Operational Systems**

* CI/CD providers  
* auth providers  
* analytics tools  
* communication platforms

---

## **Core Metadata**

| Field | Description |
| ----- | ----- |
| Resource Name | Human-readable identifier |
| Category | Infrastructure type |
| Environment | Dev/staging/prod |
| Project | Related application |
| Owner | Responsible individual/team |
| Lifecycle State | Active, archived, deprecated |
| Renewal Date | Subscription governance |
| Operational Notes | Institutional context |

---

# **Pillar 2 — Operational Timeline**

## **Purpose**

Preserve historical operational context.

---

## **Timeline Events**

| Event |
| ----- |
| Vendor added |
| Subscription upgraded |
| API rotated |
| Ownership changed |
| Trial expired |
| Invoice uploaded |
| Service deprecated |

---

## **Goal**

Allow teams to answer:

* why something exists,  
* who changed it,  
* when it changed,  
* and what depends on it.

---

# **Pillar 3 — Subscription Governance**

## **Purpose**

Prevent subscription sprawl and renewal decay.

---

## **Features**

* renewal tracking  
* trial expiration monitoring  
* spend visibility  
* inactive vendor detection  
* ownership reminders  
* lifecycle notifications

---

## **Governance States**

| State | Description |
| ----- | ----- |
| Trial | Temporary evaluation |
| Active | Operationally required |
| At-Risk | Ownership or usage unclear |
| Deprecated | Pending removal |
| Archived | Historical reference |

---

# **Pillar 4 — Infrastructure Relationships**

## **Purpose**

Map operational dependencies.

---

## **Example**

```
TaxPilot AI
├── OpenAI
├── Stripe
├── Resend
├── Vercel
└── Clerk
```

---

## **Relationship Types**

| Type |
| ----- |
| Depends On |
| Billing Through |
| Authenticates With |
| Sends Through |
| Deploys To |

---

# **Pillar 5 — Financial Operational Awareness**

## **Purpose**

Reduce hidden operational waste.

---

## **Features**

* SaaS spend summaries  
* renewal forecasts  
* invoice storage  
* vendor cost tracking  
* yearly exports  
* operational budgeting visibility

---

# **Pillar 6 — Optional Secret References**

## **Important Principle**

Secrets SHALL be:

# **optional, not foundational.**

---

## **Secret Handling Modes**

| Mode | Description |
| ----- | ----- |
| External Reference | Stored in Bitwarden/1Password |
| Local Secure Storage | SQLite encrypted |
| Not Stored | Metadata only |

---

# **8\. Primary User Personas**

---

## **Persona 1 — Indie Builder**

Pain:

* forgets subscriptions  
* loses infrastructure visibility

Needs:

* reminders  
* operational continuity

---

## **Persona 2 — Startup CTO**

Pain:

* operational fragmentation  
* unclear ownership  
* shadow tooling

Needs:

* centralized infrastructure memory

---

## **Persona 3 — Agency**

Pain:

* multiple client environments  
* subscription confusion

Needs:

* project operational governance

---

## **Persona 4 — Platform Team**

Pain:

* institutional memory decay

Needs:

* infrastructure continuity system

---

# **9\. Key Workflows**

---

# **Workflow 1 — Register Infrastructure Asset**

1. Create project  
2. Add vendor/resource  
3. Assign owner  
4. Define lifecycle state  
5. Configure reminders  
6. Add notes and relationships

---

# **Workflow 2 — Review Renewal Risk**

1. System identifies upcoming renewals  
2. Detects unclear ownership  
3. Flags inactive services  
4. Suggests governance action

---

# **Workflow 3 — Team Transition**

1. Employee leaves  
2. OpsLocker identifies owned infrastructure  
3. Ownership reassigned  
4. Continuity preserved

---

# **10\. Product Boundaries**

OpsLocker SHALL NOT:

* monitor runtime metrics  
* replace cloud observability  
* become a SIEM  
* become a full ERP  
* become accounting software

---

# **11\. Deployment Model**

## **Default Philosophy**

# **Local-first ownership.**

---

## **Deployment Modes**

| Mode | Description |
| ----- | ----- |
| Local Desktop | SQLite-based |
| Local Server | Self-hosted |
| Optional Sync | Cloud-enabled |
| Enterprise | Private deployment |

---

# **12\. Data Ownership Principles**

Users SHALL:

* own their database,  
* export freely,  
* operate offline,  
* and retain operational sovereignty.

---

# **13\. Future Vision**

OpsLocker evolves into:

# **the operational continuity layer for engineering organizations.**

Potential future capabilities:

* infrastructure maturity scoring  
* operational drift detection  
* orphaned dependency detection  
* AI operational summarization  
* governance automation

---

---

# **OpsLocker — Technical Requirements Document (TRD)**

## **Version 2.0 — Infrastructure & Operational Memory Architecture**

---

# **1\. Technical Philosophy**

## **Core Principle**

# **Local-first operational memory.**

The platform SHALL prioritize:

* ownership,  
* portability,  
* auditability,  
* and operational sovereignty.

---

# **2\. Architecture Overview**

## **Deployment Pattern**

```
Local Application
   ↓
SQLite Operational Store
   ↓
Optional Sync Layer
```

---

# **3\. Primary Architecture Goals**

| Goal | Description |
| ----- | ----- |
| Local Ownership | User controls infrastructure memory |
| Low Friction | Fast setup |
| Operational Durability | Long-term data preservation |
| Portability | Easy migration/export |
| Offline Capability | Works disconnected |
| Minimal Trust Dependency | Avoid forced cloud reliance |

---

# **4\. Recommended Stack**

| Layer | Technology |
| ----- | ----- |
| Frontend | Next.js |
| Desktop Runtime | Tauri |
| UI | Tailwind \+ ShadCN |
| Local Database | SQLite |
| Encryption | SQLCipher |
| ORM | Drizzle ORM |
| Local API | Node.js |
| Optional Sync | Supabase/Postgres |
| Notifications | Local scheduler |
| Packaging | Docker \+ Desktop builds |

---

# **5\. Storage Architecture**

---

# **Primary Operational Store**

## **Database**

# **SQLite**

Chosen because:

* local-first  
* portable  
* inspectable  
* backup-friendly  
* fast  
* low operational overhead

---

# **Encryption Layer**

## **SQLCipher**

Encrypt:

* local database  
* optional secret references  
* invoice metadata  
* operational notes

---

# **6\. Data Domains**

| Domain | Sensitivity |
| ----- | ----- |
| Infrastructure Metadata | Medium |
| Operational Notes | Medium |
| Billing Metadata | Medium |
| Secrets | High |
| Relationship Graphs | Medium-High |

---

# **7\. Core Data Model**

---

## **workspaces**

```
id
name
created_at
```

---

## **projects**

```
id
workspace_id
name
environment
```

---

## **resources**

```
id
project_id
resource_type
vendor_name
owner
lifecycle_state
renewal_date
monthly_cost
notes
```

---

## **relationships**

```
id
source_resource_id
target_resource_id
relationship_type
```

---

## **operational\_events**

```
id
resource_id
event_type
actor
timestamp
metadata
```

---

## **invoices**

```
id
resource_id
vendor
amount
billing_period
file_path
```

---

## **reminders**

```
id
resource_id
reminder_type
trigger_date
severity
```

---

# **8\. Local-First Requirements**

## **Mandatory**

| Requirement |
| ----- |
| Fully usable offline |
| Local DB ownership |
| No mandatory cloud sync |
| Export/import support |
| User-controlled backups |

---

# **9\. Optional Sync Architecture**

## **Philosophy**

Cloud SHALL be optional.

---

## **Sync Modes**

| Mode | Description |
| ----- | ----- |
| Local Only | No cloud |
| Personal Backup | Encrypted sync |
| Team Sync | Shared workspace |
| Enterprise Sync | Private infrastructure |

---

# **10\. Relationship Engine**

## **Purpose**

Maintain operational dependency awareness.

---

## **Capabilities**

* dependency mapping  
* ownership inheritance  
* renewal propagation  
* orphan detection  
* vendor graphing

---

# **11\. Governance Engine**

## **Functions**

### **Lifecycle Monitoring**

* inactive resources  
* expired trials  
* abandoned vendors

### **Ownership Monitoring**

* orphaned ownership  
* inactive maintainers

### **Financial Monitoring**

* duplicate subscriptions  
* spend anomalies

---

# **12\. Reminder System**

## **Local Scheduler**

Triggers:

* renewals  
* expirations  
* lifecycle reviews  
* ownership reviews

---

## **Channels**

| Channel |
| ----- |
| Local notifications |
| Email |
| Slack (future) |

---

# **13\. Security Model**

---

# **Security Philosophy**

## **OpsLocker minimizes centralized trust.**

---

## **Principles**

| Principle |
| ----- |
| Local-first |
| Least privilege |
| Optional secrets |
| Encryption at rest |
| Minimal cloud dependency |

---

# **14\. Optional Secret Storage**

## **Supported Modes**

| Mode | Description |
| ----- | ----- |
| External Vault Reference | Preferred |
| Local Encrypted Storage | Supported |
| Cloud Storage | Optional |

---

# **15\. AI Architecture**

## **AI SHALL augment operational awareness,**

NOT control infrastructure.

---

## **Allowed AI Functions**

| Function |
| ----- |
| Renewal summarization |
| Vendor categorization |
| Spend summaries |
| Governance suggestions |
| Operational insights |

---

## **Forbidden AI Functions**

| Function |
| ----- |
| Autonomous infra mutation |
| Secret rotation |
| Billing modification |
| Vendor deletion |

---

# **16\. Export & Ownership**

Users SHALL export:

* SQLite DB  
* CSV  
* JSON  
* operational reports

without vendor lock-in.

---

# **17\. Enterprise Roadmap**

Future enterprise features:

* SSO  
* SCIM  
* BYOK encryption  
* air-gapped deployment  
* audit exports  
* compliance reporting

---

# **18\. Long-Term Technical Vision**

OpsLocker becomes:

# **a durable operational memory substrate**

for:

* engineering continuity,  
* infrastructure governance,  
* and operational resilience.

\# UI / UX QUALITY STANDARD — MANDATORY

OpsLocker must feel like a state-of-the-art developer product, not an internal admin tool.

The UI must be:  
\- friendly  
\- beautiful  
\- modern  
\- calm  
\- premium  
\- fast  
\- intuitive  
\- developer-native  
\- logically consistent  
\- visually polished

Every screen must answer:  
1\. What am I looking at?  
2\. What matters most right now?  
3\. What action should I take next?  
4\. What risk or opportunity needs attention?  
5\. What changed recently?

Avoid:  
\- cluttered dashboards  
\- generic CRUD screens  
\- confusing terminology  
\- dead-end pages  
\- inconsistent layouts  
\- weak empty states  
\- unnecessary complexity

Required UX qualities:  
\- excellent empty states  
\- clear onboarding  
\- beautiful resource cards  
\- clean tables  
\- smart filters  
\- relationship graph that is actually useful  
\- renewal risk indicators  
\- operational health summaries  
\- smooth navigation  
\- consistent spacing and hierarchy  
\- helpful microcopy  
\- no logical dead ends

Design standard:  
OpsLocker should feel closer to:  
\- Linear  
\- Vercel  
\- Stripe  
\- Raycast  
\- Supabase  
\- Resend  
\- GitHub

Not:  
\- old admin dashboard  
\- generic SaaS template  
\- spreadsheet clone

Before marking any feature complete, perform a UX logic review:  
\- Is the workflow understandable?  
\- Is the next action obvious?  
\- Is the data model reflected correctly?  
\- Are edge cases handled?  
\- Are empty/error/loading states polished?  
\- Would a serious developer trust this screen?  
