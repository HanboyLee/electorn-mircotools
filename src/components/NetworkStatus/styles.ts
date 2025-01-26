import styled from 'styled-components';
import { useToken } from 'antd';

export const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  margin-top: auto;
  border-top: 1px solid #f0f0f0;
`;

export const StatusDot = styled.div<{ $status: 'connected' | 'disconnected' | 'checking' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props => {
    switch (props.$status) {
      case 'connected':
        return '#52c41a';
      case 'disconnected':
        return '#f5222d';
      case 'checking':
        return '#faad14';
      default:
        return '#d9d9d9';
    }
  }};
`;

export const StatusText = styled.span`
  font-size: 12px;
  color: #000;
`;

export const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: #fff;
  border-radius: 4px;
  font-size: 12px;
  color: #000;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;

  ${StatusContainer}:hover & {
    opacity: 1;
  }
`;
