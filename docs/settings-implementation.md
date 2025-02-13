# Settings 頁面 OpenAI API 測試功能實施方案

## 1. 基礎設施搭建

### 1.1 OpenAI 服務實現
創建文件：`src/services/openai.ts`
```typescript
import { Configuration, OpenAIApi } from 'openai';

export class OpenAIService {
  private api: OpenAIApi | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      const configuration = new Configuration({
        apiKey: apiKey
      });
      this.api = new OpenAIApi(configuration);
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.api) {
        throw new Error('API key is not configured');
      }
      
      // 使用最輕量的 API 調用來測試連接
      await this.api.listModels();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  private formatError(error: any): string {
    if (error.response?.status === 401) {
      return '無效的 API 密鑰';
    }
    if (error.response?.status === 429) {
      return '已超出 API 調用限制';
    }
    return error.message || '發生未知錯誤';
  }
}
```

### 1.2 類型定義更新
更新文件：`src/store/hooks/settings/types.ts`
```typescript
export interface OpenAITestResult {
  success: boolean;
  error?: string;
}

export interface OpenAITestStatus {
  testing: boolean;
  result?: OpenAITestResult;
}
```

## 2. API 測試功能實現詳細方案

### 2.1 組件狀態管理
在 Settings 組件中添加：
```typescript
// 測試狀態
const [testStatus, setTestStatus] = useState<OpenAITestStatus>({
  testing: false
});

// OpenAI 服務實例
const [openAIService, setOpenAIService] = useState<OpenAIService | null>(null);
```

### 2.2 測試流程實現
1. **初始化階段**
   ```typescript
   useEffect(() => {
     if (settings.openaiApiKey) {
       setOpenAIService(new OpenAIService(settings.openaiApiKey));
     }
   }, [settings.openaiApiKey]);
   ```

2. **測試函數實現**
   ```typescript
   const handleTestConnection = async () => {
     const apiKey = form.getFieldValue('openaiApiKey');
     if (!apiKey) {
       message.warning('請先輸入 API 密鑰');
       return;
     }

     setTestStatus({ testing: true });
     const service = new OpenAIService(apiKey);
     
     try {
       const result = await service.testConnection();
       setTestStatus({
         testing: false,
         result
       });

       if (result.success) {
         message.success('API 連接測試成功！');
       } else {
         message.error(`API 連接測試失敗: ${result.error}`);
       }
     } catch (error) {
       setTestStatus({
         testing: false,
         result: {
           success: false,
           error: '測試過程發生錯誤'
         }
       });
       message.error('測試過程發生錯誤');
     }
   };
   ```

### 2.3 UI 交互實現
1. **輸入框組合**
   ```typescript
   <Form.Item
     label="OpenAI API 密鑰"
     name="openaiApiKey"
     extra="可選項：用於 AI 分析功能"
   >
     <Input.Group compact>
       <Form.Item
         name="openaiApiKey"
         noStyle
       >
         <Input
           style={{ width: 'calc(100% - 100px)' }}
           placeholder="請輸入 API 密鑰"
           type="password"
         />
       </Form.Item>
       <Button
         type="primary"
         onClick={handleTestConnection}
         loading={testStatus.testing}
         style={{ width: '100px' }}
       >
         測試連接
       </Button>
     </Input.Group>
   </Form.Item>
   ```

2. **測試狀態展示**
   ```typescript
   {testStatus.result && (
     <Form.Item>
       <Alert
         type={testStatus.result.success ? 'success' : 'error'}
         message={
           testStatus.result.success
             ? 'API 連接正常'
             : `連接失敗: ${testStatus.result.error}`
         }
         showIcon
       />
     </Form.Item>
   )}
   ```

## 3. 錯誤處理和優化

### 3.1 錯誤處理策略
1. **API 密鑰驗證**
   - 空值檢查
   - 基本格式驗證（以 sk- 開頭）
   - 長度檢查

2. **網絡錯誤處理**
   - 超時處理（設置 5 秒超時）
   - 斷網狀態處理
   - 請求失敗重試（最多 3 次）

### 3.2 性能優化
1. **防抖處理**
   - 避免頻繁測試請求
   - 實現 300ms 延遲的防抖

2. **緩存處理**
   - 緩存成功的測試結果
   - 僅在 API 密鑰變化時重新測試

## 4. 安全性考慮

### 4.1 API 密鑰保護
1. 使用密碼輸入框隱藏 API 密鑰
2. 不在前端日誌中打印 API 密鑰
3. 本地存儲加密

### 4.2 請求安全
1. 使用 HTTPS 確保傳輸安全
2. 實現請求頻率限制
3. 清理敏感錯誤信息

## 5. 測試計劃

### 5.1 功能測試
1. 正確的 API 密鑰測試
2. 錯誤的 API 密鑰測試
3. 空 API 密鑰測試
4. 網絡異常測試

### 5.2 UI 測試
1. 按鈕狀態變化
2. 加載狀態顯示
3. 錯誤提示顯示
4. 成功提示顯示
