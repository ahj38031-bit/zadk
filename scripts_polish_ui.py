from pathlib import Path

css = Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
s = css.read_text()
addition = r'''

  ::selection {
    color: #ffffff;
    background: #16866f;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  body::-webkit-scrollbar {
    width: 10px;
  }

  body::-webkit-scrollbar-track {
    background: #f4f6f0;
  }

  body::-webkit-scrollbar-thumb {
    border: 3px solid #f4f6f0;
    border-radius: 999px;
    background: #b6d5bd;
  }

  .zadak-app-shell {
    isolation: isolate;
  }

  .zadak-header {
    transition: background-color 240ms ease, border-color 240ms ease, box-shadow 240ms ease;
  }

  .zadak-header button,
  .zadak-header select,
  .zadak-app-shell button,
  .zadak-app-shell select,
  .zadak-app-shell input,
  .zadak-app-shell textarea {
    cursor: pointer;
  }

  .zadak-app-shell button:disabled,
  .zadak-app-shell select:disabled,
  .zadak-app-shell input:disabled,
  .zadak-app-shell textarea:disabled {
    cursor: not-allowed;
  }

  .zadak-app-shell input,
  .zadak-app-shell textarea,
  .zadak-app-shell select {
    transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
  }

  .zadak-app-shell textarea {
    resize: vertical;
  }

  .zadak-dashboard-card {
    transition: transform 220ms cubic-bezier(.23, 1, .32, 1), box-shadow 220ms cubic-bezier(.23, 1, .32, 1), border-color 180ms ease;
  }

  .zadak-dashboard-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 38px rgba(35, 67, 51, .08);
  }

  .zadak-stat-card {
    position: relative;
    overflow: hidden;
    transition: transform 220ms cubic-bezier(.23, 1, .32, 1), box-shadow 220ms cubic-bezier(.23, 1, .32, 1);
  }

  .zadak-stat-card::after {
    position: absolute;
    right: -28px;
    bottom: -38px;
    width: 110px;
    height: 110px;
    border-radius: 999px;
    background: rgba(115, 198, 148, .11);
    content: "";
    pointer-events: none;
  }

  .zadak-stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 32px rgba(35, 67, 51, .09);
  }

  .zadak-mobile-menu {
    animation: zadak-card-in 180ms cubic-bezier(.23, 1, .32, 1) both;
    transform-origin: top center;
  }

  @media (max-width: 639px) {
    .zadak-home-hero {
      border-radius: 26px;
    }

    .zadak-home-hero h1 {
      letter-spacing: -0.035em;
    }

    .zadak-stat-card:hover,
    .zadak-dashboard-card:hover,
    .zadak-feature-card:hover {
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .zadak-header,
    .zadak-dashboard-card,
    .zadak-stat-card,
    .zadak-mobile-menu { transition: none; animation: none; }
  }
'''
needle = '\n}\n'
idx = s.rfind(needle)
if idx == -1:
    raise SystemExit('css layer closing anchor not found')
s = s[:idx] + addition + s[idx:]
css.write_text(s)

home = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
h = home.read_text()
h = h.replace('onClick={() => setMobileMenu(!mobileMenu)} className={`grid h-9 w-9 items-center', 'onClick={() => setMobileMenu(!mobileMenu)} aria-expanded={mobileMenu} className={`grid h-9 w-9 items-center', 1)
h = h.replace('{mobileMenu && <div className={`border-t px-5 py-3 lg:hidden', '{mobileMenu && <div className={`zadak-mobile-menu border-t px-5 py-3 lg:hidden', 1)
h = h.replace('function StatCard({ label, value, icon, dark }: { label: string; value: string; icon: React.ReactNode; dark: boolean }) { return <div className={`rounded-[22px] p-5 shadow-sm ${dark ? "bg-[#20312b]" : "bg-white"}`}', 'function StatCard({ label, value, icon, dark }: { label: string; value: string; icon: React.ReactNode; dark: boolean }) { return <div className={`zadak-stat-card rounded-[22px] p-5 shadow-sm ${dark ? "bg-[#20312b]" : "bg-white"}`}', 1)
home.write_text(h)
print('ui-polish-applied')
