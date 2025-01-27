import React from 'react';
import StatusIndicator from './StatusIndicator';
import { useNetwork } from '@/hooks/useNetwork';

interface NetworkStatusProps {
  collapsed?: boolean;
}

const NetworkStatusComponent: React.FC<NetworkStatusProps> = ({ collapsed }) => {
  const { status, tooltipCheckContent } = useNetwork();
  return (
    <StatusIndicator
      tooltipCheckContent={tooltipCheckContent}
      status={status}
      collapsed={collapsed}
    />
  );
};

export default NetworkStatusComponent;
