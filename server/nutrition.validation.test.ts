import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { calculateNutritionGoals } from "./nutrition";

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
});
