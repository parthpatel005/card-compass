CREATE TABLE `benefits` (
	`id` text PRIMARY KEY NOT NULL,
	`card` text NOT NULL,
	`name` text NOT NULL,
	`total_amount` real NOT NULL,
	`used_amount` real DEFAULT 0 NOT NULL,
	`cadence` text NOT NULL,
	`reset_month` integer,
	`period_key` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`card` text NOT NULL,
	`date` text NOT NULL,
	`merchant` text NOT NULL,
	`amount` real NOT NULL,
	`category` text NOT NULL,
	`points_earned` real DEFAULT 0 NOT NULL,
	`multiplier` real DEFAULT 1 NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
