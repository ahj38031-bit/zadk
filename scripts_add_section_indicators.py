from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

s = s.replace('home: string; analyze: string; history: string; stats: string; profile: string; navigation: string; login:', 'home: string; analyze: string; history: string; stats: string; profile: string; navigation: string; sectionIndicator: string; login:', 1)
s = s.replace('navigation: "التنقل الرئيسي", login:', 'navigation: "التنقل الرئيسي", sectionIndicator: "القسم {current} من {total}", login:', 1)
s = s.replace('navigation: "Primary navigation", login:', 'navigation: "Primary navigation", sectionIndicator: "Section {current} of {total}", login:', 1)
s = s.replace('navigation: "Ana navigasyon", login:', 'navigation: "Ana navigasyon", sectionIndicator: "Bölüm {current} / {total}", login:', 1)

nav_anchor = '''const navItems = [
  { key: "home" as const, icon: Utensils },
  { key: "analyze" as const, icon: Sparkles },
  { key: "history" as const, icon: History },
  { key: "stats" as const, icon: BarChart3 },
  { key: "profile" as const, icon: UserRound },
];'''
nav_replacement = nav_anchor + '\nconst mobileSections: View[] = ["home", "history", "stats", "profile"];'
if nav_anchor not in s: raise SystemExit('nav items anchor not found')
s = s.replace(nav_anchor, nav_replacement, 1)

component_anchor = 'function MobileBottomNav({ view, onSelect, t, dark }: { view: View; onSelect: (key: string) => void; t: Labels; dark: boolean }) {'
indicator = '''function MobileSectionIndicator({ view, t, dark }: { view: View; t: Labels; dark: boolean }) {
  const currentIndex = Math.max(0, mobileSections.indexOf(view));
  const label = t.sectionIndicator.replace("{current}", String(currentIndex + 1)).replace("{total}", String(mobileSections.length));
  return <div className={`zadak-section-indicator lg:hidden ${dark ? "bg-[#20312b]/95 text-[#b9d0c0]" : "bg-white/95 text-[#708077]"}`} aria-label={label}>
    <span aria-hidden="true" className="flex items-center gap-1.5">{mobileSections.map((section) => <span key={section} className={`zadak-section-dot ${section === view ? "is-active" : ""}`} />)}</span>
    <span dir="ltr" className="text-[9px] font-black tabular-nums">{currentIndex + 1}/{mobileSections.length}</span>
  </div>;
}

'''
if component_anchor not in s: raise SystemExit('bottom nav component anchor not found')
s = s.replace(component_anchor, indicator + component_anchor, 1)

s = s.replace('    const sections: View[] = ["home", "history", "stats", "profile"];\n    const currentIndex = sections.indexOf(view);\n    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;\n    if (nextIndex >= 0 && nextIndex < sections.length) selectNav(sections[nextIndex], deltaX < 0 ? "next" : "prev");', '    const currentIndex = mobileSections.indexOf(view);\n    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;\n    if (nextIndex >= 0 && nextIndex < mobileSections.length) selectNav(mobileSections[nextIndex], deltaX < 0 ? "next" : "prev");', 1)

render_anchor = '    <MobileBottomNav view={view} onSelect={selectNav} t={t} dark={dark} />'
if render_anchor not in s: raise SystemExit('bottom nav render anchor not found')
s = s.replace(render_anchor, '    <MobileSectionIndicator view={view} t={t} dark={dark} />\n' + render_anchor, 1)
p.write_text(s)

css = Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
c = css.read_text()
addition = r'''

  .zadak-section-indicator {
    display: none;
  }

  @media (max-width: 639px) {
    .zadak-section-indicator {
      position: fixed;
      right: 50%;
      bottom: calc(72px + env(safe-area-inset-bottom));
      z-index: 44;
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 24px;
      padding: 5px 9px;
      border: 1px solid rgba(144, 178, 151, .22);
      border-radius: 999px;
      box-shadow: 0 7px 20px rgba(35, 67, 51, .11);
      transform: translateX(50%);
      backdrop-filter: blur(14px);
    }

    .zadak-section-dot {
      display: block;
      height: 5px;
      width: 5px;
      border-radius: 999px;
      background: currentColor;
      opacity: .42;
      transition: width 180ms cubic-bezier(.23, 1, .32, 1), opacity 180ms ease, background-color 180ms ease;
    }

    .zadak-section-dot.is-active {
      width: 16px;
      opacity: 1;
      background: #16866f;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .zadak-section-dot { transition: none; }
  }
'''
idx = c.rfind('\n}\n')
c = c[:idx] + addition + c[idx:]
css.write_text(c)
print('section-indicators-added')
