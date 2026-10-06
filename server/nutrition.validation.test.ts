import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { calculateNutritionGoals } from "./nutrition";
import { getProgressMotivationStatus } from "../shared/progress";
import { buildNutritionComparison } from "../shared/nutrition-chart";
import { recalculateEatingMethod } from "../shared/eating-method";
import { scalePortionNutrition } from "../shared/portion-size";
import { calculateWeightVerification } from "../shared/weight-verification";
import { filterHistoryMeals, sortHistoryMeals } from "../shared/history-filters";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const now = new Date();
  const user: AuthenticatedUser = {
    id: 42,
    openId: "nutrition-test-user",
    email: "nutrition@example.com",
    name: "Nutrition Test",
    loginMethod: "test",
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("nutrition input validation", () => {
  it("calculates maintenance calories and balanced macros from body data", () => {
    const result = calculateNutritionGoals({ age: 30, heightCm: 170, weightKg: 70, activityLevel: "moderate", goal: "maintain" });
    expect(result.bmr).toBe(1535);
    expect(result.calorieGoal).toBe(2380);
    expect(result.proteinGoal).toBe(149);
    expect(result.carbsGoal).toBe(268);
    expect(result.fatGoal).toBe(79);
  });

  it("uses a higher calorie target for higher activity", () => {
    const sedentary = calculateNutritionGoals({ age: 30, heightCm: 170, weightKg: 70, activityLevel: "sedentary", goal: "maintain" });
    const active = calculateNutritionGoals({ age: 30, heightCm: 170, weightKg: 70, activityLevel: "high", goal: "maintain" });
    expect(active.calorieGoal).toBeGreaterThan(sedentary.calorieGoal);
    expect(active.activityMultiplier).toBe(1.725);
  });

  it("adjusts calories and macros according to the selected goal", () => {
    const lose = calculateNutritionGoals({ age: 30, heightCm: 170, weightKg: 70, activityLevel: "moderate", goal: "lose" });
    const maintain = calculateNutritionGoals({ age: 30, heightCm: 170, weightKg: 70, activityLevel: "moderate", goal: "maintain" });
    const gain = calculateNutritionGoals({ age: 30, heightCm: 170, weightKg: 70, activityLevel: "moderate", goal: "gain" });
    expect(lose.calorieGoal).toBeLessThan(maintain.calorieGoal);
    expect(gain.calorieGoal).toBeGreaterThan(maintain.calorieGoal);
    expect(lose.proteinGoal).toBeGreaterThan(maintain.proteinGoal);
    expect(gain.carbsGoal).toBeGreaterThan(maintain.carbsGoal);
  });

  it("scales nutrition when the user changes portion size", () => {
    const base = { calories: 500, protein: 30, carbs: 60, fat: 15 };
    expect(scalePortionNutrition(base, "standard", "small")).toEqual({ calories: 350, protein: 21, carbs: 42, fat: 11 });
    expect(scalePortionNutrition(base, "standard", "large")).toEqual({ calories: 675, protein: 41, carbs: 81, fat: 20 });
    expect(scalePortionNutrition(scalePortionNutrition(base, "standard", "large"), "large", "standard")).toEqual(base);
  });
  it("compares ingredient weight with the user's exact total", () => {
    expect(calculateWeightVerification([{ grams: 120 }, { grams: 180 }], 300)).toMatchObject({ ingredientGrams: 300, differenceGrams: 0, matchPercent: 100, status: "excellent" });
    expect(calculateWeightVerification([{ grams: 80 }, { grams: 120 }], 300)).toMatchObject({ ingredientGrams: 200, differenceGrams: -100, deviationPercent: 33, matchPercent: 67, status: "off" });
    expect(calculateWeightVerification([{ grams: 100 }], 0)).toBeUndefined();
  });
  it("recalculates nutrition immediately when the eating method changes", () => {
    const base = { calories: 500, protein: 24, carbs: 60, fat: 12 };
    const withBread = recalculateEatingMethod(base, "nothing", "bread");
    expect(withBread).toEqual({ calories: 660, protein: 29, carbs: 91, fat: 14 });
    expect(recalculateEatingMethod(withBread, "bread", "spoon")).toEqual(base);
  });
  it("restores the original nutrition after undoing an eating-method change", () => {
    const original = { calories: 640, protein: 30, carbs: 72, fat: 18 };
    const changed = recalculateEatingMethod(original, "nothing", "bread");
    const restored = recalculateEatingMethod(changed, "bread", "nothing");
    expect(restored).toEqual(original);
  });
  it("requires a meal description or image", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.nutrition.analyzeMeal({})).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects invalid exact food weights before analysis", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.nutrition.analyzeMeal({ description: "طبق أرز", portionGrams: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.nutrition.analyzeMeal({ description: "طبق أرز", portionGrams: 3001 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
  it("rejects unsupported eating methods before analysis", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.nutrition.analyzeMeal({
      description: "طبق أرز",
      eatingMethod: "fork" as "bread",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
  it("keeps the photo note short and rejects oversized notes", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.nutrition.analyzeMeal({
      description: "x".repeat(501),
      imageData: "data:image/png;base64,a",
      imageMimeType: "image/png",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unrealistic calorie goals before touching the database", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.nutrition.saveProfile({
      calorieGoal: 200,
      proteinGoal: 98,
      carbsGoal: 293,
      fatGoal: 64,
      activityLevel: "moderate",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects malformed target dates before touching the database", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.nutrition.saveProfile({
      calorieGoal: 2139,
      proteinGoal: 98,
      carbsGoal: 293,
      fatGoal: 64,
      activityLevel: "moderate",
      goal: "lose",
      targetWeightKg: 65,
      targetDate: "25/09/2026",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unsupported preferred eating methods before touching the database", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.nutrition.saveProfile({
      calorieGoal: 2139,
      proteinGoal: 98,
      carbsGoal: 293,
      fatGoal: 64,
      activityLevel: "moderate",
      preferredEatingMethod: "fork" as "nothing",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
  it("selects motivation based on progress and timeline", () => {
    expect(getProgressMotivationStatus(100, 20)).toBe("reached");
    expect(getProgressMotivationStatus(40, 30)).toBe("onTrack");
    expect(getProgressMotivationStatus(85, 30)).toBe("ahead");
    expect(getProgressMotivationStatus(45, 5)).toBe("deadline");
    expect(getProgressMotivationStatus(70, -1)).toBe("overdue");
    expect(getProgressMotivationStatus(10, 60)).toBe("start");
  });

  it("does not request an AI calorie change when the timeline is healthy", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.nutrition.suggestCalorieAdjustment({
      currentCalories: 2200,
      progressPercent: 65,
      daysRemaining: 30,
      goal: "lose",
      adjustmentDirection: "lower",
      currentWeightKg: 78,
      targetWeightKg: 70,
      language: "ar",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("builds daily calorie totals and carries the latest actual weight forward", () => {
    const now = new Date(2026, 8, 25, 12);
    const result = buildNutritionComparison(
      [{ calories: 600, createdAt: new Date(2026, 8, 24, 10) }, { calories: 450, createdAt: new Date(2026, 8, 24, 18) }],
      [{ weightKg: 80, loggedAt: new Date(2026, 8, 24, 8) }],
      3,
      now,
    );
    expect(result).toHaveLength(3);
    expect(result[1]).toMatchObject({ calories: 1050, weight: 80 });
    expect(result[2]).toMatchObject({ calories: 0, weight: 80 });
  });

  it("supports a 30-day comparison range for the interactive chart", () => {
    const result = buildNutritionComparison([], [], 30, new Date(2026, 8, 25, 12));
    expect(result).toHaveLength(30);
    expect(result[0]).toMatchObject({ calories: 0, weight: null });
  });

  it("filters history by meal type and calorie range", () => {
    const meals = [
      { mealType: "breakfast", calories: 320 },
      { mealType: "lunch", calories: 560 },
      { mealType: "dinner", calories: 820 },
    ];
    expect(filterHistoryMeals(meals, "all", "under400")).toHaveLength(1);
    expect(filterHistoryMeals(meals, "lunch", "all")).toEqual([{ mealType: "lunch", calories: 560 }]);
    expect(filterHistoryMeals(meals, "all", "over700")).toEqual([{ mealType: "dinner", calories: 820 }]);
  });

  it("sorts history by newest or highest calorie total without mutating the source", () => {
    const meals = [
      { mealType: "lunch", calories: 560, createdAt: new Date("2026-09-24T12:00:00Z") },
      { mealType: "breakfast", calories: 820, createdAt: new Date("2026-09-25T08:00:00Z") },
    ];
    expect(sortHistoryMeals(meals, "latest").map((meal) => meal.mealType)).toEqual(["breakfast", "lunch"]);
    expect(sortHistoryMeals(meals, "caloriesDesc").map((meal) => meal.calories)).toEqual([820, 560]);
    expect(meals[0]?.mealType).toBe("lunch");
  });

  it("validates history preference values before touching the database", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.nutrition.saveHistoryPreferences({
      historyMealTypeFilter: "brunch" as "all",
      historyCalorieFilter: "all",
      historySortOrder: "latest",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
