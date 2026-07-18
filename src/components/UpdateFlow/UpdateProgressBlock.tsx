import React from 'react';
import { Button, Progress, Space, Typography } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import type { UpdateProgress } from '@/types/update';
import { formatDownloadProgressLine } from '@/utils/updateUx';

const { Text } = Typography;

interface UpdateProgressBlockProps {
  downloading: boolean;
  progress: UpdateProgress | null;
  lastError: string | null;
  onRetry?: () => void;
  compact?: boolean;
}

const UpdateProgressBlock: React.FC<UpdateProgressBlockProps> = ({
  downloading,
  progress,
  lastError,
  onRetry,
  compact,
}) => {
  const showProgress =
    downloading &&
    progress &&
    (progress.phase === 'downloading' || progress.phase === 'opening');

  const percent =
    showProgress && typeof progress.percent === 'number' ? progress.percent : undefined;

  const line =
    showProgress && progress
      ? progress.phase === 'opening'
        ? progress.message || '正在打开安装程序…'
        : formatDownloadProgressLine(progress.transferred, progress.total, progress.message)
      : null;

  if (!showProgress && !lastError) {
    return null;
  }

  return (
    <Space direction="vertical" size={compact ? 4 : 8} style={{ width: '100%', maxWidth: 420 }}>
      {showProgress && typeof percent === 'number' && (
        <Progress
          percent={percent}
          size={compact ? 'small' : 'default'}
          status={progress?.phase === 'error' ? 'exception' : 'active'}
          style={{ marginBottom: 0 }}
        />
      )}
      {line && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {line}
        </Text>
      )}
      {lastError && !downloading && (
        <Space wrap align="center">
          <Text type="danger" style={{ fontSize: 12 }}>
            {lastError}
          </Text>
          {onRetry && (
            <Button size="small" icon={<RedoOutlined />} onClick={onRetry} type="link">
              重试
            </Button>
          )}
        </Space>
      )}
    </Space>
  );
};

export default UpdateProgressBlock;
