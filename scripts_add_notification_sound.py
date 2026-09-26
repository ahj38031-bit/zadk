from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

s = s.replace('  UserRound,\n', '  UserRound,\n  Volume2,\n  VolumeX,\n', 1)
s = s.replace('  notificationCenter: string; noNotifications: string; markAllRead: string;', '  notificationCenter: string; noNotifications: string; markAllRead: string; soundOn: string; soundOff: string;', 1)
s = s.replace('notificationCenter: "مركز الإشعارات", noNotifications: "لا توجد إشعارات سابقة", markAllRead: "تحديد الكل كمقروء",', 'notificationCenter: "مركز الإشعارات", noNotifications: "لا توجد إشعارات سابقة", markAllRead: "تحديد الكل كمقروء", soundOn: "كتم صوت الإشعارات", soundOff: "تفعيل صوت الإشعارات",', 1)
s = s.replace('notificationCenter: "Notification center", noNotifications: "No previous notifications", markAllRead: "Mark all as read",', 'notificationCenter: "Notification center", noNotifications: "No previous notifications", markAllRead: "Mark all as read", soundOn: "Mute notification sound", soundOff: "Enable notification sound",', 1)
s = s.replace('notificationCenter: "Bildirim merkezi", noNotifications: "Önceki bildirim yok", markAllRead: "Tümünü okundu olarak işaretle",', 'notificationCenter: "Bildirim merkezi", noNotifications: "Önceki bildirim yok", markAllRead: "Tümünü okundu olarak işaretle", soundOn: "Bildirim sesini kapat", soundOff: "Bildirim sesini aç",', 1)

sound_fn = r'''function playNotificationTone() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(740, now);
    oscillator.frequency.exponentialRampToValueAtTime(980, now + 0.1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.19);
    oscillator.addEventListener("ended", () => { void context.close(); }, { once: true });
  } catch {
    // Browsers may block audio until a user gesture; the visual Toast still appears.
  }
}

'''
s = s.replace('function NotificationCenter({', sound_fn + 'function NotificationCenter({', 1)

old_sig = 'function NotificationCenter({ notifications, open, onToggle, onMarkAllRead, t, dark }: { notifications: AppNotification[]; open: boolean; onToggle: () => void; onMarkAllRead: () => void; t: Labels; dark: boolean }) {'
new_sig = 'function NotificationCenter({ notifications, open, onToggle, onMarkAllRead, soundEnabled, onToggleSound, t, dark }: { notifications: AppNotification[]; open: boolean; onToggle: () => void; onMarkAllRead: () => void; soundEnabled: boolean; onToggleSound: () => void; t: Labels; dark: boolean }) {'
if old_sig not in s: raise SystemExit('notification signature not found')
s = s.replace(old_sig, new_sig, 1)

old_header = '<div><h2 className="text-xs font-black">{t.notificationCenter}</h2><p className={`mt-1 text-[9px] ${dark ? "text-[#a9c0af]" : "text-[#8a978f]"}`}>{notifications.length} · {unreadCount} {t.markAllRead}</p></div>{unreadCount > 0 && <button type="button" onClick={onMarkAllRead}'
new_header = '<div><h2 className="text-xs font-black">{t.notificationCenter}</h2><p className={`mt-1 text-[9px] ${dark ? "text-[#a9c0af]" : "text-[#8a978f]"}`}>{notifications.length} · {unreadCount} {t.markAllRead}</p></div><div className="flex items-center gap-1.5"><button type="button" onClick={onToggleSound} aria-label={soundEnabled ? t.soundOn : t.soundOff} className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${dark ? "text-[#b8d9c3] hover:bg-white/10" : "text-[#718078] hover:bg-[#eef5ee]"}`}>{soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}</button>{unreadCount > 0 && <button type="button" onClick={onMarkAllRead}'
if old_header not in s: raise SystemExit('notification header anchor not found')
s = s.replace(old_header, new_header, 1)

# Add sound preference and trigger to Home.
s = s.replace('  const [notificationsOpen, setNotificationsOpen] = useState(false);\n', '  const [notificationsOpen, setNotificationsOpen] = useState(false);\n  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => window.localStorage.getItem("zadak-notification-sound") !== "false");\n', 1)
s = s.replace('    toast[kind](message);\n    setNotifications', '    toast[kind](message);\n    if (soundEnabled) playNotificationTone();\n    setNotifications', 1)
s = s.replace('  useEffect(() => { window.localStorage.setItem("zadak-notifications-v1", JSON.stringify(notifications)); }, [notifications]);\n', '  useEffect(() => { window.localStorage.setItem("zadak-notifications-v1", JSON.stringify(notifications)); }, [notifications]);\n  useEffect(() => { window.localStorage.setItem("zadak-notification-sound", String(soundEnabled)); }, [soundEnabled]);\n', 1)

old_center = '<NotificationCenter notifications={notifications} open={notificationsOpen} onToggle={() => setNotificationsOpen((value) => !value)} onMarkAllRead={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))} t={t} dark={dark} />'
new_center = '<NotificationCenter notifications={notifications} open={notificationsOpen} onToggle={() => setNotificationsOpen((value) => !value)} onMarkAllRead={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))} soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled((value) => !value)} t={t} dark={dark} />'
if old_center not in s: raise SystemExit('center usage not found')
s = s.replace(old_center, new_center, 1)
p.write_text(s)

css = Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
c = css.read_text()
addition = r'''

  .zadak-notification-popover button[aria-label] {
    -webkit-tap-highlight-color: transparent;
  }
'''
idx = c.rfind('\n}\n')
c = c[:idx] + addition + c[idx:]
css.write_text(c)
print('notification-sound-added')
