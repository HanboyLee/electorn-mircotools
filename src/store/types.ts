import { CsvValidatorState } from './hooks/csvValidator/types';
import { Settings } from './hooks/settings/types';

export interface AppState {
  csvValidator: CsvValidatorState;
  settings: Settings;
}

export type StoreKey = keyof AppState;
export type StoreValue<K extends StoreKey> = AppState[K];
