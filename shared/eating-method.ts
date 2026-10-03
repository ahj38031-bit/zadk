export type EatingMethod = "bread" | "spoon" | "nothing";

export type MealNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

// A small bread serving is used only as a transparent UI adjustment when the
// user changes the serving method after analysis.
const BREAD_SERVING: MealNutrition = { calories: 160, protein: 5, carbs: 31, fat: 2 };

function clamp(value: number) {
  return Math.max(0, Math.round(value));
}

export function recalculateEatingMethod(base: MealNutrition, from: EatingMethod, to: EatingMethod): MealNutrition {
  const withoutBread = from === "bread"
    ? { calories: base.calories - BREAD_SERVING.calories, protein: base.protein - BREAD_SERVING.protein, carbs: base.carbs - BREAD_SERVING.carbs, fat: base.fat - BREAD_SERVING.fat }
    : base;
  const adjusted = to === "bread"
    ? { calories: withoutBread.calories + BREAD_SERVING.calories, protein: withoutBread.protein + BREAD_SERVING.protein, carbs: withoutBread.carbs + BREAD_SERVING.carbs, fat: withoutBread.fat + BREAD_SERVING.fat }
    : withoutBread;
  return { calories: clamp(adjusted.calories), protein: clamp(adjusted.protein), carbs: clamp(adjusted.carbs), fat: clamp(adjusted.fat) };
}
