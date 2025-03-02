import React, { useState } from 'react';
import styled from 'styled-components';
import { Menu, Button, theme } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  FileTextOutlined,
  PictureOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

interface SidebarMenuProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
    {
      key: '/help',
      icon: <QuestionCircleOutlined />,
      label: '幫助',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const currentTheme = token.colorBgContainer === '#141414' ? 'dark' : 'light';

  return (
    <SidebarContainer 
      $collapsed={collapsed} 
      $themecolor={token.colorBgContainer}
      $theme={currentTheme}
    >
      <StyledMenu
        mode="inline"
        theme={currentTheme}
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        inlineCollapsed={collapsed}
      />
    </SidebarContainer>
  );
};

export default SidebarMenu;

interface SidebarContainerProps {
  $collapsed: boolean;
  $themecolor: string;
  $theme?: 'dark' | 'light';
}

const SidebarContainer = styled.div<SidebarContainerProps>`
  position: fixed;
  top: 32px;
  left: 0;
  height: calc(100vh - 32px);
  width: ${props => (props.$collapsed ? '80px' : '200px')};
  background-color: ${props => props.$themecolor};
  transition: all 0.3s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  border-right: 1px solid ${props => props.$theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'};
`;



const StyledMenu = styled(Menu)`
  border-right: none;
  flex: 1;
`;
