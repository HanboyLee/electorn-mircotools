/**
 * CSV驗證器的狀態接口
 */
export interface CsvValidatorState {
  validationErrors: ValidationError[];
  isValid: boolean;
  fileName: string;
  selectedImages: File[];
  processing: boolean;
  progress: number;
  csvData: any[];
  headers: string[];
  uploadProgress: number;
}

/**
 * 驗證錯誤的接口
 */
export interface ValidationError {
  type: 'header' | 'data' | 'file';
  row?: number;
  field?: string;
  message: string;
}

/**
 * CSV行數據的接口
 */
export interface CsvRow {
  filename: string;
  description: string;
  keywords: string;
  title: string;
  [key: string]: string;
}

/**
 * CSV文件上傳組件的屬性
 */
export interface CsvUploadProps {
  onUpload: (data: any[], headers: string[]) => void;
  onError: (error: Error) => void;
  onProgress: (progress: number) => void;
  progress: number;
  onPreview?: (data: any[]) => void;
  template?: string;
}

/**
 * 圖片上傳組件的屬性
 */
export interface ImageUploadProps {
  onImageUpload: (file: File, isRemove?: boolean) => void;
  selectedImages: File[];
  csvFilenames?: string[];
  onRemove?: (file: File) => void;
  onPreview?: (file: File) => void;
  maxCount?: number;
  uploadProgress?: number;
}

/**
 * 圖片文件狀態
 */
export interface ImageFileStatus {
  status: 'success' | 'error' | 'warning' | 'uploading';
  message: string;
  progress?: number;
}

/**
 * 驗證錯誤顯示組件的屬性
 */
export interface ValidationErrorsDisplayProps {
  errors: ValidationError[];
}
