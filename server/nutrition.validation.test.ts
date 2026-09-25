import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { calculateNutritionGoals } from "./nutrition";
import { getProgressMotivationStatus } from "../shared/progress";
import { buildNutritionComparison } from "../shared/nutrition-chart";

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

  it("requires a meal description or image", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.nutrition.analyzeMeal({})).rejects.toMatchObject({ code: "BAD_REQUEST" });
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
});
