CREATE TABLE `frequentMeals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`itemsSnapshot` text NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL DEFAULT 'snack',
	`calories` int NOT NULL DEFAULT 0,
	`protein` int NOT NULL DEFAULT 0,
	`carbs` int NOT NULL DEFAULT 0,
	`fat` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `frequentMeals_id` PRIMARY KEY(`id`)
);
