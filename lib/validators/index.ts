import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  environment: z.enum(["development", "staging", "production", "all"]).default("all"),
  color: z.string().default("#3b82f6"),
  tags: z.array(z.string()).default([]),
  workspaceId: z.string().min(1),
});

export const createResourceSchema = z.object({
  name: z.string().min(1).max(200),
  vendorName: z.string().max(100).optional(),
  category: z.enum(["database","api","domain","cloud","auth","ci_cd","analytics","communication","storage","monitoring","subscription","other"]).default("other"),
  environment: z.enum(["development","staging","production","all"]).default("production"),
  owner: z.string().max(100).optional(),
  lifecycleState: z.enum(["active","trial","at_risk","deprecated","archived"]).default("active"),
  renewalDate: z.string().optional(),
  monthlyCost: z.number().min(0).default(0),
  currency: z.string().default("USD"),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string()).default([]),
  website: z.string().optional(),
  documentationUrl: z.string().optional(),
  projectId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export const createReminderSchema = z.object({
  resourceId: z.string().min(1),
  reminderType: z.enum(["renewal","trial_expiration","ownership_review","lifecycle_review","custom"]),
  triggerDate: z.string().min(1),
  severity: z.enum(["critical","high","medium","low"]).default("medium"),
  message: z.string().max(500).optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;