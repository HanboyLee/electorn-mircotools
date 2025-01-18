import React from 'react';
import { Typography, Card } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const CsvRequirements: React.FC = () => {
  return (
    <Card
      size="small"
      title={
        <span>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          CSV 格式要求
        </span>
      }
      style={{
        marginBottom: '16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        borderRadius: '8px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <Text type="secondary">必需的欄位順序：</Text>
          <div
            style={{
              background: '#fafafa',
              padding: '8px 12px',
              marginTop: '4px',
              fontFamily: 'monospace',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#1677ff',
            }}
          >
            FileName,Title,Description,Keywords
          </div>
        </div>

        <div>
          <Text type="secondary">注意事項：</Text>
          <ul
            style={{
              marginTop: '4px',
              paddingLeft: '20px',
              color: '#666',
              fontSize: '14px',
              lineHeight: '1.8',
            }}
          >
            <li>CSV 文件必須使用逗號 (,) 作為分隔符</li>
            <li>欄位名稱必須與上述完全一致</li>
            <li>FileName 必須與圖片文件名完全匹配</li>
            <li>Keywords 欄位中的關鍵詞請用逗號分隔</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
