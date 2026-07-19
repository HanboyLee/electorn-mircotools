import React, { useMemo, useRef, useState } from 'react';
import { Button, Empty, Input, Tag, Tooltip, Typography, Upload, theme } from 'antd';
import { CloseOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import styled from 'styled-components';
import { QueueThumb } from './QueueThumb';
import type { QueueItem, QueueItemStatus } from '../logic/queueItem';

const { Text } = Typography;
const { Dragger } = Upload;

const STATUS_META: Record<
  QueueItemStatus,
  { label: string; color: string }
> = {
  pending: { label: '待分析', color: 'default' },
  running: { label: '分析中', color: 'processing' },
  ok: { label: '成功', color: 'success' },
  fail: { label: '失敗', color: 'error' },
};

export interface ImageQueueProps {
  items: QueueItem[];
  analyzing: boolean;
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
}

export function ImageQueue({ items, analyzing, onAddFiles, onRemove }: ImageQueueProps) {
  const { token } = theme.useToken();
  const [query, setQuery] = useState('');
  const batchRef = useRef<File[]>([]);
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item => item.file.name.toLowerCase().includes(q));
  }, [items, query]);

  // 大量列表：限高滾動 + 懶縮略圖（區內滾動）
  const showSearch = items.length >= 25;

  const uploadProps: UploadProps = {
    accept: 'image/*,.jpg,.jpeg,.png,.webp,.gif',
    multiple: true,
    showUploadList: false,
    disabled: analyzing,
    // 多選時 beforeUpload 會逐個觸發：合併為一批再入隊
    beforeUpload: file => {
      batchRef.current.push(file as File);
      if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
      batchTimerRef.current = setTimeout(() => {
        const batch = batchRef.current;
        batchRef.current = [];
        if (batch.length) onAddFiles(batch);
      }, 0);
      return false;
    },
  };

  return (
    <QueueCard
      style={{
        borderColor: token.colorBorderSecondary,
        background: token.colorBgContainer,
      }}
    >
      <Header>
        <Text strong>
          圖片隊列 <Text type="secondary">· {items.length} 張</Text>
        </Text>
      </Header>

      <Dragger {...uploadProps} style={{ marginBottom: 12 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">拖放圖片到此，或點擊選擇</p>
        <p className="ant-upload-hint">支援 jpg / png / webp / gif · 可多選 · 始終列表展示</p>
      </Dragger>

      {showSearch && (
        <Input.Search
          allowClear
          placeholder="搜尋文件名…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ marginBottom: 8 }}
        />
      )}

      <ListViewport
        $maxHeight={320}
        style={{
          borderColor: token.colorBorderSecondary,
          background: token.colorBgContainer,
        }}
      >
        {filtered.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={items.length === 0 ? '尚未加入圖片' : '無符合搜尋的文件'}
            style={{ margin: '24px 0' }}
          />
        ) : (
          filtered.map(item => {
            const meta = STATUS_META[item.status];
            const tone =
              item.status === 'ok'
                ? 'ok'
                : item.status === 'fail'
                  ? 'fail'
                  : item.status === 'running'
                    ? 'running'
                    : 'default';
            return (
              <Row key={item.id} style={{ borderColor: token.colorBorderSecondary }}>
                <QueueThumb file={item.file} tone={tone} />
                <Tooltip title={item.file.name}>
                  <Name ellipsis>{item.file.name}</Name>
                </Tooltip>
                <Tag color={meta.color} style={{ marginInlineEnd: 0 }}>
                  {meta.label}
                </Tag>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  disabled={analyzing}
                  aria-label={`移除 ${item.file.name}`}
                  onClick={() => onRemove(item.id)}
                />
              </Row>
            );
          })
        )}
      </ListViewport>

      <Foot type="secondary">
        {items.length === 0
          ? '尚未加入圖片'
          : query.trim()
            ? `顯示 ${filtered.length} / ${items.length} · 搜尋只過濾展示，分析仍針對全部 ${items.length} 張`
            : `始終列表 · 區內滾動 · 分析將處理全部 ${items.length} 張`}
      </Foot>
    </QueueCard>
  );
}

const QueueCard = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
`;

const Header = styled.div`
  margin-bottom: 12px;
`;

const ListViewport = styled.div<{ $maxHeight: number }>`
  max-height: ${({ $maxHeight }) => $maxHeight}px;
  overflow: auto;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const Name = styled(Text)`
  min-width: 0;
`;

const Foot = styled(Text)`
  display: block;
  margin-top: 8px;
  font-size: 12px;
`;
