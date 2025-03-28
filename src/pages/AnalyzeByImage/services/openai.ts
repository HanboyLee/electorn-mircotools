import OpenAI from 'openai';
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

export async function analyzeImage(file: File, apiKey: string, prompt?: string): Promise<AnalysisResult> {
  try {
    // 使用 FileReader 讀取文件

    const dataUrl = await convertToWebP(file, 0.7);

    const client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
    });

    console.log('正在發送 OpenAI API 請求...');
    console.log('使用的提示詞:', prompt || 'Analyze this image and provide a title, description, and keywords in JSON format.');
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt || 'Analyze this image and provide a title, description, and keywords in JSON format.',
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
    });

    console.log('OpenAI API 響應:', response);

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('OpenAI 返回的響應無效');
    }

    const content = response.choices[0].message.content;
    const result = JSON.parse(content);

    if (!result.title || !result.description || !result.keywords) {
      throw new Error('響應結構無效');
    }

    return result;
  } catch (error: any) {
    console.error('分析圖片時出錯:', error);

    // 處理特定的 API 錯誤
    if (error.status === 401) {
      throw new Error('API 密鑰無效。請檢查您的 OpenAI API 密鑰並重試。');
    } else if (error.status === 429) {
      throw new Error('超出速率限制。請稍後重試。');
    } else if (error.message?.includes('API key')) {
      throw new Error('API 密鑰錯誤: ' + error.message);
    }

    throw new Error(error.message || '分析圖片失敗');
  }
}
