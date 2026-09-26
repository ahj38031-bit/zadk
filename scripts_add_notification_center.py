from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

s = s.replace('  BarChart3,\n', '  BarChart3,\n  Bell,\n  CheckCircle2,\n', 1)
s = s.replace('type MealSortOrder = HistorySortOrder;\n', 'type MealSortOrder = HistorySortOrder;\ntype NotificationKind = "success" | "error";\ntype AppNotification = { id: string; kind: NotificationKind; message: string; createdAt: number; read: boolean };\n', 1)
s = s.replace('  guestHint: string;', '  notificationCenter: string; noNotifications: string; markAllRead: string; guestHint: string;', 1)
s = s.replace('guestHint: "سجّل الدخول لحفظ وجباتك ومزامنتها بين أجهزتك.",', 'notificationCenter: "مركز الإشعارات", noNotifications: "لا توجد إشعارات سابقة", markAllRead: "تحديد الكل كمقروء", guestHint: "سجّل الدخول لحفظ وجباتك ومزامنتها بين أجهزتك.",', 1)
s = s.replace('guestHint: "Log in to save meals and sync them across devices.",', 'notificationCenter: "Notification center", noNotifications: "No previous notifications", markAllRead: "Mark all as read", guestHint: "Log in to save meals and sync them across devices.",', 1)
s = s.replace('guestHint: "Öğünleri kaydetmek ve cihazlar arasında senkronize etmek için giriş yapın.",', 'notificationCenter: "Bildirim merkezi", noNotifications: "Önceki bildirim yok", markAllRead: "Tümünü okundu olarak işaretle", guestHint: "Öğünleri kaydetmek ve cihazlar arasında senkronize etmek için giriş yapın.",', 1)

# Add a small, self-contained notification center before the logo.
logo_anchor = 'function Logo() {'
notification_component = r'''function NotificationCenter({ notifications, open, onToggle, onMarkAllRead, t, dark }: { notifications: AppNotification[]; open: boolean; onToggle: () => void; onMarkAllRead: () => void; t: Labels; dark: boolean }) {
  const unreadCount = notifications.filter((item) => !item.read).length;
  return <div className="relative"><button type="button" onClick={onToggle} aria-label={t.notificationCenter} aria-expanded={open} className={`relative grid h-9 w-9 place-items-center rounded-full transition-colors ${dark ? "bg-white/10 text-[#b8d9c3] hover:bg-white/15" : "bg-[#eef2ed] text-[#718078] hover:bg-[#e3eee5]"}`}><Bell size={16} />{unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#d49c3e] px-1 text-[9px] font-black text-white ring-2 ring-[#fbfbf8]" aria-label={`${unreadCount}`}>{unreadCount > 9 ? "9+" : unreadCount}</span>}</button>{open && <div className={`zadak-notification-popover absolute left-0 top-12 z-50 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border shadow-[0_18px_45px_rgba(35,67,51,.16)] ${dark ? "border-white/10 bg-[#20312b] text-[#e6f1e8]" : "border-[#e1ebe1] bg-white text-[#24362b]"}`} role="dialog" aria-label={t.notificationCenter}><div className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${dark ? "border-white/10" : "border-[#eef2ed]"}`}><div><h2 className="text-xs font-black">{t.notificationCenter}</h2><p className={`mt-1 text-[9px] ${dark ? "text-[#a9c0af]" : "text-[#8a978f]"}`}>{notifications.length} · {unreadCount} {t.markAllRead}</p></div>{unreadCount > 0 && <button type="button" onClick={onMarkAllRead} className="rounded-full px-2.5 py-1.5 text-[9px] font-bold text-[#16866f] transition-colors hover:bg-[#eaf7ed]">{t.markAllRead}</button>}</div>{notifications.length === 0 ? <div className="grid min-h-28 place-items-center px-5 text-center"><div><Bell className="mx-auto mb-2 text-[#9bc7a8]" size={22} /><p className={`text-xs font-bold ${dark ? "text-[#b2c7b7]" : "text-[#7d897f]"}`}>{t.noNotifications}</p></div></div> : <ul className="max-h-72 overflow-y-auto p-2">{notifications.map((item) => <li key={item.id} className={`flex gap-2.5 rounded-xl p-2.5 transition-colors ${item.read ? "opacity-70" : dark ? "bg-white/5" : "bg-[#f7fbf7]"}`}><span className={`mt-0.5 shrink-0 ${item.kind === "success" ? "text-[#16866f]" : "text-[#c66a5d]"}`}>{item.kind === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}</span><div className="min-w-0"><p className="text-[10px] font-semibold leading-5">{item.message}</p><time className={`mt-0.5 block text-[9px] ${dark ? "text-[#8fa999]" : "text-[#9aa69d]"}`} dateTime={new Date(item.createdAt).toISOString()}>{new Date(item.createdAt).toLocaleTimeString(languageLocale(t), { hour: "2-digit", minute: "2-digit" })}</time></div></li>)}</ul>}</div>}</div>;
}

function languageLocale(t: Labels) {
  return t.notificationCenter === "مركز الإشعارات" ? "ar-EG" : t.notificationCenter === "Bildirim merkezi" ? "tr-TR" : "en-US";
}

'''
# AlertCircle import is added separately below.
s = s.replace(logo_anchor, notification_component + logo_anchor, 1)
s = s.replace('  Activity,\n', '  Activity,\n  AlertCircle,\n', 1)

# Add state and a unified notify function near the other Home state.
s = s.replace('  const [mobileMenu, setMobileMenu] = useState(false);\n', '  const [mobileMenu, setMobileMenu] = useState(false);\n  const [notificationsOpen, setNotificationsOpen] = useState(false);\n  const [notifications, setNotifications] = useState<AppNotification[]>(() => {\n    try { return JSON.parse(window.localStorage.getItem("zadak-notifications-v1") ?? "[]") as AppNotification[]; } catch { return []; }\n  });\n', 1)
s = s.replace('  const utils = trpc.useUtils();\n', '  const utils = trpc.useUtils();\n  const notify = (kind: NotificationKind, message: string) => {\n    toast[kind](message);\n    setNotifications((current) => [{ id: `${Date.now()}-${Math.random()}`, kind, message, createdAt: Date.now(), read: false }, ...current].slice(0, 20));\n  };\n  useEffect(() => { window.localStorage.setItem("zadak-notifications-v1", JSON.stringify(notifications)); }, [notifications]);\n', 1)

# Route all direct toast calls in Home through the center.
s = s.replace('toast.success(t.mealSaved)', 'notify("success", t.mealSaved)')
s = s.replace('toast.error(t.operationFailed)', 'notify("error", t.operationFailed)')
s = s.replace('toast.success(t.mealDeleted)', 'notify("success", t.mealDeleted)')
s = s.replace('toast.success(t.dayCleared)', 'notify("success", t.dayCleared)')
s = s.replace('toast.success(calorieSuggestion ? t.suggestionApplied : t.saved)', 'notify("success", calorieSuggestion ? t.suggestionApplied : t.saved)')
s = s.replace('toast.error(t.suggestionError)', 'notify("error", t.suggestionError)')
s = s.replace('toast.error("استخدم صورة JPG أو PNG أو WEBP")', 'notify("error", "استخدم صورة JPG أو PNG أو WEBP")')
s = s.replace('toast.error("حجم الصورة يجب أن يكون أقل من 5 ميغابايت")', 'notify("error", "حجم الصورة يجب أن يكون أقل من 5 ميغابايت")')
s = s.replace('toast.error(t.emptyHint)', 'notify("error", t.emptyHint)')
s = s.replace('toast.error(t.preferencesError)', 'onNotify("error", t.preferencesError)')

# Header notification center.
needle = '<div className="flex items-center gap-2"><button onClick={() => toggleTheme?.()}'
replacement = '<div className="flex items-center gap-2"><NotificationCenter notifications={notifications} open={notificationsOpen} onToggle={() => setNotificationsOpen((value) => !value)} onMarkAllRead={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))} t={t} dark={dark} /><button onClick={() => toggleTheme?.()}'
if needle not in s:
    raise SystemExit('header anchor not found')
s = s.replace(needle, replacement, 1)

# History view needs the unified notifier for its async errors.
s = s.replace('isAuthenticated={isAuthenticated} preferences={historyPreferences} preferencesReady={Boolean(dashboardQuery.data?.profile)} />', 'isAuthenticated={isAuthenticated} preferences={historyPreferences} preferencesReady={Boolean(dashboardQuery.data?.profile)} onNotify={notify} />', 1)
s = s.replace('preferencesReady }: { meals:', 'preferencesReady, onNotify }: { meals:', 1)
s = s.replace('preferencesReady: boolean }) {', 'preferencesReady: boolean; onNotify: (kind: NotificationKind, message: string) => void }) {', 1)
p.write_text(s)

css = Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
c = css.read_text()
addition = r'''

  .zadak-notification-popover {
    animation: zadak-popover-in 180ms cubic-bezier(.23, 1, .32, 1) both;
    transform-origin: top left;
  }

  @keyframes zadak-popover-in {
    from { opacity: 0; transform: translateY(-5px) scale(.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
'''
idx = c.rfind('\n}\n')
c = c[:idx] + addition + c[idx:]
c = c.replace('.zadak-header,\n    .zadak-save-button,', '.zadak-header,\n    .zadak-notification-popover,\n    .zadak-save-button,', 1)
css.write_text(c)
print('notification-center-added')
