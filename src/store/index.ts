import { StoreKey, StoreValue } from './types';

const Store = {
  async get(key: StoreKey) {
    return window.electronAPI.storeGet(key);
  },

  async set(key: StoreKey, value: StoreValue<StoreKey>) {
    return window.electronAPI.storeSet(key, value);
  },

  async delete(key: StoreKey) {
    return window.electronAPI.storeDelete(key);
  }
};

export default Store;
