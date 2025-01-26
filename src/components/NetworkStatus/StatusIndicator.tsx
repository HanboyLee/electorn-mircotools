import React from 'react';
import { Typography } from 'antd';
import { StatusContainer, StatusDot } from './styles';
import { NetworkStatus } from '@/services/networkService';

const { Text } = Typography;

interface StatusIndicatorProps {
  status: NetworkStatus;
  collapsed?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, collapsed }) => {
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
    <StatusContainer>
      <StatusDot $status={dotStatus} />
      {!collapsed && (
        <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text>
      )}
    </StatusContainer>
  );
};

export default StatusIndicator;
