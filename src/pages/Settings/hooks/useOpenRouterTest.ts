import { useState, useCallback, useRef, useEffect } from 'react';
import { OpenRouterService, OpenRouterTestResult } from '../services/openrouter';
import { useSettingsStore } from '@/hooks/SettingsStore';
import { OpenRouterModelInfo } from '@/hooks/SettingsStore/types';

export interface OpenRouterTestStatus {
  testing: boolean;
  result?: OpenRouterTestResult;
}

// 模型更新間隔（24小時）
const MODEL_UPDATE_INTERVAL = 24 * 60 * 60 * 1000;

interface TestCache {
  apiKey: string;
  result: OpenRouterTestResult;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘
const DEBOUNCE_DELAY = 300; // 300ms

export function useOpenRouterTest() {
  const { settings, updateSettings } = useSettingsStore();
  const [status, setStatus] = useState<OpenRouterTestStatus>({
    testing: false
  });
  
  const [models, setModels] = useState<OpenRouterModelInfo[]>(settings.savedModels || []);
  const cacheRef = useRef<TestCache | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const pendingTestRef = useRef<string>();

  // 檢查緩存是否有效
  const isValidCache = useCallback((apiKey: string): boolean => {
    if (!cacheRef.current) return false;
    
    const { apiKey: cachedKey, timestamp } = cacheRef.current;
    const isExpired = Date.now() - timestamp > CACHE_DURATION;
    
    return cachedKey === apiKey && !isExpired;
  }, []);

  // 實際的測試函數
  const runTest = useCallback(async (apiKey: string) => {
    // 如果緩存有效，直接使用緩存結果
    if (isValidCache(apiKey)) {
      const result = cacheRef.current!.result;
      setStatus({
        testing: false,
        result
      });
      if (result.models) {
        setModels(result.models);
      }
      return result;
    }

    setStatus({ testing: true });
    const service = new OpenRouterService(apiKey);

    try {
      const result = await service.testConnection();
      
      // 更新緩存
      cacheRef.current = {
        apiKey,
        result,
        timestamp: Date.now()
      };
      
      setStatus({
        testing: false,
        result
      });

      // 如果有可用模型，更新模型列表並保存到設置中
      if (result.models && result.models.length > 0) {
        setModels(result.models);
        
        // 保存模型列表到設置中
        updateSettings({
          savedModels: result.models,
          lastModelUpdateTime: Date.now()
        });
      }
      
      return result;
    } catch (error) {
      const result = {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤'
      };
      setStatus({
        testing: false,
        result
      });
      return result;
    }
  }, [isValidCache, updateSettings]);

  // 帶防抖的測試函數
  const testConnection = useCallback(async (apiKey?: string) => {
    if (!apiKey) {
      return;
    }

    // 清除之前的定時器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 如果正在測試中且是相同的key，不重複測試
    if (status.testing && pendingTestRef.current === apiKey) {
      return;
    }

    pendingTestRef.current = apiKey;

    // 設置新的定時器
    return new Promise<OpenRouterTestResult | undefined>((resolve) => {
      timerRef.current = setTimeout(async () => {
        const result = await runTest(apiKey);
        pendingTestRef.current = undefined;
        resolve(result);
      }, DEBOUNCE_DELAY);
    });
  }, [status.testing, runTest]);

  // 自動加載已保存的模型
  useEffect(() => {
    // 如果有已保存的模型，則使用它們
    if (settings.savedModels && settings.savedModels.length > 0) {
      setModels(settings.savedModels);
    }
  }, [settings.savedModels]);

  // 如果有 API 密鑰但沒有模型列表，或者模型列表過期，則自動更新
  useEffect(() => {
    const apiKey = settings.openrouterApiKey;
    const lastUpdateTime = settings.lastModelUpdateTime || 0;
    const now = Date.now();
    const isExpired = now - lastUpdateTime > MODEL_UPDATE_INTERVAL;
    
    // 如果有 API 密鑰，且模型列表為空或過期，則自動更新
    if (apiKey && (models.length === 0 || isExpired) && !status.testing) {
      console.log('自動更新模型列表');
      testConnection(apiKey);
    }
  }, [settings.openrouterApiKey, settings.lastModelUpdateTime, models.length, status.testing, testConnection]);

  // 清理函數
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    status,
    models,
    testConnection
  };
}
