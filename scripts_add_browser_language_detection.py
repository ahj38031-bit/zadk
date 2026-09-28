from pathlib import Path
p=Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s=p.read_text()
old='''const supportedLanguages: Language[] = ["ar", "en", "tr"];
function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "ar";
  const stored = window.localStorage.getItem("zadak-language");
  return stored && supportedLanguages.includes(stored as Language) ? stored as Language : "ar";
}'''
new='''const supportedLanguages: Language[] = ["ar", "en", "tr"];
function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "ar";
  const browserLanguages = [navigator.language, ...(navigator.languages ?? [])].filter(Boolean);
  const match = browserLanguages.map((locale) => locale.toLowerCase().split("-")[0]).find((locale): locale is Language => supportedLanguages.includes(locale as Language));
  return match ?? "ar";
}
function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "ar";
  const stored = window.localStorage.getItem("zadak-language");
  return stored && supportedLanguages.includes(stored as Language) ? stored as Language : detectBrowserLanguage();
}'''
if old not in s: raise SystemExit('language initializer anchor not found')
s=s.replace(old,new,1)
p.write_text(s)
print('browser-language-detection-added')
