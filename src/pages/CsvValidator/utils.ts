import { ValidationError } from './types';
import Papa, { ParseResult } from 'papaparse';

// 修改為與 CSV 文件中的表頭名稱匹配（首字母大寫）
const REQUIRED_HEADERS = ['Filename', 'Title', 'Description', 'Keywords'];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.mp4'];

/**
 * 驗證CSV內容
 * @param data CSV數據行
 * @returns 驗證錯誤數組
 */
export const validateCsvContent = (data: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  // 驗證每一行數據
  data.forEach((row, rowIndex) => {
    // 檢查每個必需欄位
    REQUIRED_HEADERS.forEach(header => {
      const value = row[header]?.toString().trim();
      if (!value) {
        errors.push({
          type: 'data',
          row: rowIndex + 1,
          field: header,
          message: `第 ${rowIndex + 1} 行: ${header} 不能為空`,
        });
      }

      // 特殊檢查：Filename
      if (header === 'Filename' && value) {
        // 檢查文件擴展名
        const ext = value.substring(value.lastIndexOf('.')).toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
          errors.push({
            type: 'data',
            row: rowIndex + 1,
            field: header,
            message: `第 ${rowIndex + 1} 行: "${value}" 不是支持的圖片格式，僅支持 ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
          });
        }
      }

      // 特殊檢查：Keywords
      if (header === 'Keywords' && value) {
        const keywords = value.split(',').map((k: string) => k.trim());
        if (keywords.some((k: string) => !k)) {
          errors.push({
            type: 'data',
            row: rowIndex + 1,
            field: header,
            message: `第 ${rowIndex + 1} 行: Keywords 不能包含空值`,
          });
        }
      }
    });
  });

  return errors;
};

/**
 * 解析CSV文件
 * @param file CSV文件
 * @returns Promise<{data: any[], headers: string[]}>
 */
export const parseCsv = (file: File): Promise<{ data: any[]; headers: string[] }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<any>) => {
        try {
          if (!results || !Array.isArray(results.data)) {
            throw new Error('無效的 CSV 數據');
          }

          if (results.data.length === 0) {
            throw new Error('CSV 文件必須包含至少一行數據');
          }

          const headers = Object.keys(results.data[0]);

          // 驗證表頭
          const missingHeaders = REQUIRED_HEADERS.filter(
            required => !headers.some(h => h === required)
          );

          if (missingHeaders.length > 0) {
            throw new Error(`缺少必需的表頭: ${missingHeaders.join(', ')}`);
          }

          // 驗證數據
          const errors = validateCsvContent(results.data);
          if (errors.length > 0) {
            throw new Error(errors.map(e => e.message).join('\n'));
          }

          resolve({
            data: results.data,
            headers: headers,
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => {
        reject(new Error(`解析 CSV 文件失敗: ${error.message}`));
      },
    });
  });
};

/**
 * 生成CSV模板內容
 * @returns string
 */
export const generateCsvTemplate = (): string => {
  const headers = REQUIRED_HEADERS.join(',');
  const example = ['example.jpg', 'Example Title', 'Example Description', 'keyword1,keyword2'].join(
    ','
  );
  return `${headers}\n${example}`;
};
