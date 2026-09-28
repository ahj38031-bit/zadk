from pathlib import Path
p=Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s=p.read_text()
s=s.replace('  const suggestionKeyRef = useRef<string | undefined>(undefined);', '  const suggestionKeyRef = useRef<string | undefined>(undefined);\n  const hasMountedLanguageRef = useRef(false);\n  const [isDirectionChanging, setIsDirectionChanging] = useState(false);', 1)
old='''  useEffect(() => {
    window.localStorage.setItem("zadak-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.title = language === "ar" ? "زادك AI — مساعد التغذية الشخصي" : language === "tr" ? "Zadak AI — Kişisel beslenme yardımcınız" : "Zadak AI — Your personal nutrition companion";
  }, [language, isArabic]);'''
new='''  useEffect(() => {
    window.localStorage.setItem("zadak-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.title = language === "ar" ? "زادك AI — مساعد التغذية الشخصي" : language === "tr" ? "Zadak AI — Kişisel beslenme yardımcınız" : "Zadak AI — Your personal nutrition companion";
    if (!hasMountedLanguageRef.current) {
      hasMountedLanguageRef.current = true;
      return;
    }
    setIsDirectionChanging(true);
    document.documentElement.dataset.directionTransition = "true";
    const timeoutId = window.setTimeout(() => {
      setIsDirectionChanging(false);
      delete document.documentElement.dataset.directionTransition;
    }, 240);
    return () => window.clearTimeout(timeoutId);
  }, [language, isArabic]);'''
if old not in s: raise SystemExit('language effect not found')
s=s.replace(old,new,1)
old_shell='return <div className={`zadak-app-shell min-h-screen overflow-x-hidden transition-colors duration-300 ${dark ? "bg-[#182522] text-[#e7f0eb]" : "bg-[#f8f8f4] text-[#1c2924]"}`} dir={isArabic ? "rtl" : "ltr"} onTouchStart={handleTouchStart}'
new_shell='return <div className={`zadak-app-shell min-h-screen overflow-x-hidden transition-colors duration-300 ${dark ? "bg-[#182522] text-[#e7f0eb]" : "bg-[#f8f8f4] text-[#1c2924]"} ${isDirectionChanging ? "is-direction-changing" : ""}`} dir={isArabic ? "rtl" : "ltr"} onTouchStart={handleTouchStart}'
if old_shell not in s: raise SystemExit('app shell not found')
s=s.replace(old_shell,new_shell,1)
p.write_text(s)

css=Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
c=css.read_text()
anchor='''  .zadak-app-shell {
    isolation: isolate;
  }
'''
insert='''  .zadak-app-shell {
    isolation: isolate;
  }
  .zadak-app-shell.is-direction-changing {
    animation: zadak-direction-switch 240ms cubic-bezier(.23, 1, .32, 1) both;
  }
  @keyframes zadak-direction-switch {
    from { opacity: .86; transform: translateY(2px); }
    to { opacity: 1; transform: translateY(0); }
  }
'''
if anchor not in c: raise SystemExit('css shell anchor not found')
c=c.replace(anchor,insert,1)
# Respect reduced motion for this new transition.
needle='''    .zadak-mobile-menu { transition: none; animation: none; }
'''
replacement='''    .zadak-mobile-menu,
    .zadak-app-shell.is-direction-changing { transition: none; animation: none; }
'''
if needle not in c: raise SystemExit('reduced motion anchor not found')
c=c.replace(needle,replacement,1)
css.write_text(c)
print('direction-transition-added')
