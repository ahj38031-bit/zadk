import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Droplets,
  Globe2,
  History,
  Languages,
  LockKeyhole,
  LogIn,
  Moon,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type Language = "ar" | "en" | "tr";

const labels = {
  ar: {
    home: "الرئيسية",
    analyze: "حلّل وجبة",
    history: "السجل",
    stats: "الإحصائيات",
    profile: "ملفي",
    login: "تسجيل الدخول للمزامنة",
    greeting: "أهلاً، يا صديق الصحة",
    headline: "اعرف ما في طبقك، وخُذ قرارك بثقة.",
    subheadline: "صوّر وجبتك أو صفها بكلماتك — وسنحوّلها إلى تقدير غذائي واضح خلال لحظات.",
    analyzeNow: "حلّل وجبتك الآن",
    smart: "ذكي وبسيط",
    today: "ملخص اليوم",
    calories: "سعرة",
    newDay: "يوم جديد",
    remaining: "متبقٍ",
    protein: "بروتين",
    carbs: "كربوهيدرات",
    fats: "دهون",
    lastMeals: "آخر الوجبات",
    noMeals: "لم تُسجّل أي وجبة بعد",
    emptyHint: "ابدأ بصورة أو وصف بسيط، وسنرتب النتيجة لك.",
    viewHistory: "عرض السجل",
    startAnalysis: "ابدأ التحليل",
    privacy: "الخصوصية والمعالجة",
    privacyTitle: "بياناتك على جهازك",
    privacyText: "افهم بوضوح أين تبقى بياناتك ومتى تُرسل صورة للتحليل.",
    close: "إغلاق",
    reset: "تم تصفير ملخص اليوم",
    soon: "هذه الشاشة جاهزة للربط قريباً",
    language: "اللغة",
    dark: "الوضع الداكن",
    light: "الوضع الفاتح",
    sync: "المزامنة",
    feature: "الميزة قادمة قريباً",
    addMeal: "إضافة وجبة",
  },
  en: {
    home: "Home",
    analyze: "Analyze meal",
    history: "History",
    stats: "Statistics",
    profile: "My profile",
    login: "Log in to sync",
    greeting: "Hello, health friend",
    headline: "Know what's on your plate, and decide with confidence.",
    subheadline: "Snap your meal or describe it in words — we'll turn it into a clear nutrition estimate in moments.",
    analyzeNow: "Analyze your meal",
    smart: "Smart & simple",
    today: "Today's summary",
    calories: "calories",
    newDay: "New day",
    remaining: "remaining",
    protein: "Protein",
    carbs: "Carbs",
    fats: "Fats",
    lastMeals: "Recent meals",
    noMeals: "No meal logged yet",
    emptyHint: "Start with a photo or a simple description, and we'll organize the result for you.",
    viewHistory: "View history",
    startAnalysis: "Start analysis",
    privacy: "Privacy & processing",
    privacyTitle: "Your data on your device",
    privacyText: "Understand clearly where your data stays and when an image is sent for analysis.",
    close: "Close",
    reset: "Today's summary was reset",
    soon: "This screen is ready to connect soon",
    language: "Language",
    dark: "Dark mode",
    light: "Light mode",
    sync: "Sync",
    feature: "Feature coming soon",
    addMeal: "Add meal",
  },
  tr: {
    home: "Ana sayfa",
    analyze: "Öğün analiz et",
    history: "Geçmiş",
    stats: "İstatistikler",
    profile: "Profilim",
    login: "Senkronize olmak için giriş",
    greeting: "Merhaba, sağlık dostu",
    headline: "Tabağında ne olduğunu bil, güvenle karar ver.",
    subheadline: "Öğünün fotoğrafını çek veya kelimelerle anlat — saniyeler içinde anlaşılır bir beslenme tahmini sunalım.",
    analyzeNow: "Öğününü analiz et",
    smart: "Akıllı ve basit",
    today: "Bugünün özeti",
    calories: "kalori",
    newDay: "Yeni gün",
    remaining: "kalan",
    protein: "Protein",
    carbs: "Karbonhidrat",
    fats: "Yağ",
    lastMeals: "Son öğünler",
    noMeals: "Henüz öğün kaydedilmedi",
    emptyHint: "Bir fotoğraf veya kısa açıklamayla başlayın, sonucu sizin için düzenleyelim.",
    viewHistory: "Geçmişi gör",
    startAnalysis: "Analizi başlat",
    privacy: "Gizlilik ve işleme",
    privacyTitle: "Verileriniz cihazınızda",
    privacyText: "Verilerinizin nerede kaldığını ve bir görüntünün ne zaman analiz için gönderildiğini açıkça görün.",
    close: "Kapat",
    reset: "Bugünün özeti sıfırlandı",
    soon: "Bu ekran yakında bağlantıya hazır",
    language: "Dil",
    dark: "Karanlık mod",
    light: "Aydınlık mod",
    sync: "Senkronizasyon",
    feature: "Özellik yakında",
    addMeal: "Öğün ekle",
  },
} as const;

const navItems = [
  { key: "home", icon: Utensils },
  { key: "analyze", icon: Sparkles },
  { key: "history", icon: History },
  { key: "stats", icon: BarChart3 },
  { key: "profile", icon: UserRound },
] as const;

const nutrition = [
  { key: "protein", value: "0 / 98غ", color: "#299c78" },
  { key: "carbs", value: "0 / 293غ", color: "#f0b45a" },
  { key: "fats", value: "0 / 64غ", color: "#8c7ed1" },
] as const;

function Logo() {
  return (
    <div className="flex items-center gap-3" dir="rtl">
      <div className="relative grid h-11 w-11 place-items-center rounded-full bg-[#087b69] text-white shadow-[0_8px_18px_rgba(6,101,84,.2)]">
        <Utensils size={20} strokeWidth={2.2} />
        <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full bg-[#f0ad4e] ring-2 ring-white" />
      </div>
      <div className="leading-none">
        <div className="text-[17px] font-black tracking-[-0.04em] text-[#087b69]">زادك AI</div>
        <div className="mt-1 text-[7px] font-bold tracking-[.2em] text-[#9b9b93]">YOUR FOOD COMPANION</div>
      </div>
    </div>
  );
}

function MacroRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-[#6f756f]">
        <span>{label}</span>
        <span dir="ltr" className="text-[10px] text-[#48514c]">{value}</span>
      </div>
      <div className="h-[7px] overflow-hidden rounded-full bg-[#e9eeea]">
        <div className="h-full w-0 rounded-full transition-all duration-500" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("ar");
  const [dark, setDark] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [active, setActive] = useState("home");
  const [dayReset, setDayReset] = useState(false);
  const [mealModal, setMealModal] = useState(false);
  const [mealText, setMealText] = useState("");
  const t = labels[language];
  const isArabic = language === "ar";

  const direction = useMemo(() => (language === "ar" ? "rtl" : "ltr"), [language]);

  function selectNav(key: string) {
    setActive(key);
    if (key !== "home") toast.info(t.feature);
    setMobileMenu(false);
  }

  function handleReset() {
    setDayReset(true);
    toast.success(t.reset);
  }

  function handleAnalyze() {
    setMealModal(true);
  }

  function submitMeal() {
    setMealModal(false);
    setMealText("");
    toast.success(language === "ar" ? "تم استلام وجبتك للتحليل" : language === "en" ? "Your meal is ready for analysis" : "Öğününüz analiz için hazır");
  }

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${dark ? "bg-[#182522] text-[#e7f0eb]" : "bg-[#f8f8f4] text-[#1c2924]"}`} dir={direction}>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${dark ? "border-white/10 bg-[#182522]/90" : "border-[#e4e9e2] bg-[#fbfbf8]/90"}`}>
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => selectNav(key)}
                className={`group flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-all duration-200 ${active === key ? (dark ? "bg-white/10 text-[#8ddab8]" : "bg-[#e8f1eb] text-[#087b69]") : (dark ? "text-[#c9d7d0] hover:bg-white/5" : "text-[#6b716b] hover:bg-[#f1f4ef] hover:text-[#087b69]")}`}
              >
                <Icon size={15} strokeWidth={active === key ? 2.4 : 1.8} />
                {t[key as keyof typeof t]}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setDark(!dark)} className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${dark ? "bg-white/10 text-[#f5c873]" : "bg-[#eef2ed] text-[#718078] hover:text-[#087b69]"}`} aria-label={dark ? t.light : t.dark}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setPrivacyOpen(true)} className={`hidden h-9 w-9 place-items-center rounded-full transition-colors sm:grid ${dark ? "bg-white/10 text-[#9edabc]" : "bg-[#f2f4ed] text-[#728279] hover:text-[#087b69]"}`} aria-label={t.privacy}>
              <ShieldCheck size={16} />
            </button>
            <div className="relative hidden sm:block">
              <Globe2 className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${isArabic ? "right-3" : "left-3"}`} size={14} />
              <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className={`h-9 appearance-none rounded-full border bg-transparent px-8 text-[11px] font-semibold outline-none ${isArabic ? "pl-7" : "pr-7"} ${dark ? "border-white/10 text-[#c9d7d0]" : "border-[#dfe7df] text-[#65726a]"}`} aria-label={t.language}>
                <option value="ar">العربية</option>
                <option value="en">EN</option>
                <option value="tr">TR</option>
              </select>
              <ChevronDown className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${isArabic ? "left-2" : "right-2"}`} size={12} />
            </div>
            <button onClick={() => toast.success(t.sync)} className="hidden items-center gap-2 rounded-full bg-[#087b69] px-4 py-2.5 text-[11px] font-bold text-white shadow-[0_7px_18px_rgba(8,123,105,.18)] transition-transform hover:-translate-y-0.5 active:scale-95 sm:flex">
              <LogIn size={14} /> {t.login}
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className={`grid h-9 w-9 place-items-center rounded-full lg:hidden ${dark ? "bg-white/10" : "bg-[#eef2ed]"}`}>
              {mobileMenu ? <X size={17} /> : <Activity size={17} />}
            </button>
          </div>
        </div>
        {mobileMenu && <div className={`border-t px-5 py-3 lg:hidden ${dark ? "border-white/10 bg-[#182522]" : "border-[#e4e9e2] bg-[#fbfbf8]"}`}>
          <div className="flex flex-wrap gap-2">
            {navItems.map(({ key, icon: Icon }) => <button key={key} onClick={() => selectNav(key)} className="flex items-center gap-2 rounded-full bg-[#e8f1eb] px-3 py-2 text-xs font-semibold text-[#087b69]"><Icon size={14} />{t[key as keyof typeof t]}</button>)}
            <button onClick={() => toast.success(t.sync)} className="flex items-center gap-2 rounded-full bg-[#087b69] px-3 py-2 text-xs font-semibold text-white"><LogIn size={14} />{t.login}</button>
          </div>
        </div>}
      </header>

      <main className="mx-auto max-w-[1180px] px-5 pb-10 pt-6 lg:px-8 lg:pt-7">
        <section className="hero-gradient relative min-h-[242px] overflow-hidden rounded-[26px] px-7 py-7 text-white shadow-[0_18px_35px_rgba(16,104,82,.12)] sm:px-12 sm:py-9">
          <div className="absolute inset-0 opacity-[.13]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.9) .8px, transparent .8px)", backgroundSize: "9px 9px" }} />
          <div className="absolute -left-14 -top-24 h-64 w-64 rounded-full bg-[#bde6b5]/20 blur-3xl" />
          <div className={`relative z-10 max-w-[700px] ${isArabic ? "mr-auto text-right" : "ml-auto text-left"}`}>
            <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold text-[#d4ecd2]"><span className="h-2 w-2 rounded-full bg-[#f1c269]" />{t.greeting}</div>
            <h1 className="max-w-[620px] text-[31px] font-black leading-[1.35] tracking-[-0.035em] sm:text-[40px]">{t.headline}</h1>
            <p className="mt-3 max-w-[560px] text-[13px] leading-7 text-[#d0e4d3] sm:text-[14px]">{t.subheadline}</p>
            <button onClick={handleAnalyze} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#fffdf6] px-5 py-3 text-[12px] font-bold text-[#087b69] shadow-[0_8px_20px_rgba(0,0,0,.08)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(0,0,0,.14)] active:scale-95">
              {t.analyzeNow} {isArabic ? <ArrowLeft size={15} /> : <ArrowRight size={15} />} <Sparkles size={14} />
            </button>
          </div>
          <div className="absolute bottom-5 left-[13%] hidden h-[89px] w-[89px] rotate-[-7deg] rounded-full border-[8px] border-[#faf6e9] bg-[#fffdf3] shadow-[0_8px_16px_rgba(0,0,0,.12)] sm:grid sm:place-items-center">
            <span className="text-[34px] font-light text-[#eca853]">49</span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[8px] font-bold text-[#16866f] shadow-sm">{t.smart} ✨</span>
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.12fr_.88fr]">
          <section className={`zadak-meal-card order-2 rounded-[24px] p-5 shadow-[0_8px_25px_rgba(35,67,51,.05)] lg:order-1 sm:p-6 ${dark ? "bg-[#20312b]" : "bg-white"}`}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className={`mb-1 text-[10px] font-semibold ${dark ? "text-[#8ca69b]" : "text-[#9ba69d]"}`}>{t.lastMeals}</div>
                <h2 className={`text-[17px] font-extrabold ${dark ? "text-[#edf8ef]" : "text-[#1e3027]"}`}>{t.noMeals}</h2>
              </div>
              <button onClick={() => toast.info(t.soon)} className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-[#138872] transition-colors hover:bg-[#eff7ef]">{t.viewHistory} {isArabic ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}</button>
            </div>
            <div className={`zadak-meal-empty flex min-h-[120px] flex-col items-center justify-center rounded-[17px] border border-dashed text-center ${dark ? "border-white/10 bg-[#1b2a25]" : "border-[#e4e9e1] bg-[#fdfdfa]"}`}>
              <div className={`zadak-meal-icon mb-2 grid h-9 w-9 place-items-center rounded-full ${dark ? "bg-[#28483c] text-[#92d6b5]" : "bg-[#eef8ef] text-[#55a784]"}`}><Camera size={17} /></div>
              <p className={`text-[11px] ${dark ? "text-[#b0c1b8]" : "text-[#7a847d]"}`}>{t.emptyHint}</p>
              <button onClick={handleAnalyze} className="mt-2 text-[13px] font-extrabold text-[#11866f] underline decoration-[#bce0c2] decoration-2 underline-offset-4">{t.startAnalysis}</button>
            </div>
          </section>

          <section className={`order-1 rounded-[24px] p-5 shadow-[0_8px_25px_rgba(35,67,51,.05)] lg:order-2 sm:p-6 ${dark ? "bg-[#20312b]" : "bg-white"}`}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className={`mb-1 text-[10px] font-semibold ${dark ? "text-[#8ca69b]" : "text-[#9ba69d]"}`}>{t.today}</div>
                <div className="flex items-baseline gap-1"><span className={`text-[25px] font-black ${dark ? "text-[#eaf7ed]" : "text-[#1d3328]"}`}>{dayReset ? "٠" : "٠"}</span><span className={`text-[11px] ${dark ? "text-[#9fb3a8]" : "text-[#78847b]"}`}>{t.calories}</span></div>
              </div>
              <button onClick={handleReset} className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold transition-colors ${dark ? "bg-[#29453a] text-[#b5dec2] hover:bg-[#315444]" : "bg-[#f4f7ee] text-[#6c846e] hover:bg-[#eaf3e8]"}`}><Sun size={14} /> {t.newDay}</button>
            </div>
            <div className="mb-5 flex items-center justify-between">
              <div className="relative grid h-[54px] w-[54px] place-items-center rounded-full" style={{ background: "conic-gradient(#2c9d7b 0deg, #e8eee9 0deg)" }}>
                <div className={`grid h-[43px] w-[43px] place-items-center rounded-full text-[10px] font-bold ${dark ? "bg-[#20312b] text-[#b0c5b8]" : "bg-white text-[#738177]"}`}>0%</div>
              </div>
              <div className="text-left"><div className={`text-[10px] ${dark ? "text-[#9fb3a8]" : "text-[#869188]"}`}>{t.remaining}</div><div className={`mt-1 text-[16px] font-black ${dark ? "text-[#eaf7ed]" : "text-[#20372a]"}`}>٢٬١٣٩ <span className="text-[10px] font-medium">{t.calories}</span></div></div>
            </div>
            <div>{nutrition.map((item) => <MacroRow key={item.key} label={t[item.key as keyof typeof t]} value={item.value} color={item.color} />)}</div>
          </section>
        </div>

        <section className={`mt-5 flex flex-col items-start justify-between gap-4 rounded-[18px] border px-5 py-4 shadow-[0_5px_18px_rgba(35,67,51,.03)] sm:flex-row sm:items-center ${dark ? "border-[#385449] bg-[#20312b]" : "border-[#f0e6cc] bg-[#fffaf0]"}`}>
          <div className="flex items-center gap-3">
            <div className={`grid h-9 w-9 place-items-center rounded-full ${dark ? "bg-[#345348] text-[#f2c37b]" : "bg-[#fff0c9] text-[#cf9b45]"}`}><LockKeyhole size={15} /></div>
            <div><div className={`text-[12px] font-extrabold ${dark ? "text-[#e9f3e9]" : "text-[#455148]"}`}>{t.privacyTitle}</div><p className={`mt-1 text-[10px] ${dark ? "text-[#9db2a5]" : "text-[#90948d]"}`}>{t.privacyText}</p></div>
          </div>
          <button onClick={() => setPrivacyOpen(true)} className="rounded-full border border-[#e9d9a9] bg-white/50 px-4 py-2 text-[11px] font-bold text-[#8c783f] transition-colors hover:bg-[#fff3d3] dark:border-[#596a45] dark:bg-[#263c32] dark:text-[#d7c17c]">{t.privacy}</button>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1180px] justify-end px-5 pb-5 lg:px-8"><span className={`rounded-full px-3 py-1.5 text-[9px] font-semibold shadow-sm ${dark ? "bg-[#20312b] text-[#9db5a8]" : "bg-white text-[#9da59d]"}`}>Made with Manus ◈</span></footer>

      {privacyOpen && <div className="zadak-modal-backdrop fixed inset-0 z-50 grid place-items-center bg-[#10271f]/35 p-5 backdrop-blur-sm" onClick={() => setPrivacyOpen(false)}>
        <div className={`zadak-modal-panel relative w-full max-w-md rounded-[25px] p-6 shadow-2xl ${dark ? "bg-[#20312b] text-[#e8f5ec]" : "bg-white text-[#23342b]"}`} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setPrivacyOpen(false)} className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-black/5"><X size={15} /></button>
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#eaf6eb] text-[#16866f]"><ShieldCheck size={22} /></div>
          <h3 className="text-xl font-black">{t.privacyTitle}</h3>
          <p className={`mt-3 text-sm leading-7 ${dark ? "text-[#b3c7ba]" : "text-[#738078]"}`}>{t.privacyText}</p>
          <div className={`mt-5 space-y-3 rounded-2xl p-4 text-xs leading-6 ${dark ? "bg-[#182a23] text-[#c0d4c6]" : "bg-[#f6faf4] text-[#65746a]"}`}>
            <div className="flex gap-2"><Check size={15} className="mt-1 shrink-0 text-[#169374]" /> لا تُرسل الصور إلا عند طلب التحليل.</div>
            <div className="flex gap-2"><Check size={15} className="mt-1 shrink-0 text-[#169374]" /> يمكنك حذف سجل اليوم في أي وقت.</div>
            <div className="flex gap-2"><Check size={15} className="mt-1 shrink-0 text-[#169374]" /> بياناتك محلية في هذه النسخة التجريبية.</div>
          </div>
          <button onClick={() => setPrivacyOpen(false)} className="mt-5 w-full rounded-full bg-[#087b69] py-3 text-sm font-bold text-white">{t.close}</button>
        </div>
      </div>}

      {mealModal && <div className="zadak-modal-backdrop fixed inset-0 z-50 grid place-items-center bg-[#10271f]/35 p-5 backdrop-blur-sm" onClick={() => setMealModal(false)}>
        <div className={`zadak-modal-panel relative w-full max-w-lg rounded-[25px] p-6 shadow-2xl ${dark ? "bg-[#20312b] text-[#e8f5ec]" : "bg-white text-[#23342b]"}`} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setMealModal(false)} className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-black/5"><X size={15} /></button>
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf6eb] text-[#16866f]"><Camera size={19} /></div><div><h3 className="text-xl font-black">{t.analyze}</h3><p className={`mt-1 text-xs ${dark ? "text-[#adc4b6]" : "text-[#7b897e]"}`}>{t.emptyHint}</p></div></div>
          <div className="mt-6 grid grid-cols-2 gap-3"><button onClick={submitMeal} className={`flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed ${dark ? "border-white/15 bg-[#182a23]" : "border-[#dbe8dc] bg-[#f8fcf7]"}`}><Camera size={21} className="text-[#16866f]" /><span className="text-xs font-bold">{language === "ar" ? "التقاط صورة" : language === "en" ? "Take a photo" : "Fotoğraf çek"}</span></button><button onClick={submitMeal} className={`flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed ${dark ? "border-white/15 bg-[#182a23]" : "border-[#dbe8dc] bg-[#f8fcf7]"}`}><Plus size={21} className="text-[#16866f]" /><span className="text-xs font-bold">{t.addMeal}</span></button></div>
          <div className="mt-4"><textarea value={mealText} onChange={(e) => setMealText(e.target.value)} placeholder={language === "ar" ? "أو اكتب وصفاً لوجبتك هنا..." : language === "en" ? "Or describe your meal here..." : "Veya öğününüzü açıklayın..."} className={`min-h-24 w-full resize-none rounded-2xl border p-4 text-sm outline-none ring-[#70b99a] focus:ring-2 ${dark ? "border-white/10 bg-[#182a23] placeholder:text-[#789084]" : "border-[#e1e9e1] bg-[#fbfdf9] placeholder:text-[#9aa69d]"}`} /></div>
          <button onClick={submitMeal} disabled={!mealText.trim()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#087b69] py-3 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45">{t.startAnalysis} <Zap size={15} /></button>
        </div>
      </div>}
    </div>
  );
}
