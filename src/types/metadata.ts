/**
 * 圖片元數據的接口定義
 */
export interface ImageMetadata {
  title: string;
  description: string;
  keywords: string[];
}

/**
 * 寫入元數據的結果接口
 */
export interface WriteMetadataResult {
  filename: string;
  success: boolean;
  error?: string;
}

/**
 * CSV數據行的接口
 */
export interface CsvMetadataRow {
  Filename: string;
  Title: string;
  Description: string;
  Keywords: string;
}
