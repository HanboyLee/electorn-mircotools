import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#1668dc',
  },
  components: {
    Card: {
      colorBgContainer: '#1f1f1f',
    },
    Button: {
      colorPrimary: '#1668dc',
    },
  },
};
