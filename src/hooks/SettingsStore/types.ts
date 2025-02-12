export interface Settings {
  theme: 'light' | 'dark' | 'blue';
  language: string;
  openaiApiKey?: string;
}

export interface SettingsStore {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}
