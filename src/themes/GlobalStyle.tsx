import { createGlobalStyle } from 'styled-components';

interface GlobalStyleProps {
  theme: 'light' | 'dark' | 'blue';
}

export const GlobalStyle = createGlobalStyle<GlobalStyleProps>`
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  /* 全局樣式 */
  * {
    box-sizing: border-box;
  }
`;
