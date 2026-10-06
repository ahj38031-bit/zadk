export type SmartProfile = { calorieGoal: number; proteinGoal: number; carbsGoal: number; fatGoal: number; goal: "lose" | "maintain" | "gain" };
export type SmartMeal = { calories: number; protein: number; carbs: number; fat: number };

export function getMealInsights(meal: SmartMeal, profile: SmartProfile) {
  const alerts: Array<"calories" | "fat" | "sugar"> = [];
  if (meal.calories > profile.calorieGoal * 0.4) alerts.push("calories");
  if (meal.fat > profile.fatGoal * 0.45) alerts.push("fat");
  if (meal.carbs > profile.carbsGoal * 0.45) alerts.push("sugar");
  const alternative = profile.goal === "lose" ? "reduce-rice-or-add-vegetables" : profile.goal === "gain" ? "add-protein-or-whole-grains" : "half-plate-vegetables";
  return { alerts, alternative, hasAlerts: alerts.length > 0 } as const;
}

export function buildWeeklyPlan(calorieGoal: number, language: "ar" | "en" | "tr") {
  const names = language === "ar" ? ["فطور متوازن", "غداء غني بالبروتين", "عشاء خفيف"] : language === "tr" ? ["Dengeli kahvaltı", "Proteinli öğle", "Hafif akşam"] : ["Balanced breakfast", "Protein lunch", "Light dinner"];
  return Array.from({ length: 7 }, (_, index) => ({ day: index, meal: names[index % names.length], calories: Math.max(280, Math.round(calorieGoal / 3) + (index % 2) * 40) }));
}
