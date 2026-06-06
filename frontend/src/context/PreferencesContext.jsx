import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'vb_preferences';

const DEFAULTS = {
  appearance: { theme: 'light', density: 'comfortable', fontSize: 'md' },
  notifications: {
    email: true,
    push: true,
    approvals: true,
    rfqUpdates: true,
    invoices: false,
    weeklyDigest: true,
  },
  privacy: { analytics: true, activityLog: true, twoFactor: false },
  language: { locale: 'en-US', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', currency: 'USD' },
};

const PreferencesContext = createContext(null);

const readStored = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      appearance: { ...DEFAULTS.appearance, ...(parsed.appearance || {}) },
      notifications: { ...DEFAULTS.notifications, ...(parsed.notifications || {}) },
      privacy: { ...DEFAULTS.privacy, ...(parsed.privacy || {}) },
      language: { ...DEFAULTS.language, ...(parsed.language || {}) },
    };
  } catch {
    return DEFAULTS;
  }
};

export const PreferencesProvider = ({ children }) => {
  const [prefs, setPrefs] = useState(readStored);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(prefs));
    const root = document.documentElement;
    root.dataset.theme = prefs.appearance.theme;
    root.dataset.density = prefs.appearance.density;
    root.style.fontSize = { sm: '14px', md: '15px', lg: '16px' }[prefs.appearance.fontSize] || '15px';
  }, [prefs]);

  const update = (section, key, value) => {
    setPrefs((p) => ({ ...p, [section]: { ...p[section], [key]: value } }));
  };

  const updateSection = (section, values) => {
    setPrefs((p) => ({ ...p, [section]: { ...p[section], ...values } }));
  };

  const resetAll = () => setPrefs(DEFAULTS);

  return (
    <PreferencesContext.Provider value={{ prefs, update, updateSection, resetAll }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within <PreferencesProvider>');
  return ctx;
};
