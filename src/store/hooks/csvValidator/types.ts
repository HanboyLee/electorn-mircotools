export interface CsvValidatorState {
  directory?: string;
  images: string[];
  processing: boolean;
  errors: string[];
}

export interface CsvValidatorStore {
  state: CsvValidatorState;
  setState: React.Dispatch<React.SetStateAction<CsvValidatorState>>;
}
