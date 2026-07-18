import React, { useState } from 'react';
import { Upload, Button, Alert, Space, Tag } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { parseCsv } from '../utils';

const REQUIRED_HEADERS = ['Filename', 'Title', 'Description', 'Keywords'];

export interface CsvUploadProps {
  onUpload: (data: any[], headers: string[], fileName?: string) => void;
  onError: (error: Error) => void;
  onProgress: (progress: number) => void;
  progress: number;
  onPreview?: (data: any[]) => void;
  template?: string;
  onRemove?: () => void;
  selectedFileName?: string;
  disabled?: boolean;
}

export const CsvUpload: React.FC<CsvUploadProps> = ({
  onUpload,
  onError,
  onProgress,
  progress,
  template,
  onRemove,
  selectedFileName,
  disabled,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const displayName = selectedFileName || selectedFile?.name || '';

  const handleBeforeUpload = async (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      onError(new Error('只支持 CSV 文件'));
      return false;
    }

    setSelectedFile(file);
    setValidationErrors([]);

    try {
      const result = await parseCsv(file);

      const errors = validateCsvFormat(Object.keys(result.data[0] || {}));
      if (errors.length > 0) {
        setValidationErrors(errors);
        onError(new Error(errors.join('\n')));
        return false;
      }

      onUpload(result.data, result.headers, file.name);
      onProgress(100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '解析 CSV 文件時出錯';
      setValidationErrors([errorMessage]);
      onError(new Error(errorMessage));
      setSelectedFile(null);
    }

    return false;
  };

  const validateCsvFormat = (headers: string[]): string[] => {
    const errors: string[] = [];
    REQUIRED_HEADERS.forEach(required => {
      if (!headers.some(h => h.toLowerCase() === required.toLowerCase())) {
        errors.push(`缺少必需的欄位：${required}`);
      }
    });
    return errors;
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setValidationErrors([]);
    onProgress(0);
    onRemove?.();
  };

  const handleDownloadTemplate = () => {
    if (template) {
      const link = document.createElement('a');
      link.href = template;
      link.download = 'template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <Space wrap>
        <Upload accept=".csv" beforeUpload={handleBeforeUpload} showUploadList={false} disabled={disabled}>
          <Button icon={<UploadOutlined />} disabled={disabled}>
            選擇 CSV 文件
          </Button>
        </Upload>

        {template && (
          <Button type="link" onClick={handleDownloadTemplate} disabled={disabled}>
            下載 CSV 模板
          </Button>
        )}
      </Space>

      {displayName && (
        <Alert
          style={{ marginTop: 12 }}
          message={
            <Space wrap>
              <Tag color="success">CSV</Tag>
              <span>{displayName}</span>
              {progress >= 100 && <Tag>已解析</Tag>}
            </Space>
          }
          type={validationErrors.length > 0 ? 'error' : 'success'}
          showIcon
          action={
            <Button
              size="small"
              danger
              onClick={handleRemove}
              icon={<DeleteOutlined />}
              disabled={disabled}
            >
              移除
            </Button>
          }
        />
      )}

      {validationErrors.length > 0 && (
        <Alert
          message="驗證結果"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          }
          type="error"
          showIcon
          style={{ marginTop: 8 }}
        />
      )}
    </div>
  );
};
