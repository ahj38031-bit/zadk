-- ZadkAI final schema — MySQL 8 / TiDB
-- Generated from drizzle/schema.ts. Run on a fresh database.
SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) NOT NULL,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_openId_unique` (`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `calorieGoal` int NOT NULL DEFAULT 2139,
  `proteinGoal` int NOT NULL DEFAULT 98,
  `carbsGoal` int NOT NULL DEFAULT 293,
  `fatGoal` int NOT NULL DEFAULT 64,
  `age` int,
  `heightCm` int,
  `weightKg` int,
  `startWeightKg` int,
  `targetWeightKg` int,
  `targetDate` date,
  `activityLevel` enum('sedentary','light','moderate','high') NOT NULL DEFAULT 'moderate',
  `goal` enum('lose','maintain','gain') NOT NULL DEFAULT 'maintain',
  `historyMealTypeFilter` enum('all','breakfast','lunch','dinner','snack') NOT NULL DEFAULT 'all',
  `historyCalorieFilter` enum('all','under400','400to700','over700') NOT NULL DEFAULT 'all',
  `historySortOrder` enum('latest','caloriesDesc') NOT NULL DEFAULT 'latest',
  `preferredEatingMethod` enum('bread','spoon','nothing') NOT NULL DEFAULT 'nothing',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profiles_userId_unique` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `meals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `mealName` varchar(180) NOT NULL,
  `description` text,
  `mealType` enum('breakfast','lunch','dinner','snack') NOT NULL DEFAULT 'snack',
  `calories` int NOT NULL DEFAULT 0,
  `protein` int NOT NULL DEFAULT 0,
  `carbs` int NOT NULL DEFAULT 0,
  `fat` int NOT NULL DEFAULT 0,
  `fiber` int NOT NULL DEFAULT 0,
  `sugar` int NOT NULL DEFAULT 0,
  `sodium` int NOT NULL DEFAULT 0,
  `confidence` int NOT NULL DEFAULT 0,
  `aiSummary` text,
  `imageKey` varchar(512),
  `imageUrl` varchar(768),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `frequentMeals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `name` varchar(180) NOT NULL,
  `itemsSnapshot` text NOT NULL,
  `mealType` enum('breakfast','lunch','dinner','snack') NOT NULL DEFAULT 'snack',
  `calories` int NOT NULL DEFAULT 0,
  `protein` int NOT NULL DEFAULT 0,
  `carbs` int NOT NULL DEFAULT 0,
  `fat` int NOT NULL DEFAULT 0,
  `fiber` int NOT NULL DEFAULT 0,
  `sugar` int NOT NULL DEFAULT 0,
  `sodium` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `weightLogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `weightKg` int NOT NULL,
  `loggedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
