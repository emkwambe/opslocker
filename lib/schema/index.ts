import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

function cuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey().$defaultFn(cuid),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(cuid),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  environment: text("environment").default("all"),
  color: text("color").default("#3b82f6"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const resources = sqliteTable("resources", {
  id: text("id").primaryKey().$defaultFn(cuid),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  vendorName: text("vendor_name"),
  category: text("category").notNull().default("other"),
  environment: text("environment").default("production"),
  owner: text("owner"),
  lifecycleState: text("lifecycle_state").notNull().default("active"),
  renewalDate: text("renewal_date"),
  monthlyCost: real("monthly_cost").default(0),
  currency: text("currency").default("USD"),
  notes: text("notes"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  website: text("website"),
  documentationUrl: text("documentation_url"),
  lastReviewedAt: text("last_reviewed_at"),
  operationalHealth: text("operational_health"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const relationships = sqliteTable("relationships", {
  id: text("id").primaryKey().$defaultFn(cuid),
  sourceResourceId: text("source_resource_id").notNull().references(() => resources.id, { onDelete: "cascade" }),
  targetResourceId: text("target_resource_id").notNull().references(() => resources.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const operationalEvents = sqliteTable("operational_events", {
  id: text("id").primaryKey().$defaultFn(cuid),
  resourceId: text("resource_id").references(() => resources.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  actor: text("actor").default("user"),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>().default({}),
  description: text("description"),
  timestamp: text("timestamp").notNull().$defaultFn(() => new Date().toISOString()),
});

export const reminders = sqliteTable("reminders", {
  id: text("id").primaryKey().$defaultFn(cuid),
  resourceId: text("resource_id").notNull().references(() => resources.id, { onDelete: "cascade" }),
  reminderType: text("reminder_type").notNull(),
  triggerDate: text("trigger_date").notNull(),
  severity: text("severity").notNull().default("medium"),
  message: text("message"),
  isAcknowledged: integer("is_acknowledged", { mode: "boolean" }).default(false),
  acknowledgedAt: text("acknowledged_at"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey().$defaultFn(cuid),
  resourceId: text("resource_id").notNull().references(() => resources.id, { onDelete: "cascade" }),
  vendor: text("vendor").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").default("USD"),
  billingPeriod: text("billing_period"),
  filePath: text("file_path"),
  notes: text("notes"),
  invoiceDate: text("invoice_date"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const secretReferences = sqliteTable("secret_references", {
  id: text("id").primaryKey().$defaultFn(cuid),
  resourceId: text("resource_id").notNull().references(() => resources.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  storageMode: text("storage_mode").notNull().default("external_vault"),
  vaultPath: text("vault_path"),
  vaultProvider: text("vault_provider"),
  notes: text("notes"),
  lastRotatedAt: text("last_rotated_at"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().$defaultFn(cuid),
  workspaceId: text("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value", { mode: "json" }).$type<unknown>(),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type Relationship = typeof relationships.$inferSelect;
export type OperationalEvent = typeof operationalEvents.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;