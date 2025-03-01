export interface OpenRouterModelInfo {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: number;
    completion: number;
  };
}

export interface Settings {
  theme: 'light' | 'dark' | 'blue';
  language: string;
  openaiApiKey?: string;
  openrouterApiKey?: string;
  selectedModel?: string;
  apiProvider?: 'openai' | 'openrouter';
  savedModels?: OpenRouterModelInfo[];
  lastModelUpdateTime?: number; // 上次更新模型列表的時間戳
}

export interface SettingsStore {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}
