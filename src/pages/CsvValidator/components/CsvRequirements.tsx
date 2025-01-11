import React from 'react';
import { Typography, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

export const CsvRequirements: React.FC = () => {
  return (
    <div>
      <Alert
        icon={<InfoCircleOutlined />}
        message="CSV 檔案格式說明"
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />

      <div style={{ marginBottom: '16px' }}>
        <Text strong>Headers (in exact order):</Text>
        <Paragraph style={{ 
          background: '#f5f5f5', 
          padding: '8px', 
          marginTop: '8px',
          fontFamily: 'monospace',
          borderRadius: '4px'
        }}>
          FileName,Title,Description,Keywords
        </Paragraph>
      </div>

      <div>
        <Text strong>Requirements:</Text>
        <ul style={{ 
          marginTop: '8px',
          paddingLeft: '20px'
        }}>
          <li>CSV must use comma (,) as delimiter</li>
          <li>Headers must be exactly as shown above</li>
          <li>FileName must match your image file name</li>
          <li>Keywords should be comma-separated</li>
        </ul>
      </div>
    </div>
  );
};
