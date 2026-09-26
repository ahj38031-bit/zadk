from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
s = p.read_text()
addition = r'''

  @media (max-width: 639px) {
    html, body {
      min-width: 320px;
      overflow-x: hidden;
    }

    body {
      padding-bottom: env(safe-area-inset-bottom);
    }

    .zadak-header {
      padding-top: env(safe-area-inset-top);
    }

    .zadak-header > div {
      min-height: 60px;
      height: auto;
      padding-inline: 12px;
    }

    .zadak-header button {
      min-height: 40px;
      min-width: 40px;
    }

    .zadak-header .zadak-notification-popover {
      position: fixed;
      top: calc(60px + env(safe-area-inset-top));
      right: 12px;
      left: 12px;
      width: auto;
      max-height: calc(100dvh - 78px);
    }

    .zadak-header .zadak-notification-popover ul {
      max-height: min(18rem, calc(100dvh - 170px));
    }

    .zadak-app-shell main {
      scroll-margin-top: 68px;
    }

    .zadak-home-hero {
      padding: 20px 16px;
      border-radius: 24px;
    }

    .zadak-home-hero h1 {
      max-width: 100%;
      font-size: clamp(28px, 8.5vw, 36px);
      line-height: 1.28;
    }

    .zadak-home-hero p {
      max-width: 100%;
      font-size: 12px;
      line-height: 1.9;
    }

    .zadak-home-hero button {
      min-height: 44px;
    }

    .zadak-hero-preview {
      max-width: 100%;
    }

    .zadak-app-shell input,
    .zadak-app-shell textarea,
    .zadak-app-shell select {
      min-height: 44px;
      font-size: 16px;
    }

    .zadak-modal-backdrop {
      align-items: flex-end;
      padding: 8px;
    }

    .zadak-modal-panel {
      width: 100%;
      max-height: calc(100dvh - 16px);
      overflow-y: auto;
      border-radius: 24px 24px 16px 16px;
      overscroll-behavior: contain;
    }

    .zadak-save-button,
    .zadak-save-success {
      min-height: 44px;
    }

    .recharts-responsive-container {
      min-height: 230px;
    }
  }
'''
idx = s.rfind('\n}\n')
s = s[:idx] + addition + s[idx:]
p.write_text(s)
print('mobile-polish-added')
