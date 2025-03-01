import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Radio, Select, Space, Typography, Card } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import { Password } from './StyledComponents';
import { useOpenAITest } from '../hooks/useOpenAITest';
import { useOpenRouterTest } from '../hooks/useOpenRouterTest';
import { OpenRouterModel } from '../services/openrouter';

const { Text } = Typography;

interface APISettingsProps {
  onTestOpenAI: () => void;
  onTestOpenRouter: () => void;
  openAITestStatus: {
    testing: boolean;
    result?: {
      success: boolean;
      error?: string;
    };
  };
  openRouterTestStatus: {
    testing: boolean;
    result?: {
      success: boolean;
      error?: string;
      models?: OpenRouterModel[];
    };
  };
  models: OpenRouterModel[];
  selectedApiProvider: string;
  onApiProviderChange: (provider: 'openai' | 'openrouter') => void;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const APISettings: React.FC<APISettingsProps> = ({
  onTestOpenAI,
  onTestOpenRouter,
  openAITestStatus,
  openRouterTestStatus,
  models,
  selectedApiProvider,
  onApiProviderChange,
  selectedModel,
  onModelChange,
}) => {
  return (
    <>
      <Form.Item
        label="API 提供者"
        name="apiProvider"
        extra="選擇您想使用的 AI API 提供者"
      >
        <Radio.Group 
          onChange={(e) => onApiProviderChange(e.target.value)} 
          value={selectedApiProvider}
        >
          <Radio value="openai">OpenAI</Radio>
          <Radio value="openrouter">OpenRouter</Radio>
        </Radio.Group>
      </Form.Item>

      {selectedApiProvider === 'openai' ? (
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
                  onClick={onTestOpenAI}
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
            extra="可選項：用於AI分析功能。API 密鑰可以在 OpenRouter 網站獲取。"
            rules={[
              {
                required: true,
                message: '請輸入 OpenRouter API 密鑰',
              }
            ]}
          >
            <Password
              prefix={<ApiOutlined />}
              placeholder="請輸入您的 OpenRouter API 密鑰"
              addonAfter={
                <Button
                  type="text"
                  block={true}
                  onClick={onTestOpenRouter}
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

          <Form.Item
            label="選擇模型"
            name="selectedModel"
            extra="選擇您想使用的 AI 模型"
          >
            {models.length > 0 ? (
              <Select
                placeholder="請選擇模型"
                style={{ width: '100%' }}
                onChange={onModelChange}
                value={selectedModel || undefined}
                options={models.map(model => ({
                  label: model.name,
                  value: model.id,
                }))}
                showSearch
                filterOption={(input, option) => 
                  (option?.label?.toString().toLowerCase() || '').includes(input.toLowerCase()) ||
                  (option?.value?.toString().toLowerCase() || '').includes(input.toLowerCase())
                }
                optionRender={(option) => {
                  const model = models.find(m => m.id === option.value);
                  return (
                    <Space direction="vertical" size="small">
                      <Text strong>{model?.name}</Text>
                      {model?.description && <Text type="secondary">{model.description}</Text>}
                    </Space>
                  );
                }}
              />
            ) : (
              <div>
                {selectedModel ? (
                  <Alert
                    type="info"
                    message={
                      <>
                        <div>已選擇模型 ID: <Text code>{selectedModel}</Text></div>
                        <div>請測試 API 連接以獲取模型詳細信息</div>
                      </>
                    }
                  />
                ) : (
                  <Alert
                    type="info"
                    message="請先測試 API 連接以獲取可用模型"
                  />
                )}
              </div>
            )}
          </Form.Item>

          {/* 顯示已選擇模型的詳細信息 */}
          {selectedModel && models.length > 0 && (
            <Form.Item label="模型詳情">
              {(() => {
                const selectedModelInfo = models.find(m => m.id === selectedModel);
                if (!selectedModelInfo) return null;
                
                return (
                  <Card size="small" style={{ marginBottom: 0 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>模型名稱：</Text> {selectedModelInfo.name}
                      </div>
                      {selectedModelInfo.description && (
                        <div>
                          <Text strong>描述：</Text> {selectedModelInfo.description}
                        </div>
                      )}
                      {selectedModelInfo.context_length && (
                        <div>
                          <Text strong>上下文長度：</Text> {selectedModelInfo.context_length} tokens
                        </div>
                      )}
                      {selectedModelInfo.pricing && (
                        <div>
                          <Text strong>價格：</Text> 
                          輸入 ${selectedModelInfo.pricing.prompt} / 輸出 ${selectedModelInfo.pricing.completion} (每1K tokens)
                        </div>
                      )}
                    </Space>
                  </Card>
                );
              })()}
            </Form.Item>
          )}
        </>
      )}
    </>
  );
};

export default APISettings;
