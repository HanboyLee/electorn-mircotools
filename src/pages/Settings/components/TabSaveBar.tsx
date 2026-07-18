import React from 'react';
import { Button, Space, theme } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import styled from 'styled-components';

export interface TabSaveBarProps {
  dirty: boolean;
  loading?: boolean;
  onSave: () => void;
  onReset: () => void;
  saveLabel?: string;
  resetLabel?: string;
  hint?: string;
}

const TabSaveBar: React.FC<TabSaveBarProps> = ({
  dirty,
  loading = false,
  onSave,
  onReset,
  saveLabel = '保存本頁設置',
  resetLabel = '重置本頁',
  hint,
}) => {
  const { token } = theme.useToken();

  return (
    <Bar
      style={{
        background: token.colorBgContainer,
        borderTopColor: token.colorBorderSecondary,
      }}
    >
      {/* 無未保存時不顯示提示；僅 dirty 時提示「本頁有未保存更改」 */}
      <Hint style={{ color: token.colorWarning }}>
        {hint ?? (dirty ? '本頁有未保存更改' : '')}
      </Hint>
      <Space>
        {dirty && (
          <Button onClick={onReset} disabled={loading}>
            {resetLabel}
          </Button>
        )}
        <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={onSave}>
          {saveLabel}
        </Button>
      </Space>
    </Bar>
  );
};

export default TabSaveBar;

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 0 4px;
  margin-top: 8px;
  border-top: 1px solid transparent;
  position: sticky;
  bottom: 0;
  z-index: 2;
`;

const Hint = styled.span`
  font-size: 12px;
  line-height: 1.4;
`;
