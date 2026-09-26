ALTER TABLE `profiles` ADD `historyMealTypeFilter` enum('all','breakfast','lunch','dinner','snack') DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `historyCalorieFilter` enum('all','under400','400to700','over700') DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `historySortOrder` enum('latest','caloriesDesc') DEFAULT 'latest' NOT NULL;