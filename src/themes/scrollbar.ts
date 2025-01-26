import { css } from 'styled-components';

export interface ScrollbarTheme {
  track: string;      // 滚动条轨道颜色
  thumb: string;      // 滚动条滑块颜色
  thumbHover: string; // 滚动条滑块悬停颜色
  width: string;      // 滚动条宽度
}

export const scrollbarThemes = {
  light: {
    track: '#f0f0f0',
    thumb: '#d9d9d9',
    thumbHover: '#bfbfbf',
    width: '8px',
  },
  dark: {
    track: '#1f1f1f',
    thumb: '#454545',
    thumbHover: '#666666',
    width: '8px',
  },
  blue: {
    track: '#E8F3FF',
    thumb: '#4B9FE1',
    thumbHover: '#3A7FB3',
    width: '8px',
  },
} as const;

export const createScrollbarStyle = (theme: ScrollbarTheme) => css`
  &::-webkit-scrollbar {
    width: ${theme.width};
    height: ${theme.width};
  }

  &::-webkit-scrollbar-track {
    background: ${theme.track};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.thumb};
    border-radius: 4px;
    transition: all 0.3s ease-in-out;

    &:hover {
      background: ${theme.thumbHover};
    }
  }

  /* 隐藏默认滚动条但保持可滚动 */
  scrollbar-width: thin;
  scrollbar-color: ${theme.thumb} ${theme.track};
`;
