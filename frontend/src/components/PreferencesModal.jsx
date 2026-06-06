import { useEffect, useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications_active' },
  { id: 'privacy', label: 'Privacy & Security', icon: 'shield' },
  { id: 'language', label: 'Language & Region', icon: 'language' },
];

const Toggle = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <span className="font-body-md text-body-md text-on-surface">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-block w-10 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-surface-variant'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  </div>
);

const Segment = ({ value, onChange, options }) => (
  <div className="inline-flex p-1 rounded bg-surface-container-low border border-outline-variant/30">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`px-3 py-1.5 rounded font-label-caps text-label-caps uppercase tracking-wider transition-colors ${value === o.value ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const PreferencesModal = ({ open, onClose }) => {
  const { prefs, update, resetAll } = usePreferences();
  const [active, setActive] = useState('appearance');
  const [savedTick, setSavedTick] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handle = (section, key) => (value) => {
    update(section, key, value);
    setSavedTick(true);
    setTimeout(() => setSavedTick(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm animate-fade-in-up" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start p-6 border-b border-outline-variant/20">
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Workspace</span>
            <h3 className="font-display-md text-display-md text-on-surface mt-1">Preferences</h3>
          </div>
          <div className="flex items-center gap-2">
            {savedTick && (
              <span className="font-mono-data text-mono-data text-secondary flex items-center gap-1 mr-2">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>Saved
              </span>
            )}
            <button onClick={onClose} className="p-2 -mr-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-bright" aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <nav className="w-56 border-r border-outline-variant/20 p-3 hidden md:flex flex-col gap-1 bg-surface-bright/40">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors ${active === s.id ? 'bg-primary-container/15 text-on-surface' : 'text-on-surface-variant hover:bg-surface-bright hover:text-on-surface'}`}
              >
                <span className={`material-symbols-outlined text-[20px] ${active === s.id ? 'text-primary' : ''}`}>{s.icon}</span>
                <span className="font-body-md text-body-md">{s.label}</span>
              </button>
            ))}
            <div className="mt-auto pt-3 border-t border-outline-variant/20">
              <button onClick={() => { resetAll(); setSavedTick(true); setTimeout(() => setSavedTick(false), 1200); }} className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors w-full">
                <span className="material-symbols-outlined text-[20px]">restart_alt</span>
                <span className="font-body-md text-body-md">Reset to defaults</span>
              </button>
            </div>
          </nav>

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {active === 'appearance' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Theme</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4">Choose how VendorBridge looks across this device.</p>
                  <Segment
                    value={prefs.appearance.theme}
                    onChange={handle('appearance', 'theme')}
                    options={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'auto', label: 'System' },
                    ]}
                  />
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Density</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4">Adjust the spacing in tables and lists.</p>
                  <Segment
                    value={prefs.appearance.density}
                    onChange={handle('appearance', 'density')}
                    options={[
                      { value: 'compact', label: 'Compact' },
                      { value: 'comfortable', label: 'Comfortable' },
                    ]}
                  />
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Base font size</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4">Scales text across the entire workspace.</p>
                  <Segment
                    value={prefs.appearance.fontSize}
                    onChange={handle('appearance', 'fontSize')}
                    options={[
                      { value: 'sm', label: 'Small' },
                      { value: 'md', label: 'Medium' },
                      { value: 'lg', label: 'Large' },
                    ]}
                  />
                </div>
              </div>
            )}

            {active === 'notifications' && (
              <div className="flex flex-col gap-2">
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Channels</h4>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">How you'd like to be reached.</p>
                <div className="divide-y divide-outline-variant/20 border-y border-outline-variant/20">
                  <Toggle label="Email notifications" checked={prefs.notifications.email} onChange={handle('notifications', 'email')} />
                  <Toggle label="In-app push notifications" checked={prefs.notifications.push} onChange={handle('notifications', 'push')} />
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mt-6 mb-1">Topics</h4>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">Events you want to hear about.</p>
                <div className="divide-y divide-outline-variant/20 border-y border-outline-variant/20">
                  <Toggle label="Approval requests" checked={prefs.notifications.approvals} onChange={handle('notifications', 'approvals')} />
                  <Toggle label="RFQ updates & responses" checked={prefs.notifications.rfqUpdates} onChange={handle('notifications', 'rfqUpdates')} />
                  <Toggle label="Invoice processed" checked={prefs.notifications.invoices} onChange={handle('notifications', 'invoices')} />
                  <Toggle label="Weekly performance digest" checked={prefs.notifications.weeklyDigest} onChange={handle('notifications', 'weeklyDigest')} />
                </div>
              </div>
            )}

            {active === 'privacy' && (
              <div className="flex flex-col gap-2">
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Data & privacy</h4>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">Control how VendorBridge handles your activity.</p>
                <div className="divide-y divide-outline-variant/20 border-y border-outline-variant/20">
                  <Toggle label="Share anonymous usage analytics" checked={prefs.privacy.analytics} onChange={handle('privacy', 'analytics')} />
                  <Toggle label="Record activity in audit log" checked={prefs.privacy.activityLog} onChange={handle('privacy', 'activityLog')} />
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mt-6 mb-1">Security</h4>
                <div className="divide-y divide-outline-variant/20 border-y border-outline-variant/20">
                  <Toggle label="Require two-factor on sign in" checked={prefs.privacy.twoFactor} onChange={handle('privacy', 'twoFactor')} />
                </div>
                <div className="mt-6 p-4 rounded bg-surface-bright border border-outline-variant/30 flex items-start gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">password</span>
                  <div className="flex-1">
                    <p className="font-data-lg text-data-lg text-on-surface">Change password</p>
                    <p className="font-body-md text-sm text-on-surface-variant mt-0.5">Last changed 47 days ago.</p>
                  </div>
                  <button className="font-label-caps text-label-caps text-primary hover:text-on-surface border-b border-primary hover:border-on-surface pb-0.5">Update</button>
                </div>
              </div>
            )}

            {active === 'language' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Display language</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4">Used across the workspace and emails.</p>
                  <select
                    value={prefs.language.locale}
                    onChange={(e) => handle('language', 'locale')(e.target.value)}
                    className="w-full md:w-72 bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="en-GB">English (United Kingdom)</option>
                    <option value="fr-FR">Français (France)</option>
                    <option value="de-DE">Deutsch (Deutschland)</option>
                    <option value="es-ES">Español (España)</option>
                    <option value="ja-JP">日本語 (日本)</option>
                    <option value="hi-IN">हिन्दी (भारत)</option>
                  </select>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Time zone</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4">All dates and times will be shown in this zone.</p>
                  <select
                    value={prefs.language.timezone}
                    onChange={(e) => handle('language', 'timezone')(e.target.value)}
                    className="w-full md:w-72 bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Kolkata'].map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Reporting currency</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4">Used for spend dashboards and PO totals.</p>
                  <select
                    value={prefs.language.currency}
                    onChange={(e) => handle('language', 'currency')(e.target.value)}
                    className="w-full md:w-72 bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    {['USD', 'EUR', 'GBP', 'JPY', 'INR', 'SGD', 'AUD', 'CAD'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant/20 flex justify-end bg-surface-bright/30">
          <button onClick={onClose} className="px-5 py-2.5 bg-primary text-on-primary font-label-caps text-label-caps rounded hover:bg-black transition-colors">Done</button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal;
