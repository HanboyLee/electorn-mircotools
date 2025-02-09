import { Settings } from '@/hooks/SettingsStore/types';

export interface AppState {
  settings: Settings;
}

export type StoreKey = keyof AppState;
export type StoreValue<K extends StoreKey> = AppState[K];
