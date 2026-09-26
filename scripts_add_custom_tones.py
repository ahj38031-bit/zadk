from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

s = s.replace('  UserRound,\n  Volume2,\n  VolumeX,\n', '  UserRound,\n  Volume2,\n  VolumeX,\n', 1)
s = s.replace('type NotificationKind = "success" | "error";\ntype AppNotification', 'type NotificationKind = "success" | "error";\ntype NotificationTone = "gentle" | "chime" | "pulse" | "off";\ntype AppNotification', 1)
s = s.replace('notificationCenter: string; noNotifications: string; markAllRead: string; soundOn: string; soundOff: string;', 'notificationCenter: string; noNotifications: string; markAllRead: string; soundOn: string; soundOff: string; successTone: string; errorTone: string; toneGentle: string; toneChime: string; tonePulse: string; toneOff: string;', 1)
s = s.replace('soundOn: "كتم صوت الإشعارات", soundOff: "تفعيل صوت الإشعارات",', 'soundOn: "كتم صوت الإشعارات", soundOff: "تفعيل صوت الإشعارات", successTone: "نغمة النجاح", errorTone: "نغمة الخطأ", toneGentle: "هادئة", toneChime: "رنانة", tonePulse: "نبضية", toneOff: "بدون صوت",', 1)
s = s.replace('soundOn: "Mute notification sound", soundOff: "Enable notification sound",', 'soundOn: "Mute notification sound", soundOff: "Enable notification sound", successTone: "Success tone", errorTone: "Error tone", toneGentle: "Gentle", toneChime: "Chime", tonePulse: "Pulse", toneOff: "Muted",', 1)
s = s.replace('soundOn: "Bildirim sesini kapat", soundOff: "Bildirim sesini aç",', 'soundOn: "Bildirim sesini kapat", soundOff: "Bildirim sesini aç", successTone: "Başarı tonu", errorTone: "Hata tonu", toneGentle: "Yumuşak", toneChime: "Çınlama", tonePulse: "Darbe", toneOff: "Sessiz",', 1)

start = s.index('function playNotificationTone() {')
end = s.index('function NotificationCenter', start)
new_sound = '''function playNotificationTone(tone: NotificationTone) {
  if (tone === "off" || typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const settings = tone === "chime" ? { start: 740, end: 980, duration: 0.19 } : tone === "pulse" ? { start: 430, end: 430, duration: 0.14 } : { start: 560, end: 680, duration: 0.16 };
    oscillator.type = tone === "pulse" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(settings.start, now);
    oscillator.frequency.exponentialRampToValueAtTime(settings.end, now + Math.min(0.1, settings.duration * 0.6));
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(tone === "pulse" ? 0.045 : 0.055, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + settings.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + settings.duration + 0.01);
    oscillator.addEventListener("ended", () => { void context.close(); }, { once: true });
  } catch {
    // Browsers may block audio until a user gesture; the visual Toast still appears.
  }
}'''
s = s[:start] + new_sound + s[end:]

old_sig = 'function NotificationCenter({ notifications, open, onToggle, onMarkAllRead, soundEnabled, onToggleSound, t, dark }: { notifications: AppNotification[]; open: boolean; onToggle: () => void; onMarkAllRead: () => void; soundEnabled: boolean; onToggleSound: () => void; t: Labels; dark: boolean }) {'
new_sig = 'function NotificationCenter({ notifications, open, onToggle, onMarkAllRead, soundEnabled, onToggleSound, successTone, errorTone, onToneChange, t, dark }: { notifications: AppNotification[]; open: boolean; onToggle: () => void; onMarkAllRead: () => void; soundEnabled: boolean; onToggleSound: () => void; successTone: NotificationTone; errorTone: NotificationTone; onToneChange: (kind: NotificationKind, tone: NotificationTone) => void; t: Labels; dark: boolean }) {'
if old_sig not in s: raise SystemExit('notification signature not found')
s = s.replace(old_sig, new_sig, 1)

anchor = '</div>{notifications.length === 0 ?'
controls = '</div><div className={`grid grid-cols-2 gap-2 border-b px-4 py-2.5 ${dark ? "border-white/10" : "border-[#eef2ed]"}`}><label className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[9px] font-bold ${dark ? "bg-white/5 text-[#b8d0be]" : "bg-[#f7fbf7] text-[#6e7c72]"}`}>{t.successTone}<select value={successTone} onChange={(event) => onToneChange("success", event.target.value as NotificationTone)} className="max-w-[78px] rounded-md border-0 bg-transparent text-[9px] font-bold outline-none"><option value="gentle">{t.toneGentle}</option><option value="chime">{t.toneChime}</option><option value="pulse">{t.tonePulse}</option><option value="off">{t.toneOff}</option></select></label><label className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[9px] font-bold ${dark ? "bg-white/5 text-[#b8d0be]" : "bg-[#f7fbf7] text-[#6e7c72]"}`}>{t.errorTone}<select value={errorTone} onChange={(event) => onToneChange("error", event.target.value as NotificationTone)} className="max-w-[78px] rounded-md border-0 bg-transparent text-[9px] font-bold outline-none"><option value="gentle">{t.toneGentle}</option><option value="chime">{t.toneChime}</option><option value="pulse">{t.tonePulse}</option><option value="off">{t.toneOff}</option></select></label></div>{notifications.length === 0 ?'
if anchor not in s: raise SystemExit('popover content anchor not found')
s = s.replace(anchor, controls, 1)

s = s.replace('  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => window.localStorage.getItem("zadak-notification-sound") !== "false");\n', '  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => window.localStorage.getItem("zadak-notification-sound") !== "false");\n  const [successTone, setSuccessTone] = useState<NotificationTone>(() => (window.localStorage.getItem("zadak-success-tone") as NotificationTone) || "gentle");\n  const [errorTone, setErrorTone] = useState<NotificationTone>(() => (window.localStorage.getItem("zadak-error-tone") as NotificationTone) || "pulse");\n', 1)
s = s.replace('    if (soundEnabled) playNotificationTone();', '    if (soundEnabled) playNotificationTone(kind === "success" ? successTone : errorTone);', 1)
s = s.replace('  useEffect(() => { window.localStorage.setItem("zadak-notification-sound", String(soundEnabled)); }, [soundEnabled]);\n', '  useEffect(() => { window.localStorage.setItem("zadak-notification-sound", String(soundEnabled)); }, [soundEnabled]);\n  useEffect(() => { window.localStorage.setItem("zadak-success-tone", successTone); }, [successTone]);\n  useEffect(() => { window.localStorage.setItem("zadak-error-tone", errorTone); }, [errorTone]);\n', 1)
old_center = 'soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled((value) => !value)} t={t} dark={dark} />'
new_center = 'soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled((value) => !value)} successTone={successTone} errorTone={errorTone} onToneChange={(kind, tone) => kind === "success" ? setSuccessTone(tone) : setErrorTone(tone)} t={t} dark={dark} />'
if old_center not in s: raise SystemExit('center usage not found')
s = s.replace(old_center, new_center, 1)
p.write_text(s)
print('custom-notification-tones-added')
