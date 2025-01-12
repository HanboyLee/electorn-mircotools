import React, { useState } from 'react';
import { Button, Row, Col, Typography, Card, Progress, Alert, Space } from 'antd';
import { CsvUpload } from './components/CsvUpload';
import { ImageUpload } from './components/ImageUpload';
import { CsvRequirements } from './components/CsvRequirements';
import { ValidationErrorsDisplay } from './components/ValidationErrorsDisplay';
import { validateCsvContent } from './utils';
import { CsvValidatorState } from './types';

const { Title } = Typography;

const CsvValidator: React.FC = () => {
  const [state, setState] = useState<CsvValidatorState>({
    isValid: false,
    fileName: '',
    selectedImages: [],
    validationErrors: [],
    uploadProgress: 0,
    csvData: [],
    headers: [],
    processing: false,
    progress: 0
  });

  const handleCsvUpload = (data: string[][], headers: string[]) => {
    const errors = validateCsvContent(data);
    const filenames = data.map(row => row[headers.indexOf('filename')]).filter(Boolean);
    
    setState(prev => ({
      ...prev,
      csvData: data,
      headers: headers,
      validationErrors: errors,
      isValid: errors.length === 0,
      uploadProgress: 100
    }));
  };

  const handleImageUpload = (file: File, isRemove?: boolean) => {
    setState(prev => {
      let newImages;
      if (isRemove) {
        newImages = prev.selectedImages.filter(f => f.name !== file.name);
      } else {
        const exists = prev.selectedImages.some(f => f.name === file.name);
        if (exists) {
          return prev;
        }
        newImages = [...prev.selectedImages, file];
      }
      return {
        ...prev,
        selectedImages: newImages
      };
    });
  };

  const handleStartProcessing = () => {
    if (!state.isValid || state.selectedImages.length === 0) {
      return;
    }
    setState(prev => ({
      ...prev,
      processing: true
    }));
  };

  const handleError = (error: Error) => {
    setState(prev => ({
      ...prev,
      validationErrors: [{
        type: 'file',
        message: error.message
      }],
      isValid: false,
      uploadProgress: 0
    }));
  };

  const handleProgress = (progress: number) => {
    setState(prev => ({
      ...prev,
      uploadProgress: progress
    }));
  };

  const handleReset = () => {
    setState({
      isValid: false,
      fileName: '',
      selectedImages: [],
      validationErrors: [],
      uploadProgress: 0,
      csvData: [],
      headers: [],
      processing: false,
      progress: 0
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>檔案上傳</Title>

        <Card title="步驟 1: 上傳圖片檔案" bordered={false}>
          <ImageUpload
            onImageUpload={handleImageUpload}
            selectedImages={state.selectedImages}
            csvFilenames={state.csvData.map(row => 
              row[state.headers.indexOf('filename')]
            ).filter(Boolean)}
          />
          {state.selectedImages.length > 0 && (
            <Alert
              style={{ marginTop: '16px' }}
              message={`已選擇 ${state.selectedImages.length} 個圖片檔案`}
              type="success"
              showIcon
            />
          )}
        </Card>

        <Card title="步驟 2: 上傳 CSV 檔案" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <CsvRequirements />
            </Col>
            <Col span={24}>
              <CsvUpload
                onUpload={handleCsvUpload}
                onError={handleError}
                onProgress={handleProgress}
                progress={state.uploadProgress}
              />
              {state.uploadProgress > 0 && state.uploadProgress < 100 && (
                <Progress percent={state.uploadProgress} />
              )}
            </Col>
          </Row>
        </Card>

        {state.validationErrors.length > 0 && (
          <Card title="驗證結果" bordered={false}>
            <ValidationErrorsDisplay errors={state.validationErrors} />
          </Card>
        )}

        <Card bordered={false}>
          <Row gutter={[16, 16]} justify="end">
            <Col>
              <Space>
                <Button onClick={handleReset}>重置</Button>
                <Button
                  type="primary"
                  onClick={handleStartProcessing}
                  disabled={!state.isValid || state.selectedImages.length === 0 || state.processing}
                >
                  開始處理
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {state.processing && (
          <Card title="處理進度" bordered={false}>
            <Progress percent={state.progress} status="active" />
          </Card>
        )}
      </Space>
    </div>
  );
};

export default CsvValidator;
