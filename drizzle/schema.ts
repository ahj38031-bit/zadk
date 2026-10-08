import { date, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  calorieGoal: int("calorieGoal").default(2139).notNull(),
  proteinGoal: int("proteinGoal").default(98).notNull(),
  carbsGoal: int("carbsGoal").default(293).notNull(),
  fatGoal: int("fatGoal").default(64).notNull(),
  age: int("age"),
  heightCm: int("heightCm"),
  weightKg: int("weightKg"),
  startWeightKg: int("startWeightKg"),
  targetWeightKg: int("targetWeightKg"),
  targetDate: date("targetDate", { mode: "string" }),
  activityLevel: mysqlEnum("activityLevel", ["sedentary", "light", "moderate", "high"]).default("moderate").notNull(),
  goal: mysqlEnum("goal", ["lose", "maintain", "gain"]).default("maintain").notNull(),
  historyMealTypeFilter: mysqlEnum("historyMealTypeFilter", ["all", "breakfast", "lunch", "dinner", "snack"]).default("all").notNull(),
  historyCalorieFilter: mysqlEnum("historyCalorieFilter", ["all", "under400", "400to700", "over700"]).default("all").notNull(),
  historySortOrder: mysqlEnum("historySortOrder", ["latest", "caloriesDesc"]).default("latest").notNull(),
  preferredEatingMethod: mysqlEnum("preferredEatingMethod", ["bread", "spoon", "nothing"]).default("nothing").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const meals = mysqlTable("meals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mealName: varchar("mealName", { length: 180 }).notNull(),
  description: text("description"),
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).default("snack").notNull(),
  calories: int("calories").default(0).notNull(),
  protein: int("protein").default(0).notNull(),
  carbs: int("carbs").default(0).notNull(),
  fat: int("fat").default(0).notNull(),
  confidence: int("confidence").default(0).notNull(),
  aiSummary: text("aiSummary"),
  imageKey: varchar("imageKey", { length: 512 }),
  imageUrl: varchar("imageUrl", { length: 768 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const frequentMeals = mysqlTable("frequentMeals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  itemsSnapshot: text("itemsSnapshot").notNull(),
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).default("snack").notNull(),
  calories: int("calories").default(0).notNull(),
  protein: int("protein").default(0).notNull(),
  carbs: int("carbs").default(0).notNull(),
  fat: int("fat").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const weightLogs = mysqlTable("weightLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weightKg: int("weightKg").notNull(),
  loggedAt: timestamp("loggedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type FrequentMeal = typeof frequentMeals.$inferSelect;
export type WeightLog = typeof weightLogs.$inferSelect;
