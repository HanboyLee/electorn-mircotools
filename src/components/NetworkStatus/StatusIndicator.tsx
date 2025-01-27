import React from 'react';
import { Typography, Tooltip } from 'antd';
import { StatusContainer, StatusDot } from './styles';
import { NetworkStatus } from '@/services/networkService';

const { Text } = Typography;

interface StatusIndicatorProps {
  status: NetworkStatus;
  collapsed?: boolean;
  tooltipCheckContent: {
    intervalTime: number;
    checkUrl: string;
  };
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  collapsed,
  tooltipCheckContent,
}) => {
  const getStatusConfig = () => {
    if (status.checking) {
      return {
        status: 'checking' as const,
        text: '檢查中...',
      };
    }
    return {
      status: status.isConnected ? ('connected' as const) : ('disconnected' as const),
      text: status.isConnected ? '已連接' : '未連接',
    };
  };

  const { status: dotStatus, text } = getStatusConfig();

  return (
    <Tooltip
      title={
        <div>
          <p>每{tooltipCheckContent.intervalTime / 1000}秒進行網路狀態檢查。</p>
          <p>測試地址:{tooltipCheckContent.checkUrl}</p>
          <p>當離線時，會無法使用圖片分析功能，請確保網路穩定通暢。</p>
        </div>
      }
    >
      <StatusContainer>
        {/* 提示用戶每30秒檢查一次網路狀態 */}
        <StatusDot $status={dotStatus} />
        {!collapsed && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {text}
          </Text>
        )}
      </StatusContainer>
    </Tooltip>
  );
};

export default StatusIndicator;
