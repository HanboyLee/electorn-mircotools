import { useState, useCallback, useRef, useEffect } from 'react';
import { OpenAIService, OpenAITestResult } from '../services/openai';

export interface OpenAITestStatus {
  testing: boolean;
  result?: OpenAITestResult;
}

interface TestCache {
  apiKey: string;
  result: OpenAITestResult;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEBOUNCE_DELAY = 300; // 300ms

export function useOpenAITest() {
  // 所有的 hooks 声明必须在最顶部
  const [status, setStatus] = useState<OpenAITestStatus>({
    testing: false
  });
  
  const cacheRef = useRef<TestCache | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const pendingTestRef = useRef<string>();

  // 检查缓存是否有效
  const isValidCache = useCallback((apiKey: string): boolean => {
    if (!cacheRef.current) return false;
    
    const { apiKey: cachedKey, timestamp } = cacheRef.current;
    const isExpired = Date.now() - timestamp > CACHE_DURATION;
    
    return cachedKey === apiKey && !isExpired;
  }, []);

  // 实际的测试函数
  const runTest = useCallback(async (apiKey: string) => {
    // 如果缓存有效，直接使用缓存结果
    if (isValidCache(apiKey)) {
      const result = cacheRef.current!.result;
      setStatus({
        testing: false,
        result
      });
      return result;
    }

    setStatus({ testing: true });
    const service = new OpenAIService(apiKey);

    try {
      const result = await service.testConnection();
      
      // 更新缓存
      cacheRef.current = {
        apiKey,
        result,
        timestamp: Date.now()
      };
      
      setStatus({
        testing: false,
        result
      });
      return result;
    } catch (error) {
      const result = {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
      setStatus({
        testing: false,
        result
      });
      return result;
    }
  }, [isValidCache]);

  // 带防抖的测试函数
  const testConnection = useCallback(async (apiKey?: string) => {
    if (!apiKey) {
      return;
    }

    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 如果正在测试中且是相同的key，不重复测试
    if (status.testing && pendingTestRef.current === apiKey) {
      return;
    }

    pendingTestRef.current = apiKey;

    // 设置新的定时器
    return new Promise<OpenAITestResult | undefined>((resolve) => {
      timerRef.current = setTimeout(async () => {
        const result = await runTest(apiKey);
        pendingTestRef.current = undefined;
        resolve(result);
      }, DEBOUNCE_DELAY);
    });
  }, [status.testing, runTest]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    status,
    testConnection
  };
}
