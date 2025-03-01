import axios from 'axios';
import { OpenRouterModelInfo } from '@/hooks/SettingsStore/types';

export interface OpenRouterTestResult {
  success: boolean;
  error?: string;
  models?: OpenRouterModelInfo[];
}

// 為了向後兼容，保留這個類型別名
export type OpenRouterModel = OpenRouterModelInfo;

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async testConnection(): Promise<OpenRouterTestResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API密鑰未配置'
      };
    }

    try {
      // 獲取可用模型列表來測試API連接
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // 如果能獲取到模型列表，說明API key有效
      if (response.data && response.data.data) {
        const models = response.data.data.map((model: any) => ({
          id: model.id,
          name: model.name || model.id,
          description: model.description,
          context_length: model.context_length,
          pricing: model.pricing
        }));

        return {
          success: true,
          models
        };
      }

      return {
        success: false,
        error: '無法連接到 OpenRouter API'
      };
    } catch (error: any) {
      console.error('OpenRouter API test failed:', error);
      
      // 處理特定的 API 錯誤
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'API 密鑰無效。請檢查您的 OpenRouter API 密鑰並重試。'
        };
      } else if (error.response?.status === 429) {
        return {
          success: false,
          error: '超出速率限制。請稍後重試。'
        };
      }

      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || '未知錯誤'
      };
    }
  }

  async chatCompletion(model: string, messages: any[]): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('OpenRouter chat completion failed:', error);
      throw error;
    }
  }
}
