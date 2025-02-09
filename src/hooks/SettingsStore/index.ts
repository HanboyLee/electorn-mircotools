import { useEffect, useState } from 'react';
import Store from '@/hooks/PersistentStore';
import { Settings } from './types';

const initialSettings: Settings = {
  theme: 'light',
  language: 'zh_TW',
  openaiApiKey: '', // 添加默认值
};

export function useSettingsStore() {
  const [settings, setSettings] = useState<Settings>(initialSettings);

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('Loading settings...');
        const saved = await Store.get('settings');
        console.log('Loaded settings:', saved);

        if (saved) {
          const mergedSettings = {
            ...initialSettings,
            ...saved,
          };
          console.log('Merged settings:', mergedSettings);
          setSettings(mergedSettings);
        }
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      console.log('Updating settings with:', newSettings);
      const updated = {
        ...settings,
        ...newSettings,
      };
      console.log('Updated settings:', updated);

      await Store.set('settings', updated);
      console.log('Settings saved to store');

      setSettings(updated);
    } catch (error) {
      console.error('保存设置失败:', error);
      throw error;
    }
  };

  return { settings, updateSettings };
}

export type { Settings, SettingsStore } from './types';
