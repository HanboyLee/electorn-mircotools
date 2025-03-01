import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Form, Button, message, Collapse, theme } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import { useSettingsStore } from '@/hooks/SettingsStore';
import type { Settings } from '@/hooks/SettingsStore';
import { useOpenAITest } from './hooks/useOpenAITest';
import { useOpenRouterTest } from './hooks/useOpenRouterTest';
import { isEqual } from 'lodash';
import BasicSettings from './components/BasicSettings';
import APISettings from './components/APISettings';

const { Title } = Typography;
const { Panel } = Collapse;

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { settings, updateSettings } = useSettingsStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { status: openAITestStatus, testConnection: testOpenAIConnection } = useOpenAITest();
  const { status: openRouterTestStatus, models, testConnection: testOpenRouterConnection } = useOpenRouterTest();
  const [selectedApiProvider, setSelectedApiProvider] = useState<'openai' | 'openrouter'>(settings.apiProvider || 'openai');
  const [selectedModel, setSelectedModel] = useState<string>(settings.selectedModel || '');

  // 監聽表單變化
  const handleFormChange = (changedValues: any) => {
    console.log('Form values changed:', changedValues);
    
    // 如果 API 提供者改變，更新選擇的提供者
    if (changedValues.apiProvider) {
      setSelectedApiProvider(changedValues.apiProvider);
    }
    
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
      // 確保更新 selectedModel
      if (selectedApiProvider === 'openrouter' && selectedModel) {
        values.selectedModel = selectedModel;
      }
      
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
    setSelectedApiProvider(settings.apiProvider || 'openai');
    setSelectedModel(settings.selectedModel || '');
    setHasUnsavedChanges(false);
  };

  // 測試 OpenAI API 連接
  const handleTestOpenAIConnection = async () => {
    const currentApiKey = form.getFieldValue('openaiApiKey');
    if (!currentApiKey?.trim()) {
      message.warning('請先輸入 OpenAI API 密鑰');
      return;
    }

    const result = await testOpenAIConnection(currentApiKey);
    if (result?.success) {
      message.success('OpenAI API 連接測試成功！');
    }
  };

  // 測試 OpenRouter API 連接
  const handleTestOpenRouterConnection = async () => {
    const currentApiKey = form.getFieldValue('openrouterApiKey');
    if (!currentApiKey?.trim()) {
      message.warning('請先輸入 OpenRouter API 密鑰');
      return;
    }

    const result = await testOpenRouterConnection(currentApiKey);
    if (result?.success) {
      message.success('OpenRouter API 連接測試成功！');
      
      // 如果有可用模型，自動選擇第一個
      if (result.models && result.models.length > 0 && !selectedModel) {
        setSelectedModel(result.models[0].id);
        form.setFieldsValue({ selectedModel: result.models[0].id });
      }
    }
  };

  // 處理 API 提供者變更
  const handleApiProviderChange = (provider: 'openai' | 'openrouter') => {
    setSelectedApiProvider(provider);
    form.setFieldsValue({ apiProvider: provider });
  };

  // 處理模型變更
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    form.setFieldsValue({ selectedModel: modelId });
  };

  // 当settings变化时更新表单
  useEffect(() => {
    console.log('Settings changed, updating form:', settings);
    form.setFieldsValue(settings);
    setSelectedApiProvider(settings.apiProvider || 'openai');
    setSelectedModel(settings.selectedModel || '');
  }, [settings, form]);

  // 獲取主題顏色
  const { token } = theme.useToken();

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
          <Collapse 
            defaultActiveKey={['basic', 'api']} 
            accordion={false} 
            style={{ marginBottom: 24 }}
            bordered={false}
            expandIconPosition="end"
          >
            <Panel 
              header={<Title level={4} style={{ margin: 0 }}>基本設置</Title>} 
              key="basic"
              style={{ backgroundColor: token.colorBgContainer }}
            >
              <BasicSettings />
            </Panel>
            
            <Panel 
              header={<Title level={4} style={{ margin: 0 }}>API 設置</Title>} 
              key="api"
              style={{ backgroundColor: token.colorBgContainer }}
            >
              <APISettings 
                onTestOpenAI={handleTestOpenAIConnection} 
                onTestOpenRouter={handleTestOpenRouterConnection}
                openAITestStatus={openAITestStatus} 
                openRouterTestStatus={openRouterTestStatus}
                models={models}
                selectedApiProvider={selectedApiProvider}
                onApiProviderChange={handleApiProviderChange}
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
              />
            </Panel>
          </Collapse>

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
