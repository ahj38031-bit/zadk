from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

anchor = 'type Language = "ar" | "en" | "tr";'
helper = '''type Language = "ar" | "en" | "tr";
const supportedLanguages: Language[] = ["ar", "en", "tr"];
function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "ar";
  const stored = window.localStorage.getItem("zadak-language");
  return stored && supportedLanguages.includes(stored as Language) ? stored as Language : "ar";
}
'''
if anchor not in s: raise SystemExit('language type anchor not found')
s = s.replace(anchor, helper, 1)

s = s.replace('  const [language, setLanguage] = useState<Language>("ar");', '  const [language, setLanguage] = useState<Language>(getInitialLanguage);', 1)

effect_anchor = '  const isArabic = language === "ar";\n  const utils = trpc.useUtils();'
effect_replacement = '''  const isArabic = language === "ar";
  useEffect(() => {
    window.localStorage.setItem("zadak-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.title = language === "ar" ? "زادك AI — مساعد التغذية الشخصي" : language === "tr" ? "Zadak AI — Kişisel beslenme yardımcınız" : "Zadak AI — Your personal nutrition companion";
  }, [language, isArabic]);
  const utils = trpc.useUtils();'''
if effect_anchor not in s: raise SystemExit('language effect anchor not found')
s = s.replace(effect_anchor, effect_replacement, 1)

mobile_anchor = '</button>)}{!isAuthenticated && <button onClick={startLogin}'
mobile_insert = '''</button>)}<label className={`zadak-mobile-language flex w-full items-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-semibold ${dark ? "border-white/10 bg-white/5 text-[#c9d7d0]" : "border-[#e1e9e1] bg-white text-[#65726a]"}`}><Globe2 size={14} /><span>{t.language}</span><select value={language} onChange={(event) => setLanguage(event.target.value as Language)} className="ms-auto bg-transparent text-xs font-bold outline-none" aria-label={t.language}><option value="ar">العربية</option><option value="en">English</option><option value="tr">Türkçe</option></select></label>{!isAuthenticated && <button onClick={startLogin}'''
if mobile_anchor not in s: raise SystemExit('mobile language anchor not found')
s = s.replace(mobile_anchor, mobile_insert, 1)
p.write_text(s)
print('language-support-polished')
