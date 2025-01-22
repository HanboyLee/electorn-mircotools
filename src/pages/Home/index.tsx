import React, { useState } from 'react';
import { Typography, Card, Space, Input, Button, Alert, Divider } from 'antd';
import {
  FileTextOutlined,
  ReadOutlined,
  SaveOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { FileIPC } from '../../constants/ipc';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface Result {
  success: boolean;
  message: string;
}

interface SystemInfo {
  platform: string;
  version: string;
  electronVersion: string;
}

const Home: React.FC = () => {
  const [testContent, setTestContent] = useState('');
  const [testFilePath, setTestFilePath] = useState(
    '/Users/douzi/Documents/產品文檔/csv寫入圖片metadata/image_analysis_2024-12-02.csv'
  );
  const [result, setResult] = useState<Result | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  const handleTestFileWrite = async () => {
    try {
      const api = window.electronAPI;
      await api[FileIPC.WRITE](testFilePath, testContent);
      setResult({ success: true, message: '文件寫入成功！' });
    } catch (error) {
      setResult({ success: false, message: `文件寫入失敗：${error.message}` });
    }
  };

  const handleTestFileRead = async () => {
    try {
      const api = window.electronAPI;
      const content = await api[FileIPC.READ](testFilePath);
      setTestContent(content);
      setResult({ success: true, message: '文件讀取成功！' });
    } catch (error) {
      setResult({ success: false, message: `文件讀取失敗：${error.message}` });
    }
  };

  const handleGetSystemInfo = async () => {
    try {
      const api = window.electronAPI;
      const info = (await api.getSystemInfo()) as SystemInfo;
      setSystemInfo(info);
      setResult({ success: true, message: '系統信息獲取成功！' });
    } catch (error) {
      setResult({ success: false, message: `系統信息獲取失敗：${error.message}` });
    }
  };

  return (
    <Card>
      <Title level={4}>功能說明</Title>
      <Paragraph>這個頁面提供了一個測試面板，用於測試基本的文件操作和系統信息獲取功能：</Paragraph>
      <ul>
        <li>
          <Text>文件讀寫：測試文件的讀取和寫入功能</Text>
        </li>
        <li>
          <Text>系統信息：獲取當前系統的基本信息</Text>
        </li>
      </ul>
      <Divider />

      <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 24 }}>
        <Input
          placeholder="文件路徑"
          value={testFilePath}
          onChange={e => setTestFilePath(e.target.value)}
          prefix={<FileTextOutlined />}
        />

        <TextArea
          placeholder="文件內容"
          rows={4}
          value={testContent}
          onChange={e => setTestContent(e.target.value)}
        />

        <Space>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleTestFileWrite}>
            測試寫入文件
          </Button>
          <Button type="default" icon={<ReadOutlined />} onClick={handleTestFileRead}>
            測試讀取文件
          </Button>
          <Button type="default" icon={<InfoCircleOutlined />} onClick={handleGetSystemInfo}>
            獲取系統信息
          </Button>
        </Space>

        {result && (
          <Alert message={result.message} type={result.success ? 'success' : 'error'} showIcon />
        )}

        {systemInfo && (
          <Card size="small" title="系統信息">
            <Space direction="vertical">
              <Text>平台：{systemInfo.platform}</Text>
              <Text>版本：{systemInfo.version}</Text>
              <Text>Electron版本：{systemInfo.electronVersion}</Text>
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
};

export default Home;
