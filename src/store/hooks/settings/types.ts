export interface Settings {
  theme: 'light' | 'dark';
  language: string;
  openaiApiKey?: string;
}

export interface SettingsStore {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}
