import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Form, Button, message, Divider } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import { useSettingsStore } from '@/hooks/SettingsStore';
import type { Settings } from '@/hooks/SettingsStore';
import { useOpenAITest } from './hooks/useOpenAITest';
import { isEqual } from 'lodash';
import BasicSettings from './components/BasicSettings';
import APISettings from './components/APISettings';

const { Title } = Typography;

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { settings, updateSettings } = useSettingsStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { status: testStatus, testConnection } = useOpenAITest();

  // 監聽表單變化
  const handleFormChange = (changedValues: any) => {
    console.log('Form values changed:', changedValues);
    checkFormChanges();
  };

  // 检查表单值是否有变化
  const checkFormChanges = () => {
    const currentValues = form.getFieldsValue();
    const hasChanges = !isEqual(currentValues, settings);
    setHasUnsavedChanges(hasChanges);
  };

  // 保存設置
  const handleSave = async (values: Partial<Settings>) => {
    console.log('Saving settings:', values);
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
    form.setFieldsValue(settings);
    setHasUnsavedChanges(false);
  };

  // 測試API連接
  const handleTestConnection = async () => {
    const currentApiKey = form.getFieldValue('openaiApiKey');
    if (!currentApiKey?.trim()) {
      message.warning('請先輸入API密鑰');
      return;
    }

    const result = await testConnection(currentApiKey);
    if (result?.success) {
      message.success('API連接測試成功！');
    }
  };

  // 当settings变化时更新表单
  useEffect(() => {
    console.log('Settings changed, updating form:', settings);
    form.setFieldsValue(settings);
  }, [settings, form]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space align="center" style={{ marginBottom: 24 }}>
          <SettingOutlined style={{ fontSize: 24 }} />
          <Title level={2} style={{ margin: 0 }}>
            系統設置
          </Title>
        </Space>

        <Form form={form} layout="vertical" onFinish={handleSave} onValuesChange={handleFormChange}>
          <BasicSettings />

          <Divider orientation="left">API 設置</Divider>
          <APISettings onTestConnection={handleTestConnection} testStatus={testStatus} />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                保存設置
              </Button>
              {hasUnsavedChanges && <Button onClick={handleReset}>重置更改</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default Settings;
