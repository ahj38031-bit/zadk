import { describe, expect, it } from "vitest";
import { calculateWeightPlan } from "../shared/weight-plans";

const base = {
  goal: "maintain" as const,
  calorieGoal: 2200,
  proteinGoal: 100,
  carbsGoal: 280,
  fatGoal: 70,
  weightKg: 80,
  startWeightKg: 80,
  targetWeightKg: 72,
  targetDate: null,
};

describe("calculateWeightPlan", () => {
  it("sets a lower calorie target and a safe weekly pace for weight loss", () => {
    const plan = calculateWeightPlan(base, "lose");
    expect(plan.calories).toBe(1850);
    expect(plan.weeklyPaceKg).toBe(0.4);
    expect(plan.days).toBe(140);
    expect(plan.protein).toBe(128);
  });

  it("sets a higher calorie target for weight gain", () => {
    const plan = calculateWeightPlan(base, "gain");
    expect(plan.calories).toBe(2500);
    expect(plan.weeklyPaceKg).toBe(0.25);
    expect(plan.days).toBe(224);
  });

  it("keeps maintenance calories and uses the selected target date", () => {
    const plan = calculateWeightPlan({ ...base, targetDate: "2026-12-31" }, "maintain", new Date("2026-12-01T00:00:00Z"));
    expect(plan.calories).toBe(2200);
    expect(plan.days).toBe(31);
    expect(plan.targetDateDays).toBe(31);
  });

  it("returns a useful setup state when weight data is missing", () => {
    const plan = calculateWeightPlan({ ...base, weightKg: null, targetWeightKg: null }, "lose");
    expect(plan.hasProfileData).toBe(false);
    expect(plan.hasTarget).toBe(false);
    expect(plan.difference).toBeNull();
    expect(plan.days).toBeNull();
  });
});
