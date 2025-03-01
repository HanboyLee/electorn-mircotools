import { AnalysisResult } from '../types';
import { analyzeImage } from './openai';
import { analyzeImageWithOpenRouter } from './openrouter';
import { Settings } from '@/hooks/SettingsStore/types';

/**
 * 根據用戶設置選擇適當的 API 提供者來分析圖片
 */
export async function analyzeImageWithProvider(
  file: File, 
  settings: Settings
): Promise<AnalysisResult> {
  // 檢查是否有設置 API 提供者
  const apiProvider = settings.apiProvider || 'openai';
  
  // 根據提供者選擇適當的 API
  if (apiProvider === 'openrouter') {
    // 檢查是否有 OpenRouter API 密鑰
    if (!settings.openrouterApiKey) {
      throw new Error('未設置 OpenRouter API 密鑰。請在設置中配置您的 API 密鑰。');
    }
    
    // 檢查是否有選擇模型
    if (!settings.selectedModel) {
      throw new Error('未選擇 OpenRouter 模型。請在設置中選擇一個模型。');
    }
    
    // 使用 OpenRouter API
    return analyzeImageWithOpenRouter(
      file, 
      settings.openrouterApiKey, 
      settings.selectedModel
    );
  } else {
    // 檢查是否有 OpenAI API 密鑰
    if (!settings.openaiApiKey) {
      throw new Error('未設置 OpenAI API 密鑰。請在設置中配置您的 API 密鑰。');
    }
    
    // 使用 OpenAI API
    return analyzeImage(file, settings.openaiApiKey);
  }
}
