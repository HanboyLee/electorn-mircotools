import React, { useMemo } from 'react';
import { Alert, Col, Row, Space, Statistic, Table, Tag, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { AnalysisResult } from '../types';
import { QueueThumb } from './QueueThumb';
import type { QueueItem } from '../logic/queueItem';

const { Text } = Typography;

export interface AnalysisResultsProps {
  items: QueueItem[];
  results: Record<string, AnalysisResult | null>;
  errors: Record<string, string | undefined>;
}

interface RowData {
  key: string;
  file?: File;
  filename: string;
  title: string;
  description: string;
  keywords: string[];
  status: 'ok' | 'fail' | 'pending' | 'running';
  error?: string;
}

function keywordsToList(kw: AnalysisResult['keywords']): string[] {
  if (Array.isArray(kw)) return kw.map(String).filter(Boolean);
  if (typeof kw === 'string') {
    return kw
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function AnalysisResults({ items, results, errors }: AnalysisResultsProps) {
  const { token } = theme.useToken();

  const rows: RowData[] = useMemo(() => {
    const byName = new Map(items.map(i => [i.file.name, i]));
    const names = new Set([...Object.keys(results), ...Object.keys(errors)]);
    return Array.from(names).map(filename => {
      const result = results[filename];
      const err = errors[filename];
      const item = byName.get(filename);
      if (result) {
        return {
          key: filename,
          file: item?.file,
          filename,
          title: result.title || '—',
          description: result.description || '—',
          keywords: keywordsToList(result.keywords),
          status: 'ok' as const,
        };
      }
      return {
        key: filename,
        file: item?.file,
        filename,
        title: '—',
        description: err || '—',
        keywords: [],
        status: 'fail' as const,
        error: err,
      };
    });
  }, [items, results, errors]);

  const success = rows.filter(r => r.status === 'ok').length;
  const fail = rows.filter(r => r.status === 'fail').length;
  const total = rows.length;
  const rate = total > 0 ? Math.round((success / total) * 100) : 0;

  if (rows.length === 0) return null;

  const columns: ColumnsType<RowData> = [
    {
      title: '文件',
      dataIndex: 'filename',
      width: 200,
      render: (_, row) => (
        <Space size={8}>
          {row.file ? <QueueThumb file={row.file} tone={row.status === 'ok' ? 'ok' : 'fail'} /> : null}
          <Text ellipsis style={{ maxWidth: 120 }} title={row.filename}>
            {row.filename}
          </Text>
        </Space>
      ),
    },
    {
      title: '標題',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      render: (text, row) =>
        row.status === 'fail' ? (
          <Text type="danger" ellipsis title={row.error}>
            {row.error || text}
          </Text>
        ) : (
          <Text ellipsis title={text}>
            {text}
          </Text>
        ),
    },
    {
      title: '關鍵詞',
      dataIndex: 'keywords',
      width: 220,
      render: (kws: string[]) =>
        kws.length ? (
          <Space size={[4, 4]} wrap>
            {kws.slice(0, 8).map(k => (
              <Tag key={k} style={{ marginInlineEnd: 0 }}>
                {k}
              </Tag>
            ))}
            {kws.length > 8 ? <Text type="secondary">+{kws.length - 8}</Text> : null}
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      width: 88,
      render: (s: RowData['status']) =>
        s === 'ok' ? <Tag color="success">成功</Tag> : <Tag color="error">失敗</Tag>,
    },
  ];

  return (
    <Panel style={{ borderColor: token.colorBorderSecondary, background: token.colorBgContainer }}>
      <Header>
        <Text strong>分析結果</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          可將 CSV 用於「元數據寫入」
        </Text>
      </Header>

      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={6}>
          <StatBox
            style={{ borderColor: token.colorBorderSecondary, background: token.colorFillAlter }}
          >
            <Statistic title="合計" value={total} />
          </StatBox>
        </Col>
        <Col span={6}>
          <StatBox
            style={{ borderColor: token.colorBorderSecondary, background: token.colorFillAlter }}
          >
            <Statistic title="成功" value={success} valueStyle={{ color: token.colorSuccess }} />
          </StatBox>
        </Col>
        <Col span={6}>
          <StatBox
            style={{ borderColor: token.colorBorderSecondary, background: token.colorFillAlter }}
          >
            <Statistic title="失敗" value={fail} valueStyle={{ color: token.colorError }} />
          </StatBox>
        </Col>
        <Col span={6}>
          <StatBox
            style={{ borderColor: token.colorBorderSecondary, background: token.colorFillAlter }}
          >
            <Statistic title="成功率" value={rate} suffix="%" />
          </StatBox>
        </Col>
      </Row>

      {fail > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="失敗項不會寫入 CSV；可調整提示詞或稍後重試。"
        />
      )}

      <Table
        size="small"
        rowKey="key"
        columns={columns}
        dataSource={rows}
        pagination={rows.length > 50 ? { pageSize: 50, showSizeChanger: false } : false}
        scroll={{ x: 800 }}
      />
    </Panel>
  );
}

const Panel = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  margin-bottom: 12px;
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
`;

const StatBox = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 8px 12px;
`;
