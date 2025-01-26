import OpenAI from 'openai';
import { AnalysisResult } from '../types';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除 data URL 前綴，只保留 base64 部分
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function analyzeImage(file: File, apiKey: string): Promise<AnalysisResult> {
  try {
    // 使用 FileReader 讀取文件
    const base64Image = await readFileAsBase64(file);
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    const client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
    });

    console.log('正在發送 OpenAI API 請求...');
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
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
