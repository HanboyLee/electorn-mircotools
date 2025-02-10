# Settings页面 OpenAI API测试功能实现方案

## 1. 基础设施搭建

### 1.1 OpenAI服务实现
创建文件：`src/services/openai.ts`
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
      
      // 使用最轻量的API调用来测试连接
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
      return 'Invalid API key';
    }
    if (error.response?.status === 429) {
      return 'Rate limit exceeded';
    }
    return error.message || 'Unknown error occurred';
  }
}
```

### 1.2 类型定义更新
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

## 2. API测试功能实现详细方案

### 2.1 组件状态管理
在 Settings 组件中添加：
```typescript
// 测试状态
const [testStatus, setTestStatus] = useState<OpenAITestStatus>({
  testing: false
});

// OpenAI服务实例
const [openAIService, setOpenAIService] = useState<OpenAIService | null>(null);
```

### 2.2 测试流程实现
1. **初始化阶段**
   ```typescript
   useEffect(() => {
     if (settings.openaiApiKey) {
       setOpenAIService(new OpenAIService(settings.openaiApiKey));
     }
   }, [settings.openaiApiKey]);
   ```

2. **测试函数实现**
   ```typescript
   const handleTestConnection = async () => {
     const apiKey = form.getFieldValue('openaiApiKey');
     if (!apiKey) {
       message.warning('请先输入API密钥');
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
         message.success('API连接测试成功！');
       } else {
         message.error(`API连接测试失败: ${result.error}`);
       }
     } catch (error) {
       setTestStatus({
         testing: false,
         result: {
           success: false,
           error: '测试过程发生错误'
         }
       });
       message.error('测试过程发生错误');
     }
   };
   ```

### 2.3 UI交互实现
1. **输入框组合**
   ```typescript
   <Form.Item
     label="OpenAI API 密钥"
     name="openaiApiKey"
     extra="可选项：用于AI分析功能"
   >
     <Input.Group compact>
       <Form.Item
         name="openaiApiKey"
         noStyle
       >
         <Input
           style={{ width: 'calc(100% - 100px)' }}
           placeholder="请输入API密钥"
           type="password"
         />
       </Form.Item>
       <Button
         type="primary"
         onClick={handleTestConnection}
         loading={testStatus.testing}
         style={{ width: '100px' }}
       >
         测试连接
       </Button>
     </Input.Group>
   </Form.Item>
   ```

2. **测试状态展示**
   ```typescript
   {testStatus.result && (
     <Form.Item>
       <Alert
         type={testStatus.result.success ? 'success' : 'error'}
         message={
           testStatus.result.success
             ? 'API连接正常'
             : `连接失败: ${testStatus.result.error}`
         }
         showIcon
       />
     </Form.Item>
   )}
   ```

## 3. 错误处理和优化

### 3.1 错误处理策略
1. **API密钥验证**
   - 空值检查
   - 基本格式验证（以sk-开头）
   - 长度检查

2. **网络错误处理**
   - 超时处理（设置5秒超时）
   - 断网状态处理
   - 请求失败重试（最多3次）

### 3.2 性能优化
1. **防抖处理**
   - 避免频繁测试请求
   - 实现300ms延迟的防抖

2. **缓存处理**
   - 缓存成功的测试结果
   - 仅在API密钥变化时重新测试

## 4. 安全性考虑

### 4.1 API密钥保护
1. 使用密码输入框隐藏API密钥
2. 不在前端日志中打印API密钥
3. 本地存储加密

### 4.2 请求安全
1. 使用HTTPS确保传输安全
2. 实现请求频率限制
3. 清理敏感错误信息

## 5. 测试用例

### 5.1 功能测试
1. 正确的API密钥测试
2. 错误的API密钥测试
3. 空API密钥测试
4. 网络异常测试

### 5.2 UI测试
1. 按钮状态变化
2. 加载状态显示
3. 错误提示显示
4. 成功提示显示
