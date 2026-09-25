export type HistoryMealType = "breakfast" | "lunch" | "dinner" | "snack";
export type HistoryCalorieFilter = "all" | "under400" | "400to700" | "over700";
export type FilterableMeal = { mealType: string; calories: number };

export function filterHistoryMeals<T extends FilterableMeal>(meals: T[], mealType: HistoryMealType | "all", calorieRange: HistoryCalorieFilter): T[] {
  return meals.filter((meal) => {
    const matchesType = mealType === "all" || meal.mealType === mealType;
    const matchesCalories = calorieRange === "all" || calorieRange === "under400" && meal.calories < 400 || calorieRange === "400to700" && meal.calories >= 400 && meal.calories <= 700 || calorieRange === "over700" && meal.calories > 700;
    return matchesType && matchesCalories;
  });
}
