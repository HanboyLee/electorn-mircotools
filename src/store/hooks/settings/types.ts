export interface Settings {
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  openaiApiKey?: string;
}

export interface SettingsStore {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}
