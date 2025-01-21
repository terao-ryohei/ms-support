CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`is_disable` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contract` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from` integer NOT NULL,
	`to` integer NOT NULL,
	`contract_type` text NOT NULL,
	`subject` text NOT NULL,
	`document` text NOT NULL,
	`is_disable` integer NOT NULL,
	`update` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`is_hour` integer NOT NULL,
	`is_fixed` integer NOT NULL,
	`paid_from` integer NOT NULL,
	`paid_to` integer NOT NULL,
	`period_date` text NOT NULL,
	`work_price` integer NOT NULL,
	`round_type` text NOT NULL,
	`round_digit` integer NOT NULL,
	`calc_type` text NOT NULL,
	`over_price` integer NOT NULL,
	`under_price` integer NOT NULL,
	`is_disable` integer NOT NULL,
	`update` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`is_disable` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`is_disable` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workers_relation` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`companies_id` integer,
	`worker_id` integer,
	`sales_id` integer,
	`contract_id` integer NOT NULL,
	`payment_id` integer NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`companies_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sales_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`contract_id`) REFERENCES `contract`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payment_id`) REFERENCES `payment`(`id`) ON UPDATE no action ON DELETE no action
);
