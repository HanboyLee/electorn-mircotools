import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    current: 'light' | 'dark' | 'blue';
    // 可在此擴充完整主題結構
    colors?: {
      primary?: string;
      secondary?: string;
    };
  }
}
