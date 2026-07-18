import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Store from '@/hooks/PersistentStore';
import { Settings, SettingsStore } from './types';

export const initialSettings: Settings = {
  theme: 'light',
  language: 'zh_TW',
  openaiApiKey: '',
  openrouterApiKey: '',
  selectedModel: '',
  apiProvider: 'openai',
  savedModels: [],
  lastModelUpdateTime: 0,
  analysisPrompt:
    'Please carefully analyze the image and generate an output in JSON format using the structure below: { "title": "<Enter the image title>", "description": "<Enter a detailed description of the image content>", "keywords": ["keyword1", "keyword2", ..., "keyword15", ...] } Requirements: 1. The title must accurately summarize the main subject of the image. 2. The description should be detailed and specific, covering all significant aspects of the image. 3. The keywords array must contain at least 15 keywords that are closely related to the image content, ensuring a comprehensive description of all its facets.',
};

const SettingsContext = createContext<SettingsStore | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await Store.get('settings');
        if (saved) {
          setSettings({
            ...initialSettings,
            ...saved,
          });
        }
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    };
    void loadSettings();
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    try {
      let updated: Settings | undefined;
      setSettings(prev => {
        updated = {
          ...prev,
          ...newSettings,
        };
        return updated;
      });
      if (!updated) {
        throw new Error('Failed to compute updated settings');
      }
      await Store.set('settings', updated);
    } catch (error) {
      console.error('保存设置失败:', error);
      throw error;
    }
  }, []);

  const value = useMemo<SettingsStore>(
    () => ({
      settings,
      updateSettings,
    }),
    [settings, updateSettings]
  );

  return React.createElement(SettingsContext.Provider, { value }, children);
}

export function useSettingsStore(): SettingsStore {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettingsStore must be used within SettingsProvider');
  }
  return ctx;
}

export type { Settings, SettingsStore } from './types';
