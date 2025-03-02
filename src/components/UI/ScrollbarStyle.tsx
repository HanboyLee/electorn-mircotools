import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from 'antd';
import { useSettingsStore } from '@/hooks/SettingsStore';

// 滾動條主題接口
interface ScrollbarThemeConfig {
  width: string;
  borderRadius: string;
  track: {
    background: string;
    hover: string;
  };
  thumb: {
    background: string;
    hover: string;
    active: string;
  };
  transition: string;
}

// 創建滾動條樣式的函數
const createScrollbarStyles = (config: ScrollbarThemeConfig) => css`
  /* 滾動條整體樣式 */
  &::-webkit-scrollbar {
    width: ${config.width};
    height: ${config.width};
  }

  /* 滾動條軌道樣式 */
  &::-webkit-scrollbar-track {
    background: ${config.track.background};
    border-radius: ${config.borderRadius};
    transition: ${config.transition};
    
    &:hover {
      background: ${config.track.hover};
    }
  }

  /* 滾動條滑塊樣式 */
  &::-webkit-scrollbar-thumb {
    background: ${config.thumb.background};
    border-radius: ${config.borderRadius};
    transition: ${config.transition};
    
    &:hover {
      background: ${config.thumb.hover};
    }
    
    &:active {
      background: ${config.thumb.active};
    }
  }

  /* Firefox 滾動條樣式 */
  scrollbar-width: thin;
  scrollbar-color: ${config.thumb.background} ${config.track.background};
`;

// 創建具有滾動條樣式的容器
interface ScrollableContainerProps {
  height?: string;
  maxHeight?: string;
  width?: string;
  maxWidth?: string;
  padding?: string;
  margin?: string;
}

const ScrollableContainer = styled.div<ScrollableContainerProps>`
  height: ${props => props.height || 'auto'};
  max-height: ${props => props.maxHeight || 'none'};
  width: ${props => props.width || 'auto'};
  max-width: ${props => props.maxWidth || 'none'};
  padding: ${props => props.padding || '0'};
  margin: ${props => props.margin || '0'};
  overflow: auto;
  
  ${props => {
    const { token } = theme.useToken();
    const { settings } = useSettingsStore();
    
    // 根據當前主題配置滾動條樣式
    let scrollbarConfig: ScrollbarThemeConfig;
    
    switch (settings.theme) {
      case 'dark':
        scrollbarConfig = {
          width: '8px',
          borderRadius: '4px',
          track: {
            background: token.colorBgContainer,
            hover: token.colorBgElevated,
          },
          thumb: {
            background: token.colorTextSecondary,
            hover: token.colorText,
            active: token.colorPrimary,
          },
          transition: 'all 0.3s ease',
        };
        break;
      case 'blue':
        scrollbarConfig = {
          width: '8px',
          borderRadius: '4px',
          track: {
            background: token.colorBgContainer,
            hover: token.colorBgElevated,
          },
          thumb: {
            background: token.colorPrimary,
            hover: token.colorPrimaryHover,
            active: token.colorPrimaryActive,
          },
          transition: 'all 0.3s ease',
        };
        break;
      default: // light
        scrollbarConfig = {
          width: '8px',
          borderRadius: '4px',
          track: {
            background: token.colorBgContainer,
            hover: token.colorBgElevated,
          },
          thumb: {
            background: token.colorBorder,
            hover: token.colorTextSecondary,
            active: token.colorPrimary,
          },
          transition: 'all 0.3s ease',
        };
    }
    
    return createScrollbarStyles(scrollbarConfig);
  }}
`;

export default ScrollableContainer;
