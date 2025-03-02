import React, { ReactNode } from 'react';
import ScrollableContainer from './ScrollbarStyle';

interface ScrollableContentProps {
  children: ReactNode;
  height?: string;
  maxHeight?: string;
  width?: string;
  maxWidth?: string;
  padding?: string;
  margin?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 可滾動內容容器組件
 * 
 * 這個組件提供了一個帶有自定義滾動條的容器，滾動條樣式會根據當前主題自動適應。
 * 
 * @param {ReactNode} children - 子元素
 * @param {string} height - 容器高度
 * @param {string} maxHeight - 容器最大高度
 * @param {string} width - 容器寬度
 * @param {string} maxWidth - 容器最大寬度
 * @param {string} padding - 內邊距
 * @param {string} margin - 外邊距
 * @param {string} className - 自定義類名
 * @param {React.CSSProperties} style - 自定義樣式
 */
const ScrollableContent: React.FC<ScrollableContentProps> = ({
  children,
  height,
  maxHeight,
  width,
  maxWidth,
  padding,
  margin,
  className,
  style,
}) => {
  return (
    <ScrollableContainer
      height={height}
      maxHeight={maxHeight}
      width={width}
      maxWidth={maxWidth}
      padding={padding}
      margin={margin}
      className={className}
      style={style}
    >
      {children}
    </ScrollableContainer>
  );
};

export default ScrollableContent;
