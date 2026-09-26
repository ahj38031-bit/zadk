from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

s = s.replace('chartCaloriesAverage: string; chartLatestWeight: string; chartVisible: string;', 'chartCaloriesAverage: string; chartLatestWeight: string; chartDailyTarget: string; chartVisible: string;', 1)
s = s.replace('chartCaloriesAverage: "متوسط السعرات", chartLatestWeight: "آخر وزن", chartVisible:', 'chartCaloriesAverage: "متوسط السعرات", chartLatestWeight: "آخر وزن", chartDailyTarget: "الهدف اليومي", chartVisible:', 1)
s = s.replace('chartCaloriesAverage: "Average calories", chartLatestWeight: "Latest weight", chartVisible:', 'chartCaloriesAverage: "Average calories", chartLatestWeight: "Latest weight", chartDailyTarget: "Daily target", chartVisible:', 1)
s = s.replace('chartCaloriesAverage: "Ortalama kalori", chartLatestWeight: "Son kilo", chartVisible:', 'chartCaloriesAverage: "Ortalama kalori", chartLatestWeight: "Son kilo", chartDailyTarget: "Günlük hedef", chartVisible:', 1)

s = s.replace('const [visibleSeries, setVisibleSeries] = useState({ calories: true, weight: true });', 'const [visibleSeries, setVisibleSeries] = useState({ calories: true, weight: true, target: true });', 1)
s = s.replace('const chartData = useMemo(() => buildNutritionComparison(meals, weightLogs, chartDays, new Date(), language === "ar" ? "ar-EG" : language), [meals, weightLogs, chartDays, language]);', 'const chartData = useMemo(() => buildNutritionComparison(meals, weightLogs, chartDays, new Date(), language === "ar" ? "ar-EG" : language).map((point) => ({ ...point, calorieGoal: profile.calorieGoal })), [meals, weightLogs, chartDays, language, profile.calorieGoal]);', 1)
s = s.replace('const seriesButton = (key: "calories" | "weight", label: string, color: string)', 'const seriesButton = (key: "calories" | "weight" | "target", label: string, color: string)', 1)
s = s.replace('{seriesButton("weight", t.weightSeries, "#d49c3e")}', '{seriesButton("weight", t.weightSeries, "#d49c3e")}{seriesButton("target", t.chartDailyTarget, "#7892a6")}', 1)

old = '<Line yAxisId="calories" type="monotone" dataKey="calories" name={t.caloriesSeries} stroke="#16866f" strokeWidth={3} dot={{ r: 3, fill: "#16866f" }} activeDot={{ r: 6 }} connectNulls />}{visibleSeries.weight && <Line yAxisId="weight"'
new = '<Line yAxisId="calories" type="monotone" dataKey="calories" name={t.caloriesSeries} stroke="#16866f" strokeWidth={3} dot={{ r: 3, fill: "#16866f" }} activeDot={{ r: 6 }} connectNulls />}{visibleSeries.target && <Line yAxisId="calories" type="monotone" dataKey="calorieGoal" name={t.chartDailyTarget} stroke="#7892a6" strokeWidth={2} strokeDasharray="6 5" dot={false} activeDot={{ r: 4 }} />}{visibleSeries.weight && <Line yAxisId="weight"'
if old not in s:
    raise SystemExit('chart line anchor not found')
s = s.replace(old, new, 1)
p.write_text(s)
print('calorie-target-chart-added')
