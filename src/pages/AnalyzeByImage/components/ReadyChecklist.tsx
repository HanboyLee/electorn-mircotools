import React from 'react';
import { Progress, Space, Typography, theme } from 'antd';
import { CheckCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import styled from 'styled-components';
import type { ApiReadyStatus } from '../logic/apiReady';

const { Text } = Typography;

export interface ReadyChecklistProps {
  api: ApiReadyStatus;
  imageCount: number;
  analyzing: boolean;
  progress: { done: number; total: number; current: string | null } | null;
}

export function ReadyChecklist({ api, imageCount, analyzing, progress }: ReadyChecklistProps) {
  const { token } = theme.useToken();
  const promptOk = true; // 提示詞有默認預設，始終視為就緒（不改預設內容）

  const items = [
    {
      ok: api.ready,
      label: api.ready
        ? api.provider === 'openai'
          ? 'API 已配置（OpenAI）'
          : `API 已配置（OpenRouter${api.model ? ` · ${api.model}` : ''}）`
        : api.reason || 'API 未配置',
    },
    {
      ok: promptOk,
      label: '提示詞已就緒',
    },
    {
      ok: imageCount > 0,
      label: imageCount > 0 ? `已選擇 ${imageCount} 張圖片` : '尚未選擇圖片',
    },
  ];

  const pct =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.done / progress.total) * 100))
      : 0;

  return (
    <Card style={{ borderColor: token.colorBorderSecondary, background: token.colorBgContainer }}>
      <Text strong style={{ display: 'block', marginBottom: 12 }}>
        就緒檢查
      </Text>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        {items.map(item => (
          <Row key={item.label}>
            {item.ok ? (
              <CheckCircleFilled style={{ color: token.colorSuccess, fontSize: 16 }} />
            ) : (
              <ExclamationCircleFilled style={{ color: token.colorWarning, fontSize: 16 }} />
            )}
            <Text type={item.ok ? undefined : 'secondary'}>{item.label}</Text>
          </Row>
        ))}
      </Space>

      {(analyzing || progress) && progress && progress.total > 0 && (
        <ProgressWrap>
          <ProgressLabel>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {analyzing
                ? `正在分析 ${progress.done}/${progress.total}${
                    progress.current ? ` · ${progress.current}` : ''
                  }`
                : `已完成 ${progress.done}/${progress.total}`}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {pct}%
            </Text>
          </ProgressLabel>
          <Progress percent={pct} showInfo={false} status={analyzing ? 'active' : 'normal'} />
        </ProgressWrap>
      )}
    </Card>
  );
}

const Card = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  height: 100%;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.4;
`;

const ProgressWrap = styled.div`
  margin-top: 14px;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  gap: 8px;
`;
