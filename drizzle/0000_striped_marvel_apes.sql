CREATE TABLE `budget_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fiscalYear` int NOT NULL,
	`category` varchar(64) NOT NULL,
	`prefecture` varchar(64),
	`municipality` varchar(128),
	`amount` decimal(15,0) NOT NULL,
	`unit` varchar(16) DEFAULT '万円',
	`sourceType` varchar(32) DEFAULT 'manual',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fetch_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(64) NOT NULL,
	`status` enum('success','error','partial') NOT NULL,
	`recordsFetched` int DEFAULT 0,
	`recordsInserted` int DEFAULT 0,
	`recordsUpdated` int DEFAULT 0,
	`errorMessage` text,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fetch_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personnel_changes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`municipality` varchar(128) NOT NULL,
	`prefecture` varchar(64),
	`oldPosition` text,
	`newPosition` text NOT NULL,
	`effectiveDate` timestamp,
	`importance` enum('高','中','低') DEFAULT '中',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personnel_changes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(128),
	`title` text NOT NULL,
	`municipality` varchar(128) NOT NULL,
	`prefecture` varchar(64) NOT NULL,
	`category` varchar(64) NOT NULL,
	`status` enum('公告中','受付終了','落札済み') NOT NULL DEFAULT '公告中',
	`budget` decimal(15,0),
	`publishedAt` timestamp,
	`deadline` timestamp,
	`demandScore` int DEFAULT 0,
	`matchScore` int DEFAULT 0,
	`description` text,
	`tags` json DEFAULT ('[]'),
	`sourceUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastFetchedAt` timestamp,
	CONSTRAINT `tenders_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenders_externalId_unique` UNIQUE(`externalId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
