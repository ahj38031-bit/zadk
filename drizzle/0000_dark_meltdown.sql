CREATE TABLE `meals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mealName` varchar(180) NOT NULL,
	`description` text,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL DEFAULT 'snack',
	`calories` int NOT NULL DEFAULT 0,
	`protein` int NOT NULL DEFAULT 0,
	`carbs` int NOT NULL DEFAULT 0,
	`fat` int NOT NULL DEFAULT 0,
	`confidence` int NOT NULL DEFAULT 0,
	`aiSummary` text,
	`imageKey` varchar(512),
	`imageUrl` varchar(768),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`calorieGoal` int NOT NULL DEFAULT 2139,
	`proteinGoal` int NOT NULL DEFAULT 98,
	`carbsGoal` int NOT NULL DEFAULT 293,
	`fatGoal` int NOT NULL DEFAULT 64,
	`age` int,
	`heightCm` int,
	`weightKg` int,
	`activityLevel` enum('sedentary','light','moderate','high') NOT NULL DEFAULT 'moderate',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_userId_unique` UNIQUE(`userId`)
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
