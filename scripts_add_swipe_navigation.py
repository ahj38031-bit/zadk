from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

old_state = '  const [mobileMenu, setMobileMenu] = useState(false);\n  const [notificationsOpen, setNotificationsOpen] = useState(false);'
new_state = '  const [mobileMenu, setMobileMenu] = useState(false);\n  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);\n  const [notificationsOpen, setNotificationsOpen] = useState(false);'
if old_state not in s: raise SystemExit('state anchor not found')
s = s.replace(old_state, new_state, 1)

old_select = '''  function selectNav(key: string) {
    setMobileMenu(false);
    if (key === "analyze") { setMealModal(true); return; }
    setView(key as View);
  }
'''
new_select = '''  function selectNav(key: string) {
    setMobileMenu(false);
    if (key === "analyze") { setMealModal(true); return; }
    setView(key as View);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (typeof window === "undefined" || !window.matchMedia("(max-width: 639px)").matches || mealModal || privacyOpen || notificationsOpen || mobileMenu) {
      swipeStartRef.current = null;
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest("button, input, textarea, select, a, [role=dialog], .zadak-bottom-nav")) {
      swipeStartRef.current = null;
      return;
    }
    const touch = event.changedTouches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    const sections: View[] = ["home", "history", "stats", "profile"];
    const currentIndex = sections.indexOf(view);
    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < sections.length) selectNav(sections[nextIndex]);
  }
'''
if old_select not in s: raise SystemExit('selectNav anchor not found')
s = s.replace(old_select, new_select, 1)

old_root = '  return <div className={`zadak-app-shell min-h-screen overflow-x-hidden transition-colors duration-300 ${dark ? "bg-[#182522] text-[#e7f0eb]" : "bg-[#f8f8f4] text-[#1c2924]"}`} dir={isArabic ? "rtl" : "ltr"}>'
new_root = '  return <div className={`zadak-app-shell min-h-screen overflow-x-hidden transition-colors duration-300 ${dark ? "bg-[#182522] text-[#e7f0eb]" : "bg-[#f8f8f4] text-[#1c2924]"}`} dir={isArabic ? "rtl" : "ltr"} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={() => { swipeStartRef.current = null; }}>'
if old_root not in s: raise SystemExit('root anchor not found')
s = s.replace(old_root, new_root, 1)
p.write_text(s)

css = Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
c = css.read_text()
addition = r'''

  @media (max-width: 639px) {
    .zadak-app-shell {
      touch-action: pan-y;
    }

    .zadak-app-shell main {
      overscroll-behavior-x: none;
    }
  }
'''
idx = c.rfind('\n}\n')
c = c[:idx] + addition + c[idx:]
css.write_text(c)
print('swipe-navigation-added')
