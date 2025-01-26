/**
 * CSV驗證器的狀態接口
 */
export interface CsvValidatorState {
  validationErrors: ValidationError[];
  isValid: boolean;
  fileName: string;
  imageDirectory: string; // 改為圖片目錄路徑
  directoryImages: string[]; // 目錄中的圖片文件列表
  processing: boolean;
  progress: number;
  csvData: string[][]; // Changed from any[] to string[][]
  headers: string[];
  uploadProgress: number;
}

/**
 * 驗證錯誤的接口
 */
export interface ValidationError {
  type: 'header' | 'data' | 'file' | 'directory'; // 添加 directory 類型
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
 * 驗證錯誤顯示組件的屬性
 */
export interface ValidationErrorsDisplayProps {
  errors: ValidationError[];
}

export interface ImageFileStatus {
  status: 'success' | 'error' | 'warning';
  message: string;
  progress?: number;
}

export interface ImageUploadProps {
  onImageUpload: (file: File, remove?: boolean) => void;
  selectedImages: File[];
  csvFilenames: string[];
  onRemove?: (file: File) => void;
  onPreview?: (file: File) => void;
  maxCount?: number;
  uploadProgress?: number;
}
