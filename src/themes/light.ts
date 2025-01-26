import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1677ff',
  },
  components: {
    Card: {
      colorBgContainer: '#ffffff',
    },
    Button: {
      colorPrimary: '#1677ff',
    },
  },
};
