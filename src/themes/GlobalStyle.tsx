import { createGlobalStyle } from 'styled-components';
import { createScrollbarStyle, scrollbarThemes } from './scrollbar';

interface GlobalStyleProps {
  theme: 'light' | 'dark' | 'blue' | any;
}

export const GlobalStyle = createGlobalStyle<GlobalStyleProps>`
  * {
    ${props => createScrollbarStyle(scrollbarThemes[props.theme] || scrollbarThemes.light)}
  }

  /* 特定容器的滚动条样式 */
  .ant-layout-content,
  .ant-layout-sider,
  .ant-modal-content,
  .ant-drawer-content {
    ${props => createScrollbarStyle(scrollbarThemes[props.theme] || scrollbarThemes.light)}
  }
`;
