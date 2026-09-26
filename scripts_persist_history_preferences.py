from pathlib import Path
import re

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

old_type = 'resetFilters: string; sortOrder: string; newestFirst: string; highestCalories: string; signInToSync:'
new_type = 'resetFilters: string; sortOrder: string; newestFirst: string; highestCalories: string; preferenceHint: string; guestPreferenceHint: string; preferencesSaving: string; preferencesSaved: string; preferencesError: string; preferencesLoading: string; signInToSync:'
if old_type not in s:
    raise SystemExit('labels type anchor not found')
s = s.replace(old_type, new_type, 1)

label_replacements = [
    ('resetFilters: "مسح التصفية", sortOrder: "ترتيب العرض", newestFirst: "الأحدث أولاً", highestCalories: "الأعلى سعراً أولاً",', 'resetFilters: "مسح التصفية", sortOrder: "ترتيب العرض", newestFirst: "الأحدث أولاً", highestCalories: "الأعلى سعراً أولاً", preferenceHint: "سيُحفظ ترتيبك وفلاترك تلقائياً مع حسابك.", guestPreferenceHint: "للحفظ بين الزيارات، سجّل الدخول للمزامنة.", preferencesSaving: "جارٍ حفظ التفضيل", preferencesSaved: "تم الحفظ", preferencesError: "تعذر الحفظ", preferencesLoading: "جارٍ استعادة تفضيلاتك...",'),
    ('resetFilters: "Clear filters", sortOrder: "Sort display", newestFirst: "Newest first", highestCalories: "Highest calories first",', 'resetFilters: "Clear filters", sortOrder: "Sort display", newestFirst: "Newest first", highestCalories: "Highest calories first", preferenceHint: "Your filters and sort order are saved with your account.", guestPreferenceHint: "Log in to sync preferences across visits.", preferencesSaving: "Saving preference", preferencesSaved: "Saved", preferencesError: "Could not save", preferencesLoading: "Restoring your preferences...",'),
    ('resetFilters: "Filtreleri temizle", sortOrder: "Görüntüleme sırası", newestFirst: "En yeni önce", highestCalories: "En yüksek kalori önce",', 'resetFilters: "Filtreleri temizle", sortOrder: "Görüntüleme sırası", newestFirst: "En yeni önce", highestCalories: "En yüksek kalori önce", preferenceHint: "Filtreleriniz ve sıralamanız hesabınıza kaydedilir.", guestPreferenceHint: "Ziyaretler arasında senkronizasyon için giriş yapın.", preferencesSaving: "Tercih kaydediliyor", preferencesSaved: "Kaydedildi", preferencesError: "Kaydedilemedi", preferencesLoading: "Tercihleriniz geri yükleniyor...",'),
]
for old, new in label_replacements:
    if old not in s:
        raise SystemExit(f'label anchor not found: {old[:35]}')
    s = s.replace(old, new, 1)

profile_anchor = '  const profile = dashboardQuery.data?.profile ?? defaultProfile;\n  const meals = dashboardQuery.data?.meals ?? [];'
profile_replacement = '''  const profile = dashboardQuery.data?.profile ?? defaultProfile;
  const historyPreferences = dashboardQuery.data?.profile ? {
    historyMealTypeFilter: dashboardQuery.data.profile.historyMealTypeFilter,
    historyCalorieFilter: dashboardQuery.data.profile.historyCalorieFilter,
    historySortOrder: dashboardQuery.data.profile.historySortOrder,
  } : undefined;
  const meals = dashboardQuery.data?.meals ?? [];'''
if profile_anchor not in s:
    raise SystemExit('profile anchor not found')
s = s.replace(profile_anchor, profile_replacement, 1)

render_anchor = '    {view === "history" && <HistoryView meals={meals} t={t} language={language} dark={dark} onDelete={(id) => deleteMutation.mutate({ id })} onAnalyze={openAnalyze} />}'
render_replacement = '    {view === "history" && <HistoryView meals={meals} t={t} language={language} dark={dark} onDelete={(id) => deleteMutation.mutate({ id })} onAnalyze={openAnalyze} isAuthenticated={isAuthenticated} preferences={historyPreferences} preferencesReady={Boolean(dashboardQuery.data?.profile)} />}'
if render_anchor not in s:
    raise SystemExit('history render anchor not found')
s = s.replace(render_anchor, render_replacement, 1)

start = s.index('function HistoryView(')
end = s.index('\nfunction StatsView(', start)
new_history = r'''type HistoryPreferences = {
  historyMealTypeFilter: MealType | "all";
  historyCalorieFilter: CalorieFilter;
  historySortOrder: MealSortOrder;
};

type PreferenceSaveState = "saving" | "saved" | "error" | null;
const HISTORY_PREFERENCES_STORAGE_KEY = "zadak-history-preferences-v1";

function HistoryView({ meals, t, language, dark, onDelete, onAnalyze, isAuthenticated, preferences, preferencesReady }: { meals: Array<{ id: number; mealName: string; calories: number; protein: number; carbs: number; fat: number; mealType: string; createdAt: Date; aiSummary: string | null }>; t: Labels; language: Language; dark: boolean; onDelete: (id: number) => void; onAnalyze: () => void; isAuthenticated: boolean; preferences?: HistoryPreferences; preferencesReady: boolean }) {
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType | "all">("all");
  const [calorieFilter, setCalorieFilter] = useState<CalorieFilter>("all");
  const [sortOrder, setSortOrder] = useState<MealSortOrder>("latest");
  const [preferencesLoaded, setPreferencesLoaded] = useState(!isAuthenticated);
  const [saveState, setSaveState] = useState<PreferenceSaveState>(null);
  const savePreferencesMutation = trpc.nutrition.saveHistoryPreferences.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (isAuthenticated) {
      if (!preferencesReady || !preferences) return;
      setMealTypeFilter(preferences.historyMealTypeFilter);
      setCalorieFilter(preferences.historyCalorieFilter);
      setSortOrder(preferences.historySortOrder);
      setPreferencesLoaded(true);
      return;
    }

    try {
      const stored = window.localStorage.getItem(HISTORY_PREFERENCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<HistoryPreferences>;
        if (["all", "breakfast", "lunch", "dinner", "snack"].includes(parsed.historyMealTypeFilter ?? "")) setMealTypeFilter(parsed.historyMealTypeFilter as MealType | "all");
        if (["all", "under400", "400to700", "over700"].includes(parsed.historyCalorieFilter ?? "")) setCalorieFilter(parsed.historyCalorieFilter as CalorieFilter);
        if (["latest", "caloriesDesc"].includes(parsed.historySortOrder ?? "")) setSortOrder(parsed.historySortOrder as MealSortOrder);
      }
    } catch {
      // Ignore malformed guest preferences and use the defaults.
    } finally {
      setPreferencesLoaded(true);
    }
  }, [isAuthenticated, preferencesReady, preferences?.historyMealTypeFilter, preferences?.historyCalorieFilter, preferences?.historySortOrder]);

  const filteredMeals = useMemo(() => sortHistoryMeals(filterHistoryMeals(meals, mealTypeFilter, calorieFilter), sortOrder), [meals, mealTypeFilter, calorieFilter, sortOrder]);
  const hasFilters = mealTypeFilter !== "all" || calorieFilter !== "all";

  function persistPreferences(next: HistoryPreferences) {
    setMealTypeFilter(next.historyMealTypeFilter);
    setCalorieFilter(next.historyCalorieFilter);
    setSortOrder(next.historySortOrder);
    if (!preferencesLoaded) return;
    setSaveState("saving");

    if (!isAuthenticated) {
      window.localStorage.setItem(HISTORY_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
      setSaveState("saved");
      return;
    }

    savePreferencesMutation.mutate(next, {
      onSuccess: () => {
        setSaveState("saved");
        void utils.nutrition.dashboard.invalidate();
      },
      onError: () => {
        setSaveState("error");
        toast.error(t.preferencesError);
      },
    });
  }

  function changeMealType(value: MealType | "all") {
    persistPreferences({ historyMealTypeFilter: value, historyCalorieFilter: calorieFilter, historySortOrder: sortOrder });
  }

  function changeCalories(value: CalorieFilter) {
    persistPreferences({ historyMealTypeFilter: mealTypeFilter, historyCalorieFilter: value, historySortOrder: sortOrder });
  }

  function changeSort(value: MealSortOrder) {
    persistPreferences({ historyMealTypeFilter: mealTypeFilter, historyCalorieFilter: calorieFilter, historySortOrder: value });
  }

  function resetFilters() {
    persistPreferences({ historyMealTypeFilter: "all", historyCalorieFilter: "all", historySortOrder: sortOrder });
  }

  const preferenceStatus = saveState === "saving" ? t.preferencesSaving : saveState === "saved" ? t.preferencesSaved : saveState === "error" ? t.preferencesError : null;
  const controlClass = `mt-2 h-11 w-full rounded-xl border px-3 text-xs font-semibold outline-none transition-shadow focus:ring-2 focus:ring-[#70b99a] disabled:cursor-wait disabled:opacity-60 ${dark ? "border-white/10 bg-[#182a23] text-[#d9e8dc]" : "border-[#e1e9e1] bg-[#fbfdf9] text-[#526158]"}`;

  return <main className="mx-auto max-w-[1180px] px-5 pb-10 pt-8 lg:px-8">
    <div className="mb-6 flex items-end justify-between gap-4"><div><div className="mb-2 text-xs font-semibold text-[#8a988e]">{t.history}</div><h1 className="text-3xl font-black">{t.allMeals}</h1></div><button onClick={onAnalyze} className="flex items-center gap-2 rounded-full bg-[#087b69] px-4 py-3 text-xs font-bold text-white shadow-[0_8px_18px_rgba(8,123,105,.14)] transition-all hover:-translate-y-0.5 active:scale-95"><Plus size={15} />{t.addMeal}</button></div>
    {meals.length > 0 && <section className={`mb-5 rounded-[26px] border p-4 shadow-[0_10px_30px_rgba(35,67,51,.05)] sm:p-5 ${dark ? "border-white/10 bg-[#20312b]" : "border-[#e2ece2] bg-white"}`} aria-label={t.filters}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-2"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#eaf6eb] text-[#16866f]"><History size={17} /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-black">{t.filters}</h2>{isAuthenticated && <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${saveState === "error" ? "bg-red-50 text-red-600" : saveState === "saving" ? "bg-[#fff7df] text-[#9a7730]" : "bg-[#eef8ef] text-[#16866f]"}`} aria-live="polite"><Save size={10} />{preferenceStatus ?? (preferencesLoaded ? t.preferencesSaved : t.preferencesLoading)}</span>}</div><p className={`mt-1 text-[10px] ${dark ? "text-[#9fb7a8]" : "text-[#849188]"}`}>{filteredMeals.length} / {meals.length} {t.filteredResults}</p><p className={`mt-1 text-[10px] ${dark ? "text-[#8ca89a]" : "text-[#9aa69d]"}`}>{isAuthenticated ? t.preferenceHint : t.guestPreferenceHint}</p></div></div>{hasFilters && <button type="button" onClick={resetFilters} disabled={!preferencesLoaded} className="rounded-full border border-[#cfe2d1] px-3 py-1.5 text-[10px] font-bold text-[#087b69] transition-colors hover:bg-[#eff8ef] disabled:opacity-50">{t.resetFilters}</button>}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3"><label className={`text-[10px] font-bold ${dark ? "text-[#b9cdbf]" : "text-[#68776d]"}`}>{t.mealTypeFilter}<select disabled={!preferencesLoaded} value={mealTypeFilter} onChange={(event) => changeMealType(event.target.value as MealType | "all")} className={controlClass}><option value="all">{t.allTypes}</option><option value="breakfast">{t.breakfast}</option><option value="lunch">{t.lunch}</option><option value="dinner">{t.dinner}</option><option value="snack">{t.snack}</option></select></label><label className={`text-[10px] font-bold ${dark ? "text-[#b9cdbf]" : "text-[#68776d]"}`}>{t.calorieFilter}<select disabled={!preferencesLoaded} value={calorieFilter} onChange={(event) => changeCalories(event.target.value as CalorieFilter)} className={controlClass}><option value="all">{t.allCalories}</option><option value="under400">{t.under400}</option><option value="400to700">{t.between400700}</option><option value="over700">{t.over700}</option></select></label><label className={`text-[10px] font-bold ${dark ? "text-[#b9cdbf]" : "text-[#68776d]"}`}>{t.sortOrder}<select disabled={!preferencesLoaded} value={sortOrder} onChange={(event) => changeSort(event.target.value as MealSortOrder)} className={controlClass}><option value="latest">{t.newestFirst}</option><option value="caloriesDesc">{t.highestCalories}</option></select></label></div>
    </section>}
    {meals.length === 0 ? <div className={`rounded-[24px] p-12 text-center shadow-sm ${dark ? "bg-[#20312b]" : "bg-white"}`}><History className="mx-auto mb-4 text-[#8fc5a8]" size={36} /><h2 className="text-xl font-black">{t.noHistory}</h2><p className="mt-2 text-sm text-[#7d897f]">{t.emptyHint}</p></div> : filteredMeals.length === 0 ? <div className={`rounded-[24px] border border-dashed p-12 text-center shadow-sm ${dark ? "border-white/10 bg-[#20312b]" : "border-[#dce9dd] bg-white"}`}><History className="mx-auto mb-4 text-[#8fc5a8]" size={34} /><h2 className="text-lg font-black">{t.noFilteredMeals}</h2><p className="mt-2 text-xs text-[#7d897f]">{t.emptyHint}</p><button type="button" onClick={resetFilters} disabled={!preferencesLoaded} className="mt-5 rounded-full bg-[#087b69] px-4 py-2.5 text-xs font-bold text-white transition-transform active:scale-95 disabled:opacity-50">{t.resetFilters}</button></div> : <div className="grid gap-3 md:grid-cols-2">{filteredMeals.map((meal) => <div key={meal.id} className={`zadak-meal-card rounded-[22px] p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${dark ? "bg-[#20312b]" : "bg-white"}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-extrabold">{meal.mealName}</h3><div className="mt-1 flex items-center gap-2 text-[10px] text-[#8a978f]"><Clock3 size={12} />{new Date(meal.createdAt).toLocaleString(language === "ar" ? "ar-EG" : language)}<span>•</span>{t[meal.mealType as MealType]}</div></div><button onClick={() => onDelete(meal.id)} className="grid h-8 w-8 place-items-center rounded-full text-[#9da8a0] transition-colors hover:bg-red-50 hover:text-red-500" aria-label={t.delete}><Trash2 size={14} /></button></div><div className="mt-4 grid grid-cols-4 gap-2">{[[t.calories, meal.calories], [t.protein, meal.protein], [t.carbs, meal.carbs], [t.fats, meal.fat]].map(([label, value]) => <div key={String(label)} className={`rounded-xl p-2 text-center ${dark ? "bg-[#182a23]" : "bg-[#f7faf6]"}`}><div className="text-[9px] text-[#8b978e]">{label}</div><div className="mt-1 text-sm font-black text-[#16866f]">{value}{label === t.calories ? "" : "غ"}</div></div>)}</div></div>)}</div>}
  </main>;
}'''
s = s[:start] + new_history + s[end:]
p.write_text(s)
print('history-preferences-ui-updated')
