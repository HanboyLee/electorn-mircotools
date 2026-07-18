import React from 'react';
import { Modal, Typography } from 'antd';
import type { UpdateDownloadResult } from '@/types/update';
import {
  getPostInstallHint,
  getPostInstallSteps,
  getPostInstallTitle,
  getPreUpdateConfirm,
} from '@/utils/updateUx';

const { Paragraph, Text } = Typography;

type MessageApi = {
  success: (content: string) => void;
  error: (content: string) => void;
  warning: (content: string) => void;
  info: (content: string) => void;
};

export interface RunUpdateFlowOptions {
  platform: NodeJS.Platform | string;
  downloadAndInstall: () => Promise<UpdateDownloadResult | null>;
  message: MessageApi;
  onError?: (error: string) => void;
  onSuccess?: () => void;
  /** 是否在开始前弹确认（默认 true） */
  confirmBefore?: boolean;
}

/**
 * 统一的「立即更新」交互：确认 → 下载打开 → 分平台安装引导
 */
export async function runUpdateFlow(options: RunUpdateFlowOptions): Promise<void> {
  const {
    platform,
    downloadAndInstall,
    message,
    onError,
    onSuccess,
    confirmBefore = true,
  } = options;

  const startDownload = async () => {
    const result = await downloadAndInstall();
    if (!result) {
      const err = '更新失败，请稍后重试';
      onError?.(err);
      message.error(err);
      return;
    }
    if (!result.success) {
      const err = result.error || result.message || '更新失败，请稍后重试';
      onError?.(err);
      message.error(err);
      return;
    }

    onSuccess?.();
    showPostInstallGuide(platform, message);
  };

  if (!confirmBefore) {
    await startDownload();
    return;
  }

  const { title, content } = getPreUpdateConfirm(platform);
  Modal.confirm({
    title,
    content,
    okText: '开始更新',
    cancelText: '取消',
    centered: true,
    onOk: () => startDownload(),
  });
}

function showPostInstallGuide(platform: NodeJS.Platform | string, message: MessageApi): void {
  const steps = getPostInstallSteps(platform);
  const isWin = platform === 'win32';

  Modal.info({
    title: getPostInstallTitle(),
    centered: true,
    width: 480,
    okText: isWin ? '关闭应用' : '我知道了',
    content: (
      <div>
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          {getPostInstallHint()}
        </Paragraph>
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          {steps.map(step => (
            <li key={step} style={{ marginBottom: 8 }}>
              <Text>{step}</Text>
            </li>
          ))}
        </ol>
      </div>
    ),
    onOk: () => {
      if (isWin) {
        try {
          window.electronAPI.windowClose();
        } catch {
          message.info('请手动关闭本应用，然后重新打开');
        }
      }
    },
  });
}
