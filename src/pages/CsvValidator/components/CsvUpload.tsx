import React, { useState } from 'react';
import { Upload, Button, Alert, Progress, Modal, Table, Space } from 'antd';
import { UploadOutlined, FileTextOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { CsvUploadProps } from '../types';
import { parseCsv } from '../utils';

// 與 utils.ts 保持一致的必需欄位
const REQUIRED_HEADERS = ['Filename', 'Title', 'Description', 'Keywords'];

export const CsvUpload: React.FC<CsvUploadProps> = ({
  onUpload,
  onError,
  onProgress,
  progress,
  onPreview,
  template
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 處理文件上傳前的驗證
  const handleBeforeUpload = async (file: File) => {
    // 檢查文件類型
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      onError(new Error('只支持 CSV 文件'));
      return false;
    }

    setSelectedFile(file);
    setValidationErrors([]);

    try {
      // 解析並驗證 CSV 文件
      const result = await parseCsv(file);
      
      // 驗證格式
      const errors = validateCsvFormat(Object.keys(result.data[0]));
      if (errors.length > 0) {
        setValidationErrors(errors);
        onError(new Error(errors.join('\n')));
        return false;
      }

      // 更新數據
      onUpload(result.data, result.headers);
      onProgress(100);

      // 如果有預覽功能，保存預覽數據
      if (onPreview) {
        setPreviewData(result.data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '解析 CSV 文件時出錯';
      setValidationErrors([errorMessage]);
      onError(new Error(errorMessage));
      setSelectedFile(null);
    }

    return false;
  };

  // 驗證 CSV 文件格式
  const validateCsvFormat = (headers: string[]): string[] => {
    const errors: string[] = [];

    // 不區分大小寫比較
    REQUIRED_HEADERS.forEach(required => {
      if (!headers.some(h => h.toLowerCase() === required.toLowerCase())) {
        errors.push(`缺少必需的欄位：${required}`);
      }
    });

    return errors;
  };

  // 處理文件刪除
  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setValidationErrors([]);
    onProgress(0);
  };

  // 處理預覽
  const handlePreview = () => {
    if (previewData) {
      setPreviewVisible(true);
    }
  };

  // 下載模板
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
      <Space>
        <Upload
          accept=".csv"
          beforeUpload={handleBeforeUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>選擇 CSV 文件</Button>
        </Upload>
        
        {template && (
          <Button
            type="link"
            onClick={handleDownloadTemplate}
          >
            下載 CSV 模板
          </Button>
        )}
      </Space>

      {selectedFile && (
        <div style={{ marginTop: '16px' }}>
          <Alert
            message={`已選擇文件：${selectedFile.name}`}
            type={validationErrors.length > 0 ? 'error' : 'success'}
            showIcon
            action={
              <>
                {previewData && (
                  <Button
                    size="small"
                    type="link"
                    onClick={handlePreview}
                    icon={<EyeOutlined />}
                  >
                    預覽
                  </Button>
                )}
                <Button
                  size="small"
                  danger
                  onClick={handleRemove}
                  icon={<DeleteOutlined />}
                >
                  移除
                </Button>
              </>
            }
          />
          {progress > 0 && progress < 100 && (
            <Progress percent={progress} size="small" style={{ marginTop: '8px' }} />
          )}
          {validationErrors.length > 0 && (
            <Alert
              message="驗證結果"
              description={
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              }
              type="error"
              showIcon
              style={{ marginTop: '8px' }}
            />
          )}
        </div>
      )}

      <Modal
        title="CSV 預覽"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewData && (
          <Table
            dataSource={previewData}
            columns={Object.keys(previewData[0] || {}).map(key => ({
              title: key,
              dataIndex: key,
              key: key,
              ellipsis: true
            }))}
            scroll={{ x: true, y: 400 }}
            size="small"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Modal>
    </div>
  );
};
