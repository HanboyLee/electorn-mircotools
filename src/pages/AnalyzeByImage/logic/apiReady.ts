import type { Settings } from '@/hooks/SettingsStore/types';

export type ApiProvider = 'openai' | 'openrouter';

export interface ApiReadyStatus {
  ready: boolean;
  provider: ApiProvider;
  model: string | null;
  /** 未就緒時給用戶看的原因（繁體） */
  reason: string | null;
}

/**
 * 依當前設置判斷 LLM 圖片分析 API 是否就緒（與設置頁 Provider 對齊）
 */
export function getApiReadyStatus(settings: Settings): ApiReadyStatus {
  const provider = (settings.apiProvider === 'openrouter' ? 'openrouter' : 'openai') as ApiProvider;

  if (provider === 'openrouter') {
    if (!settings.openrouterApiKey?.trim()) {
      return {
        ready: false,
        provider,
        model: settings.selectedModel || null,
        reason: '請先在設置中配置 OpenRouter API 密鑰',
      };
    }
    if (!settings.selectedModel?.trim()) {
      return {
        ready: false,
        provider,
        model: null,
        reason: '請先在設置中選擇一個 OpenRouter 模型',
      };
    }
    return {
      ready: true,
      provider,
      model: settings.selectedModel,
      reason: null,
    };
  }

  if (!settings.openaiApiKey?.trim()) {
    return {
      ready: false,
      provider: 'openai',
      model: null,
      reason: '請先在設置中配置 OpenAI API 密鑰',
    };
  }

  // 僅提示格式問題，不在就緒徽章層硬擋（分析時仍可再校驗）
  return {
    ready: true,
    provider: 'openai',
    model: null,
    reason: null,
  };
}

/** 分析前攔截：返回錯誤文案；通過則 null */
export function getAnalyzeBlockReason(settings: Settings): string | null {
  const status = getApiReadyStatus(settings);
  if (!status.ready) {
    return status.reason;
  }
  if (status.provider === 'openai' && settings.openaiApiKey && !settings.openaiApiKey.startsWith('sk-')) {
    return '無效的 OpenAI API 密鑰格式，請在設置頁面重新配置';
  }
  return null;
}
