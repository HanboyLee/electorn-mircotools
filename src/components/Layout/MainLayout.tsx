import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Typography, theme } from 'antd';
import styled from 'styled-components';
import { logo } from '../../assets/images';

import {
  HomeOutlined,
  SettingOutlined,
  FileTextOutlined,
  PictureOutlined,
} from '@ant-design/icons';

import HeaderContainer from './HeaderContainer';
import NetworkStatus from '../NetworkStatus';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首頁',
    },
    {
      key: '/csv-validation',
      icon: <FileTextOutlined />,
      label: 'CSV 驗證',
    },
    {
      key: '/image-analyze',
      icon: <PictureOutlined />,
      label: '圖片分析',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '設置',
    },
  ];

  return (
    <StyledLayout>
      <StyledSider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: token.colorBgContainer,
        }}
      >
        <SiderContent>
          <LogoContainer collapsed={collapsed} style={{ background: token.colorBgElevated }}>
            <Avatar
              onClick={() => setCollapsed(!collapsed)}
              src={logo}
              size={collapsed ? 32 : 48}
              style={{
                display: 'block',
                margin: '0 auto',
                cursor: 'pointer',
              }}
            />
          </LogoContainer>
          <Menu
            style={{
              background: token.colorBgContainer,
            }}
            theme={token.colorBgContainer === '#141414' ? 'dark' : 'light'}
            mode="inline"
            defaultSelectedKeys={['/']}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
          <NetworkStatus collapsed={collapsed} />
        </SiderContent>
      </StyledSider>
      <StyledMainLayout collapsed={collapsed}>
        <HeaderContainer
          style={{ height: collapsed ? 50 : 64, background: token.colorBgElevated }}
        />
        <Content
          style={{
            height: '100%',
            minHeight: 280,
            overflowY: 'auto',
            padding: 12,
            background: token.colorBgLayout,
          }}
        >
          {children}
        </Content>
      </StyledMainLayout>
    </StyledLayout>
  );
};

export default MainLayout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledSider = styled(Sider)`
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
`;

const SiderContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  .ant-menu {
    flex: 1;
    overflow-y: auto;
    border-inline-end: none !important;
  }
`;

const StyledMainLayout = styled(Layout)<{ collapsed: boolean }>`
  margin-left: ${props => (props.collapsed ? '80px' : '200px')};
  transition: margin-left 0.2s;
`;

const LogoContainer = styled.div<{ collapsed: boolean }>`
  height: ${props => (props.collapsed ? '50px' : '64px')};
  padding: ${props => (props.collapsed ? '9px 8px' : '8px')};
  transition: all 0.2s;
`;
