import React, { useEffect, useMemo, useState } from 'react';
import {
  Form,
  Button,
  Alert,
  Select,
  Space,
  Typography,
  Card,
  Segmented,
  App,
  theme,
  Badge,
} from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import { isEqual } from 'lodash';
import styled from 'styled-components';
import { useSettingsStore } from '@/hooks/SettingsStore';
import { Password } from './StyledComponents';
import TabSaveBar from './TabSaveBar';
import { useOpenAITest } from '../hooks/useOpenAITest';
import { useOpenRouterTest } from '../hooks/useOpenRouterTest';

const { Text } = Typography;

export interface APISettingsTabProps {
  onDirtyChange?: (dirty: boolean) => void;
}

type ApiProvider = 'openai' | 'openrouter';

type ApiFormValues = {
  apiProvider: ApiProvider;
  openaiApiKey?: string;
  openrouterApiKey?: string;
  selectedModel?: string;
};

function pickApi(settings: {
  apiProvider?: string;
  openaiApiKey?: string;
  openrouterApiKey?: string;
  selectedModel?: string;
}): ApiFormValues {
  return {
    apiProvider: (settings.apiProvider as ApiProvider) || 'openai',
    openaiApiKey: settings.openaiApiKey || '',
    openrouterApiKey: settings.openrouterApiKey || '',
    selectedModel: settings.selectedModel || '',
  };
}

function normalizeApi(values: Partial<ApiFormValues> | undefined): ApiFormValues {
  return {
    apiProvider: values?.apiProvider || 'openai',
    openaiApiKey: values?.openaiApiKey || '',
    openrouterApiKey: values?.openrouterApiKey || '',
    selectedModel: values?.selectedModel || '',
  };
}

const APISettingsTab: React.FC<APISettingsTabProps> = ({ onDirtyChange }) => {
  const [form] = Form.useForm<ApiFormValues>();
  const { settings, updateSettings } = useSettingsStore();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);

  const { status: openAITestStatus, testConnection: testOpenAIConnection } = useOpenAITest();
  const {
    status: openRouterTestStatus,
    models,
    testConnection: testOpenRouterConnection,
  } = useOpenRouterTest();

  const synced = useMemo(
    () => pickApi(settings),
    // only re-sync when API fields change (not savedModels etc.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      settings.apiProvider,
      settings.openaiApiKey,
      settings.openrouterApiKey,
      settings.selectedModel,
    ]
  );

  const watched = Form.useWatch([], form) as ApiFormValues | undefined;
  const provider = (watched?.apiProvider || synced.apiProvider) as ApiProvider;
  const selectedModelId = watched?.selectedModel;
  const watchedOpenAIKey = watched?.openaiApiKey;
  const watchedOpenRouterKey = watched?.openrouterApiKey;

  const dirty = useMemo(() => {
    if (!watched) return false;
    return !isEqual(normalizeApi(watched), synced);
  }, [watched, synced]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    form.setFieldsValue(synced);
  }, [form, synced]);

  const readinessLive = useMemo(() => {
    if (provider === 'openai') {
      const key = watchedOpenAIKey || '';
      if (!String(key).trim()) {
        return { status: 'default' as const, text: '未配置', hint: '請填寫 API 密鑰' };
      }
      if (openAITestStatus.result?.success) {
        return { status: 'success' as const, text: '連接正常', hint: 'OpenAI' };
      }
      if (openAITestStatus.result && !openAITestStatus.result.success) {
        return { status: 'error' as const, text: '連接失敗', hint: openAITestStatus.result.error };
      }
      return { status: 'warning' as const, text: '已填寫未測試', hint: '建議測試連接' };
    }
    const key = watchedOpenRouterKey || '';
    if (!String(key).trim()) {
      return { status: 'default' as const, text: '未配置', hint: '請填寫 API 密鑰' };
    }
    if (openRouterTestStatus.result?.success) {
      return {
        status: 'success' as const,
        text: '連接正常',
        hint: selectedModelId || 'OpenRouter',
      };
    }
    if (openRouterTestStatus.result && !openRouterTestStatus.result.success) {
      return {
        status: 'error' as const,
        text: '連接失敗',
        hint: openRouterTestStatus.result.error,
      };
    }
    return { status: 'warning' as const, text: '已填寫未測試', hint: '建議測試連接' };
  }, [
    provider,
    watchedOpenAIKey,
    watchedOpenRouterKey,
    selectedModelId,
    openAITestStatus.result,
    openRouterTestStatus.result,
  ]);

  const handleTestOpenAI = async () => {
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

  const handleTestOpenRouter = async () => {
    const currentApiKey = form.getFieldValue('openrouterApiKey');
    if (!currentApiKey?.trim()) {
      message.warning('請先輸入 OpenRouter API 密鑰');
      return;
    }
    const result = await testOpenRouterConnection(currentApiKey);
    if (result?.success) {
      message.success('OpenRouter API 連接測試成功！');
      if (result.models && result.models.length > 0 && !form.getFieldValue('selectedModel')) {
        form.setFieldsValue({ selectedModel: result.models[0].id });
      }
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await updateSettings({
        apiProvider: values.apiProvider,
        openaiApiKey: values.openaiApiKey || '',
        openrouterApiKey: values.openrouterApiKey || '',
        selectedModel: values.selectedModel || '',
      });
      message.success('AI 設置已保存');
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
      console.error('保存 AI 設置失敗:', error);
      message.error('保存 AI 設置失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(synced);
  };

  const selectedModelInfo = models.find(m => m.id === selectedModelId);

  return (
    <Wrap>
      <SectionDesc style={{ color: token.colorTextSecondary }}>
        配置 LLM 圖片分析所用的 API。密鑰僅保存在本機。
      </SectionDesc>

      <StatusLine>
        <Badge status={readinessLive.status} text={readinessLive.text} />
        {readinessLive.hint && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {readinessLive.hint}
          </Text>
        )}
      </StatusLine>

      <Panel style={{ background: token.colorBgContainer, borderColor: token.colorBorderSecondary }}>
        <Form form={form} layout="vertical" initialValues={synced}>
          <Form.Item label="API 提供者" name="apiProvider">
            <Segmented
              options={[
                { label: 'OpenAI', value: 'openai' },
                { label: 'OpenRouter', value: 'openrouter' },
              ]}
            />
          </Form.Item>

          {provider === 'openai' ? (
            <>
              <Form.Item
                label="OpenAI API 密鑰"
                name="openaiApiKey"
                extra="可選。用於 AI 分析功能；可在 OpenAI 網站取得密鑰。"
                rules={[
                  {
                    validator: async (_, value) => {
                      if (!value || !String(value).trim()) return;
                      const v = String(value).trim();
                      if (v.length < 10) {
                        throw new Error('API 密鑰格式似乎過短，請檢查');
                      }
                    },
                  },
                ]}
              >
                <Password
                  prefix={<ApiOutlined />}
                  placeholder="請輸入您的 OpenAI API 密鑰"
                  addonAfter={
                    <Button
                      type="text"
                      block
                      onClick={handleTestOpenAI}
                      loading={openAITestStatus.testing}
                    >
                      測試連接
                    </Button>
                  }
                />
              </Form.Item>

              {openAITestStatus.result && (
                <Form.Item>
                  <Alert
                    type={openAITestStatus.result.success ? 'success' : 'error'}
                    message={
                      openAITestStatus.result.success
                        ? 'OpenAI API 連接正常'
                        : `連接失敗: ${openAITestStatus.result.error}`
                    }
                    showIcon
                    closable
                  />
                </Form.Item>
              )}
            </>
          ) : (
            <>
              <Form.Item
                label="OpenRouter API 密鑰"
                name="openrouterApiKey"
                extra="用於 AI 分析功能；可在 OpenRouter 網站取得密鑰。"
                rules={[
                  {
                    required: true,
                    message: '請輸入 OpenRouter API 密鑰',
                  },
                ]}
              >
                <Password
                  prefix={<ApiOutlined />}
                  placeholder="請輸入您的 OpenRouter API 密鑰"
                  addonAfter={
                    <Button
                      type="text"
                      block
                      onClick={handleTestOpenRouter}
                      loading={openRouterTestStatus.testing}
                    >
                      測試連接
                    </Button>
                  }
                />
              </Form.Item>

              {openRouterTestStatus.result && (
                <Form.Item>
                  <Alert
                    type={openRouterTestStatus.result.success ? 'success' : 'error'}
                    message={
                      openRouterTestStatus.result.success
                        ? 'OpenRouter API 連接正常'
                        : `連接失敗: ${openRouterTestStatus.result.error}`
                    }
                    showIcon
                    closable
                  />
                </Form.Item>
              )}

              <Form.Item label="選擇模型" name="selectedModel" extra="選擇您想使用的 AI 模型">
                {models.length > 0 ? (
                  <Select
                    placeholder="請選擇模型"
                    style={{ width: '100%' }}
                    showSearch
                    options={models.map(model => ({
                      label: model.name,
                      value: model.id,
                    }))}
                    filterOption={(input, option) =>
                      (option?.label?.toString().toLowerCase() || '').includes(
                        input.toLowerCase()
                      ) ||
                      (option?.value?.toString().toLowerCase() || '').includes(input.toLowerCase())
                    }
                    optionRender={option => {
                      const model = models.find(m => m.id === option.value);
                      return (
                        <Space direction="vertical" size={0}>
                          <Text strong>{model?.name}</Text>
                          {model?.description && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {model.description}
                            </Text>
                          )}
                        </Space>
                      );
                    }}
                  />
                ) : (
                  <Alert
                    type="info"
                    showIcon
                    message={
                      selectedModelId
                        ? `已選擇模型 ID: ${selectedModelId}。請測試 API 連接以獲取模型詳細信息`
                        : '請先測試 API 連接以獲取可用模型'
                    }
                  />
                )}
              </Form.Item>

              {selectedModelInfo && (
                <Form.Item label="模型詳情">
                  <Card size="small">
                    <Space direction="vertical" style={{ width: '100%' }} size={4}>
                      <div>
                        <Text strong>模型名稱：</Text> {selectedModelInfo.name}
                      </div>
                      {selectedModelInfo.description && (
                        <div>
                          <Text strong>描述：</Text> {selectedModelInfo.description}
                        </div>
                      )}
                      {selectedModelInfo.context_length != null && (
                        <div>
                          <Text strong>上下文長度：</Text> {selectedModelInfo.context_length}{' '}
                          tokens
                        </div>
                      )}
                      {selectedModelInfo.pricing && (
                        <div>
                          <Text strong>價格：</Text>
                          輸入 ${selectedModelInfo.pricing.prompt} / 輸出 $
                          {selectedModelInfo.pricing.completion}（每 1K tokens）
                        </div>
                      )}
                    </Space>
                  </Card>
                </Form.Item>
              )}
            </>
          )}
        </Form>
      </Panel>

      <TabSaveBar dirty={dirty} loading={loading} onSave={handleSave} onReset={handleReset} />
    </Wrap>
  );
};

export default APISettingsTab;

const Wrap = styled.div`
  max-width: 720px;
`;

const SectionDesc = styled.p`
  font-size: 12px;
  line-height: 1.5;
  margin: 0 0 12px;
`;

const StatusLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  min-height: 22px;
`;

const Panel = styled.div`
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;
