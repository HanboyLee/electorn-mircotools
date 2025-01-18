import { ThemeConfig } from 'antd';
import { darkTheme } from './dark';
import { lightTheme } from './light';
import { blueTheme } from './blue';

export type ThemeType = 'light' | 'dark' | 'blue';

export const themes: Record<ThemeType, ThemeConfig> = {
  light: lightTheme,
  dark: darkTheme,
  blue: blueTheme,
};

export const themeOptions = [
  { label: '白色風格', value: 'light' },
  { label: '黑色風格', value: 'dark' },
  { label: '藍色風格', value: 'blue' },
];

// 從 localStorage 獲取主題
export const getStoredTheme = (): ThemeType => {
  return (localStorage.getItem('theme') as ThemeType) || 'light';
};

// 保存主題到 localStorage
export const setStoredTheme = (theme: ThemeType) => {
  localStorage.setItem('theme', theme);
};