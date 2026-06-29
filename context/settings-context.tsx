'use client';

import * as React from 'react';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
} from '@/lib/settings';

// ── Context type ───────────────────────────────────────────────────
interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  persistSettings: (overrides?: Partial<AppSettings>) => void;
}

const SettingsContext = React.createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  persistSettings: () => {},
});

// ── Provider ───────────────────────────────────────────────────────
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = React.useState(false);

  // Load from localStorage on mount (client only)
  React.useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  // Update in memory (does NOT auto-persist — call persistSettings to save)
  const updateSettings = React.useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  // Persist current settings (or a patched version) to localStorage
  const persistSettings = React.useCallback(
    (overrides?: Partial<AppSettings>) => {
      setSettings((prev) => {
        const next = overrides ? { ...prev, ...overrides } : prev;
        saveSettings(next);
        return next;
      });
    },
    []
  );

  if (!hydrated) {
    // Render children with defaults while localStorage loads (avoids hydration mismatch)
    return (
      <SettingsContext.Provider
        value={{ settings: DEFAULT_SETTINGS, updateSettings, persistSettings }}
      >
        {children}
      </SettingsContext.Provider>
    );
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, persistSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────
export function useSettings() {
  return React.useContext(SettingsContext);
}
