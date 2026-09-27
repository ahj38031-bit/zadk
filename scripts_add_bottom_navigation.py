from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

anchor = 'export default function Home() {'
component = '''function MobileBottomNav({ view, onSelect, t, dark }: { view: View; onSelect: (key: string) => void; t: Labels; dark: boolean }) {
  return <nav className={`zadak-bottom-nav lg:hidden ${dark ? "border-white/10 bg-[#182522]/95 text-[#b9d0c0]" : "border-[#e1e9e1] bg-white/95 text-[#7a877e]"}`} aria-label={t.navigation}>
    {navItems.map(({ key, icon: Icon }) => <button key={key} type="button" onClick={() => onSelect(key)} aria-current={view === key ? "page" : undefined} className={`zadak-bottom-nav-item ${view === key ? (dark ? "is-active-dark" : "is-active") : ""}`}>
      <span className="zadak-bottom-nav-icon"><Icon size={17} strokeWidth={view === key ? 2.4 : 1.9} /></span><span>{t[key]}</span>
    </button>)}
  </nav>;
}
'''
if anchor not in s: raise SystemExit('Home anchor not found')
s = s.replace(anchor, component + anchor, 1)
footer_anchor = '    <footer className="mx-auto flex max-w-[1180px] justify-end px-5 pb-5 lg:px-8">'
nav_render = '    <MobileBottomNav view={view} onSelect={selectNav} t={t} dark={dark} />\n'
if footer_anchor not in s: raise SystemExit('footer anchor not found')
s = s.replace(footer_anchor, nav_render + footer_anchor, 1)
p.write_text(s)

css = Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
c = css.read_text()
addition = r'''

  .zadak-bottom-nav {
    display: none;
  }

  @media (max-width: 639px) {
    .zadak-app-shell {
      padding-bottom: calc(76px + env(safe-area-inset-bottom));
    }

    .zadak-bottom-nav {
      position: fixed;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 45;
      display: flex;
      align-items: stretch;
      justify-content: space-around;
      gap: 2px;
      min-height: 64px;
      padding: 7px 8px calc(7px + env(safe-area-inset-bottom));
      border-top: 1px solid;
      box-shadow: 0 -10px 28px rgba(35, 67, 51, .10);
      backdrop-filter: blur(18px);
    }

    .zadak-bottom-nav-item {
      display: flex;
      min-width: 0;
      min-height: 50px;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      border-radius: 16px;
      font-size: 9px;
      font-weight: 800;
      line-height: 1;
      transition: color 180ms ease, background-color 180ms ease, transform 180ms cubic-bezier(.23, 1, .32, 1);
    }

    .zadak-bottom-nav-item:active {
      transform: scale(.95);
    }

    .zadak-bottom-nav-icon {
      display: grid;
      height: 26px;
      width: 42px;
      place-items: center;
      border-radius: 999px;
      transition: background-color 180ms ease, color 180ms ease, transform 180ms cubic-bezier(.23, 1, .32, 1);
    }

    .zadak-bottom-nav-item.is-active {
      color: #087b69;
    }

    .zadak-bottom-nav-item.is-active .zadak-bottom-nav-icon {
      background: #e5f5e8;
      color: #087b69;
      transform: translateY(-1px);
    }

    .zadak-bottom-nav-item.is-active-dark {
      color: #8ddab8;
    }

    .zadak-bottom-nav-item.is-active-dark .zadak-bottom-nav-icon {
      background: rgba(141, 218, 184, .14);
      color: #8ddab8;
      transform: translateY(-1px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .zadak-bottom-nav-item,
    .zadak-bottom-nav-icon { transition: none; }
  }
'''
idx = c.rfind('\n}\n')
c = c[:idx] + addition + c[idx:]
css.write_text(c)
print('bottom-navigation-added')
