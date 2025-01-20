import { useEffect, useState } from 'react';
import Store from '../..';
import { Settings } from './types';

const initialSettings: Settings = {
  theme: 'light',
  language: 'zh',
};

export function useSettingsStore() {
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await Store.get('settings');
      if (saved) {
        setSettings(saved);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await Store.set('settings', updated);
  };

  return { settings, updateSettings };
}

export type { Settings, SettingsStore } from './types';
