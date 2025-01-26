import { useEffect, useState } from 'react';
import Store from '../..';
import { CsvValidatorState } from './types';

const initialState: CsvValidatorState = {
  images: [],
  processing: false,
  errors: [],
};

export function useCsvValidatorStore() {
  const [state, setState] = useState<CsvValidatorState>(initialState);

  useEffect(() => {
    const loadState = async () => {
      const savedState = await Store.get('csvValidator');
      if (savedState) {
        setState(savedState);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    Store.set('csvValidator', state);
  }, [state]);

  return [state, setState] as const;
}

export type { CsvValidatorState } from './types';
