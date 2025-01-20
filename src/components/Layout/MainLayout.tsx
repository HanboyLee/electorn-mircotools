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
      key: '/analyze-by-image',
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
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: token.colorBgContainer,
        }}
      >
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
      </Sider>
      <Layout>
        <StyledHeader style={{ background: token.colorBgElevated }}>
          {/* header添加 */}
        </StyledHeader>
        <Content
          style={{
            minHeight: 280,
            background: token.colorBgLayout,
          }}
        >
          {children}
        </Content>
      </Layout>
    </StyledLayout>
  );
};

export default MainLayout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  padding: 0;
`;

const LogoContainer = styled.div<{ collapsed: boolean }>`
  height: ${props => (props.collapsed ? '50px' : '64px')};
  padding: ${props => (props.collapsed ? '9px 8px' : '8px')};
  transition: all 0.2s;
  margin-bottom: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;
