from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

old_state = '  const [view, setView] = useState<View>("home");\n  const [mobileMenu, setMobileMenu] = useState(false);'
new_state = '  const [view, setView] = useState<View>("home");\n  const [slideDirection, setSlideDirection] = useState<"next" | "prev" | null>(null);\n  const [mobileMenu, setMobileMenu] = useState(false);'
if old_state not in s: raise SystemExit('view state anchor not found')
s = s.replace(old_state, new_state, 1)

old_select = '''  function selectNav(key: string) {
    setMobileMenu(false);
    if (key === "analyze") { setMealModal(true); return; }
    setView(key as View);
  }
'''
new_select = '''  function selectNav(key: string, direction: "next" | "prev" | null = null) {
    setMobileMenu(false);
    setSlideDirection(direction);
    if (key === "analyze") { setMealModal(true); return; }
    setView(key as View);
  }
'''
if old_select not in s: raise SystemExit('selectNav anchor not found')
s = s.replace(old_select, new_select, 1)

old_swipe_call = '    if (nextIndex >= 0 && nextIndex < sections.length) selectNav(sections[nextIndex]);'
new_swipe_call = '    if (nextIndex >= 0 && nextIndex < sections.length) selectNav(sections[nextIndex], deltaX < 0 ? "next" : "prev");'
if old_swipe_call not in s: raise SystemExit('swipe call anchor not found')
s = s.replace(old_swipe_call, new_swipe_call, 1)

view_anchor = '    {view === "home" && <main className="mx-auto max-w-[1220px] px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pt-7">'
view_open = '    <div key={view} className={`zadak-view-stage ${slideDirection ? `is-${slideDirection}` : ""}`}>'
if view_anchor not in s: raise SystemExit('view anchor not found')
s = s.replace(view_anchor, view_open + '\n' + view_anchor, 1)

footer_anchor = '    <MobileBottomNav view={view} onSelect={selectNav} t={t} dark={dark} />'
if footer_anchor not in s: raise SystemExit('bottom nav anchor not found')
s = s.replace(footer_anchor, '    </div>\n' + footer_anchor, 1)
p.write_text(s)

css = Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
c = css.read_text()
addition = r'''

  .zadak-view-stage {
    min-width: 0;
  }

  @keyframes zadak-slide-next {
    from { opacity: .55; transform: translateX(22px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes zadak-slide-prev {
    from { opacity: .55; transform: translateX(-22px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @media (max-width: 639px) and (prefers-reduced-motion: no-preference) {
    .zadak-view-stage.is-next {
      animation: zadak-slide-next 260ms cubic-bezier(.23, 1, .32, 1) both;
    }

    .zadak-view-stage.is-prev {
      animation: zadak-slide-prev 260ms cubic-bezier(.23, 1, .32, 1) both;
    }
  }
'''
idx = c.rfind('\n}\n')
c = c[:idx] + addition + c[idx:]
css.write_text(c)
print('sliding-animation-added')
