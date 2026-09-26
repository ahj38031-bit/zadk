from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

s = s.replace('analyzing: string; analysisDone: string; mealSaved: string; delete: string;', 'analyzing: string; analysisDone: string; mealSaved: string; mealDeleted: string; dayCleared: string; operationFailed: string; delete: string;', 1)
s = s.replace('analysisDone: "نتيجة التحليل", mealSaved: "تم حفظ الوجبة في سجلك", delete:', 'analysisDone: "نتيجة التحليل", mealSaved: "تم حفظ الوجبة في سجلك", mealDeleted: "تم حذف الوجبة", dayCleared: "تم تصفير وجبات اليوم", operationFailed: "تعذر إكمال العملية، حاول مرة أخرى", delete:', 1)
s = s.replace('analysisDone: "Analysis result", mealSaved: "Meal saved to your history", delete:', 'analysisDone: "Analysis result", mealSaved: "Meal saved to your history", mealDeleted: "Meal deleted", dayCleared: "Today’s meals were cleared", operationFailed: "Something went wrong. Please try again.", delete:', 1)
s = s.replace('analysisDone: "Analiz sonucu", mealSaved: "Öğün geçmişinize kaydedildi", delete:', 'analysisDone: "Analiz sonucu", mealSaved: "Öğün geçmişinize kaydedildi", mealDeleted: "Öğün silindi", dayCleared: "Bugünün öğünleri temizlendi", operationFailed: "İşlem tamamlanamadı. Lütfen tekrar deneyin.", delete:', 1)

old = 'const analyzeMutation = trpc.nutrition.analyzeMeal.useMutation({ onSuccess: (result) => { setAnalysisResult({ ...result.analysis, items: result.analysis.items }); void utils.nutrition.dashboard.invalidate(); toast.success(t.mealSaved); } });\n  const deleteMutation = trpc.nutrition.deleteMeal.useMutation({ onSuccess: () => { void utils.nutrition.dashboard.invalidate(); toast.success(t.delete); } });\n  const clearMutation = trpc.nutrition.clearToday.useMutation({ onSuccess: () => { void utils.nutrition.dashboard.invalidate(); toast.success(t.reset); } });\n  const saveProfileMutation = trpc.nutrition.saveProfile.useMutation({ onSuccess: () => { void utils.nutrition.dashboard.invalidate(); toast.success(calorieSuggestion ? t.suggestionApplied : t.saved); } });'
new = 'const analyzeMutation = trpc.nutrition.analyzeMeal.useMutation({ onSuccess: (result) => { setAnalysisResult({ ...result.analysis, items: result.analysis.items }); void utils.nutrition.dashboard.invalidate(); toast.success(t.mealSaved); }, onError: () => toast.error(t.operationFailed) });\n  const deleteMutation = trpc.nutrition.deleteMeal.useMutation({ onSuccess: () => { void utils.nutrition.dashboard.invalidate(); toast.success(t.mealDeleted); }, onError: () => toast.error(t.operationFailed) });\n  const clearMutation = trpc.nutrition.clearToday.useMutation({ onSuccess: () => { void utils.nutrition.dashboard.invalidate(); toast.success(t.dayCleared); }, onError: () => toast.error(t.operationFailed) });\n  const saveProfileMutation = trpc.nutrition.saveProfile.useMutation({ onSuccess: () => { void utils.nutrition.dashboard.invalidate(); toast.success(calorieSuggestion ? t.suggestionApplied : t.saved); }, onError: () => toast.error(t.operationFailed) });'
if old not in s:
    raise SystemExit('mutation block anchor not found')
s = s.replace(old, new, 1)
p.write_text(s)

app = Path('/home/ubuntu/zadak-ai-clone/client/src/App.tsx')
a = app.read_text()
a = a.replace('<Toaster position="bottom-center" />', '<Toaster position="bottom-center" richColors closeButton duration={3600} visibleToasts={4} />', 1)
app.write_text(a)

css = Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
c = css.read_text()
addition = r'''

  .toaster [data-sonner-toast] {
    border-radius: 16px;
    box-shadow: 0 14px 34px rgba(35, 67, 51, .14);
    font-family: 'Inter', 'Noto Sans Arabic', sans-serif;
    font-size: 12px;
    font-weight: 700;
  }

  .toaster [data-sonner-toast][data-type="success"] {
    border-color: rgba(22, 134, 111, .25);
  }

  .toaster [data-sonner-toast][data-type="error"] {
    border-color: rgba(198, 91, 76, .25);
  }
'''
idx = c.rfind('\n}\n')
c = c[:idx] + addition + c[idx:]
css.write_text(c)
print('toasts-unified')
