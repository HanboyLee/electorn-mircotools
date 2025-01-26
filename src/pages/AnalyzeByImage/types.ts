export interface AnalysisResult {
  title: string;
  description: string;
  keywords: string;
}

export interface ImageAnalysisState {
  selectedFiles: File[];
  analyzing: boolean;
  results: Record<string, AnalysisResult | null>;
  errors: Record<string, string | undefined>;
  apiKey: string;
}

export interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (value: string) => void;
}
