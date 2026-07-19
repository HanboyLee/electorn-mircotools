import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface QueueThumbProps {
  file: File;
  /** 可選：狀態染色提示 */
  tone?: 'default' | 'ok' | 'fail' | 'running';
}

/**
 * 懶生成 Object URL，卸載時 revoke，避免大批量 blob 常駐
 */
export function QueueThumb({ file, tone = 'default' }: QueueThumbProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <Thumb aria-hidden $tone={tone}>
      {url ? <img src={url} alt="" /> : null}
    </Thumb>
  );
}

const Thumb = styled.div<{ $tone: string }>`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: ${({ $tone }) => {
    if ($tone === 'ok') return '#f6ffed';
    if ($tone === 'fail') return '#fff2f0';
    if ($tone === 'running') return '#e6f4ff';
    return '#f5f5f5';
  }};
  border: 1px solid #f0f0f0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;
