from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

old_indicator = 'function MobileSectionIndicator({ view, t, dark }: { view: View; t: Labels; dark: boolean }) {'
new_indicator = 'function MobileSectionIndicator({ view, t, dark, transitioning }: { view: View; t: Labels; dark: boolean; transitioning: boolean }) {'
if old_indicator not in s: raise SystemExit('indicator signature not found')
s = s.replace(old_indicator, new_indicator, 1)
old_class = 'zadak-section-indicator lg:hidden ${dark ? "bg-[#20312b]/95 text-[#b9d0c0]" : "bg-white/95 text-[#708077]"}'
new_class = 'zadak-section-indicator lg:hidden ${transitioning ? "is-transitioning" : ""} ${dark ? "bg-[#20312b]/95 text-[#b9d0c0]" : "bg-white/95 text-[#708077]"}'
if old_class not in s: raise SystemExit('indicator class anchor not found')
s = s.replace(old_class, new_class, 1)

hook_anchor = '  function selectNav(key: string, direction: "next" | "prev" | null = null) {\n    setMobileMenu(false);\n    setSlideDirection(direction);\n    if (key === "analyze") { setMealModal(true); return; }\n    setView(key as View);\n  }\n'
hook_replacement = hook_anchor + '\n  useEffect(() => {\n    if (!slideDirection) return;\n    const timer = window.setTimeout(() => setSlideDirection(null), 340);\n    return () => window.clearTimeout(timer);\n  }, [slideDirection]);\n'
if hook_anchor not in s: raise SystemExit('selectNav hook anchor not found')
s = s.replace(hook_anchor, hook_replacement, 1)

old_render = '<MobileSectionIndicator view={view} t={t} dark={dark} />'
new_render = '<MobileSectionIndicator view={view} t={t} dark={dark} transitioning={Boolean(slideDirection)} />'
if old_render not in s: raise SystemExit('indicator render not found')
s = s.replace(old_render, new_render, 1)
p.write_text(s)

css = Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
c = css.read_text()
addition = r'''

  @keyframes zadak-indicator-gradient {
    from { background-position: 0% 50%; }
    to { background-position: 100% 50%; }
  }

  @media (max-width: 639px) and (prefers-reduced-motion: no-preference) {
    .zadak-section-indicator.is-transitioning .zadak-section-dot {
      background: linear-gradient(90deg, #8bd6a4, #16866f, #f0bd63, #16866f, #8bd6a4);
      background-size: 240% 100%;
      animation: zadak-indicator-gradient 500ms cubic-bezier(.23, 1, .32, 1) both;
    }

    .zadak-section-indicator.is-transitioning .zadak-section-dot.is-active {
      background: linear-gradient(90deg, #73c694, #087b69, #d9a84f, #087b69, #73c694);
      background-size: 240% 100%;
    }
  }
'''
idx = c.rfind('\n}\n')
c = c[:idx] + addition + c[idx:]
css.write_text(c)
print('indicator-gradient-added')
