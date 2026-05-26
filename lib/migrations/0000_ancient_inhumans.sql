CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_id` text NOT NULL,
	`vendor` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'USD',
	`billing_period` text,
	`file_path` text,
	`notes` text,
	`invoice_date` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `operational_events` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_id` text,
	`project_id` text,
	`workspace_id` text NOT NULL,
	`event_type` text NOT NULL,
	`actor` text DEFAULT 'user',
	`metadata` text DEFAULT '{}',
	`description` text,
	`timestamp` text NOT NULL,
	FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`environment` text DEFAULT 'all',
	`color` text DEFAULT '#3b82f6',
	`tags` text DEFAULT '[]',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`source_resource_id` text NOT NULL,
	`target_resource_id` text NOT NULL,
	`relationship_type` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`source_resource_id`) REFERENCES `resources`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_resource_id`) REFERENCES `resources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_id` text NOT NULL,
	`reminder_type` text NOT NULL,
	`trigger_date` text NOT NULL,
	`severity` text DEFAULT 'medium' NOT NULL,
	`message` text,
	`is_acknowledged` integer DEFAULT false,
	`acknowledged_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`vendor_name` text,
	`category` text DEFAULT 'other' NOT NULL,
	`environment` text DEFAULT 'production',
	`owner` text,
	`lifecycle_state` text DEFAULT 'active' NOT NULL,
	`renewal_date` text,
	`monthly_cost` real DEFAULT 0,
	`currency` text DEFAULT 'USD',
	`notes` text,
	`tags` text DEFAULT '[]',
	`website` text,
	`documentation_url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `secret_references` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_id` text NOT NULL,
	`label` text NOT NULL,
	`storage_mode` text DEFAULT 'external_vault' NOT NULL,
	`vault_path` text,
	`vault_provider` text,
	`notes` text,
	`last_rotated_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text,
	`key` text NOT NULL,
	`value` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_default` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
