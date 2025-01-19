import React, { useState } from 'react';
import { Button, Row, Col, Typography, Card, Progress, Alert, Space } from 'antd';
import { CsvUpload } from './components/CsvUpload';
import { CsvRequirements } from './components/CsvRequirements';
import { ValidationErrorsDisplay } from './components/ValidationErrorsDisplay';
import { validateCsvContent } from './utils';
import { CsvValidatorState } from './types';
import { FileIPC, MetadataIPC } from '../../constants/ipc';
import { WriteMetadataResult } from '@/types/metadata';

const { Title } = Typography;

const CsvValidator: React.FC = () => {
  const [state, setState] = useState<CsvValidatorState>({
    isValid: false,
    fileName: '',
    imageDirectory: '',
    directoryImages: [],
    validationErrors: [],
    uploadProgress: 0,
    csvData: [],
    headers: [],
    processing: false,
    progress: 0,
  });

  const handleDirectorySelect = async () => {
    try {
      const directory = await window.electronAPI[FileIPC.SELECT_DIRECTORY]();
      if (!directory) return;

      const images = await window.electronAPI[FileIPC.VALIDATE_IMAGE_DIRECTORY](directory);
      console.log(images,'images')

      setState(prev => ({
        ...prev,
        imageDirectory: directory,
        directoryImages: images,
        validationErrors:
          images.length === 0
            ? [
                {
                  type: 'directory',
                  message: '所選目錄中沒有支持的圖片文件',
                },
              ]
            : [],
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        validationErrors: [
          {
            type: 'directory',
            message: error instanceof Error ? error.message : '選擇目錄時發生錯誤',
          },
        ],
      }));
    }
  };

  const handleCsvUpload = (data: string[][], headers: string[]) => {
    const errors = validateCsvContent(data);

    // 驗證 CSV 中的文件名是否在目錄中存在
    if (state.directoryImages.length > 0) {
      const filenames = new Set(
        data.map(row => {
          return row['Filename'];
        })
      );

      const missingFiles = Array.from(filenames).filter(
        filename => !state.directoryImages.includes(filename)
      );

      if (missingFiles.length > 0) {
        errors.push({
          type: 'file',
          message: `以下文件在目錄中找不到：${missingFiles.join(', ')}`,
        });
      }
    }

    setState(prev => ({
      ...prev,
      csvData: data,
      headers: headers,
      validationErrors: errors,
      isValid: true,
      uploadProgress: 100,
    }));
  };

  const handleStartProcessing = async () => {
    if (!state.isValid || !state.imageDirectory || state.processing) {
      return;
    }

    setState(prev => ({ ...prev, processing: true }));

    try {
      const results: WriteMetadataResult = await window.electronAPI[MetadataIPC.METADATA_WRITE](
        String(state.imageDirectory),
        state.csvData.map(row => ({
          Filename: row['Filename'],
          Title: row['Title'],
          Description: row['Description'],
          Keywords: row['Keywords'],
        }))
      );
      console.log(results,'results')

      const errors =
        results
          ?.filter(r => !r.success)
          ?.map(r => ({
            type: 'file' as const,
            message: `處理 ${r.Filename} 失敗: ${r.error}`,
          })) || [];

      setState(prev => ({
        ...prev,
        processing: false,
        validationErrors: errors,
        progress: 100,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        processing: false,
        validationErrors: [
          {
            type: 'file',
            message: error instanceof Error ? error.message : '處理過程中發生錯誤',
          },
        ],
      }));
    }
  };

  const handleError = (error: Error) => {
    setState(prev => ({
      ...prev,
      validationErrors: [
        {
          type: 'file',
          message: error.message,
        },
      ],
      isValid: false,
      uploadProgress: 0,
    }));
  };

  const handleProgress = (progress: number) => {
    setState(prev => ({
      ...prev,
      uploadProgress: progress,
    }));
  };

  const handleReset = () => {
    setState({
      isValid: false,
      fileName: '',
      imageDirectory: '',
      directoryImages: [],
      validationErrors: [],
      uploadProgress: 0,
      csvData: [],
      headers: [],
      processing: false,
      progress: 0,
    });
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={4}>CSV 元數據寫入工具</Title>

        <div>
          <Button type="primary" onClick={handleDirectorySelect} disabled={state.processing}>
            選擇圖片目錄
          </Button>
          {state.imageDirectory && (
            <div style={{ marginTop: '8px' }}>
              已選擇目錄: {state.imageDirectory}
              <br />
              找到 {state.directoryImages.length} 個圖片文件
            </div>
          )}
        </div>

        <CsvRequirements />

        <CsvUpload
          onUpload={handleCsvUpload}
          onError={handleError}
          onProgress={handleProgress}
          progress={state.uploadProgress}
        />

        {state.validationErrors.length > 0 && (
          <ValidationErrorsDisplay errors={state.validationErrors} />
        )}

        <Space>
          <Button
            type="primary"
            onClick={handleStartProcessing}
            disabled={!state.isValid || !state.imageDirectory || state.processing}
          >
            開始處理
          </Button>
          <Button onClick={handleReset} disabled={state.processing}>
            重置
          </Button>
        </Space>

        {state.processing && <Progress percent={state.progress} status="active" />}
      </Space>
    </Card>
  );
};

export default CsvValidator;
