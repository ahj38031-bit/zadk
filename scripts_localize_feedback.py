from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

old = '  notificationCenter: string; noNotifications: string; markAllRead: string; soundOn: string; soundOff: string; successTone: string; errorTone: string; toneGentle: string; toneChime: string; tonePulse: string; toneOff: string; guestHint: string; filters: string; mealTypeFilter: string; calorieFilter: string; allTypes: string; allCalories: string; under400: string; between400700: string; over700: string; filteredResults: string; noFilteredMeals: string; resetFilters: string; sortOrder: string; newestFirst: string; highestCalories: string; preferenceHint: string; guestPreferenceHint: string; preferencesSaving: string; preferencesSaved: string; preferencesError: string; preferencesLoading: string; signInToSync: string; confidence: string; estimated: string; items: string; removeImage: string;'
new = '  notificationCenter: string; noNotifications: string; markAllRead: string; soundOn: string; soundOff: string; successTone: string; errorTone: string; toneGentle: string; toneChime: string; tonePulse: string; toneOff: string; guestHint: string; filters: string; mealTypeFilter: string; calorieFilter: string; allTypes: string; allCalories: string; under400: string; between400700: string; over700: string; filteredResults: string; noFilteredMeals: string; resetFilters: string; sortOrder: string; newestFirst: string; highestCalories: string; preferenceHint: string; guestPreferenceHint: string; preferencesSaving: string; preferencesSaved: string; preferencesError: string; preferencesLoading: string; signInToSync: string; confidence: string; estimated: string; items: string; removeImage: string; invalidImage: string; imageTooLarge: string; unitGram: string; unitKilogram: string; daysUnit: string; activitySedentary: string; activityLight: string; activityModerate: string; activityHigh: string;'
if old not in s: raise SystemExit('Labels type anchor not found')
s = s.replace(old, new, 1)

entries = {
    '"إزالة الصورة",': '"إزالة الصورة", invalidImage: "استخدم صورة JPG أو PNG أو WEBP", imageTooLarge: "يجب أن يكون حجم الصورة أقل من 5 ميغابايت", unitGram: "غ", unitKilogram: "كغ", daysUnit: "يوماً", activitySedentary: "قليل", activityLight: "خفيف", activityModerate: "متوسط", activityHigh: "عالٍ",',
    '"Remove image",': '"Remove image", invalidImage: "Use a JPG, PNG, or WEBP image", imageTooLarge: "Image size must be under 5 MB", unitGram: "g", unitKilogram: "kg", daysUnit: "days", activitySedentary: "Sedentary", activityLight: "Light", activityModerate: "Moderate", activityHigh: "High",',
    '"Görseli kaldır",': '"Görseli kaldır", invalidImage: "JPG, PNG veya WEBP görseli kullanın", imageTooLarge: "Görsel boyutu 5 MB altında olmalıdır", unitGram: "g", unitKilogram: "kg", daysUnit: "gün", activitySedentary: "Hareketsiz", activityLight: "Hafif", activityModerate: "Orta", activityHigh: "Yüksek",',
}
for old_entry, new_entry in entries.items():
    if old_entry not in s: raise SystemExit(f'locale entry not found: {old_entry}')
    s = s.replace(old_entry, new_entry, 1)

replacements = {
    'notify("error", "استخدم صورة JPG أو PNG أو WEBP")': 'notify("error", t.invalidImage)',
    'notify("error", "حجم الصورة يجب أن يكون أقل من 5 ميغابايت")': 'notify("error", t.imageTooLarge)',
    '{analyzeMutation.error.message}': '{t.operationFailed}',
    'unit="غ"': 'unit={t.unitGram}',
    '${value}{label === t.calories ? "" : "غ"}': '${value}{label === t.calories ? "" : t.unitGram}',
    '`${formatNumber(latestWeight, language)} كغ`': '`${formatNumber(latestWeight, language)} ${t.unitKilogram}`',
    'language === "ar" ? "يوماً" : language === "tr" ? "gün" : "days"': 't.daysUnit',
    '`${days} ${t.daysLeft}`': '`${days} ${t.daysLeft}`',
    't.snack === "وجبة خفيفة" ? "قليل" : "Sedentary"': 't.activitySedentary',
    't.snack === "وجبة خفيفة" ? "خفيف" : "Light"': 't.activityLight',
    't.snack === "وجبة خفيفة" ? "متوسط" : "Moderate"': 't.activityModerate',
    't.snack === "وجبة خفيفة" ? "عالٍ" : "High"': 't.activityHigh',
}
for old_text, new_text in replacements.items():
    if old_text not in s:
        print(f'warning: replacement not found: {old_text}')
    s = s.replace(old_text, new_text)

# Replace the remaining two explicit weight units in profile progress.
s = s.replace('{progress.current} كغ', '{progress.current} {t.unitKilogram}')
s = s.replace('{progress.target} كغ', '{progress.target} {t.unitKilogram}')
# The statistics card uses a fixed Arabic gram suffix.
s = s.replace('value={`${avgProtein}غ`}', 'value={`${avgProtein}${t.unitGram}`}')

p.write_text(s)
print('localized-feedback-and-guidance')
