import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const { Header, Sider, Content } = Layout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  padding: 0;
  background: #fff;
`;

const StyledLogo = styled.div`
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.2);
`;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首頁',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '設置',
    },
    {
      key: '/csv-validation',
      icon: <FileTextOutlined />,
      label: 'CSV 驗證',
    },
  ];

  return (
    <StyledLayout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <StyledLogo />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <StyledHeader>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </StyledHeader>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </StyledLayout>
  );
};

export default MainLayout;
