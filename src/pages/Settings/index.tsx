import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Form, Input, Select, Button, message, Radio, Divider } from 'antd';
import { SettingOutlined, SaveOutlined, ApiOutlined } from '@ant-design/icons';
import { ThemeType, themeOptions } from '../../themes';
import { useSettingsStore } from '../../store/hooks/settings';
import type { Settings } from '../../store/hooks/settings';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { settings, updateSettings } = useSettingsStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 初始化表單
  useEffect(() => {
    form.setFieldsValue({
      theme: settings.theme,
      language: settings.language,
      openaiApiKey: settings.openaiApiKey,
    });
  }, [settings]);

  // 監聽表單變化
  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  // 保存設置
  const handleSave = async (values: Partial<Settings>) => {
    setLoading(true);
    try {
      await updateSettings(values);
      setHasUnsavedChanges(false);
      message.success('設置已保存');
      
      // 如果主題改變了，需要重新載入頁面
      if (values.theme && values.theme !== settings.theme) {
        window.location.reload();
      }
    } catch (error) {
      console.error('保存設置失敗:', error);
      message.error('保存設置失敗');
    } finally {
      setLoading(false);
    }
  };

  // 重置表單
  const handleReset = () => {
    form.setFieldsValue({
      theme: settings.theme,
      language: settings.language,
      openaiApiKey: settings.openaiApiKey,
    });
    setHasUnsavedChanges(false);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space align="center" style={{ marginBottom: 24 }}>
          <SettingOutlined style={{ fontSize: 24 }} />
          <Title level={2} style={{ margin: 0 }}>
            系統設置
          </Title>
        </Space>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          onValuesChange={handleFormChange}
        >
          <Divider orientation="left">基本設置</Divider>
          
          <Form.Item label="界面語言" name="language">
            <Select>
              <Option value="zh_TW">繁體中文</Option>
              <Option value="en">English</Option>
              <Option value="ja">日本語</Option>
            </Select>
          </Form.Item>

          <Form.Item label="界面主題" name="theme">
            <Radio.Group optionType="button" buttonStyle="solid">
              {themeOptions.map(option => (
                <Radio.Button key={option.value} value={option.value}>
                  {option.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          <Divider orientation="left">API 設置</Divider>

          <Form.Item
            label="OpenAI API 密鑰"
            name="openaiApiKey"
            rules={[
              { required: true, message: '請輸入 OpenAI API 密鑰' },
              {
                pattern: /^sk-[A-Za-z0-9]{48}$/,
                message: '請輸入有效的 OpenAI API 密鑰格式',
              },
            ]}
            extra="API 密鑰可以在 OpenAI 網站獲取。格式應該以 'sk-' 開頭，後跟48個字符。"
          >
            <Input.Password
              prefix={<ApiOutlined />}
              placeholder="請輸入您的 OpenAI API 密鑰"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
                disabled={!hasUnsavedChanges}
              >
                保存設置
              </Button>
              {hasUnsavedChanges && (
                <Button onClick={handleReset}>
                  重置更改
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default Settings;
