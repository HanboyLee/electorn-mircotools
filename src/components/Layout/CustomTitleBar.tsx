import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Typography, theme, Avatar, Tooltip } from 'antd';
import {
  MinusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CloseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  BarsOutlined,
} from '@ant-design/icons';
import { logo } from '../../assets/images';

const { Title } = Typography;

interface CustomTitleBarProps {
  title?: string;
  sidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
}

const CustomTitleBar: React.FC<CustomTitleBarProps> = ({ 
  title = 'Micro DOU Golden Man',
  sidebarCollapsed = false,
  onSidebarCollapsedChange
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const { token } = theme.useToken();

  useEffect(() => {
    const checkMaximizeState = async () => {
      try {
        const maximized = await window.electronAPI.isWindowMaximized();
        setIsMaximized(maximized);
      } catch (error) {
        console.error('Error checking maximize state:', error);
      }
    };

    // 初始檢查
    checkMaximizeState();

    // 監聽窗口大小變化
    const handleResize = () => {
      checkMaximizeState();
    };
    
    window.addEventListener('resize', handleResize);
    
    // 監聽自定義事件
    window.electron.on('maximize', () => {
      setIsMaximized(true);
    });
    
    window.electron.on('unmaximize', () => {
      setIsMaximized(false);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.electron.removeListener('maximize', () => {});
      window.electron.removeListener('unmaximize', () => {});
    };
  }, []);

  const handleMinimize = () => {
    window.electronAPI.windowMinimize();
  };

  const handleMaximizeRestore = () => {
    // 直接切換狀態，不需要檢查當前狀態
    window.electronAPI.windowToggleMaximize();
  };

  const handleClose = () => {
    window.electronAPI.windowClose();
  };
  
  const handleToggleSidebar = () => {
    if (onSidebarCollapsedChange) {
      onSidebarCollapsedChange(!sidebarCollapsed);
    }
  };

  return (
    <TitleBarContainer style={{ backgroundColor: token.colorBgElevated }}>
      <LogoSection>
        <Avatar src={logo} size={24} style={{ marginRight: 8 }} />
        <Title level={5} style={{ margin: 0, color: token.colorText }}>{title}</Title>
        <Tooltip title={sidebarCollapsed ? '展開菜單' : '收起菜單'}>
          <MenuToggleButton 
            type="text" 
            icon={sidebarCollapsed ? <BarsOutlined /> : <AppstoreOutlined />} 
            onClick={handleToggleSidebar}
            $hoverColor={token.colorPrimary}
            $hoverBg={token.colorBgTextHover}
          />
        </Tooltip>
      </LogoSection>
      
      <WindowControls>
        <WindowButton
          type="text"
          icon={<MinusOutlined />}
          onClick={handleMinimize}
          $hoverColor={token.colorPrimary}
          $hoverBg={token.colorBgTextHover}
        />
        <WindowButton
          type="text"
          icon={isMaximized ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={handleMaximizeRestore}
          $hoverColor={token.colorPrimary}
          $hoverBg={token.colorBgTextHover}
        />
        <WindowButton
          type="text"
          icon={<CloseOutlined />}
          onClick={handleClose}
          $hoverColor="white"
          $hoverBg="#ff4d4f"
        />
      </WindowControls>
    </TitleBarContainer>
  );
};

export default CustomTitleBar;

const TitleBarContainer = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 12px;
  -webkit-app-region: drag;
  user-select: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  min-width: 200px;
`;



const WindowControls = styled.div`
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
`;

interface WindowButtonProps {
  $hoverColor: string;
  $hoverBg: string;
}

const WindowButton = styled(Button)<WindowButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0;
  margin-left: 4px;
  -webkit-app-region: no-drag;
  
  &:hover {
    color: ${props => props.$hoverColor} !important;
    background-color: ${props => props.$hoverBg} !important;
  }
`;

const MenuToggleButton = styled(Button)<WindowButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  margin-left: 12px;
  -webkit-app-region: no-drag;
  
  &:hover {
    color: ${props => props.$hoverColor} !important;
    background-color: ${props => props.$hoverBg} !important;
  }
`;
