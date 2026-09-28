from pathlib import Path
p=Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s=p.read_text()
s=s.replace('''const supportedLanguages: Language[] = ["ar", "en", "tr"];
function detectBrowserLanguage(): Language {''','''const supportedLanguages: Language[] = ["ar", "en", "tr"];
const LANGUAGE_STORAGE_KEY = "zadak-language";
function readStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored && supportedLanguages.includes(stored as Language) ? stored as Language : null;
  } catch {
    return null;
  }
}
function persistLanguage(language: Language) {
  try { window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* storage may be restricted */ }
}
function detectBrowserLanguage(): Language {''',1)
s=s.replace('''  const stored = window.localStorage.getItem("zadak-language");
  return stored && supportedLanguages.includes(stored as Language) ? stored as Language : detectBrowserLanguage();''','''  return readStoredLanguage() ?? detectBrowserLanguage();''',1)
s=s.replace('''    window.localStorage.setItem("zadak-language", language);
    document.documentElement.lang = language;''','''    persistLanguage(language);
    document.documentElement.lang = language;''',1)
anchor='''  }, [language, isArabic]);
  const utils = trpc.useUtils();'''
replacement='''  }, [language, isArabic]);
  useEffect(() => {
    function syncLanguage(event: StorageEvent) {
      if (event.key !== LANGUAGE_STORAGE_KEY || !event.newValue || event.newValue === language) return;
      if (supportedLanguages.includes(event.newValue as Language)) setLanguage(event.newValue as Language);
    }
    window.addEventListener("storage", syncLanguage);
    return () => window.removeEventListener("storage", syncLanguage);
  }, [language]);
  const utils = trpc.useUtils();'''
if anchor not in s: raise SystemExit('language effect ending not found')
s=s.replace(anchor,replacement,1)
p.write_text(s)
print('language-storage-hardened')
