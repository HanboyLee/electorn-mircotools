import React from 'react';
import { createGlobalStyle } from 'styled-components';
import { theme } from 'antd';
import { useSettingsStore } from '@/hooks/SettingsStore';

/**
 * 增強型全局滾動條樣式組件
 * 
 * 這個組件會根據當前主題自動適應滾動條樣式，並應用到整個應用程序。
 */
const EnhancedScrollbarStyle: React.FC = () => {
  const { token } = theme.useToken();
  const { settings } = useSettingsStore();
  
  // 根據當前主題獲取滾動條配置
  const getScrollbarConfig = () => {
    switch (settings.theme) {
      case 'dark':
        return {
          width: '8px',
          borderRadius: '4px',
          trackBg: token.colorBgContainer,
          trackHoverBg: token.colorBgElevated,
          thumbBg: token.colorTextSecondary,
          thumbHoverBg: token.colorText,
          thumbActiveBg: token.colorPrimary,
        };
      case 'blue':
        return {
          width: '8px',
          borderRadius: '4px',
          trackBg: token.colorBgContainer,
          trackHoverBg: token.colorBgElevated,
          thumbBg: token.colorPrimary,
          thumbHoverBg: token.colorPrimaryHover,
          thumbActiveBg: token.colorPrimaryActive,
        };
      default: // light
        return {
          width: '8px',
          borderRadius: '4px',
          trackBg: token.colorBgContainer,
          trackHoverBg: token.colorBgElevated,
          thumbBg: token.colorBorder,
          thumbHoverBg: token.colorTextSecondary,
          thumbActiveBg: token.colorPrimary,
        };
    }
  };
  
  const config = getScrollbarConfig();
  
  // 創建全局樣式
  const GlobalScrollbarStyle = createGlobalStyle`
    /* 全局滾動條樣式 */
    ::-webkit-scrollbar {
      width: ${config.width};
      height: ${config.width};
    }
    
    ::-webkit-scrollbar-track {
      background: ${config.trackBg};
      border-radius: ${config.borderRadius};
      transition: all 0.3s ease;
    }
    
    ::-webkit-scrollbar-track:hover {
      background: ${config.trackHoverBg};
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${config.thumbBg};
      border-radius: ${config.borderRadius};
      transition: all 0.3s ease;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${config.thumbHoverBg};
    }
    
    ::-webkit-scrollbar-thumb:active {
      background: ${config.thumbActiveBg};
    }
    
    /* Firefox 滾動條樣式 */
    * {
      scrollbar-width: thin;
      scrollbar-color: ${config.thumbBg} ${config.trackBg};
    }
    
    /* 特定容器的滾動條樣式 */
    .ant-layout-content,
    .ant-layout-sider,
    .ant-modal-content,
    .ant-drawer-content,
    .ant-table-body,
    .ant-collapse-content,
    .ant-card-body {
      &::-webkit-scrollbar {
        width: ${config.width};
        height: ${config.width};
      }
      
      &::-webkit-scrollbar-track {
        background: ${config.trackBg};
        border-radius: ${config.borderRadius};
      }
      
      &::-webkit-scrollbar-track:hover {
        background: ${config.trackHoverBg};
      }
      
      &::-webkit-scrollbar-thumb {
        background: ${config.thumbBg};
        border-radius: ${config.borderRadius};
      }
      
      &::-webkit-scrollbar-thumb:hover {
        background: ${config.thumbHoverBg};
      }
      
      &::-webkit-scrollbar-thumb:active {
        background: ${config.thumbActiveBg};
      }
    }
  `;
  
  return <GlobalScrollbarStyle />;
};

export default EnhancedScrollbarStyle;
