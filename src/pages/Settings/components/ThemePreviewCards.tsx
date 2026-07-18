import React from 'react';
import { theme as antdTheme } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { ThemeType } from '@/themes';
import { themeOptions } from '@/themes';

export interface ThemePreviewCardsProps {
  value?: ThemeType;
  onChange?: (theme: ThemeType) => void;
}

const PREVIEW: Record<
  ThemeType,
  { titleBar: string; sidebar: string; content: string; cardBg: string; nameColor: string }
> = {
  light: {
    titleBar: '#ffffff',
    sidebar: '#f3f4f6',
    content: '#f0f4f8',
    cardBg: '#ffffff',
    nameColor: '#1f2937',
  },
  dark: {
    titleBar: '#1f1f1f',
    sidebar: '#141414',
    content: '#0a0a0a',
    cardBg: '#1a1a1a',
    nameColor: '#e5e7eb',
  },
  blue: {
    titleBar: '#e6f4ff',
    sidebar: '#f0f7ff',
    content: '#f5f9ff',
    cardBg: '#ffffff',
    nameColor: '#1f2937',
  },
};

const ThemePreviewCards: React.FC<ThemePreviewCardsProps> = ({ value, onChange }) => {
  const { token } = antdTheme.useToken();

  return (
    <Grid>
      {themeOptions.map(option => {
        const t = option.value as ThemeType;
        const selected = value === t;
        const colors = PREVIEW[t];
        return (
          <Card
            key={t}
            type="button"
            selected={selected}
            primary={token.colorPrimary}
            border={token.colorBorder}
            style={{ background: colors.cardBg }}
            onClick={() => onChange?.(t)}
            aria-pressed={selected}
          >
            {selected && (
              <Check style={{ background: token.colorPrimary }}>
                <CheckOutlined style={{ fontSize: 10, color: '#fff' }} />
              </Check>
            )}
            <Preview>
              <TitleBar style={{ background: colors.titleBar }} />
              <Side style={{ background: colors.sidebar }} />
              <Content style={{ background: colors.content }} />
            </Preview>
            <Name style={{ color: colors.nameColor }}>{option.label}</Name>
          </Card>
        );
      })}
    </Grid>
  );
};

export default ThemePreviewCards;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.button<{ selected: boolean; primary: string; border: string }>`
  position: relative;
  border: 2px solid ${p => (p.selected ? p.primary : p.border)};
  box-shadow: ${p => (p.selected ? `0 0 0 1px ${p.primary}` : 'none')};
  border-radius: 10px;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: ${p => p.primary};
  }
`;

const Check = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  z-index: 1;
`;

const Preview = styled.div`
  height: 64px;
  display: grid;
  grid-template-columns: 28px 1fr;
  grid-template-rows: 12px 1fr;
`;

const TitleBar = styled.div`
  grid-column: 1 / -1;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

const Side = styled.div``;
const Content = styled.div``;

const Name = styled.div`
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 500;
`;
