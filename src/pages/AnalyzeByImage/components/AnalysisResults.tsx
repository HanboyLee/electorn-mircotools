'use client';

import { Card, Space, Typography, Alert, Descriptions } from 'antd';
import { AnalysisResult } from '../types';

interface AnalysisResultsProps {
  results: Record<string, AnalysisResult | null>;
  errors: Record<string, string | undefined>;
}

const { Title } = Typography;

export function AnalysisResults({ results, errors }: AnalysisResultsProps) {
  if (Object.keys(results).length === 0) {
    return null;
  }

  console.log(results, 'result');

  return (
    <Space direction="vertical" style={{ width: '100%', marginTop: 24 }}>
      {Object.entries(results).map(([filename, result]) => (
        <Card key={filename} title={filename}>
          {result ? (
            <Descriptions column={1}>
              <Descriptions.Item label="標題">{result.title}</Descriptions.Item>
              <Descriptions.Item label="描述">{result.description}</Descriptions.Item>
              <Descriptions.Item label="關鍵詞">
                {Array.isArray(result.keywords)
                  ? result.keywords.map(String).join(', ')
                  : '無關鍵詞'}
              </Descriptions.Item>
            </Descriptions>
          ) : errors[filename] ? (
            <Alert type="error" message={errors[filename]} style={{ marginTop: 8 }} />
          ) : null}
        </Card>
      ))}
    </Space>
  );
}
