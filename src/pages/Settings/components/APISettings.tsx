import React from 'react';
import { Form, Button, Alert } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import { Password } from './StyledComponents';
import { useOpenAITest } from '../hooks/useOpenAITest';

interface APISettingsProps {
  onTestConnection: () => void;
  testStatus: {
    testing: boolean;
    result?: {
      success: boolean;
      error?: string;
    };
  };
}

const APISettings: React.FC<APISettingsProps> = ({
  onTestConnection,
  testStatus,
}) => {
  return (
    <>
      <Form.Item
        label="OpenAI API 密鑰"
        name="openaiApiKey"
        extra="可選項：用於AI分析功能。API 密鑰可以在 OpenAI 網站獲取。"
        rules={[
          {
            pattern: /^$|^sk-[A-Za-z0-9]{48}$/,
            message: '請輸入有效的 OpenAI API 密鑰格式 (以sk-開頭，後跟48個字符)',
          }
        ]}
      >
        <Password
          prefix={<ApiOutlined />}
          placeholder="請輸入您的 OpenAI API 密鑰"
          addonAfter={
            <Button
              type="text"
              block={true}
              onClick={onTestConnection}
              loading={testStatus.testing}
            >
              測試連接
            </Button>
          }
        />
      </Form.Item>

      {testStatus.result && (
        <Form.Item>
          <Alert
            type={testStatus.result.success ? 'success' : 'error'}
            message={
              testStatus.result.success
                ? 'API連接正常'
                : `連接失敗: ${testStatus.result.error}`
            }
            showIcon
            closable
          />
        </Form.Item>
      )}
    </>
  );
};

export default APISettings;
