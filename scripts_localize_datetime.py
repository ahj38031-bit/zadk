from pathlib import Path
p=Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s=p.read_text()

anchor='function formatNumber(value: number, language: Language) {\n  return value.toLocaleString(language === "ar" ? "ar-EG" : language === "tr" ? "tr-TR" : "en-US");\n}\n'
addition='''function formatNumber(value: number, language: Language) {
  return value.toLocaleString(language === "ar" ? "ar-EG" : language === "tr" ? "tr-TR" : "en-US");
}
function localeForLanguage(language: Language) {
  return language === "ar" ? "ar-EG" : language === "tr" ? "tr-TR" : "en-US";
}
function formatDateTime(value: Date | string | number, language: Language) {
  return new Date(value).toLocaleString(localeForLanguage(language), { dateStyle: "medium", timeStyle: "short" });
}
function formatTime(value: Date | string | number, language: Language) {
  return new Date(value).toLocaleTimeString(localeForLanguage(language), { hour: "2-digit", minute: "2-digit" });
}
function formatDate(value: Date | string | number, language: Language, options: Intl.DateTimeFormatOptions = {}) {
  return new Date(value).toLocaleDateString(localeForLanguage(language), { year: "numeric", month: "short", day: "numeric", ...options });
}
'''
if anchor not in s: raise SystemExit('formatNumber anchor not found')
s=s.replace(anchor,addition,1)

# Notification center receives the explicit language instead of inferring it from translated text.
s=s.replace('onToneChange, t, dark }: { notifications:', 'onToneChange, t, language, dark }: { notifications:',1)
s=s.replace('onToneChange: (kind: NotificationKind, tone: NotificationTone) => void; t: Labels; dark: boolean })', 'onToneChange: (kind: NotificationKind, tone: NotificationTone) => void; t: Labels; language: Language; dark: boolean })',1)
s=s.replace('new Date(item.createdAt).toLocaleTimeString(languageLocale(t), { hour: "2-digit", minute: "2-digit" })', 'formatTime(item.createdAt, language)',1)
# Keep languageLocale available only if another older call remains; it is removed below if unused.

# Header call: add the selected language to NotificationCenter.
s=s.replace('onToneChange={(kind, tone) => kind === "success" ? setSuccessTone(tone) : setErrorTone(tone)} t={t} dark={dark}', 'onToneChange={(kind, tone) => kind === "success" ? setSuccessTone(tone) : setErrorTone(tone)} t={t} language={language} dark={dark}',1)

# Replace all user-facing date/time renderings.
s=s.replace('new Date(meal.createdAt).toLocaleTimeString(language === "ar" ? "ar-EG" : language, { hour: "2-digit", minute: "2-digit" })', 'formatTime(meal.createdAt, language)')
s=s.replace('new Date(meal.createdAt).toLocaleString(language === "ar" ? "ar-EG" : language)', 'formatDateTime(meal.createdAt, language)')
s=s.replace('new Date(Date.now() - (6 - index) * 86_400_000).toLocaleDateString(language === "ar" ? "ar-EG" : language, { weekday: "short" })', 'formatDate(Date.now() - (6 - index) * 86_400_000, language, { weekday: "short", year: undefined, month: undefined, day: undefined })')
s=s.replace('{profile.targetDate}</span>', '{formatDate(profile.targetDate, language)}</span>')
s=s.replace('{form.targetDate}</span>', '{formatDate(form.targetDate, language)}</span>')

# The chart data still receives the same locale, now through the shared resolver.
s=s.replace('language === "ar" ? "ar-EG" : language).map((point)', 'localeForLanguage(language)).map((point)',1)
# Remove the old translation-based locale helper, which is no longer needed.
old='''function languageLocale(t: Labels) {
  return t.notificationCenter === "مركز الإشعارات" ? "ar-EG" : t.notificationCenter === "Bildirim merkezi" ? "tr-TR" : "en-US";
}
'''
s=s.replace(old,'',1)
p.write_text(s)
print('localized-datetime')
