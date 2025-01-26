import OpenAI from 'openai';

export interface OpenAITestResult {
  success: boolean;
  error?: string;
}

interface RetryConfig {
  maxRetries: number;
  timeout: number;
}

export class OpenAIService {
  private api: OpenAI | null = null;
  
  private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    timeout: 5000, // 5 seconds
  };

  constructor(apiKey?: string) {
    if (apiKey) {
      this.api = new OpenAI({
        apiKey: apiKey,
        timeout: OpenAIService.DEFAULT_RETRY_CONFIG.timeout,
        dangerouslyAllowBrowser: true,
        defaultHeaders: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  async testConnection(): Promise<OpenAITestResult> {
    if (!this.api) {
      return {
        success: false,
        error: 'API密钥未配置'
      };
    }

    try {
      // 使用简单的聊天完成请求来测试API连接
      const response = await this.api.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'user', 
            content: 'Hi' 
          }
        ],
        max_tokens: 1, // 只需要最小的响应来验证连接
        temperature: 0.3
      });

      // 如果能获取到响应，说明API key有效
      if (response) {
        return {
          success: true
        };
      }

      return {
        success: false,
        error: '无法连接到 OpenAI API'
      };
    } catch (error: any) {
      console.error('OpenAI API test failed:', error);
      
      // 处理特定的 API 错误
      if (error.status === 401) {
        return {
          success: false,
          error: 'API 密钥无效。请检查您的 OpenAI API 密钥并重试。'
        };
      } else if (error.status === 429) {
        return {
          success: false,
          error: '超出速率限制。请稍后重试。'
        };
      } else if (error.message?.includes('API key')) {
        return {
          success: false,
          error: 'API 密钥错误: ' + error.message
        };
      }

      return {
        success: false,
        error: error.message || '未知错误'
      };
    }
  }

  private async withRetry(
    operation: () => Promise<OpenAITestResult>,
    config: RetryConfig = OpenAIService.DEFAULT_RETRY_CONFIG
  ): Promise<OpenAITestResult> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // 如果是验证错误，立即返回，不需要重试
        if (error.response?.status === 401) {
          return {
            success: false,
            error: this.formatError(error)
          };
        }
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < config.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
    }

    return {
      success: false,
      error: this.formatError(lastError)
    };
  }

  private formatError(error: any): string {
    // API密钥相关错误
    if (error.response?.status === 401) {
      return 'API密钥无效';
    }
    if (!error.response && /invalid api key/i.test(error.message)) {
      return 'API密钥格式不正确';
    }

    // 请求限制错误
    if (error.response?.status === 429) {
      return '超出API调用限制';
    }

    // 网络相关错误
    if (error.code === 'ECONNREFUSED') {
      return '网络连接失败';
    }
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
      return '连接超时';
    }
    if (error.code === 'ENOTFOUND') {
      return '无法解析服务器地址';
    }

    // 其他错误
    return error.message || '未知错误';
  }
}
