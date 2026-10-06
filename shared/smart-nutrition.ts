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

export function buildWeeklyPlan(calorieGoal: number, language: "ar" | "en" | "tr", goal: SmartProfile["goal"] = "maintain") {
  const localized = {
    ar: {
      breakfasts: ["شوفان بالزبادي والتوت", "بيض وخبز حبوب كاملة", "لبنة وخضار ومكسرات", "فول بزيت خفيف"],
      lunches: ["دجاج مشوي وأرز بني وسلطة", "سمك بالفرن وبطاطا وخضار", "مكبوس معدل بأرز أقل وسلطة", "لحم قليل الدهن وبرغل"],
      dinners: ["سلطة تونة وحمص", "شوربة عدس وزبادي", "ساندويتش دجاج بخبز كامل", "سلطة دجاج وأفوكادو"],
    },
    en: {
      breakfasts: ["Yogurt oats with berries", "Eggs with whole-grain toast", "Labneh, vegetables and nuts", "Light-oil fava beans"],
      lunches: ["Grilled chicken, brown rice and salad", "Baked fish, potato and vegetables", "Lighter machboos with less rice", "Lean beef and bulgur"],
      dinners: ["Tuna and chickpea salad", "Lentil soup with yogurt", "Whole-grain chicken sandwich", "Chicken and avocado salad"],
    },
    tr: {
      breakfasts: ["Yoğurtlu yulaf ve meyve", "Yumurta ve tam tahıllı ekmek", "Labne, sebze ve kuruyemiş", "Az yağlı bakla"],
      lunches: ["Izgara tavuk, esmer pirinç ve salata", "Fırın balık, patates ve sebze", "Daha az pirinçli hafif machboos", "Yağsız et ve bulgur"],
      dinners: ["Ton balığı ve nohut salatası", "Yoğurtlu mercimek çorbası", "Tam tahıllı tavuk sandviçi", "Tavuk ve avokado salatası"],
    },
  }[language];
  const { breakfasts, lunches, dinners } = localized;
  const days = language === "ar" ? ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"] : language === "tr" ? ["Cumartesi", "Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"] : ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const portions = goal === "lose" ? [0.24, 0.43, 0.33] : goal === "gain" ? [0.28, 0.42, 0.30] : [0.25, 0.45, 0.30];
  return days.map((day, index) => {
    const total = Math.max(1200, calorieGoal + (index % 3 === 0 ? -40 : index % 3 === 1 ? 35 : 0));
    const calories = portions.map((portion) => Math.round(total * portion));
    return { day, breakfast: breakfasts[index % breakfasts.length], lunch: lunches[(index + 1) % lunches.length], dinner: dinners[(index + 2) % dinners.length], calories, totalCalories: calories.reduce((sum, value) => sum + value, 0) };
  });
}
