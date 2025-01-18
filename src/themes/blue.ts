import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const blueTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#4B9FE1', // 天空藍
    colorInfo: '#4B9FE1',
    colorBgLayout: '#E1EEFF', // 更明顯的天空藍背景
    colorBgContainer: '#E8F3FF', // 容器背景色
    colorBgElevated: '#E8F3FF', // 浮層背景色
    borderRadius: 6,
  },
  components: {
    Layout: {
      siderBg: '#E8F3FF', // 側邊欄背景
      headerBg: '#E8F3FF', // header 背景
      colorBgBody: '#E1EEFF', // 主體背景
      colorBgLayout: '#E1EEFF', // 佈局背景
    },
    Menu: {
      itemBg: '#E8F3FF', // 菜單項背景
      itemSelectedBg: '#B3D7FF', // 選中項背景
      itemHoverBg: '#D1E9FF', // 懸停背景
      itemActiveBg: '#D1E9FF', // 活動項背景
      itemColor: '#333333', // 文字顏色
      itemSelectedColor: '#1668dc', // 選中項文字顏色
      itemHoverColor: '#1668dc', // 懸停文字顏色
      colorBgContainer: '#E8F3FF', // 整體背景
    },
    Card: {
      colorBgContainer: '#ffffff', // 卡片保持白色背景
    },
    Button: {
      colorPrimary: '#4B9FE1',
      algorithm: true,
    },
  },
};
