import { Options } from 'electron-store';

declare module 'electron-store' {
  export default class Store<T extends Record<string, any> = Record<string, unknown>> {
    constructor(options?: Options<T>);
    get<K extends keyof T>(key: K): T[K];
    set<K extends keyof T>(key: K, value: T[K]): void;
    set(object: Partial<T>): void;
    has<K extends keyof T>(key: K): boolean;
    delete<K extends keyof T>(key: K): void;
    clear(): void;
    onDidChange<K extends keyof T>(key: K, callback: (newValue: T[K], oldValue: T[K]) => void): () => void;
    onDidAnyChange(callback: (newValue: T, oldValue: T) => void): () => void;
    size: number;
    store: T;
    path: string;
  }
}
