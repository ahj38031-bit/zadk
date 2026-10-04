export type PortionSize = "small" | "standard" | "large";

export const PORTION_MULTIPLIERS: Record<PortionSize, number> = {
  small: 0.7,
  standard: 1,
  large: 1.35,
};

export type PortionNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function scalePortionNutrition(base: PortionNutrition, from: PortionSize, to: PortionSize): PortionNutrition {
  const ratio = PORTION_MULTIPLIERS[to] / PORTION_MULTIPLIERS[from];
  return {
    calories: Math.max(0, Math.round(base.calories * ratio)),
    protein: Math.max(0, Math.round(base.protein * ratio)),
    carbs: Math.max(0, Math.round(base.carbs * ratio)),
    fat: Math.max(0, Math.round(base.fat * ratio)),
  };
}
