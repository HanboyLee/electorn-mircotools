import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, theme } from 'antd';
import styled from 'styled-components';

import CustomTitleBar from './CustomTitleBar';
import SidebarMenu from './SidebarMenu';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { token } = theme.useToken();

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <StyledLayout>
      <CustomTitleBar 
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={handleSidebarCollapse}
      />
      
      <MainContent>
        <Content
          style={{
            height: 'calc(100vh - 32px)',
            overflowY: 'auto',
            padding: 12,
            background: token.colorBgLayout,
            marginTop: '32px',
            marginLeft: sidebarCollapsed ? '80px' : '200px',
            transition: 'margin-left 0.3s ease',
          }}
        >
          {children}
        </Content>
        
        <SidebarMenu 
          collapsed={sidebarCollapsed} 
          onCollapse={handleSidebarCollapse} 
        />
      </MainContent>
    </StyledLayout>
  );
};

export default MainLayout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  overflow: hidden;
`;

const MainContent = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
`;
