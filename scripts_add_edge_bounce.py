from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

old_state = '  const [slideDirection, setSlideDirection] = useState<"next" | "prev" | null>(null);\n  const [mobileMenu, setMobileMenu] = useState(false);'
new_state = '  const [slideDirection, setSlideDirection] = useState<"next" | "prev" | null>(null);\n  const [edgeBounce, setEdgeBounce] = useState<"start" | "end" | null>(null);\n  const [mobileMenu, setMobileMenu] = useState(false);'
if old_state not in s: raise SystemExit('state anchor not found')
s = s.replace(old_state, new_state, 1)

hook_anchor = '''  useEffect(() => {
    if (!slideDirection) return;
    const timer = window.setTimeout(() => setSlideDirection(null), 340);
    return () => window.clearTimeout(timer);
  }, [slideDirection]);
'''
hook_replacement = hook_anchor + '''  useEffect(() => {
    if (!edgeBounce) return;
    const timer = window.setTimeout(() => setEdgeBounce(null), 360);
    return () => window.clearTimeout(timer);
  }, [edgeBounce]);
'''
if hook_anchor not in s: raise SystemExit('effect anchor not found')
s = s.replace(hook_anchor, hook_replacement, 1)

old_logic = '    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;\n    if (nextIndex >= 0 && nextIndex < mobileSections.length) selectNav(mobileSections[nextIndex], deltaX < 0 ? "next" : "prev");'
new_logic = '    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;\n    if (nextIndex >= 0 && nextIndex < mobileSections.length) {\n      setEdgeBounce(null);\n      selectNav(mobileSections[nextIndex], deltaX < 0 ? "next" : "prev");\n    } else {\n      setSlideDirection(null);\n      setEdgeBounce(deltaX < 0 ? "end" : "start");\n    }'
if old_logic not in s: raise SystemExit('swipe logic anchor not found')
s = s.replace(old_logic, new_logic, 1)

old_stage = 'className={`zadak-view-stage ${slideDirection ? `is-${slideDirection}` : ""}`}>'
new_stage = 'className={`zadak-view-stage ${slideDirection ? `is-${slideDirection}` : ""} ${edgeBounce ? `is-edge-${edgeBounce}` : ""}`}>'
if old_stage not in s: raise SystemExit('stage class anchor not found')
s = s.replace(old_stage, new_stage, 1)

old_indicator = '<MobileSectionIndicator view={view} t={t} dark={dark} transitioning={Boolean(slideDirection)} />'
new_indicator = '<MobileSectionIndicator view={view} t={t} dark={dark} transitioning={Boolean(slideDirection)} edgeBounce={edgeBounce} />'
if old_indicator not in s: raise SystemExit('indicator render anchor not found')
s = s.replace(old_indicator, new_indicator, 1)

old_signature = 'function MobileSectionIndicator({ view, t, dark, transitioning }: { view: View; t: Labels; dark: boolean; transitioning: boolean }) {'
new_signature = 'function MobileSectionIndicator({ view, t, dark, transitioning, edgeBounce }: { view: View; t: Labels; dark: boolean; transitioning: boolean; edgeBounce: "start" | "end" | null }) {'
if old_signature not in s: raise SystemExit('indicator signature anchor not found')
s = s.replace(old_signature, new_signature, 1)
old_indicator_class = 'zadak-section-indicator lg:hidden ${transitioning ? "is-transitioning" : ""} ${dark ? "bg-[#20312b]/95 text-[#b9d0c0]" : "bg-white/95 text-[#708077]"}'
new_indicator_class = 'zadak-section-indicator lg:hidden ${transitioning ? "is-transitioning" : ""} ${edgeBounce ? `is-bouncing-${edgeBounce}` : ""} ${dark ? "bg-[#20312b]/95 text-[#b9d0c0]" : "bg-white/95 text-[#708077]"}'
if old_indicator_class not in s: raise SystemExit('indicator class anchor not found')
s = s.replace(old_indicator_class, new_indicator_class, 1)
p.write_text(s)

css = Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
c = css.read_text()
addition = r'''

  @keyframes zadak-edge-bounce-start {
    0%, 100% { transform: translateX(0); }
    45% { transform: translateX(10px); }
    72% { transform: translateX(-3px); }
  }

  @keyframes zadak-edge-bounce-end {
    0%, 100% { transform: translateX(0); }
    45% { transform: translateX(-10px); }
    72% { transform: translateX(3px); }
  }

  @media (max-width: 639px) and (prefers-reduced-motion: no-preference) {
    .zadak-view-stage.is-edge-start {
      animation: zadak-edge-bounce-start 320ms cubic-bezier(.23, 1, .32, 1) both;
    }

    .zadak-view-stage.is-edge-end {
      animation: zadak-edge-bounce-end 320ms cubic-bezier(.23, 1, .32, 1) both;
    }

    .zadak-section-indicator.is-bouncing-start {
      animation: zadak-edge-bounce-start 320ms cubic-bezier(.23, 1, .32, 1) both;
    }

    .zadak-section-indicator.is-bouncing-end {
      animation: zadak-edge-bounce-end 320ms cubic-bezier(.23, 1, .32, 1) both;
    }
  }
'''
idx = c.rfind('\n}\n')
c = c[:idx] + addition + c[idx:]
css.write_text(c)
print('edge-bounce-added')
