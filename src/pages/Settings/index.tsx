import React, { useMemo, useState } from 'react';
import { Card, Typography, Space, Tabs, theme } from 'antd';
import {
  SettingOutlined,
  BgColorsOutlined,
  ApiOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import AppearanceSettingsTab from './components/AppearanceSettingsTab';
import APISettingsTab from './components/APISettingsTab';
import AboutUpdateSettings from './components/AboutUpdateSettings';

const { Title } = Typography;

const DirtyDot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d97706;
  margin-left: 6px;
  vertical-align: middle;
`;

const Settings: React.FC = () => {
  const { token } = theme.useToken();
  const [activeKey, setActiveKey] = useState('appearance');
  const [dirtyAppearance, setDirtyAppearance] = useState(false);
  const [dirtyApi, setDirtyApi] = useState(false);

  // Stable pane bodies so dirty-label re-renders do not remount forms
  const appearancePane = useMemo(
    () => <AppearanceSettingsTab onDirtyChange={setDirtyAppearance} />,
    []
  );
  const apiPane = useMemo(() => <APISettingsTab onDirtyChange={setDirtyApi} />, []);
  const aboutPane = useMemo(() => <AboutUpdateSettings />, []);

  const items = useMemo(
    () => [
      {
        key: 'appearance',
        label: (
          <span>
            <BgColorsOutlined /> 外觀與語言
            {dirtyAppearance ? <DirtyDot title="未保存" /> : null}
          </span>
        ),
        children: appearancePane,
        forceRender: true,
      },
      {
        key: 'api',
        label: (
          <span>
            <ApiOutlined /> AI 服務
            {dirtyApi ? <DirtyDot title="未保存" /> : null}
          </span>
        ),
        children: apiPane,
        forceRender: true,
      },
      {
        key: 'about',
        label: (
          <span>
            <InfoCircleOutlined /> 關於與更新
          </span>
        ),
        children: aboutPane,
        forceRender: true,
      },
    ],
    [dirtyAppearance, dirtyApi, appearancePane, apiPane, aboutPane]
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card styles={{ body: { paddingBottom: 12 } }}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <SettingOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
          <Title level={3} style={{ margin: 0 }}>
            設置
          </Title>
        </Space>

        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          destroyInactiveTabPane={false}
          items={items}
        />
      </Card>
    </Space>
  );
};

export default Settings;
