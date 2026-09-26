from pathlib import Path

p = Path('/home/ubuntu/zadak-ai-clone/client/src/pages/Home.tsx')
s = p.read_text()

s = s.replace('  LockKeyhole,\n', '  LockKeyhole,\n  Loader2,\n', 1)
s = s.replace('activity: string; save: string; saved: string;', 'activity: string; save: string; saved: string; saving: string; calculatingGoals: string;', 1)
s = s.replace('activity: "مستوى النشاط", save: "حفظ الأهداف", saved: "تم حفظ أهدافك",', 'activity: "مستوى النشاط", save: "حفظ الأهداف", saved: "تم حفظ أهدافك", saving: "جارٍ حفظ التغييرات...", calculatingGoals: "جارٍ تحديث الأهداف...",', 1)
s = s.replace('activity: "Activity level", save: "Save targets", saved: "Your targets were saved",', 'activity: "Activity level", save: "Save targets", saved: "Your targets were saved", saving: "Saving changes...", calculatingGoals: "Updating targets...",', 1)
s = s.replace('activity: "Aktivite seviyesi", save: "Hedefleri kaydet", saved: "Hedefleriniz kaydedildi",', 'activity: "Aktivite seviyesi", save: "Hedefleri kaydet", saved: "Hedefleriniz kaydedildi", saving: "Değişiklikler kaydediliyor...", calculatingGoals: "Hedefler güncelleniyor...",', 1)

s = s.replace('onSave={saveProfile} saving={saveProfileMutation.isPending} isAuthenticated={isAuthenticated}', 'onSave={saveProfile} saving={saveProfileMutation.isPending} saved={saveProfileMutation.isSuccess} isAuthenticated={isAuthenticated}', 1)
s = s.replace('onSave, saving, isAuthenticated, onLogin', 'onSave, saving, saved, isAuthenticated, onLogin', 1)
s = s.replace('onSave: () => void; saving: boolean; isAuthenticated:', 'onSave: () => void; saving: boolean; saved: boolean; isAuthenticated:', 1)

needle = '{canCalculate && calculation && <div className={`mt-5 rounded-2xl border p-4 ${dark ? "border-[#385449] bg-[#182a23]" : "border-[#dceee0] bg-[#f5fbf5]"}`}'
replacement = '{calculating && <div className={`zadak-loading-card mt-5 flex items-center gap-3 rounded-2xl border border-dashed p-4 text-xs font-bold ${dark ? "border-[#385449] bg-[#182a23] text-[#b6d2be]" : "border-[#dceee0] bg-[#fbfdf9] text-[#6e8877]"}`} role="status" aria-live="polite"><Loader2 size={16} className="animate-spin text-[#16866f]" />{t.calculatingGoals}</div>}{canCalculate && calculation && <div className={`mt-5 rounded-2xl border p-4 ${dark ? "border-[#385449] bg-[#182a23]" : "border-[#dceee0] bg-[#f5fbf5]"}`}'
if needle not in s:
    raise SystemExit('calculation anchor not found')
s = s.replace(needle, replacement, 1)

old_button = '<button onClick={onSave} disabled={saving || calculating} className="mt-6 flex items-center gap-2 rounded-full bg-[#087b69] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Save size={15} />{saving ? "..." : t.save}</button>'
new_button = '<div className="mt-6 flex flex-wrap items-center gap-3"><button onClick={onSave} disabled={saving || calculating} aria-busy={saving} className={`zadak-save-button flex items-center gap-2 rounded-full bg-[#087b69] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(8,123,105,.14)] disabled:cursor-wait disabled:opacity-60 ${saving ? "is-saving" : ""}`}>{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}{saving ? t.saving : t.save}</button>{saved && !saving && <span className="zadak-save-success inline-flex items-center gap-1.5 rounded-full bg-[#eaf7ed] px-3 py-2 text-[10px] font-bold text-[#16866f]" role="status" aria-live="polite"><Check size={13} />{t.saved}</span>}</div>'
if old_button not in s:
    raise SystemExit('save button anchor not found')
s = s.replace(old_button, new_button, 1)
p.write_text(s)

css = Path('/home/ubuntu/zadak-ai-clone/client/src/index.css')
c = css.read_text()
addition = r'''

  .zadak-save-button {
    position: relative;
    overflow: hidden;
    transition: transform 180ms cubic-bezier(.23, 1, .32, 1), box-shadow 180ms ease, opacity 180ms ease;
  }

  .zadak-save-button:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 13px 25px rgba(8, 123, 105, .2);
  }

  .zadak-save-button.is-saving::after {
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,.22) 48%, transparent 76%);
    content: "";
    animation: zadak-save-sheen 1.25s ease-in-out infinite;
  }

  .zadak-save-success {
    animation: zadak-save-success-in 260ms cubic-bezier(.23, 1, .32, 1) both;
  }

  .zadak-loading-card {
    animation: zadak-save-success-in 220ms cubic-bezier(.23, 1, .32, 1) both;
  }

  @keyframes zadak-save-sheen {
    from { transform: translateX(-100%); }
    to { transform: translateX(100%); }
  }

  @keyframes zadak-save-success-in {
    from { opacity: 0; transform: translateY(4px) scale(.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
'''
idx = c.rfind('\n}\n')
c = c[:idx] + addition + c[idx:]
c = c.replace('.zadak-header,\n    .zadak-dashboard-card,', '.zadak-header,\n    .zadak-save-button,\n    .zadak-save-success,\n    .zadak-loading-card,\n    .zadak-dashboard-card,', 1)
css.write_text(c)
print('save-loading-added')
