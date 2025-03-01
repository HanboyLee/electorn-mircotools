import axios from 'axios';
import { AnalysisResult } from '../types';

function convertToWebP(file: File, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0, img.width, img.height);

        // 設定 WebP 品質
        const base64String = canvas.toDataURL('image/webp', quality);
        resolve(base64String);
      };

      img.onerror = error => reject(error);
    };

    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function analyzeImageWithOpenRouter(file: File, apiKey: string, modelId: string): Promise<AnalysisResult> {
  try {
    // 轉換圖片為 WebP 格式
    const dataUrl = await convertToWebP(file, 0.7);

    console.log('正在發送 OpenRouter API 請求...');
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelId,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and provide a title, description, and keywords in JSON format.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                  detail: 'low',
                },
              },
            ],
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Metadata Desktop',
        },
      }
    );

    console.log('OpenRouter API 響應:', response.data);

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('OpenRouter 返回的響應無效');
    }

    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);

    if (!result.title || !result.description || !result.keywords) {
      throw new Error('響應結構無效');
    }

    return result;
  } catch (error: any) {
    console.error('分析圖片時出錯:', error);

    // 處理特定的 API 錯誤
    if (error.response?.status === 401) {
      throw new Error('API 密鑰無效。請檢查您的 OpenRouter API 密鑰並重試。');
    } else if (error.response?.status === 429) {
      throw new Error('超出速率限制。請稍後重試。');
    } else if (error.message?.includes('API key')) {
      throw new Error('API 密鑰錯誤: ' + error.message);
    }

    throw new Error(error.response?.data?.error?.message || error.message || '分析圖片失敗');
  }
}
