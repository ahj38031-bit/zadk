export type ActivityLevel = "sedentary" | "light" | "moderate" | "high";

export type GoalInputs = {
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
};

export type NutritionGoals = {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  bmr: number;
  activityMultiplier: number;
};

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

/**
 * Estimates maintenance calories with the Mifflin-St Jeor equation using a
 * sex-neutral midpoint correction because the current profile does not ask for sex.
 * Macro targets use 25% protein, 45% carbohydrate, and 30% fat calories.
 */
export function calculateNutritionGoals(input: GoalInputs): NutritionGoals {
  const { age, heightCm, weightKg, activityLevel } = input;
  if (!Number.isFinite(age) || !Number.isFinite(heightCm) || !Number.isFinite(weightKg)) {
    throw new Error("Age, height, and weight are required");
  }
  const multiplier = activityMultipliers[activityLevel];
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 78);
  const calorieGoal = Math.max(1200, Math.round((bmr * multiplier) / 10) * 10);
  const proteinGoal = Math.max(40, Math.round((calorieGoal * 0.25) / 4));
  const carbsGoal = Math.max(40, Math.round((calorieGoal * 0.45) / 4));
  const fatGoal = Math.max(25, Math.round((calorieGoal * 0.3) / 9));

  return { calorieGoal, proteinGoal, carbsGoal, fatGoal, bmr, activityMultiplier: multiplier };
}
