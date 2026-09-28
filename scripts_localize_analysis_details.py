from pathlib import Path
p=Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s=p.read_text()
old='  notificationCenter: string; noNotifications: string; markAllRead: string; soundOn: string; soundOff: string; successTone: string; errorTone: string; toneGentle: string; toneChime: string; tonePulse: string; toneOff: string; guestHint: string; filters: string; mealTypeFilter: string; calorieFilter: string; allTypes: string; allCalories: string; under400: string; between400700: string; over700: string; filteredResults: string; noFilteredMeals: string; resetFilters: string; sortOrder: string; newestFirst: string; highestCalories: string; preferenceHint: string; guestPreferenceHint: string; preferencesSaving: string; preferencesSaved: string; preferencesError: string; preferencesLoading: string; signInToSync: string; confidence: string; estimated: string; items: string; removeImage: string; invalidImage: string; imageTooLarge: string; unitGram: string; unitKilogram: string; daysUnit: string; activitySedentary: string; activityLight: string; activityModerate: string; activityHigh: string;'
new=old[:-1]+' ingredientDetails: string; calorieUnit: string; estimateNotes: string;'
if old not in s: raise SystemExit('type anchor not found')
s=s.replace(old,new,1)
for olde,newe in [
('activityHigh: "عالٍ",','activityHigh: "عالٍ", ingredientDetails: "تفصيل المكونات والحصص", calorieUnit: "سعرة", estimateNotes: "ملاحظات التقدير",'),
('activityHigh: "High",','activityHigh: "High", ingredientDetails: "Ingredient and portion details", calorieUnit: "kcal", estimateNotes: "Estimation notes",'),
('activityHigh: "Yüksek",','activityHigh: "Yüksek", ingredientDetails: "İçerik ve porsiyon ayrıntıları", calorieUnit: "kcal", estimateNotes: "Tahmin notları",'),
]:
    if olde not in s: raise SystemExit(f'locale anchor not found: {olde}')
    s=s.replace(olde,newe,1)
repls={
'{label === t.calories ? t.calories : "غ"}':'{label === t.calories ? t.calories : t.unitGram}',
'تفصيل المكونات والحصص':'{t.ingredientDetails}',
'{ingredient.portion} · {ingredient.grams}غ · ثقة {ingredient.confidence}%':'{ingredient.portion} · {ingredient.grams}{t.unitGram} · {t.confidence}: {ingredient.confidence}%',
'>سعرة</div>':'>{t.calorieUnit}</div>',
'<span>ب {ingredient.protein}غ</span><span>ك {ingredient.carbs}غ</span><span>د {ingredient.fat}غ</span>':'<span>{t.protein} {ingredient.protein}{t.unitGram}</span><span>{t.carbs} {ingredient.carbs}{t.unitGram}</span><span>{t.fats} {ingredient.fat}{t.unitGram}</span>',
'>ملاحظات التقدير</div>':'>{t.estimateNotes}</div>',
}
for olde,newe in repls.items():
    if olde not in s: print('warning missing', olde)
    s=s.replace(olde,newe)
p.write_text(s)
print('localized-analysis-details')
