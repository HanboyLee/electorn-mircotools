import React, { useState } from 'react';
import { Button, Card, Space, Typography, Upload, message, Spin, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { AnalysisResults } from './components/AnalysisResults';
import { analyzeImage } from './services/openai';
import { exportToCsv } from './utils/csv';
import { useSettingsStore } from '../../store/hooks/settings';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// 用於追蹤已經顯示過警告的文件名（移到組件外部以保持狀態）
const warnedFiles = new Set<string>();

export default function Page() {
  const { settings } = useSettingsStore();
  const navigate = useNavigate();
  const [state, setState] = useState({
    analyzing: false,
    selectedFiles: [] as File[],
    results: {} as Record<string, any>,
    errors: {} as Record<string, string | undefined>,
  });

  const handleFileSelect = (info: any) => {
    if (info.file.status !== 'removed') {
      // 檢查是否有重複文件名
      const newFileList = info.fileList.reduce((acc: UploadFile[], current: UploadFile) => {
        const isDuplicate = acc.some(file => file.name === current.name);
        if (isDuplicate && !warnedFiles.has(current.name)) {
          message.warning(`文件 "${current.name}" 已存在，已自動跳過`);
          warnedFiles.add(current.name);
          return acc;
        }
        if (!isDuplicate) {
          return [...acc, current];
        }
        return acc;
      }, []);

      // 更新 fileList 以移除重複項
      info.fileList = newFileList;

      setState(prev => ({
        ...prev,
        selectedFiles: newFileList.map((file: UploadFile) => file.originFileObj),
        results: {},
        errors: {},
      }));
    }
  };

  const handleAnalyze = async () => {
    if (!settings.openaiApiKey) {
      message.error('請先在設置頁面配置 OpenAI API 密鑰');
      navigate('/settings');
      return;
    }

    if (!settings.openaiApiKey.startsWith('sk-')) {
      message.error('無效的 OpenAI API 密鑰格式，請在設置頁面重新配置');
      navigate('/settings');
      return;
    }

    setState(prev => ({ ...prev, analyzing: true }));

    for (const file of state.selectedFiles) {
      try {
        console.log(`正在分析 ${file.name}...`);
        const result = await analyzeImage(file, settings.openaiApiKey);
        setState(prev => ({
          ...prev,
          results: { ...prev.results, [file.name]: result },
          errors: { ...prev.errors, [file.name]: undefined },
        }));
      } catch (error: any) {
        console.error(`分析 ${file.name} 時出錯:`, error);
        setState(prev => ({
          ...prev,
          results: { ...prev.results, [file.name]: null },
          errors: { ...prev.errors, [file.name]: error.message },
        }));
      }
    }

    setState(prev => ({ ...prev, analyzing: false }));
  };

  const handleExportCsv = () => {
    try {
      exportToCsv(state.results);
      message.success('CSV 導出成功');
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const transformToRcFile = (file: File): UploadFile => ({
    uid: file.name, // 你可以用 file.lastModified 來保證唯一性
    name: file.name,
    status: 'done',
    url: URL.createObjectURL(file),
    originFileObj: file as any, // 強制轉型為 RcFile
  });

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={4}>CSV 元數據寫入工具</Title>

        {!settings.openaiApiKey && (
          <Alert
            type="warning"
            message="未配置 OpenAI API 密鑰"
            description={
              <Space direction="vertical">
                <Text>請先在設置頁面配置您的 OpenAI API 密鑰</Text>
                <Button type="primary" onClick={() => navigate('/settings')}>
                  前往設置
                </Button>
              </Space>
            }
          />
        )}

        <Space>
          <Button
            type="primary"
            onClick={handleAnalyze}
            loading={state.analyzing}
            disabled={state.selectedFiles.length === 0 || !settings.openaiApiKey}
          >
            {state.analyzing ? '分析中...' : '開始分析'}
          </Button>
          <Button onClick={handleExportCsv} disabled={Object.keys(state.results).length === 0}>
            導出 CSV
          </Button>
        </Space>

        <div style={{ width: '100%', marginTop: 16 }}>
          <Upload
            accept="image/*"
            multiple
            beforeUpload={() => false}
            onChange={handleFileSelect}
            showUploadList={{
              showRemoveIcon: true,
              showPreviewIcon: true,
            }}
            listType="picture-card"
            fileList={state.selectedFiles.map(transformToRcFile)}
          >
            <div
              style={{
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <UploadOutlined style={{ fontSize: 24, color: '#666' }} />
              <div style={{ color: '#666' }}>選擇圖片</div>
            </div>
          </Upload>
        </div>

        {state.analyzing && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <Text style={{ marginLeft: 8 }}>正在分析圖片...</Text>
          </div>
        )}

        <AnalysisResults results={state.results} errors={state.errors} />
      </Space>
    </Card>
  );
}
